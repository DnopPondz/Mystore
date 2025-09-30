import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectToDatabase();
  const rows = await Order.find({}).lean();

  const header = ["date", "orderId", "total", "status", "totalCost", "profit"].join(",");
  const lines = rows.map((r) => {
    const totals = Array.isArray(r.items)
      ? r.items.reduce(
          (acc, item) => {
            const qty = Number(item?.qty || 0);
            const unitPrice = Number(item?.price || 0);
            const unitCost = Number(item?.cost || 0);
            const revenue = unitPrice * qty;
            const cost = unitCost * qty;
            return {
              revenue: acc.revenue + revenue,
              cost: acc.cost + cost,
            };
          },
          { revenue: 0, cost: 0 },
        )
      : { revenue: 0, cost: 0 };

    const roundedCost = Math.round((totals.cost + Number.EPSILON) * 100) / 100;
    const profitValue = Math.round(((totals.revenue - totals.cost) + Number.EPSILON) * 100) / 100;

    return [
      new Date(r.createdAt).toISOString(),
      String(r._id),
      r.total,
      r.status,
      roundedCost,
      profitValue,
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
