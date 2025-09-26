import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PreorderMenuItem } from "@/models/PreorderMenuItem";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function sanitize(value) {
  return String(value || "").trim();
}

export async function GET(request) {
  try {
    const includeAll = request.nextUrl.searchParams.get("all") === "1";
    await connectToDatabase();

    if (includeAll) {
      const session = await getServerSession(authOptions);
      if (session?.user?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const items = await PreorderMenuItem.find({}).sort({ createdAt: 1 }).lean();
      return NextResponse.json(items);
    }

    const items = await PreorderMenuItem.find({ active: true }).sort({ createdAt: 1 }).lean();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: String(error || "") }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const title = sanitize(payload.title);
  const description = sanitize(payload.description);
  const unitLabel = sanitize(payload.unitLabel || "ชุด");
  const imageUrl = sanitize(payload.imageUrl);
  const price = Number(payload.price || 0);
  const depositRateRaw = Number(payload.depositRate);
  const depositRate = Number.isFinite(depositRateRaw) && depositRateRaw > 0 ? Math.min(1, depositRateRaw) : 0.5;

  if (!title) {
    return NextResponse.json({ error: "กรุณากรอกชื่อเมนู" }, { status: 400 });
  }

  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "ราคาต้องมากกว่า 0" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const item = await PreorderMenuItem.create({
      title,
      description,
      unitLabel,
      price: Math.round(price * 100) / 100,
      depositRate,
      imageUrl,
    });
    return NextResponse.json({ ok: 1, item });
  } catch (error) {
    return NextResponse.json({ error: String(error || "") }, { status: 500 });
  }
}
