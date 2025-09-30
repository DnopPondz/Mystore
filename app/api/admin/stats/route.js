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

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date(todayStart);
  monthStart.setDate(1);

  const activeStatusFilter = { $nin: ["cancel", "cancelled"] };
  const timeframes = [
    { key: "today", start: todayStart },
    { key: "week", start: weekStart },
    { key: "month", start: monthStart },
  ];

  const profitPromise = Promise.all(
    timeframes.map(({ start }) =>
      Order.aggregate([
        { $match: { createdAt: { $gte: start }, status: activeStatusFilter } },
        { $unwind: "$items" },
        {
          $group: {
            _id: null,
            revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
            cost: {
              $sum: {
                $multiply: [{ $ifNull: ["$items.costPrice", 0] }, "$items.qty"],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            revenue: { $ifNull: ["$revenue", 0] },
            cost: { $ifNull: ["$cost", 0] },
            profit: {
              $subtract: [
                { $ifNull: ["$revenue", 0] },
                { $ifNull: ["$cost", 0] },
              ],
            },
          },
        },
      ]),
    ),
  );

  const [todayAgg, newOrdersCount, lowStockCount, topProducts, preorderToday, profitAggs] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, status: activeStatusFilter } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments({
      createdAt: { $gte: todayStart },
      status: { $in: ["new", "pending", "preparing"] },
    }),
    Product.countDocuments({ stock: { $lt: 5 } }),
    Order.aggregate([
      { $match: { status: activeStatusFilter } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.title",
          qty: { $sum: "$items.qty" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
          cost: {
            $sum: {
              $multiply: [{ $ifNull: ["$items.costPrice", 0] }, "$items.qty"],
            },
          },
        },
      },
      {
        $addFields: {
          profit: { $subtract: ["$revenue", "$cost"] },
        },
      },
      {
        $project: {
          _id: 1,
          qty: 1,
          revenue: { $round: ["$revenue", 2] },
          cost: { $round: ["$cost", 2] },
          profit: { $round: ["$profit", 2] },
        },
      },
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
    profitPromise,
  ]);

  const profitSummary = timeframes.reduce((acc, frame, index) => {
    const doc = profitAggs?.[index]?.[0] || { revenue: 0, cost: 0, profit: 0 };
    const revenue = Number(doc.revenue || 0);
    const cost = Number(doc.cost || 0);
    const profit = Number(doc.profit != null ? doc.profit : revenue - cost);
    acc[frame.key] = {
      revenue: Math.round(revenue * 100) / 100,
      cost: Math.round(cost * 100) / 100,
      profit: Math.round(profit * 100) / 100,
    };
    return acc;
  }, {});

  const todaySales = todayAgg?.[0]?.total || 0;
  const preorderPipeline = preorderToday?.[0]?.total || 0;
  const todayProfit = profitSummary.today?.profit || 0;

  return NextResponse.json({
    cards: {
      todaySales,
      newOrders: newOrdersCount,
      lowStock: lowStockCount,
      preorderPipeline,
      todayProfit,
    },
    topProducts,
    profitSummary,
  });
}
