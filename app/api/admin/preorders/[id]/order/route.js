import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PreOrder } from "@/models/PreOrder";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serializePreorder } from "@/lib/serializePreorder";

const PLAN_VALUES = ["full", "half"];

function computePayment(plan, quotedTotal) {
  const safeTotal = Math.max(0, Number(quotedTotal || 0));
  const normalizedPlan = PLAN_VALUES.includes(plan) ? plan : "full";
  let deposit = normalizedPlan === "half" ? safeTotal / 2 : safeTotal;
  deposit = Math.round(deposit * 100) / 100;
  const balance = Math.max(0, Math.round((safeTotal - deposit) * 100) / 100);
  return { plan: normalizedPlan, total: safeTotal, deposit, balance };
}

export async function POST(req, { params }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();

  const preorder = await PreOrder.findById(id);
  if (!preorder) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!Number.isFinite(Number(preorder.quotedTotal)) || Number(preorder.quotedTotal) <= 0) {
    return NextResponse.json({ error: "กรุณาระบุยอดเสนอราคาก่อน" }, { status: 400 });
  }

  const { plan, total, deposit, balance } = computePayment(preorder.paymentPlan, preorder.quotedTotal);
  const summary = preorder.quoteSummary || `Pre-order สำหรับ ${preorder.name}`;

  let order;
  if (preorder.orderId) {
    order = await Order.findById(preorder.orderId);
  }

  const paymentMethod = "promptpay";
  const paymentStatus = deposit > 0 ? "unpaid" : "paid";

  if (!order) {
    order = await Order.create({
      userId: preorder.userId || null,
      items: [
        {
          title: summary,
          price: deposit,
          qty: 1,
        },
      ],
      subtotal: deposit,
      discount: 0,
      total: deposit,
      coupon: null,
      customer: {
        name: preorder.name,
        phone: preorder.phone,
        email: preorder.email,
      },
      shipping: {
        address1: "",
        address2: "",
        district: "",
        province: "",
        postcode: "",
        note: preorder.notes || "",
      },
      payment: {
        method: paymentMethod,
        status: paymentStatus,
        ref: "",
        amountPaid: 0,
        confirmedAt: null,
      },
      status: "new",
      preorder: {
        preorderId: preorder._id,
        paymentPlan: plan,
        quotedTotal: total,
        depositAmount: deposit,
        balanceAmount: balance,
        summary,
      },
    });
    preorder.orderId = order._id;
  } else {
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
    if (!order.payment) order.payment = {};
    order.payment.method = order.payment.method || paymentMethod;
    if (!["paid", "cash", "verifying"].includes(order.payment.status)) {
      order.payment.status = paymentStatus;
      order.payment.amountPaid = 0;
      order.payment.ref = "";
      order.payment.confirmedAt = null;
    }
    order.preorder = {
      preorderId: preorder._id,
      paymentPlan: plan,
      quotedTotal: total,
      depositAmount: deposit,
      balanceAmount: balance,
      summary,
    };
    await order.save();
  }

  preorder.paymentPlan = plan;
  preorder.quotedTotal = total;
  preorder.depositAmount = deposit;
  preorder.balanceAmount = balance;
  if (!preorder.quotedAt) {
    preorder.quotedAt = new Date();
  }
  if (preorder.status === "contacted") {
    preorder.status = "quoted";
    preorder.statusHistory = Array.isArray(preorder.statusHistory) ? preorder.statusHistory : [];
    preorder.statusHistory.push({ status: "quoted", changedAt: new Date() });
  }

  await preorder.save();

  const serialized = serializePreorder(preorder, { order });
  return NextResponse.json(serialized, { status: 201 });
}
