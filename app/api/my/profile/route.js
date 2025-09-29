import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

const updateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อ-นามสกุล")
    .max(120, "ชื่อยาวเกินไป"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .max(120, "อีเมลยาวเกินไป"),
  phone: z
    .string()
    .trim()
    .max(30, "เบอร์โทรยาวเกินไป")
    .optional()
    .transform((value) => value ?? ""),
  address: z
    .string()
    .trim()
    .max(500, "ที่อยู่ยาวเกินไป")
    .optional()
    .transform((value) => value ?? ""),
});

function serializeProfile(user) {
  return {
    id: String(user._id),
    name: user.name || "",
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}

export async function GET() {
  const { session, response } = await requireSession();
  if (!session) return response;

  await connectToDatabase();
  const user = await User.findById(session.user.id).lean();
  if (!user) {
    return NextResponse.json({ error: "ไม่พบบัญชีผู้ใช้" }, { status: 404 });
  }

  return NextResponse.json({ user: serializeProfile(user) });
}

export async function PATCH(req) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();

  const current = await User.findById(session.user.id);
  if (!current) {
    return NextResponse.json({ error: "ไม่พบบัญชีผู้ใช้" }, { status: 404 });
  }

  const updates = parsed.data;
  const nextEmail = updates.email;
  if (nextEmail && nextEmail !== current.email) {
    const exists = await User.findOne({ email: nextEmail, _id: { $ne: current._id } }).lean();
    if (exists) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 409 });
    }
  }

  current.name = updates.name;
  current.email = nextEmail;
  current.phone = updates.phone ?? "";
  current.address = updates.address ?? "";
  await current.save();

  const serialized = serializeProfile(current.toObject());
  return NextResponse.json({ user: serialized });
}
