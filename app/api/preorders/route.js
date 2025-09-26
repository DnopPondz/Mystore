import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PreOrder } from "@/models/PreOrder";
import { PreorderMenuItem } from "@/models/PreorderMenuItem";
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
  const notes = sanitizeText(payload.notes);
  const preferredContact = sanitizeText(payload.preferredContact || "phone");
  const orderType = sanitizeText(payload.orderType || "break") === "menu" ? "menu" : "break";

  if (!name || !phone) {
    return NextResponse.json(
      { error: "กรุณากรอกชื่อและเบอร์ติดต่อ" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const data = {
    name,
    phone,
    email,
    eventDate,
    eventTime,
    servings: Number.isFinite(servings) && servings > 0 ? servings : 0,
    budget: Number.isFinite(budget) && budget > 0 ? budget : 0,
    notes,
    preferredContact: ["phone", "line", "email"].includes(preferredContact)
      ? preferredContact
      : "phone",
    orderType,
  };

  if (orderType === "menu") {
    const menuItemId = sanitizeText(payload.menuItemId);
    const quantity = Number(payload.quantity || 0);

    if (!menuItemId) {
      return NextResponse.json({ error: "กรุณาเลือกเมนูที่ต้องการ" }, { status: 400 });
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "จำนวนชุดต้องมากกว่า 0" }, { status: 400 });
    }

    const menuItem = await PreorderMenuItem.findOne({ _id: menuItemId, active: true }).lean();
    if (!menuItem) {
      return NextResponse.json({ error: "ไม่พบเมนูที่เลือก" }, { status: 404 });
    }

    const depositRate = Number.isFinite(menuItem.depositRate) && menuItem.depositRate > 0
      ? Math.min(1, menuItem.depositRate)
      : 0.5;

    const unitPrice = Number(menuItem.price || 0);
    const totalPrice = unitPrice * quantity;
    const depositAmount = Math.round(totalPrice * depositRate * 100) / 100;

    data.menuItemId = menuItem._id;
    data.menuSnapshot = {
      title: menuItem.title,
      unitLabel: menuItem.unitLabel || "",
      price: unitPrice,
      depositRate,
    };
    data.quantity = quantity;
    data.itemPrice = unitPrice;
    data.totalPrice = totalPrice;
    data.depositAmount = depositAmount;
    data.depositStatus = depositAmount > 0 ? "pending" : "waived";
    data.flavourIdeas = sanitizeText(payload.flavourIdeas) || menuItem.title;
    data.notes = notes;
  } else {
    const flavourIdeas = sanitizeText(payload.flavourIdeas);
    if (!flavourIdeas) {
      return NextResponse.json(
        { error: "กรุณาระบุรายละเอียดขนมที่ต้องการ" },
        { status: 400 }
      );
    }
    data.flavourIdeas = flavourIdeas;
    data.depositStatus = "waived";
  }

  try {
    const preorder = await PreOrder.create(data);
    return NextResponse.json({
      ok: 1,
      stored: true,
      preorderId: String(preorder._id),
      orderType: preorder.orderType,
      depositAmount: preorder.depositAmount,
      totalPrice: preorder.totalPrice,
      menuSnapshot: preorder.menuSnapshot,
    });
  } catch (error) {
    console.error("Failed to store pre-order request", error);
    return NextResponse.json(
      { error: "ไม่สามารถบันทึกคำขอได้ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
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
