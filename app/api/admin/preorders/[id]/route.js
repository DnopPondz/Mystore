import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PreOrder } from "@/models/PreOrder";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serializePreorder } from "@/lib/serializePreorder";

const STATUS_VALUES = ["new", "contacted", "quoted", "confirmed", "closed"];
const PLAN_VALUES = ["full", "half"];

function computePayment(plan, quotedTotal) {
  const safeTotal = Math.max(0, Number(quotedTotal || 0));
  const normalizedPlan = PLAN_VALUES.includes(plan) ? plan : "full";
  let deposit = normalizedPlan === "half" ? safeTotal / 2 : safeTotal;
  deposit = Math.round(deposit * 100) / 100;
  const balance = Math.max(0, Math.round((safeTotal - deposit) * 100) / 100);
  return { plan: normalizedPlan, total: safeTotal, deposit, balance };
}

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function GET(_req, { params }) {
  const { id } = await params;

  const { error } = await ensureAdmin();
  if (error) return error;

  await connectToDatabase();

  const preorder = await PreOrder.findById(id).lean();
  if (!preorder) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let order = null;
  if (preorder.orderId) {
    order = await Order.findById(preorder.orderId).lean();
  }

  return NextResponse.json(serializePreorder(preorder, { order }));
}

export async function PATCH(req, { params }) {
  const { id } = await params;

  const { error } = await ensureAdmin();
  if (error) return error;

  const body = await req.json().catch(() => ({}));

  await connectToDatabase();

  const preorder = await PreOrder.findById(id);
  if (!preorder) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let updatedFields = false;

  if (body.status && STATUS_VALUES.includes(body.status) && body.status !== preorder.status) {
    const now = new Date();
    preorder.status = body.status;
    preorder.statusHistory = Array.isArray(preorder.statusHistory) ? preorder.statusHistory : [];
    preorder.statusHistory.push({ status: body.status, changedAt: now });
    if (body.status === "contacted" && !preorder.contactedAt) {
      preorder.contactedAt = now;
    }
    if (body.status === "quoted") {
      preorder.quotedAt = now;
    }
    updatedFields = true;
  }

  if (body.quoteSummary !== undefined) {
    const summary = String(body.quoteSummary || "").slice(0, 500);
    if (summary !== preorder.quoteSummary) {
      preorder.quoteSummary = summary;
      updatedFields = true;
    }
  }

  if (body.internalNotes !== undefined) {
    const notes = String(body.internalNotes || "").slice(0, 2000);
    if (notes !== preorder.internalNotes) {
      preorder.internalNotes = notes;
      updatedFields = true;
    }
  }

  let recompute = false;
  if (body.quotedTotal !== undefined) {
    const total = Number(body.quotedTotal);
    if (Number.isFinite(total) && total >= 0) {
      preorder.quotedTotal = Math.round(total * 100) / 100;
      recompute = true;
      updatedFields = true;
    }
  }

  if (body.paymentPlan && PLAN_VALUES.includes(body.paymentPlan)) {
    if (body.paymentPlan !== preorder.paymentPlan) {
      preorder.paymentPlan = body.paymentPlan;
      recompute = true;
      updatedFields = true;
    }
  }

  if (recompute) {
    const { plan, total, deposit, balance } = computePayment(preorder.paymentPlan, preorder.quotedTotal);
    preorder.paymentPlan = plan;
    preorder.depositAmount = deposit;
    preorder.balanceAmount = balance;
    preorder.quotedTotal = total;
    if (!preorder.quotedAt && total > 0) {
      preorder.quotedAt = new Date();
    }
  }

  if (!updatedFields && !recompute) {
    return NextResponse.json(serializePreorder(preorder));
  }

  await preorder.save();

  // Sync existing order if needed
  if (preorder.orderId) {
    const order = await Order.findById(preorder.orderId);
    if (order) {
      const { deposit, balance, total, plan } = computePayment(
        preorder.paymentPlan,
        preorder.quotedTotal
      );
      const summary = preorder.quoteSummary || `Pre-order สำหรับ ${preorder.name}`;
      order.items = [
        {
          title: summary,
          price: deposit,
          qty: 1,
        },
      ];
      order.subtotal = deposit;
      order.discount = 0;
      order.total = deposit;
      order.customer = {
        name: preorder.name,
        phone: preorder.phone,
        email: preorder.email,
      };
      const prevShipping = order.shipping
        ? typeof order.shipping.toObject === "function"
          ? order.shipping.toObject()
          : order.shipping
        : {};
      order.shipping = {
        ...prevShipping,
        note: preorder.notes || prevShipping?.note || "",
      };
      order.preorder = {
        preorderId: preorder._id,
        paymentPlan: plan,
        quotedTotal: total,
        depositAmount: deposit,
        balanceAmount: balance,
        summary,
      };
      if (!order.payment) order.payment = {};
      if (!order.payment.status || ["unpaid", "invalid", "pending"].includes(order.payment.status)) {
        order.payment.status = deposit > 0 ? "unpaid" : "paid";
      }
      await order.save();
    }
  }

  return NextResponse.json(serializePreorder(preorder));
}
