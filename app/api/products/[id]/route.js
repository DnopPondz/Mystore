import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { normalizeProductPayload } from "../utils";

export async function GET(_req, { params }) {
  const { id } = await params;            // ✅ ต้อง await
  await connectToDatabase();
  const p = await Product.findById(id).lean();
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(p);
}

export async function PATCH(req, { params }) {
  const { id } = await params;            // ✅ ต้อง await
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectToDatabase();
  const data = await req.json();
  const payload = normalizeProductPayload(data);
  const updated = await Product.findByIdAndUpdate(id, payload, { new: true }).lean();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req, { params }) {
  const { id } = await params;            // ✅ ต้อง await
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectToDatabase();
  const ok = await Product.findByIdAndDelete(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: 1 });
}
