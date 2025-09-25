import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { z } from "zod";

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

const updateSchema = z
  .object({
    published: z.boolean().optional(),
    userName: z
      .string()
      .trim()
      .min(1, "กรุณาระบุชื่อผู้รีวิว")
      .max(120, "ชื่อยาวเกินไป")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "ไม่มีข้อมูลที่ต้องการแก้ไข",
    path: ["published"],
  });

export async function PATCH(req, { params }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates = {};
  if (Object.prototype.hasOwnProperty.call(parsed.data, "published")) {
    updates.published = parsed.data.published;
  }
  if (parsed.data.userName) {
    updates.userName = parsed.data.userName.trim();
  }

  await connectToDatabase();
  const updated = await Review.findByIdAndUpdate(id, updates, { new: true })
    .populate({ path: "user", select: "email name" })
    .lean();
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ review: serializeAdminReview(updated) });
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
  }

  await connectToDatabase();
  const deleted = await Review.findByIdAndDelete(id).lean();
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
