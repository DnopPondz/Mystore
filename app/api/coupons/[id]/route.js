import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectToDatabase();
  const c = await Coupon.findById(id).lean();
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(c);
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = await req.json();
  await connectToDatabase();
  if (data.code) data.code = String(data.code).toUpperCase().trim();
  if (data.expiresAt === "") data.expiresAt = null;

  const updated = await Coupon.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectToDatabase();
  const ok = await Coupon.findByIdAndDelete(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: 1 });
}
