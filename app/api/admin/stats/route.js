import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { PreOrder } from "@/models/PreOrder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  buildTopProducts,
  hydrateOrdersWithCost,
  normalizeStatus,
  roundMoney,
  sumOrderFrame,
} from "@/lib/admin/sales-helpers";

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

  const earliestStart = new Date(
    Math.min(todayStart.getTime(), weekStart.getTime(), monthStart.getTime()),
  );

  const [rawOrders, lowStockCount, preorderToday] = await Promise.all([
    Order.find({ createdAt: { $gte: earliestStart } }).lean(),
    Product.countDocuments({ stock: { $lt: 5 } }),
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

  const resolvedOrders = await hydrateOrdersWithCost(rawOrders);

  const getFrameOrders = (start) => resolvedOrders.filter((order) => order.createdAt >= start);

  const profitSummary = {
    today: sumOrderFrame(getFrameOrders(todayStart)),
    week: sumOrderFrame(getFrameOrders(weekStart)),
    month: sumOrderFrame(getFrameOrders(monthStart)),
  };

  const todaySales = profitSummary.today.revenue;
  const todayProfit = profitSummary.today.profit;

  const newOrdersCount = resolvedOrders.filter((order) => {
    const status = normalizeStatus(order.status);
    return (status === "new" || status === "pending") && order.createdAt >= todayStart;
  }).length;

  const topProducts = buildTopProducts(getFrameOrders(monthStart));

  const preorderPipeline = roundMoney(preorderToday?.[0]?.total || 0);

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
