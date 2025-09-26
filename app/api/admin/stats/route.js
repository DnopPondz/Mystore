import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { PreOrder } from "@/models/PreOrder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectToDatabase();

  const todayStart = new Date(); todayStart.setHours(0,0,0,0);

  const [todayAgg, newOrdersCount, lowStockCount, topProducts, preorderToday] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, status: { $nin: ["cancel", "cancelled"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments({
      createdAt: { $gte: todayStart },
      status: { $in: ["new", "pending", "preparing"] },
    }),
    Product.countDocuments({ stock: { $lt: 5 } }),
    Order.aggregate([
      { $match: { status: { $nin: ["cancel", "cancelled"] } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.title", qty: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
      { $sort: { qty: -1 } },
      { $limit: 10 },
    ]),
    PreOrder.aggregate([
      {
        $match: {
          quotedAt: { $gte: todayStart },
          status: { $in: ["contacted", "quoted", "confirmed"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quotedTotal" },
        },
      },
    ]),
  ]);

  const todaySales = todayAgg?.[0]?.total || 0;
  const preorderPipeline = preorderToday?.[0]?.total || 0;

  return NextResponse.json({
    cards: {
      todaySales,
      newOrders: newOrdersCount,
      lowStock: lowStockCount,
      preorderPipeline,
    },
    topProducts,
  });
}
