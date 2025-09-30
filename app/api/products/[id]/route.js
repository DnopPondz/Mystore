import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildProductUpdate } from "../helpers";

export async function GET(_req, { params }) {
  const { id } = await params;            // ✅ ต้อง await
  await connectToDatabase();
  const p = await Product.findById(id).lean();
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "admin";
  const base = { ...p, _id: String(p._id) };
  if (isAdmin) {
    const priceSource = base.price ?? base.unitPrice ?? 0;
    const costSource = base.costPrice ?? base.cost ?? (base.pricing && typeof base.pricing === "object" ? base.pricing.cost : undefined);
    const priceValue = Number(priceSource);
    const costValue = Number(costSource);
    return NextResponse.json({
      ...base,
      price: Number.isFinite(priceValue) ? priceValue : 0,
      costPrice: Number.isFinite(costValue) ? costValue : 0,
    });
  }
  const { costPrice: _ignoredCostPrice, cost: _ignoredCost, pricing: _ignoredPricing, ...rest } = base;
  return NextResponse.json(rest);
}

export async function PATCH(req, { params }) {
  const { id } = await params;            // ✅ ต้อง await
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectToDatabase();
  const data = await req.json();
  const update = buildProductUpdate(data);
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }
  const updated = await Product.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const priceValue = Number(updated.price);
  const costValue = Number(updated.costPrice);
  return NextResponse.json({
    ...updated,
    _id: String(updated._id),
    price: Number.isFinite(priceValue) ? priceValue : update.price,
    costPrice: Number.isFinite(costValue) ? costValue : update.costPrice,
  });
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
