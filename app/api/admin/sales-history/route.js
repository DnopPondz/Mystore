import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import {
  buildTopProducts,
  hydrateOrdersWithCost,
  roundMoney,
  sumOrderFrame,
} from "@/lib/admin/sales-helpers";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 370; // ~1 ปีปฏิทิน

const parseNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toStartOfDay = (input) => {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
};

const toEndOfDay = (input) => {
  const date = new Date(input);
  date.setHours(23, 59, 59, 999);
  return date;
};

const parseRange = (searchParams) => {
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const monthParam = parseNumber(searchParams.get("month"));
  const yearParam = parseNumber(searchParams.get("year"));

  let startDate;
  let endDate;

  if (startParam || endParam) {
    const maybeStart = startParam ? new Date(startParam) : null;
    const maybeEnd = endParam ? new Date(endParam) : null;
    if (maybeStart && !Number.isNaN(maybeStart.getTime())) {
      startDate = toStartOfDay(maybeStart);
    }
    if (maybeEnd && !Number.isNaN(maybeEnd.getTime())) {
      endDate = toEndOfDay(maybeEnd);
    }
  }

  if (!startDate || !endDate) {
    const now = new Date();
    const monthIndex = monthParam && monthParam >= 1 && monthParam <= 12 ? monthParam - 1 : now.getMonth();
    const year = yearParam && yearParam >= 2000 ? yearParam : now.getFullYear();

    startDate = new Date(year, monthIndex, 1);
    endDate = new Date(year, monthIndex + 1, 0);
    endDate.setHours(23, 59, 59, 999);
  }

  if (endDate < startDate) {
    const tmp = startDate;
    startDate = endDate;
    endDate = tmp;
  }

  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / DAY_IN_MS);
  if (diffDays > MAX_RANGE_DAYS) {
    startDate = new Date(endDate.getTime() - MAX_RANGE_DAYS * DAY_IN_MS);
    startDate.setHours(0, 0, 0, 0);
  }

  return { startDate, endDate };
};

const groupOrdersByDay = (orders) => {
  const bucket = new Map();

  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    if (!bucket.has(key)) {
      bucket.set(key, []);
    }
    bucket.get(key).push(order);
  }

  return Array.from(bucket.entries())
    .map(([date, group]) => ({
      date,
      ...sumOrderFrame(group),
    }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
};

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const { startDate, endDate } = parseRange(searchParams);

  const rawOrders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate },
  }).lean();

  const orders = await hydrateOrdersWithCost(rawOrders);

  const totals = sumOrderFrame(orders);

  const endDayStart = toStartOfDay(endDate);
  const endDayEnd = toEndOfDay(endDate);
  const dailyOrders = orders.filter(
    (order) => order.createdAt >= endDayStart && order.createdAt <= endDayEnd,
  );

  const weekStart = new Date(Math.max(startDate.getTime(), endDayStart.getTime() - 6 * DAY_IN_MS));
  weekStart.setHours(0, 0, 0, 0);
  const weeklyOrders = orders.filter((order) => order.createdAt >= weekStart);

  const timeline = groupOrdersByDay(orders);
  const topProducts = buildTopProducts(orders);
  const orderCount = orders.length;
  const averageOrderValue = orderCount > 0 ? roundMoney(totals.revenue / orderCount) : 0;

  return NextResponse.json({
    range: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    totals,
    daily: sumOrderFrame(dailyOrders),
    sevenDay: sumOrderFrame(weeklyOrders),
    timeline,
    topProducts,
    orders: {
      count: orderCount,
      averageValue: averageOrderValue,
    },
  });
}
