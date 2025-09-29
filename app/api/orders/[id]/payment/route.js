import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { promptPayPayload } from "@/lib/promptpay";
import { getPaymentConfig } from "@/lib/paymentConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serializeOrder } from "@/lib/serializeOrder";

const ALLOWED_METHODS = ["promptpay", "bank"];

function buildResponse(order, method) {
  const total = Number(order.total || 0);
  const { promptpayId, bankAccount } = getPaymentConfig();
  const sanitized = serializeOrder(order) || {};
  const normalizedMethod = sanitized.payment?.method || method;

  const promptpay = normalizedMethod === "promptpay" && total > 0
    ? {
        payload: promptPayPayload({ id: promptpayId, amount: total }),
        amount: total,
      }
    : null;

  return {
    ok: 1,
    method: normalizedMethod,
    orderId: String(order._id),
    orderPreview: buildPreview(order),
    promptpay,
    bankAccount: normalizedMethod === "bank" ? bankAccount : null,
    paymentStatus: sanitized.payment?.status || (total > 0 ? "unpaid" : "paid"),
  };
}

function buildPreview(order) {
  const items = Array.isArray(order.items)
    ? order.items.map((item) => {
        const plain = typeof item.toObject === "function" ? item.toObject() : item;
        const price = Number(plain.price || 0);
        const qty = Number(plain.qty || 0);
        return {
          ...plain,
          _id: plain._id ? plain._id.toString() : plain._id,
          productId: plain.productId ? plain.productId.toString() : plain.productId,
          lineTotal: price * qty,
        };
      })
    : [];

  const promotionDiscount = Number(order.promotionDiscount || 0);
  const promotions = Array.isArray(order.promotions)
    ? order.promotions.map((promotion) => {
        const plain =
          typeof promotion.toObject === "function" ? promotion.toObject() : promotion;
        const promoItems = Array.isArray(plain?.items)
          ? plain.items.map((item) => ({
              productId: item?.productId ? item.productId.toString() : item?.productId || null,
              title: item?.title || "",
              freeQty: Number(item?.freeQty || 0),
              unitPrice: Number(item?.unitPrice || 0),
              discount: Number(item?.discount || 0),
            }))
          : [];
        return {
          promotionId: plain?.promotionId ? plain.promotionId.toString() : null,
          title: plain?.title || "",
          summary: plain?.summary || "",
          description: plain?.description || "",
          type: plain?.type || "",
          discount: Number(plain?.discount || 0),
          freeQty: Number(plain?.freeQty || 0),
          metadata: plain?.metadata || null,
          items: promoItems,
        };
      })
    : [];

  const couponDiscount = order.coupon?.discount != null
    ? Number(order.coupon.discount || 0)
    : Math.max(0, Number(order.discount || 0) - promotionDiscount);

  return {
    items,
    subtotal: Number(order.subtotal || 0),
    discount: Number(order.discount || 0),
    total: Number(order.total || 0),
    coupon: order.coupon || null,
    couponDiscount,
    promotionDiscount,
    promotions,
  };
}

async function loadOrderForUser(orderId) {
  await connectToDatabase();

  const order = await Order.findById(orderId);
  if (!order) {
    return { error: NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 }) };
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (order.userId && userId && String(order.userId) !== String(userId)) {
    return { error: NextResponse.json({ error: "ไม่สามารถเปลี่ยนวิธีการชำระเงินของคำสั่งซื้อนี้" }, { status: 403 }) };
  }

  return { order };
}

export async function GET(_req, { params }) {
  try {
    const orderId = params?.id;
    if (!orderId) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const { order, error } = await loadOrderForUser(orderId);
    if (error) return error;

    const method = order.payment?.method || (order.total > 0 ? "promptpay" : "promptpay");

    return NextResponse.json(buildResponse(order, method));
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const orderId = params?.id;
    if (!orderId) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const method = String(body?.method || "").trim();

    if (!ALLOWED_METHODS.includes(method)) {
      return NextResponse.json({ error: "ไม่รองรับวิธีการชำระเงินนี้" }, { status: 400 });
    }

    const { order, error } = await loadOrderForUser(orderId);
    if (error) return error;

    const current = serializeOrder(order)?.payment?.status || (order.total > 0 ? "unpaid" : "paid");
    if (["paid", "cash", "verifying"].includes(current)) {
      return NextResponse.json({ error: "คำสั่งซื้ออยู่ระหว่างหรือเสร็จสิ้นการชำระเงิน ไม่สามารถเปลี่ยนวิธีได้" }, { status: 400 });
    }

    order.payment = {
      ...(order.payment?.toObject ? order.payment.toObject() : order.payment),
      method,
      status: order.total > 0 ? "unpaid" : "paid",
      ref: "",
      amountPaid: 0,
      slip: "",
      slipFilename: "",
      confirmedAt: null,
    };

    await order.save();

    return NextResponse.json(buildResponse(order, method));
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
