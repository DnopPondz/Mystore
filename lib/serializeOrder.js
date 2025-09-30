const FULFILLMENT_STATUS_MAP = {
  preparing: "pending",
  shipped: "shipping",
  done: "success",
  cancelled: "cancel",
};

const PAYMENT_STATUS_MAP = {
  pending: "unpaid",
  failed: "invalid",
};

const VALID_FULFILLMENT = new Set(["new", "pending", "shipping", "success", "cancel"]);
const VALID_PAYMENT = new Set(["unpaid", "verifying", "paid", "invalid", "cash"]);
const VALID_PREORDER_PLAN = new Set(["full", "half"]);

function normalizeFulfillmentStatus(value) {
  if (!value) return "new";
  const mapped = FULFILLMENT_STATUS_MAP[value] || value;
  return VALID_FULFILLMENT.has(mapped) ? mapped : "new";
}

function normalizePaymentStatus(value, total) {
  const mapped = PAYMENT_STATUS_MAP[value] || value;
  if (VALID_PAYMENT.has(mapped)) return mapped;
  return Number(total || 0) > 0 ? "unpaid" : "paid";
}

export function serializeOrder(order, { includeSlip = false, includeCost = false } = {}) {
  if (!order) return null;
  const plain = typeof order.toObject === "function" ? order.toObject() : order;

  const safeDate = (value) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  };

  const normalizeId = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (typeof value.toString === "function") return value.toString();
    return null;
  };

  const items = Array.isArray(plain.items)
    ? plain.items.map((item) => {
        const plainItem =
          typeof item?.toObject === "function" ? item.toObject() : item;
        const normalizedItem = {
          ...plainItem,
          _id: normalizeId(plainItem?._id),
          productId: normalizeId(plainItem?.productId),
        };
        if (!includeCost && "costPrice" in normalizedItem) {
          delete normalizedItem.costPrice;
        }
        return normalizedItem;
      })
    : [];

  const promotions = Array.isArray(plain.promotions)
    ? plain.promotions.map((promotion) => {
        const promo =
          typeof promotion.toObject === "function" ? promotion.toObject() : promotion;
        const promoItems = Array.isArray(promo?.items)
          ? promo.items.map((item) => ({
              productId: normalizeId(item?.productId),
              title: item?.title || "",
              freeQty: Number(item?.freeQty || 0),
              unitPrice: Number(item?.unitPrice || 0),
              discount: Number(item?.discount || 0),
            }))
          : [];
        return {
          promotionId: normalizeId(promo?.promotionId || promo?._id),
          title: promo?.title || "",
          summary: promo?.summary || "",
          description: promo?.description || "",
          type: promo?.type || "",
          discount: Number(promo?.discount || 0),
          freeQty: Number(promo?.freeQty || 0),
          metadata: promo?.metadata || null,
          items: promoItems,
        };
      })
    : [];

  const payment = plain.payment || {};
  const total = Number(plain.total || 0);
  const preorder = plain.preorder || null;

  const sanitized = {
    ...plain,
    _id: normalizeId(plain._id),
    id: normalizeId(plain._id),
    userId: normalizeId(plain.userId),
    createdAt: safeDate(plain.createdAt),
    updatedAt: safeDate(plain.updatedAt),
    items,
    status: normalizeFulfillmentStatus(plain.status),
    payment: {
      method: payment.method || "promptpay",
      status: normalizePaymentStatus(payment.status, total),
      ref: payment.ref || "",
      amountPaid: typeof payment.amountPaid === "number" ? payment.amountPaid : null,
      confirmedAt: safeDate(payment.confirmedAt),
      slip: includeSlip ? payment.slip || "" : undefined,
      slipFilename: includeSlip ? payment.slipFilename || "" : undefined,
    },
    total,
    coupon: plain.coupon
      ? {
          code: plain.coupon.code || "",
          type: plain.coupon.type || "",
          value: Number(plain.coupon.value || 0),
          discount: Number(plain.coupon.discount || 0),
        }
      : null,
    promotionDiscount: Number(plain.promotionDiscount || 0),
    promotions,
    preorder: preorder
      ? {
          preorderId: normalizeId(preorder.preorderId || preorder.id),
          paymentPlan: VALID_PREORDER_PLAN.has(preorder.paymentPlan) ? preorder.paymentPlan : "full",
          quotedTotal: Number(preorder.quotedTotal || 0),
          depositAmount: Number(preorder.depositAmount || 0),
          balanceAmount: Number(preorder.balanceAmount || 0),
          summary: preorder.summary || "",
        }
      : null,
  };

  if (!includeSlip) {
    delete sanitized.payment.slip;
    delete sanitized.payment.slipFilename;
  }

  if ("__v" in sanitized) {
    delete sanitized.__v;
  }

  return sanitized;
}
