import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectToDatabase();
  const rows = await Order.find({ status: { $nin: ["cancel", "cancelled"] } }).lean();

  const header = ["date","orderId","total","status","revenue","cost","profit"].join(",");
  const lines = rows.map((r) => {
    const items = Array.isArray(r.items) ? r.items : [];
    const revenue = items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
      0,
    );
    const cost = items.reduce(
      (sum, item) => sum + Number(item.costPrice || 0) * Number(item.qty || 0),
      0,
    );
    const profit = revenue - cost;

    return [
      new Date(r.createdAt).toISOString(),
      String(r._id),
      Number(r.total || 0).toFixed(2),
      r.status,
      revenue.toFixed(2),
      cost.toFixed(2),
      profit.toFixed(2),
    ].join(",");
  });
  const csv = [header, ...lines].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"sales.csv\"",
    },
  });
}
