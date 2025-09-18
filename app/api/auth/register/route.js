import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const exists = await User.findOne({ email: parsed.data.email });
  if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const isFirst = (await User.countDocuments({})) === 0;
  const doc = await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    role: isFirst ? "admin" : "user",
  });

  return NextResponse.json({ id: String(doc._id), role: doc.role });
}
