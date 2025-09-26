import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PreOrder } from "@/models/PreOrder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function sanitizeText(value) {
  return String(value || "").trim();
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const name = sanitizeText(payload.name);
  const phone = sanitizeText(payload.phone);
  const email = sanitizeText(payload.email);
  const eventDate = sanitizeText(payload.eventDate);
  const eventTime = sanitizeText(payload.eventTime);
  const servings = Number(payload.servings || 0);
  const budget = Number(payload.budget || 0);
  const flavourIdeas = sanitizeText(payload.flavourIdeas);
  const notes = sanitizeText(payload.notes);
  const preferredContact = sanitizeText(payload.preferredContact || "phone");

  if (!name || !phone || !flavourIdeas) {
    return NextResponse.json(
      { error: "กรุณากรอกชื่อ เบอร์ติดต่อ และรายละเอียดขนมที่ต้องการ" },
      { status: 400 }
    );
  }

  const data = {
    name,
    phone,
    email,
    eventDate,
    eventTime,
    servings: Number.isFinite(servings) && servings > 0 ? servings : 0,
    budget: Number.isFinite(budget) && budget > 0 ? budget : 0,
    flavourIdeas,
    notes,
    preferredContact: ["phone", "line", "email"].includes(preferredContact)
      ? preferredContact
      : "phone",
  };

  let stored = false;

  try {
    await connectToDatabase();
    await PreOrder.create(data);
    stored = true;
  } catch (error) {
    const message = String(error || "");
    if (message.includes("MONGODB_URI is not defined")) {
      console.warn("Pre-order request received but database is not configured");
    } else {
      console.error("Failed to store pre-order request", error);
      return NextResponse.json(
        { error: "ไม่สามารถบันทึกคำขอได้ กรุณาลองใหม่อีกครั้ง" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: 1, stored });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const items = await PreOrder.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: String(error || "") }, { status: 500 });
  }
}
