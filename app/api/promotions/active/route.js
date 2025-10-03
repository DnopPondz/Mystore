import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Promotion } from "@/models/Promotion";
import { getActiveSamplePromotions } from "@/lib/sampleData";

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json(getActiveSamplePromotions(), {
      headers: { "x-demo-data": "true" },
    });
  }

  try {
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
  } catch (error) {
    console.error("โหลดโปรโมชันจากฐานข้อมูลไม่สำเร็จ", error);
    return NextResponse.json(getActiveSamplePromotions(), {
      headers: { "x-demo-data": "true" },
    });
  }
}
