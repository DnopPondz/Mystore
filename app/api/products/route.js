import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  const filter = session?.user?.role === "admin" ? {} : { active: true };
  const products = await Product.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json(products);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectToDatabase();
  const data = await req.json();
  const created = await Product.create(data);
  return NextResponse.json(created, { status: 201 });
}
