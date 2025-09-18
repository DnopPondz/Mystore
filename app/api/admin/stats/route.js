import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectToDatabase();

  const todayStart = new Date(); todayStart.setHours(0,0,0,0);

  const [todayAgg, newOrdersCount, lowStockCount, topProducts] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: todayStart }, status: { $ne: "cancelled" } }),
    Product.countDocuments({ stock: { $lt: 5 } }),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.title", qty: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
      { $sort: { qty: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const todaySales = todayAgg?.[0]?.total || 0;

  return NextResponse.json({
    cards: {
      todaySales,
      newOrders: newOrdersCount,
      lowStock: lowStockCount,
    },
    topProducts,
  });
}
