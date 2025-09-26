import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PreOrder } from "@/models/PreOrder";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serializePreorder } from "@/lib/serializePreorder";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();

  const preorders = await PreOrder.find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const orderIds = preorders
    .map((p) => p.orderId)
    .filter((id) => id)
    .map((id) => id.toString());

  let ordersById = new Map();
  if (orderIds.length > 0) {
    const orders = await Order.find({ _id: { $in: orderIds } })
      .sort({ createdAt: -1 })
      .lean();
    ordersById = new Map(orders.map((order) => [order._id.toString(), order]));
  }

  const data = preorders.map((doc) => {
    const order = doc.orderId ? ordersById.get(doc.orderId.toString()) : null;
    return serializePreorder(doc, { order });
  });

  return NextResponse.json(data);
}
