import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Review } from "@/models/Review";

const hasMongo = Boolean(process.env.MONGODB_URI);

const demoReviews = [
  {
    id: "demo-1",
    name: "คุณแอน",
    rating: 5,
    comment: "ซาลาเปาไส้หมูสับไข่เค็มอร่อยมาก แป้งนุ่ม ไส้แน่นกำลังดีค่ะ",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-2",
    name: "คุณบอส",
    rating: 4.5,
    comment: "ขนมจีบรสชาติยอดเยี่ยม ส่งตรงถึงออฟฟิศตรงเวลา",
    createdAt: new Date().toISOString(),
  },
];

const createSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(5, "กรุณาเขียนรีวิวอย่างน้อย 5 ตัวอักษร")
    .max(600, "รีวิวยาวเกินไป"),
});

function normalizeRating(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return 1;
  const clamped = Math.min(5, Math.max(1, value));
  return Math.round(clamped * 2) / 2;
}

function serializePublicReview(review) {
  return {
    id: String(review._id),
    name: review.userName || "ลูกค้า",
    rating: Number(review.rating || 0),
    comment: review.comment || "",
    createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : null,
  };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get("featured");
  const minRatingParam = searchParams.get("minRating");
  const limitParam = searchParams.get("limit");

  let minRating = 0;
  if (featured === "true") {
    minRating = 3.5;
  }
  if (minRatingParam != null) {
    const parsed = Number(minRatingParam);
    if (!Number.isNaN(parsed)) {
      minRating = Math.max(minRating, parsed);
    }
  }

  const limit = Math.min(100, Math.max(1, Number.parseInt(limitParam || "0", 10) || (featured === "true" ? 50 : 20)));

  const filter = { published: true };
  if (minRating > 0) {
    filter.rating = { $gte: minRating };
  }

  if (!hasMongo) {
    return NextResponse.json({ reviews: demoReviews.slice(0, limit) });
  }

  await connectToDatabase();
  const query = Review.find(filter).sort({ createdAt: -1 }).limit(limit);
  const docs = await query.lean();

  return NextResponse.json({
    reviews: docs.map(serializePublicReview),
  });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "ต้องเข้าสู่ระบบก่อนจึงจะรีวิวได้" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const rating = normalizeRating(parsed.data.rating);
  const comment = parsed.data.comment.trim();

  if (!hasMongo) {
    return NextResponse.json(
      { error: "โหมดทดลองไม่รองรับการบันทึกรีวิว กรุณาติดต่อผู้ดูแลระบบ" },
      { status: 503 }
    );
  }

  await connectToDatabase();

  const payload = {
    rating,
    comment,
    userName: session.user?.name || session.user?.email || "ลูกค้า",
    published: true,
  };

  const review = await Review.findOneAndUpdate(
    { user: session.user.id },
    { ...payload, user: session.user.id },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return NextResponse.json({
    review: serializePublicReview(review),
  });
}
