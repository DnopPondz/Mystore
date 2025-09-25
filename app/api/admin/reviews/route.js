import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Review } from "@/models/Review";

function serializeAdminReview(review) {
  const user = review.user || {};
  return {
    id: String(review._id),
    userName: review.userName || user.name || "ลูกค้า",
    userEmail: user.email || "",
    rating: Number(review.rating || 0),
    comment: review.comment || "",
    published: !!review.published,
    createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : null,
    updatedAt: review.updatedAt ? new Date(review.updatedAt).toISOString() : null,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();
  const docs = await Review.find({})
    .sort({ createdAt: -1 })
    .populate({ path: "user", select: "email name" })
    .lean();

  return NextResponse.json({ reviews: docs.map(serializeAdminReview) });
}
