import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { getNextTierProgress, getAllTiers } from "@/lib/loyalty";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const user = await User.findById(session.user.id).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const points = Number(user.loyaltyPoints || 0);
  const tierId = user.loyaltyTier || "starter";
  const memberSince = user.memberSince ? new Date(user.memberSince).toISOString() : null;
  const history = Array.isArray(user.loyaltyHistory) ? user.loyaltyHistory.slice(0, 20) : [];
  const progress = getNextTierProgress(points);

  return NextResponse.json({
    points,
    tier: tierId,
    memberSince,
    history: history.map((item) => ({
      points: Number(item.points || 0),
      note: item.note || "",
      orderId: item.orderId ? String(item.orderId) : null,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
    })),
    progress: {
      current: progress.current.id,
      currentLabel: progress.current.label,
      next: progress.next ? progress.next.id : null,
      nextLabel: progress.next ? progress.next.label : null,
      progress: progress.progress,
      pointsToNext: progress.pointsToNext,
    },
    tiers: getAllTiers().map((tier) => ({
      id: tier.id,
      label: tier.label,
      minPoints: tier.minPoints,
      perks: tier.perks,
    })),
  });
}
