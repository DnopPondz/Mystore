import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { promptPayPayload } from "@/lib/promptpay";
import { getPaymentConfig } from "@/lib/paymentConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ALLOWED_METHODS = ["promptpay", "bank"];

function buildResponse(order, method) {
  const total = Number(order.total || 0);
  const { promptpayId, bankAccount } = getPaymentConfig();

  const promptpay = method === "promptpay" && total > 0
    ? {
        payload: promptPayPayload({ id: promptpayId, amount: total }),
        amount: total,
      }
    : null;

  return {
    ok: 1,
    method,
    orderId: String(order._id),
    orderPreview: buildPreview(order),
    promptpay,
    bankAccount: method === "bank" ? bankAccount : null,
    paymentStatus: order.payment?.status || (total > 0 ? "pending" : "paid"),
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

  return {
    items,
    subtotal: Number(order.subtotal || 0),
    discount: Number(order.discount || 0),
    total: Number(order.total || 0),
    coupon: order.coupon || null,
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

    if ((order.payment?.status || "pending") === "paid") {
      return NextResponse.json({ error: "คำสั่งซื้อชำระเงินแล้ว ไม่สามารถเปลี่ยนวิธีได้" }, { status: 400 });
    }

    order.payment = {
      ...(order.payment?.toObject ? order.payment.toObject() : order.payment),
      method,
      status: order.total > 0 ? "pending" : "paid",
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
