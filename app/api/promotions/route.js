import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Promotion } from "@/models/Promotion";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizePayload(body) {
  const type = body.type || "custom";
  const payload = {
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    type,
    active: Boolean(body.active ?? true),
    startAt: parseDate(body.startAt),
    endAt: parseDate(body.endAt),
    buyQuantity: type === "buy_x_get_y" ? Number(body.buyQuantity || 0) : 0,
    getQuantity: type === "buy_x_get_y" ? Number(body.getQuantity || 0) : 0,
    stampGoal: type === "stamp_card" ? Number(body.stampGoal || 0) : 0,
    stampReward: type === "stamp_card" ? String(body.stampReward || "").trim() : "",
  };
  return payload;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();
  const promotions = await Promotion.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(promotions);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const payload = normalizePayload(body);

  if (!payload.title) {
    return NextResponse.json({ error: "ต้องระบุชื่อโปรโมชัน" }, { status: 400 });
  }

  if (payload.type === "buy_x_get_y" && (payload.buyQuantity <= 0 || payload.getQuantity <= 0)) {
    return NextResponse.json({ error: "กรุณาระบุจำนวนซื้อ/แถมให้ถูกต้อง" }, { status: 400 });
  }

  if (payload.type === "stamp_card" && payload.stampGoal <= 0) {
    return NextResponse.json({ error: "กรุณาระบุจำนวนแต้มที่ต้องสะสม" }, { status: 400 });
  }

  await connectToDatabase();
  const created = await Promotion.create(payload);
  return NextResponse.json(created, { status: 201 });
}
