import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req, { params }) {
  const { id } = await params;
  await connectToDatabase();
  const o = await Order.findById(id).lean();
  if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(o);
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();
  const data = await req.json();
  const prev = await Order.findById(id).lean();
  if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ถ้าเปลี่ยนเป็น cancelled → คืนสต็อก
  if (data.status === "cancelled" && prev.status !== "cancelled") {
    await Promise.all(
      prev.items.map(it =>
        Product.updateOne(
          { _id: it.productId },
          { $inc: { stock: +it.qty } }
        )
      )
    );
  }

  const updated = await Order.findByIdAndUpdate(id, data, { new: true }).lean();
  return NextResponse.json(updated);
}
