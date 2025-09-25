import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { NewsletterSubscriber } from "@/models/NewsletterSubscriber";

const schema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional(),
  source: z.string().max(120).optional(),
  marketingOptIn: z.boolean().optional(),
});

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  await connectToDatabase();

  const { email, name, source, marketingOptIn = true } = parsed.data;

  const existing = await NewsletterSubscriber.findOne({ email });
  if (existing) {
    existing.name = name || existing.name;
    existing.source = source || existing.source;
    existing.marketingOptIn = marketingOptIn;
    await existing.save();
    return NextResponse.json({ ok: 1, message: "อัปเดตข้อมูลเรียบร้อยแล้ว" });
  }

  await NewsletterSubscriber.create({ email, name: name || "", source: source || "", marketingOptIn });
  return NextResponse.json({ ok: 1, message: "สมัครรับข่าวสารเรียบร้อย" }, { status: 201 });
}
