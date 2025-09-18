import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { promptPayPayload } from "@/lib/promptpay";
import { Coupon } from "@/models/Coupon"; // ⬅️ เพิ่ม

function calcDiscount(coupon, subtotal) {
  if (!coupon) return { discount: 0, used: null };
  if (!coupon.active) return { discount: 0, used: null };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { discount: 0, used: null };
  if (subtotal < (coupon.minSubtotal || 0)) return { discount: 0, used: null };

  let discount = 0;
  if (coupon.type === "percent") discount = Math.floor((subtotal * coupon.value) / 100);
  else discount = Math.floor(coupon.value);
  discount = Math.max(0, Math.min(discount, subtotal));
  return { discount, used: { code: coupon.code, type: coupon.type, value: coupon.value } };
}

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
      checked.push({ productId: String(p._id), title: p.title, price: p.price, qty, lineTotal: p.price * qty });
    }

    const subtotal = checked.reduce((n, x) => n + x.lineTotal, 0);

    // validate coupon
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase().trim() }).lean();
    }
    const { discount, used } = calcDiscount(coupon, subtotal);
    const total = subtotal - discount;

    if (method === "promptpay") {
      const payload = promptPayPayload({ id: process.env.PROMPTPAY_ID, amount: total });
      return NextResponse.json({
        ok: 1,
        method,
        orderPreview: { items: checked, subtotal, discount, total, coupon: used },
        promptpay: { payload, amount: total },
      });
    }

    return NextResponse.json({ error: "Unknown payment method" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
