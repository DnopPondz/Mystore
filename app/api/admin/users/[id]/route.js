import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

const schema = z
  .object({
    role: z.enum(["user", "admin"]).optional(),
    banned: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No changes provided",
    path: ["role"],
  });

function serializeUser(u) {
  return {
    id: String(u._id),
    name: u.name || "",
    email: u.email,
    role: u.role || "user",
    banned: !!u.banned,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function PATCH(req, { params }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates = parsed.data;

  if (updates.role && session.user.id === id && updates.role !== "admin") {
    return NextResponse.json({ error: "ไม่สามารถลดสิทธิ์ตัวเองได้" }, { status: 400 });
  }
  if (typeof updates.banned === "boolean" && updates.banned && session.user.id === id) {
    return NextResponse.json({ error: "ไม่สามารถแบนบัญชีของตัวเองได้" }, { status: 400 });
  }

  await connectToDatabase();
  const updated = await User.findByIdAndUpdate(id, updates, { new: true }).lean();
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ user: serializeUser(updated) });
}
