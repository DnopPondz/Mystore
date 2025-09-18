import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Coupon } from "@/models/Coupon";

function applyCoupon(coupon, subtotal) {
  if (!coupon) return { discount: 0, reason: "NOT_FOUND" };
  if (!coupon.active) return { discount: 0, reason: "INACTIVE" };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { discount: 0, reason: "EXPIRED" };
  if (subtotal < (coupon.minSubtotal || 0)) return { discount: 0, reason: "MIN_SUBTOTAL" };

  let discount = 0;
  if (coupon.type === "percent") discount = Math.floor((subtotal * coupon.value) / 100);
  else discount = Math.floor(coupon.value);
  discount = Math.max(0, Math.min(discount, subtotal));
  return { discount, reason: "OK" };
}

export async function POST(req) {
  try {
    const { code, subtotal } = await req.json();
    const normalized = String(code || "").toUpperCase().trim();
    const sub = Number(subtotal || 0);
    if (!normalized) return NextResponse.json({ error: "CODE required" }, { status: 400 });

    await connectToDatabase();
    const coupon = await Coupon.findOne({ code: normalized }).lean();

    const { discount, reason } = applyCoupon(coupon, sub);
    if (reason !== "OK") return NextResponse.json({ ok: 0, reason }, { status: 200 });

    return NextResponse.json({
      ok: 1,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      description: coupon.type === "percent" ? `${coupon.value}% off` : `฿${coupon.value} off`,
    });
  } catch (e) {
    // สำคัญ: อย่าปล่อยให้ตกและตอบว่าง ให้ส่ง JSON กลับเสมอ
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
