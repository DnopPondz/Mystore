import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serializeOrder } from "@/lib/serializeOrder";
import { PreOrder } from "@/models/PreOrder";

export async function GET(_req, { params }) {
  const { id } = await params;
  await connectToDatabase();
  const o = await Order.findById(id).lean();
  if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(o);
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();
  const data = await req.json();
  const prev = await Order.findById(id).lean();
  if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const normalizedPrev = serializeOrder(prev);

  const toFulfillmentStatus = (value) => {
    if (!value) return undefined;
    const map = { preparing: "pending", shipped: "shipping", done: "success", cancelled: "cancel" };
    const next = map[value] || value;
    return ["new", "pending", "shipping", "success", "cancel"].includes(next) ? next : undefined;
  };

  const toPaymentStatus = (value, total) => {
    if (!value) return undefined;
    const map = { pending: "unpaid", failed: "invalid" };
    const next = map[value] || value;
    const allowed = ["unpaid", "verifying", "paid", "invalid", "cash"];
    if (allowed.includes(next)) return next;
    return Number(total || 0) > 0 ? "unpaid" : "paid";
  };

  const normalizedStatus = toFulfillmentStatus(data.status);
  const normalizedPaymentStatus = toPaymentStatus(data.payment?.status, normalizedPrev?.total ?? prev.total);

  const updatePayload = { ...data };
  if (normalizedStatus) {
    updatePayload.status = normalizedStatus;
  }
  if (data.payment) {
    const prevPayment = prev.payment || {};
    const mergedPayment = { ...prevPayment, ...data.payment };
    if (normalizedPaymentStatus) {
      mergedPayment.status = normalizedPaymentStatus;
    }
    updatePayload.payment = mergedPayment;
    updatePayload.__nextPaymentStatus = mergedPayment.status;
  }

  // ถ้าเปลี่ยนเป็น cancel → คืนสต็อก
  if (normalizedStatus === "cancel" && normalizedPrev?.status !== "cancel") {
    await Promise.all(
      prev.items.map(it =>
        Product.updateOne(
          { _id: it.productId },
          { $inc: { stock: +it.qty } }
        )
      )
    );
  }

  const { __nextPaymentStatus, ...persistPayload } = updatePayload;
  const updated = await Order.findByIdAndUpdate(id, persistPayload, { new: true }).lean();

  if (updated && __nextPaymentStatus) {
    const depositStatus = ["paid", "cash"].includes(__nextPaymentStatus) ? "paid" : "pending";
    try {
      await PreOrder.updateMany(
        { depositOrderId: updated._id, depositStatus: { $ne: "waived" } },
        { depositStatus }
      );
    } catch (err) {
      console.warn("Failed to sync preorder status from order patch", err);
    }
  }

  return NextResponse.json(updated);
}
