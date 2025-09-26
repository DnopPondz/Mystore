import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { PreOrder } from "@/models/PreOrder";
import { promptPayPayload } from "@/lib/promptpay";
import { Coupon } from "@/models/Coupon"; // ⬅️ เพิ่ม
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPaymentConfig } from "@/lib/paymentConfig";

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
    const {
      items,
      method = "promptpay",
      couponCode,
      customer = {},
      shipping = {},
    } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    await connectToDatabase();

    const productIds = [];
    const preorderIds = [];
    for (const item of items) {
      if (item?.kind === "preorder-deposit") {
        const preorderId = String(item.preorderId || "").trim();
        if (!preorderId) {
          return NextResponse.json({ error: "กรุณาเลือกคำสั่งซื้อมัดจำให้ถูกต้อง" }, { status: 400 });
        }
        preorderIds.push(preorderId);
      } else {
        const productId = String(item?.productId || "").trim();
        if (!productId) {
          return NextResponse.json({ error: "ไม่พบสินค้าในตะกร้า" }, { status: 400 });
        }
        productIds.push(productId);
      }
    }

    const productDocs = productIds.length
      ? await Product.find({ _id: { $in: productIds }, active: true }).lean()
      : [];
    const byProductId = Object.fromEntries(productDocs.map((d) => [String(d._id), d]));

    const preorderDocs = preorderIds.length ? await PreOrder.find({ _id: { $in: preorderIds } }).lean() : [];
    const byPreorderId = Object.fromEntries(preorderDocs.map((d) => [String(d._id), d]));

    if (preorderIds.length && couponCode) {
      return NextResponse.json({ error: "มัดจำไม่รองรับการใช้คูปองส่วนลด" }, { status: 400 });
    }

    const checked = [];
    const depositLines = [];
    for (const item of items) {
      if (item?.kind === "preorder-deposit") {
        const preorderId = String(item.preorderId || "").trim();
        const preorder = byPreorderId[preorderId];
        if (!preorder) {
          return NextResponse.json({ error: "ไม่พบคำขอพรีออเดอร์" }, { status: 404 });
        }

        if (preorder.orderType !== "menu") {
          return NextResponse.json({ error: "คำขอพรีออเดอร์นี้ไม่รองรับมัดจำ" }, { status: 400 });
        }

        if (preorder.depositStatus === "paid") {
          return NextResponse.json({ error: "คำขอนี้ชำระมัดจำเรียบร้อยแล้ว" }, { status: 400 });
        }

        const depositAmount = Number(preorder.depositAmount || 0);
        if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
          return NextResponse.json({ error: "คำขอพรีออเดอร์นี้ยังไม่ได้คำนวณยอดมัดจำ" }, { status: 400 });
        }

        const line = {
          kind: "preorder-deposit",
          productId: null,
          preorderId,
          title: `มัดจำ ${preorder.menuSnapshot?.title || "Pre-order"}`,
          price: depositAmount,
          qty: 1,
          lineTotal: depositAmount,
        };
        checked.push(line);
        depositLines.push(line);
      } else {
        const productId = String(item?.productId || "").trim();
        const product = byProductId[productId];
        if (!product) {
          return NextResponse.json({ error: `Product not found: ${productId}` }, { status: 400 });
        }
        const qty = Math.max(1, Number(item.qty || 1));
        checked.push({
          kind: "product",
          productId: String(product._id),
          preorderId: null,
          title: product.title,
          price: product.price,
          qty,
          lineTotal: product.price * qty,
        });
      }
    }

    const subtotal = checked.reduce((n, x) => n + x.lineTotal, 0);

    // validate coupon
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase().trim() }).lean();
    }
    const { discount, used } = calcDiscount(coupon, subtotal);
    const total = subtotal - discount;

    const allowedMethods = ["promptpay", "bank"];
    if (!allowedMethods.includes(method)) {
      return NextResponse.json({ error: "Unknown payment method" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const paymentStatus = total > 0 ? "unpaid" : "paid";
    const { promptpayId, bankAccount: configuredBank } = getPaymentConfig();

    const order = await Order.create({
      userId,
      items: checked.map(({ lineTotal, ...rest }) => rest),
      subtotal,
      discount,
      total,
      coupon: used,
      customer: {
        name: String(customer?.name || ""),
        phone: String(customer?.phone || ""),
        email: String(customer?.email || ""),
      },
      shipping: {
        address1: String(shipping?.address1 || ""),
        address2: String(shipping?.address2 || ""),
        district: String(shipping?.district || ""),
        province: String(shipping?.province || ""),
        postcode: String(shipping?.postcode || ""),
        note: String(shipping?.note || ""),
      },
      payment: { method, status: paymentStatus, ref: "", amountPaid: 0, confirmedAt: null },
      status: "new",
    });

    const promptpayData =
      method === "promptpay" && total > 0
        ? {
            payload: promptPayPayload({ id: promptpayId, amount: total }),
            amount: total,
          }
        : null;

    const bankAccount = method === "bank" ? configuredBank : null;

    if (depositLines.length) {
      try {
        await PreOrder.updateMany(
          { _id: { $in: depositLines.map((line) => line.preorderId) } },
          { depositOrderId: order._id }
        );
      } catch (err) {
        console.warn("Failed to link deposit order", err);
      }
    }

    return NextResponse.json({
      ok: 1,
      method,
      orderId: String(order._id),
      orderPreview: { items: checked, subtotal, discount, total, coupon: used },
      promptpay: promptpayData,
      bankAccount,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
