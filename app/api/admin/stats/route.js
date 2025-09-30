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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(todayStart);
  monthStart.setDate(1);

  const profitPipeline = (startDate) => [
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $nin: ["cancel", "cancelled"] },
      },
    },
    { $unwind: "$items" },
    { $match: { "items.productId": { $ne: null } } },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $addFields: {
        product: { $arrayElemAt: ["$product", 0] },
        unitPrice: { $ifNull: ["$items.price", 0] },
        unitCost: {
          $ifNull: [
            "$items.cost",
            { $ifNull: ["$product.cost", 0] },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        profit: {
          $sum: {
            $multiply: [
              { $subtract: ["$unitPrice", "$unitCost"] },
              "$items.qty",
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        profit: { $round: ["$profit", 2] },
      },
    },
  ];

  const [
    todayAgg,
    monthAgg,
    newOrdersCount,
    lowStockCount,
    topProducts,
    preorderToday,
    todayProfitAgg,
    monthProfitAgg,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, status: { $nin: ["cancel", "cancelled"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: monthStart }, status: { $nin: ["cancel", "cancelled"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments({
      createdAt: { $gte: todayStart },
      status: { $in: ["new", "pending", "preparing"] },
    }),
    Product.countDocuments({ stock: { $lt: 5 } }),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart },
          status: { $nin: ["cancel", "cancelled"] },
        },
      },
      { $unwind: "$items" },
      { $match: { "items.productId": { $ne: null } } },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $addFields: {
          product: { $arrayElemAt: ["$product", 0] },
          unitPrice: { $ifNull: ["$items.price", 0] },
          unitCost: {
            $ifNull: [
              "$items.cost",
              { $ifNull: ["$product.cost", 0] },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$items.productId",
          qty: { $sum: "$items.qty" },
          revenue: { $sum: { $multiply: ["$unitPrice", "$items.qty"] } },
          cost: { $sum: { $multiply: ["$unitCost", "$items.qty"] } },
          fallbackTitle: { $first: "$items.title" },
          product: { $first: "$product" },
        },
      },
      {
        $addFields: {
          title: { $ifNull: ["$product.title", "$fallbackTitle"] },
          revenue: { $round: ["$revenue", 2] },
          cost: { $round: ["$cost", 2] },
          profit: {
            $round: [
              { $subtract: ["$revenue", "$cost"] },
              2,
            ],
          },
        },
      },
      {
        $project: {
          product: 0,
          fallbackTitle: 0,
          cost: 0,
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
    Order.aggregate(profitPipeline(todayStart)),
    Order.aggregate(profitPipeline(monthStart)),
  ]);

  const todaySales = Math.round(((todayAgg?.[0]?.total || 0) + Number.EPSILON) * 100) / 100;
  const monthSales = Math.round(((monthAgg?.[0]?.total || 0) + Number.EPSILON) * 100) / 100;
  const preorderPipeline = Math.round(((preorderToday?.[0]?.total || 0) + Number.EPSILON) * 100) / 100;
  const todayProfit = Math.round(((todayProfitAgg?.[0]?.profit || 0) + Number.EPSILON) * 100) / 100;
  const monthProfit = Math.round(((monthProfitAgg?.[0]?.profit || 0) + Number.EPSILON) * 100) / 100;

  return NextResponse.json({
    cards: {
      todaySales,
      todayProfit,
      monthSales,
      monthProfit,
      newOrders: newOrdersCount,
      lowStock: lowStockCount,
      preorderPipeline,
    },
    topProducts,
  });
}
