import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { PreOrder } from "@/models/PreOrder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const CANCELLED_STATUS_TOKENS = ["cancel", "void", "refund"];

const roundMoney = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100) / 100;
};

const toSafeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const toDate = (value) => {
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeStatus = (value) => String(value || "").toLowerCase();

const isCancelledStatus = (value) => {
  const normalized = normalizeStatus(value);
  return CANCELLED_STATUS_TOKENS.some((token) => normalized.includes(token));
};

const sumOrderFrame = (orders) => {
  let revenue = 0;
  let cost = 0;

  for (const order of orders) {
    revenue += toSafeNumber(order.total);

    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      const qty = toSafeNumber(item.qty);
      if (qty <= 0) continue;
      const unitCost = toSafeNumber(item.costPrice);
      cost += unitCost * qty;
    }
  }

  const profit = revenue - cost;
  return {
    revenue: roundMoney(revenue),
    cost: roundMoney(cost),
    profit: roundMoney(profit),
  };
};

const buildTopProducts = (orders) => {
  const productTotals = new Map();

  for (const order of orders) {
    const items = Array.isArray(order.items) ? order.items : [];
    if (items.length === 0) continue;

    const grossTotal = items.reduce((sum, item) => {
      const qty = toSafeNumber(item.qty);
      if (qty <= 0) return sum;
      const price = toSafeNumber(item.price);
      return sum + price * qty;
    }, 0);

    const orderTotal = toSafeNumber(order.total);
    const netTotal = orderTotal > 0 ? orderTotal : grossTotal;
    const scale = grossTotal > 0 ? netTotal / grossTotal : 0;

    for (const item of items) {
      const qty = toSafeNumber(item.qty);
      if (qty <= 0) continue;

      const price = toSafeNumber(item.price);
      const costPrice = toSafeNumber(item.costPrice);
      const gross = price * qty;
      const revenue = scale > 0 ? gross * scale : gross;
      const cost = costPrice * qty;
      const profit = revenue - cost;

      const key = item.productId ? String(item.productId) : item._id ? String(item._id) : item.title || `product-${productTotals.size}`;
      const title = item.title || key;

      const existing = productTotals.get(key) || {
        _id: title,
        productId: item.productId ? String(item.productId) : null,
        title,
        qty: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
      };

      existing.qty += qty;
      existing.revenue += revenue;
      existing.cost += cost;
      existing.profit = existing.revenue - existing.cost;

      productTotals.set(key, existing);
    }
  }

  return Array.from(productTotals.values())
    .map((product) => ({
      ...product,
      qty: Math.round(product.qty),
      revenue: roundMoney(product.revenue),
      cost: roundMoney(product.cost),
      profit: roundMoney(product.profit),
    }))
    .sort((a, b) => {
      if (b.qty !== a.qty) return b.qty - a.qty;
      return b.revenue - a.revenue;
    })
    .slice(0, 10);
};

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

  const orders = rawOrders
    .map((order) => {
      const createdAt = toDate(order.createdAt);
      if (!createdAt) return null;
      return { ...order, createdAt };
    })
    .filter(Boolean)
    .filter((order) => !isCancelledStatus(order.status));

  const productCostMap = new Map();
  const productIdSet = new Set();
  for (const order of orders) {
    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      const productId = item?.productId || item?._id;
      if (productId) {
        productIdSet.add(String(productId));
      }
    }
  }

  if (productIdSet.size > 0) {
    const docs = await Product.find({ _id: { $in: Array.from(productIdSet) } })
      .select({ costPrice: 1 })
      .lean();
    for (const doc of docs) {
      productCostMap.set(String(doc._id), toSafeNumber(doc.costPrice));
    }
  }

  const resolvedOrders = orders.map((order) => ({
    ...order,
    items: Array.isArray(order.items)
      ? order.items.map((item) => {
          const rawCost = toSafeNumber(item?.costPrice);
          if (rawCost > 0) {
            return { ...item, costPrice: rawCost };
          }
          const lookupId = item?.productId || item?._id;
          const fallbackCost = lookupId ? productCostMap.get(String(lookupId)) : undefined;
          return {
            ...item,
            costPrice: toSafeNumber(fallbackCost),
          };
        })
      : [],
  }));

  const getFrameOrders = (start) => resolvedOrders.filter((order) => order.createdAt >= start);

  const profitSummary = {
    today: sumOrderFrame(getFrameOrders(todayStart)),
    week: sumOrderFrame(getFrameOrders(weekStart)),
    month: sumOrderFrame(getFrameOrders(monthStart)),
  };

  const todaySales = profitSummary.today.revenue;
  const todayProfit = profitSummary.today.profit;

  const newOrdersCount = orders.filter((order) => {
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
