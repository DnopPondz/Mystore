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

function normalizePayload(body, existingType) {
  const type = body.type || existingType || "custom";
  const payload = { ...body, type };

  if (body.title !== undefined) payload.title = String(body.title || "").trim();
  if (body.description !== undefined) payload.description = String(body.description || "").trim();
  if (body.active !== undefined) payload.active = Boolean(body.active);

  if (body.startAt !== undefined) payload.startAt = parseDate(body.startAt);
  if (body.endAt !== undefined) payload.endAt = parseDate(body.endAt);

  if (type === "buy_x_get_y") {
    if (body.buyQuantity !== undefined) payload.buyQuantity = Number(body.buyQuantity || 0);
    if (body.getQuantity !== undefined) payload.getQuantity = Number(body.getQuantity || 0);
    payload.stampGoal = 0;
    payload.stampReward = "";
  } else if (type === "stamp_card") {
    if (body.stampGoal !== undefined) payload.stampGoal = Number(body.stampGoal || 0);
    if (body.stampReward !== undefined) payload.stampReward = String(body.stampReward || "").trim();
    payload.buyQuantity = 0;
    payload.getQuantity = 0;
  } else {
    payload.buyQuantity = 0;
    payload.getQuantity = 0;
    payload.stampGoal = 0;
    payload.stampReward = "";
  }

  return payload;
}

export async function GET(_req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();
  const promotion = await Promotion.findById(id).lean();
  if (!promotion) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(promotion);
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  await connectToDatabase();
  const existing = await Promotion.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const payload = normalizePayload(body, existing.type);

  if (payload.title !== undefined && !payload.title) {
    return NextResponse.json({ error: "ต้องระบุชื่อโปรโมชัน" }, { status: 400 });
  }

  if (payload.type === "buy_x_get_y") {
    const buy = payload.buyQuantity ?? existing.buyQuantity;
    const get = payload.getQuantity ?? existing.getQuantity;
    if (buy <= 0 || get <= 0) {
      return NextResponse.json({ error: "กรุณาระบุจำนวนซื้อ/แถมให้ถูกต้อง" }, { status: 400 });
    }
  }

  if (payload.type === "stamp_card") {
    const goal = payload.stampGoal ?? existing.stampGoal;
    if (goal <= 0) {
      return NextResponse.json({ error: "กรุณาระบุจำนวนแต้มที่ต้องสะสม" }, { status: 400 });
    }
  }

  Object.assign(existing, payload);
  await existing.save();
  return NextResponse.json(existing.toObject());
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();
  const result = await Promotion.findByIdAndDelete(id);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: 1 });
}
