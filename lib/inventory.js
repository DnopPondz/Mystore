import { Product } from "@/models/Product";

export class InventoryError extends Error {
  constructor(message, { code, productId, productTitle } = {}) {
    super(message);
    this.name = "InventoryError";
    this.code = code;
    this.productId = productId || null;
    this.productTitle = productTitle || null;
  }
}

function toProductId(value) {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    if (typeof value.toString === "function") {
      const str = value.toString();
      if (str && str !== "[object Object]") return str;
    }
    if (value._id) return toProductId(value._id);
  }
  return null;
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      const productId = toProductId(item?.productId ?? item?.product);
      const qty = Math.max(0, Number(item?.qty || item?.quantity || 0));
      return productId && qty > 0 ? { productId, qty } : null;
    })
    .filter(Boolean);
}

export async function releaseInventory(items, { productMap } = {}) {
  const normalized = normalizeItems(items);
  if (normalized.length === 0) return;

  await Promise.allSettled(
    normalized.map((item) =>
      Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: item.qty } },
      ),
    ),
  );

  if (productMap) {
    for (const item of normalized) {
      const product = productMap[item.productId];
      if (product && typeof product.stock === "number") {
        productMap[item.productId] = {
          ...product,
          stock: product.stock + item.qty,
        };
      }
    }
  }
}

export async function reserveInventory(items, { productMap } = {}) {
  const normalized = normalizeItems(items);
  if (normalized.length === 0) return [];

  const reserved = [];

  try {
    for (const item of normalized) {
      let product = productMap ? productMap[item.productId] : null;
      if (!product) {
        product = await Product.findById(item.productId).lean();
        if (!product) {
          throw new InventoryError("Product not found", {
            code: "PRODUCT_NOT_FOUND",
            productId: item.productId,
          });
        }
      }

      const stock = product?.stock;
      if (typeof stock !== "number") {
        continue;
      }

      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
      ).lean();

      if (!updated) {
        throw new InventoryError("Insufficient stock", {
          code: "INSUFFICIENT_STOCK",
          productId: item.productId,
          productTitle: product?.title || null,
        });
      }

      reserved.push(item);

      if (productMap && product) {
        productMap[item.productId] = {
          ...product,
          stock: typeof stock === "number" ? stock - item.qty : stock,
        };
      }
    }

    return reserved;
  } catch (error) {
    if (reserved.length > 0) {
      await releaseInventory(reserved, { productMap });
    }
    throw error;
  }
}

export function normalizeInventoryItems(items) {
  return normalizeItems(items);
}
