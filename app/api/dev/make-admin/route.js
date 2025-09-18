// app/api/dev/make-admin/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  await connectToDatabase();
  const u = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true }).lean();
  if (!u) return NextResponse.json({ error: "user not found" }, { status: 404 });

  return NextResponse.json({ ok: 1, email: u.email, role: u.role });
}
