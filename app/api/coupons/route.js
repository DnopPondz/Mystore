import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectToDatabase();
  const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(coupons);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = await req.json();
  await connectToDatabase();

  // normalize
  data.code = String(data.code || "").toUpperCase().trim();
  if (!data.code) return NextResponse.json({ error: "CODE required" }, { status: 400 });

  const limit = Number(data.maxUsesPerUser);

  const created = await Coupon.create({
    code: data.code,
    type: data.type,
    value: Number(data.value || 0),
    minSubtotal: Number(data.minSubtotal || 0),
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    active: Boolean(data.active ?? true),
    maxUsesPerUser: Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : null,
  });
  return NextResponse.json(created, { status: 201 });
}
