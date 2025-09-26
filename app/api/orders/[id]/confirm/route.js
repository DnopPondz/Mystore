import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serializeOrder } from "@/lib/serializeOrder";
import { PreOrder } from "@/models/PreOrder";

function isValidDataUrl(str) {
  if (typeof str !== "string") return false;
  return /^data:image\/(png|jpe?g|gif|webp);base64,/.test(str.trim());
}

function parseAmountInput(value) {
  if (value === null || value === undefined) return NaN;
  const raw = String(value).trim();
  if (!raw) return NaN;
  const digits = raw.replace(/[^0-9.,]/g, "");
  if (!digits) return NaN;

  const hasComma = digits.includes(",");
  const hasDot = digits.includes(".");

  if (hasComma && hasDot) {
    const separatorIndex = Math.max(digits.lastIndexOf(","), digits.lastIndexOf("."));
    const integerPart = digits.slice(0, separatorIndex).replace(/[^0-9]/g, "");
    const decimalPart = digits.slice(separatorIndex + 1).replace(/[^0-9]/g, "");
    if (!integerPart && !decimalPart) return NaN;
    const normalizedInteger = integerPart || "0";
    const normalizedDecimal = decimalPart ? decimalPart.slice(0, 2) : "0";
    return Number(`${normalizedInteger}.${normalizedDecimal}`);
  }

  const separator = hasComma ? "," : hasDot ? "." : null;
  if (!separator) {
    return Number(digits.replace(/[^0-9]/g, ""));
  }

  const parts = digits.split(separator);
  if (parts.length === 2 && parts[1].replace(/[^0-9]/g, "").length <= 2) {
    const integerPart = parts[0].replace(/[^0-9]/g, "") || "0";
    const decimalPart = parts[1].replace(/[^0-9]/g, "");
    return Number(`${integerPart}.${decimalPart.slice(0, 2)}`);
  }

  return Number(digits.replace(/[^0-9]/g, ""));
}

export async function POST(req, { params }) {
  try {
    const orderId = params?.id;
    if (!orderId) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const body = await req.json();
    const { slip, filename = "", amount, reference = "" } = body || {};

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

    const expected = Number(order.total || 0);
    const normalizedStatus = serializeOrder(order)?.payment?.status || (expected > 0 ? "unpaid" : "paid");
    if (["paid", "cash"].includes(normalizedStatus)) {
      return NextResponse.json({ error: "คำสั่งซื้อนี้ได้รับการชำระแล้ว" }, { status: 400 });
    }

    let paidAmount = 0;

    if (expected > 0) {
      const parsedAmount = parseAmountInput(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return NextResponse.json({ error: "กรุณากรอกจำนวนเงินที่โอน" }, { status: 400 });
      }

      paidAmount = Number(parsedAmount.toFixed(2));
      const tolerance = 0.5;
      if (Math.abs(paidAmount - expected) > tolerance) {
        return NextResponse.json(
          {
            error: `ยอดโอน ${paidAmount.toFixed(2)} บาท ไม่ตรงกับยอดที่ต้องชำระ ${expected.toFixed(2)} บาท กรุณาตรวจสอบอีกครั้ง`,
          },
          { status: 400 }
        );
      }
    }

    order.payment = {
      ...order.payment,
      slip,
      slipFilename: String(filename || "").slice(0, 120),
      confirmedAt: new Date(),
      status: expected > 0 ? "verifying" : "paid",
      amountPaid: paidAmount,
      ref: String(reference || "").slice(0, 120),
    };

    await order.save();

    try {
      if (order.items.some((item) => item.kind === "preorder-deposit")) {
        const depositStatus = expected > 0 ? "paid" : "waived";
        await PreOrder.updateMany(
          { depositOrderId: order._id, depositStatus: { $ne: "waived" } },
          { depositStatus }
        );
      }
    } catch (updateError) {
      console.warn("Failed to sync preorder deposit status", updateError);
    }

    return NextResponse.json({ ok: 1, orderId: String(order._id) });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
