import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serializeOrder } from "@/lib/serializeOrder";

export async function GET(_req, { params }) {
  const { id } = await params; // Next 15 ต้อง await
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const order = await Order.findOne({ _id: id, userId: session.user.id }).lean();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serializeOrder(order, { includeSlip: true }));
}
