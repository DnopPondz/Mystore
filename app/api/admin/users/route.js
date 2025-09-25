import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();
  const users = await User.find({}, null, { sort: { createdAt: -1 } }).lean();

  return NextResponse.json({
    users: users.map(serializeUser),
  });
}
