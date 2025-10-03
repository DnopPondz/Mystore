import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildProductPayload } from "./helpers";
import { getSampleProducts } from "@/lib/sampleData";

function formatProductsForRole(products, { isAdmin }) {
  return products.map((product) => {
    const base = { ...product, _id: String(product._id) };
    const priceSource = base.price ?? base.unitPrice ?? 0;
    const costSource =
      base.costPrice ?? base.cost ?? (base.pricing && typeof base.pricing === "object" ? base.pricing.cost : undefined);
    if (isAdmin) {
      const priceValue = Number(priceSource);
      const costValue = Number(costSource);
      return {
        ...base,
        price: Number.isFinite(priceValue) ? priceValue : 0,
        costPrice: Number.isFinite(costValue) ? costValue : 0,
      };
    }
    const { costPrice: _ignoredCostPrice, cost: _ignoredCost, pricing: _ignoredPricing, ...rest } = base;
    return rest;
  });
}

function respondWithSampleProducts({ isAdmin }) {
  const sample = getSampleProducts({ activeOnly: !isAdmin });
  return NextResponse.json(formatProductsForRole(sample, { isAdmin }), {
    headers: { "x-demo-data": "true" },
  });
}

export async function GET() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.warn("ไม่สามารถอ่าน session ได้สำหรับ /api/products", error);
  }

  const isAdmin = session?.user?.role === "admin";

  if (!process.env.MONGODB_URI) {
    return respondWithSampleProducts({ isAdmin });
  }

  try {
    await connectToDatabase();
    const filter = isAdmin ? {} : { active: true };
    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json(formatProductsForRole(products, { isAdmin }));
  } catch (error) {
    console.error("โหลดรายการสินค้าไม่สำเร็จ", error);
    return respondWithSampleProducts({ isAdmin });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectToDatabase();
  const data = await req.json();
  const payload = buildProductPayload(data);
  const created = await Product.create(payload);
  const createdObject = created.toObject({ depopulate: true });
  const priceValue = Number(createdObject.price);
  const costValue = Number(createdObject.costPrice);
  return NextResponse.json(
    {
      ...createdObject,
      _id: String(createdObject._id),
      price: Number.isFinite(priceValue) ? priceValue : payload.price,
      costPrice: Number.isFinite(costValue) ? costValue : payload.costPrice,
    },
    { status: 201 },
  );
}
