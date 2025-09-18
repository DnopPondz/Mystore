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

  const header = ["date","orderId","total","status"].join(",");
  const lines = rows.map(r => [
    new Date(r.createdAt).toISOString(),
    String(r._id),
    r.total,
    r.status
  ].join(","));
  const csv = [header, ...lines].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"sales.csv\"",
    },
  });
}
