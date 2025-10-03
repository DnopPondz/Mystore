import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { evaluateCouponForUser } from "@/lib/couponUsage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const { code, subtotal } = await req.json();
    const normalized = String(code || "").toUpperCase().trim();
    const sub = Number(subtotal || 0);
    if (!normalized) return NextResponse.json({ error: "CODE required" }, { status: 400 });

    await connectToDatabase();
    const coupon = await Coupon.findOne({ code: normalized }).lean();

    const evaluation = await evaluateCouponForUser({ coupon, subtotal: sub, userId });
    if (!evaluation.ok) {
      const payload = { ok: 0, reason: evaluation.reason };
      if (evaluation.usage?.maxUses != null) {
        payload.maxUses = evaluation.usage.maxUses;
        payload.usedCount = evaluation.usage.usedCount;
      }
      return NextResponse.json(payload, { status: 200 });
    }

    const maxUses = evaluation.usage?.maxUses ?? null;
    const usedCount = evaluation.usage?.usedCount ?? 0;
    const remaining = maxUses != null ? Math.max(maxUses - usedCount, 0) : null;

    return NextResponse.json({
      ok: 1,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: evaluation.discount,
      description: coupon.type === "percent" ? `${coupon.value}% off` : `฿${coupon.value} off`,
      maxUses,
      usedCount,
      remaining,
    });
  } catch (e) {
    // สำคัญ: อย่าปล่อยให้ตกและตอบว่าง ให้ส่ง JSON กลับเสมอ
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
