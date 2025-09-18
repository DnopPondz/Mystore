// app/api/admin/export/orders/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();
  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(1000).lean();

  const header = ["id","createdAt","status","total","paymentMethod","paymentStatus","items"].join(",");
  const rows = orders.map(o => {
    const items = o.items.map(it => `${it.title}×${it.qty}@${it.price}`).join(" | ");
    return [
      o._id,
      new Date(o.createdAt).toISOString(),
      o.status,
      o.total,
      o.payment?.method || "",
      o.payment?.status || "",
      `"${items.replace(/"/g,'""')}"`,
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders.csv"`,
    },
  });
}
