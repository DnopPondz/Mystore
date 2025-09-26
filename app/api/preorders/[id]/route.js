import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PreOrder } from "@/models/PreOrder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const allowedStatus = new Set(["new", "contacted", "quoted", "confirmed", "closed"]);

export async function PATCH(request, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload = {};
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const update = {};
  if (typeof payload.status === "string" && allowedStatus.has(payload.status)) {
    update.status = payload.status;
  }

  const textFields = ["notes", "flavourIdeas", "name", "phone", "email", "eventDate", "eventTime", "preferredContact"];
  for (const key of textFields) {
    if (payload[key] !== undefined) {
      update[key] = String(payload[key] ?? "").trim();
    }
  }

  const numericFields = ["servings", "budget"];
  for (const key of numericFields) {
    if (payload[key] !== undefined) {
      const value = Number(payload[key]);
      update[key] = Number.isFinite(value) && value >= 0 ? value : 0;
    }
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No updates" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const updated = await PreOrder.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error || "") }, { status: 500 });
  }
}

export async function GET(_request, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const preorder = await PreOrder.findById(id).lean();
    if (!preorder) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(preorder);
  } catch (error) {
    return NextResponse.json({ error: String(error || "") }, { status: 500 });
  }
}
