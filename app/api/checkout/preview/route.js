import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { promptPayPayload } from "@/lib/promptpay";
import { Coupon } from "@/models/Coupon";
import { getPaymentConfig } from "@/lib/paymentConfig";
import { Promotion } from "@/models/Promotion";
import { calculateCartPromotions } from "@/lib/promotionUtils";
import { evaluateCouponForUser } from "@/lib/couponUsage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const { items, method = "promptpay", couponCode } = await req.json();

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
      checked.push({
        productId: String(p._id),
        title: p.title,
        price: p.price,
        qty,
        costPrice: Number(p.costPrice || 0),
        lineTotal: p.price * qty,
      });
    }

    const subtotal = checked.reduce((n, x) => n + x.lineTotal, 0);
    const publicItems = checked.map(({ costPrice, ...rest }) => rest);

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

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    let couponDiscount = 0;
    let used = null;
    if (coupon) {
      const evaluation = await evaluateCouponForUser({ coupon, subtotal, userId });
      if (evaluation.ok) {
        couponDiscount = evaluation.discount;
        used = evaluation.used;
      } else if (evaluation.reason === "LOGIN_REQUIRED") {
        return NextResponse.json(
          { error: "กรุณาเข้าสู่ระบบเพื่อใช้คูปองนี้", code: "LOGIN_REQUIRED" },
          { status: 401 },
        );
      } else if (evaluation.reason === "LIMIT_REACHED") {
        return NextResponse.json(
          {
            error: "คุณใช้คูปองนี้ครบจำนวนครั้งแล้ว",
            code: "LIMIT_REACHED",
            maxUses: evaluation.usage?.maxUses ?? null,
          },
          { status: 400 },
        );
      }
    }

    const discount = Math.min(subtotal, couponDiscount + promotionDiscount);
    const total = subtotal - discount;

    const { promptpayId, bankAccount } = getPaymentConfig();

    if (method === "promptpay") {
      const payload = promptPayPayload({ id: promptpayId, amount: total });
      // ❗️ พรีวิว: ไม่สร้างออเดอร์, ไม่ตัดสต็อก — แค่ส่งข้อมูลกลับ
      return NextResponse.json({
        ok: 1,
        method,
        orderPreview: {
          items: publicItems,
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
        promptpay: { payload, amount: total },
      });
    }

    if (method === "bank") {
      return NextResponse.json({
        ok: 1,
        method,
        orderPreview: {
          items: publicItems,
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
        bankAccount,
      });
    }

    return NextResponse.json({ error: "Unknown payment method" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
