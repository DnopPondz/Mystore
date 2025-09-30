import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { promptPayPayload } from "@/lib/promptpay";
import { Coupon } from "@/models/Coupon"; // ⬅️ เพิ่ม
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPaymentConfig } from "@/lib/paymentConfig";
import { Promotion } from "@/models/Promotion";
import { calculateCartPromotions } from "@/lib/promotionUtils";

function calcDiscount(coupon, subtotal) {
  if (!coupon) return { discount: 0, used: null };
  if (!coupon.active) return { discount: 0, used: null };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { discount: 0, used: null };
  if (subtotal < (coupon.minSubtotal || 0)) return { discount: 0, used: null };

  let discount = 0;
  if (coupon.type === "percent") discount = Math.floor((subtotal * coupon.value) / 100);
  else discount = Math.floor(coupon.value);
  discount = Math.max(0, Math.min(discount, subtotal));
  return {
    discount,
    used: { code: coupon.code, type: coupon.type, value: coupon.value, discount },
  };
}

export async function POST(req) {
  const deductedStock = [];
  try {
    const {
      items,
      method = "promptpay",
      couponCode,
      customer = {},
      shipping = {},
    } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    await connectToDatabase();

    const ids = items.map((x) => x.productId);
    const docs = await Product.find({ _id: { $in: ids }, active: true }).lean();
    const byId = Object.fromEntries(docs.map((d) => [String(d._id), d]));

    const checked = [];
    for (const it of items) {
      const p = byId[it.productId];
      if (!p) return NextResponse.json({ error: `Product not found: ${it.productId}` }, { status: 400 });
      const qty = Math.max(1, Number(it.qty || 1));
      checked.push({ productId: String(p._id), title: p.title, price: p.price, qty, lineTotal: p.price * qty });
    }

    const insufficientStock = checked.filter((item) => {
      const product = byId[item.productId];
      return typeof product.stock === "number" && product.stock < item.qty;
    });
    if (insufficientStock.length > 0) {
      const first = insufficientStock[0];
      return NextResponse.json(
        {
          error: `Insufficient stock for ${first.title}`,
          productId: first.productId,
        },
        { status: 409 },
      );
    }

    for (const item of checked) {
      const product = byId[item.productId];
      if (typeof product.stock !== "number") continue;
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
      ).lean();
      if (!updated) {
        const err = new Error(`Insufficient stock for ${item.productId}`);
        err.code = "INSUFFICIENT_STOCK";
        err.productId = item.productId;
        err.productTitle = product.title;
        throw err;
      }
      deductedStock.push({ productId: item.productId, qty: item.qty });
      byId[item.productId] = { ...product, stock: typeof product.stock === "number" ? product.stock - item.qty : product.stock };
    }

    const subtotal = checked.reduce((n, x) => n + x.lineTotal, 0);

    // validate coupon
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase().trim() }).lean();
    }
    const now = new Date();
    const promotions = await Promotion.find({
      active: true,
      $and: [
        { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
        { $or: [{ endAt: null }, { endAt: { $gte: now } }] },
      ],
    }).lean();

    const promotionCalc = calculateCartPromotions(checked, promotions);
    const promotionRecords = promotionCalc.applied.map((promo) => ({
      promotionId: promo.id || promo.promotionId || null,
      title: promo.title || "",
      summary: promo.summary || "",
      description: promo.description || "",
      type: promo.type || "",
      discount: Number(promo.discount || 0),
      freeQty: Number(promo.freeQty || 0),
      metadata: promo.metadata || null,
      items: Array.isArray(promo.items)
        ? promo.items.map((item) => ({
            productId: item.productId || null,
            title: item.title || "",
            freeQty: Number(item.freeQty || 0),
            unitPrice: Number(item.unitPrice || 0),
            discount: Number(item.discount || 0),
          }))
        : [],
    }));

    const promotionDiscount = Math.min(
      subtotal,
      Math.max(0, Number(promotionCalc.discount || 0)),
    );

    const { discount: couponDiscount, used } = calcDiscount(coupon, subtotal);
    const discount = Math.min(subtotal, couponDiscount + promotionDiscount);
    const total = subtotal - discount;

    const allowedMethods = ["promptpay", "bank"];
    if (!allowedMethods.includes(method)) {
      return NextResponse.json({ error: "Unknown payment method" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const paymentStatus = total > 0 ? "unpaid" : "paid";
    const { promptpayId, bankAccount: configuredBank } = getPaymentConfig();

    const order = await Order.create({
      userId,
      items: checked.map(({ lineTotal, ...rest }) => rest),
      subtotal,
      discount,
      total,
      promotionDiscount,
      coupon: used,
      promotions: promotionRecords,
      customer: {
        name: String(customer?.name || ""),
        phone: String(customer?.phone || ""),
        email: String(customer?.email || ""),
      },
      shipping: {
        address1: String(shipping?.address1 || ""),
        address2: String(shipping?.address2 || ""),
        district: String(shipping?.district || ""),
        province: String(shipping?.province || ""),
        postcode: String(shipping?.postcode || ""),
        note: String(shipping?.note || ""),
      },
      payment: { method, status: paymentStatus, ref: "", amountPaid: 0, confirmedAt: null },
      status: "new",
    });

    const promptpayData =
      method === "promptpay" && total > 0
        ? {
            payload: promptPayPayload({ id: promptpayId, amount: total }),
            amount: total,
          }
        : null;

    const bankAccount = method === "bank" ? configuredBank : null;

    return NextResponse.json({
      ok: 1,
      method,
      orderId: String(order._id),
      orderPreview: {
        items: checked,
        subtotal,
        discount,
        total,
        coupon: used,
        couponDiscount,
        promotionDiscount,
        promotions: promotionRecords.map((promo) => ({
          ...promo,
          promotionId: promo.promotionId ? String(promo.promotionId) : null,
          items: promo.items.map((item) => ({
            ...item,
            productId: item.productId ? String(item.productId) : item.productId,
          })),
        })),
      },
      promptpay: promptpayData,
      bankAccount,
    });
  } catch (e) {
    if (deductedStock.length > 0) {
      await Promise.allSettled(
        deductedStock.map((item) =>
          Product.updateOne({ _id: item.productId }, { $inc: { stock: item.qty } }),
        ),
      );
    }

    if (e?.code === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        {
          error: e.productTitle ? `Insufficient stock for ${e.productTitle}` : "Insufficient stock",
          productId: e.productId,
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
