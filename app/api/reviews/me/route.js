import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Review } from "@/models/Review";

function serialize(review) {
  return {
    id: String(review._id),
    rating: Number(review.rating || 0),
    comment: review.comment || "",
    published: !!review.published,
    createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : null,
    updatedAt: review.updatedAt ? new Date(review.updatedAt).toISOString() : null,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      {
        review: null,
        demo: true,
      },
      { headers: { "x-demo-data": "true" } },
    );
  }

  try {
    await connectToDatabase();
    const review = await Review.findOne({ user: session.user.id }).lean();
    if (!review) {
      return NextResponse.json({ review: null });
    }

    return NextResponse.json({ review: serialize(review) });
  } catch (error) {
    console.error("โหลดรีวิวของผู้ใช้ไม่สำเร็จ", error);
    return NextResponse.json(
      {
        review: null,
        demo: true,
      },
      { headers: { "x-demo-data": "true" } },
    );
  }
}
