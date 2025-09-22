import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serializeOrder } from "@/lib/serializeOrder";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const orders = await Order.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();
  const sanitized = orders.map((order) => serializeOrder(order));
  return NextResponse.json(sanitized);
}
