import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";

export async function POST() {
  await connectToDatabase();

  // เคลียร์ก่อนแล้วใส่ใหม่
  await Product.deleteMany({});
  await Product.insertMany([
    {
      title: "Bun Original",
      slug: "bun-original",
      description: "นุ่ม หอม",
      price: 49,
      costPrice: 28,
      stock: 50,
      active: true,
    },
    {
      title: "Bun Creamy",
      slug: "bun-creamy",
      description: "ครีมหอมมัน",
      price: 59,
      costPrice: 33,
      stock: 30,
      active: true,
    },
    {
      title: "Bun Choco",
      slug: "bun-choco",
      description: "ช็อคเข้มข้น",
      price: 69,
      costPrice: 38,
      stock: 20,
      active: true,
    },
  ]);

  const count = await Product.countDocuments({});
  return NextResponse.json({ ok: 1, count });
}
