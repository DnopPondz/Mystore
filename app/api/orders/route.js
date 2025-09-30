// app/api/orders/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  InventoryError,
  releaseInventory,
  reserveInventory,
} from "@/lib/inventory";


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await connectToDatabase();
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json(orders);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req) {
  let deductedStock = [];
  try {
    const { items, payment = { method: "promptpay" } } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    await connectToDatabase();
    const ids = items.map((x) => x.productId);
    const docs = await Product.find({ _id: { $in: ids }, active: true }).lean();
    const byId = Object.fromEntries(docs.map((d) => [String(d._id), d]));
    for (const it of items) {
      if (!byId[it.productId]) {
        return NextResponse.json({ error: `Product not found: ${it.productId}` }, { status: 400 });
      }
    }

    const checked = items.map((it) => {
      const p = byId[it.productId];
      const qty = Math.max(1, Number(it.qty || 1));
      return { productId: String(p._id), title: p.title, price: p.price, qty, lineTotal: p.price * qty };
    });

    const insufficientStock = checked.filter((it) => {
      const product = byId[it.productId];
      return typeof product.stock === "number" && product.stock < it.qty;
    });
    if (insufficientStock.length > 0) {
      const first = insufficientStock[0];
      return NextResponse.json(
        {
          error: `Insufficient stock for ${first.title}`,
          productId: first.productId,
        },
        { status: 409 },
      );
    }

    deductedStock = await reserveInventory(checked, { productMap: byId });

    const subtotal = checked.reduce((n, x) => n + x.lineTotal, 0);
    const discount = 0;
    const total = subtotal - discount;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const allowedPaymentStatuses = new Set(["unpaid", "verifying", "paid", "invalid", "cash"]);
    const requestedStatus = payment.status;
    const fallbackStatus = total > 0 ? "unpaid" : "paid";
    const initialStatus = allowedPaymentStatuses.has(requestedStatus) ? requestedStatus : fallbackStatus;

    const order = await Order.create({
      userId,
      items: checked.map(({ lineTotal, ...rest }) => rest),
      subtotal, discount, total,
      payment: {
        method: payment.method || "promptpay",
        status: initialStatus,
        ref: payment.ref || "",
        amountPaid: payment.amountPaid || 0,
        confirmedAt: payment.confirmedAt || null,
      },
      status: "new",
    });

    return NextResponse.json({ ok: 1, id: String(order._id) }, { status: 201 });
  } catch (e) {
    if (deductedStock.length > 0) {
      await releaseInventory(deductedStock, { productMap: byId });
    }

    if (e instanceof InventoryError && e.code === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        {
          error: e.productTitle ? `Insufficient stock for ${e.productTitle}` : "Insufficient stock",
          productId: e.productId,
        },
        { status: 409 },
      );
    }

    if (e instanceof InventoryError && e.code === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
