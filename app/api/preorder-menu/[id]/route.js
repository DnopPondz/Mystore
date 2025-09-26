import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PreorderMenuItem } from "@/models/PreorderMenuItem";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function sanitize(value) {
  return String(value || "").trim();
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PATCH(request, { params }) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  const { id } = await params;

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const update = {};
  if (payload.title !== undefined) update.title = sanitize(payload.title);
  if (payload.description !== undefined) update.description = sanitize(payload.description);
  if (payload.unitLabel !== undefined) update.unitLabel = sanitize(payload.unitLabel);
  if (payload.imageUrl !== undefined) update.imageUrl = sanitize(payload.imageUrl);
  if (payload.active !== undefined) update.active = Boolean(payload.active);

  if (payload.price !== undefined) {
    const price = Number(payload.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "ราคาต้องมากกว่า 0" }, { status: 400 });
    }
    update.price = Math.round(price * 100) / 100;
  }

  if (payload.depositRate !== undefined) {
    const raw = Number(payload.depositRate);
    if (!Number.isFinite(raw) || raw <= 0) {
      return NextResponse.json({ error: "อัตรามัดจำต้องมากกว่า 0" }, { status: 400 });
    }
    update.depositRate = Math.min(1, raw);
  }

  try {
    await connectToDatabase();
    const item = await PreorderMenuItem.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!item) {
      return NextResponse.json({ error: "ไม่พบเมนู" }, { status: 404 });
    }
    return NextResponse.json({ ok: 1, item });
  } catch (error) {
    return NextResponse.json({ error: String(error || "") }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  const { id } = await params;

  try {
    await connectToDatabase();
    const item = await PreorderMenuItem.findByIdAndUpdate(id, { active: false }, { new: true }).lean();
    if (!item) {
      return NextResponse.json({ error: "ไม่พบเมนู" }, { status: 404 });
    }
    return NextResponse.json({ ok: 1 });
  } catch (error) {
    return NextResponse.json({ error: String(error || "") }, { status: 500 });
  }
}
