import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Promotion } from "@/models/Promotion";

export async function GET() {
  await connectToDatabase();
  const now = new Date();
  const promotions = await Promotion.find({
    active: true,
    $and: [
      { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
      { $or: [{ endAt: null }, { endAt: { $gte: now } }] },
    ],
  })
    .sort({ startAt: 1, createdAt: -1 })
    .lean();

  return NextResponse.json(promotions);
}
