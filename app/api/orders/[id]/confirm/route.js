import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function isValidDataUrl(str) {
  if (typeof str !== "string") return false;
  return /^data:image\/(png|jpe?g|gif|webp);base64,/.test(str.trim());
}

export async function POST(req, { params }) {
  try {
    const orderId = params?.id;
    if (!orderId) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const body = await req.json();
    const { slip, filename = "" } = body || {};

    if (!isValidDataUrl(slip)) {
      return NextResponse.json({ error: "ต้องแนบสลิปการโอนเป็นไฟล์ภาพ" }, { status: 400 });
    }

    // Limit slip payload size (about 5MB of base64)
    if (slip.length > 7_000_000) {
      return NextResponse.json({ error: "ไฟล์สลิปมีขนาดใหญ่เกินไป (สูงสุด ~5MB)" }, { status: 413 });
    }

    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (order.userId && userId && String(order.userId) !== String(userId)) {
      return NextResponse.json({ error: "ไม่สามารถยืนยันคำสั่งซื้อนี้" }, { status: 403 });
    }

    order.payment = {
      ...order.payment,
      slip,
      slipFilename: String(filename || "").slice(0, 120),
      confirmedAt: new Date(),
      status: "paid",
    };

    await order.save();

    return NextResponse.json({ ok: 1, orderId: String(order._id) });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
