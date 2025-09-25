const TIERS = [
  { id: "starter", label: "Starter", minPoints: 0, perks: ["สะสมครบ 50 แต้มรับส่วนลด 5%"] },
  { id: "silver", label: "Silver", minPoints: 80, perks: ["ลด 5% ทุกบิล", "ส่วนลดวันเกิด 10%"] },
  { id: "gold", label: "Gold", minPoints: 180, perks: ["ลด 8% ทุกบิล", "จัดส่งฟรีในเขตเมือง", "สิทธิ์จองเมนูพิเศษก่อน"] },
  { id: "platinum", label: "Platinum", minPoints: 320, perks: ["ลด 12%", "ที่ปรึกษางานจัดเลี้ยง", "สั่งล่วงหน้าพิเศษ"] },
];

export function calculateLoyaltyPoints(orderTotal) {
  const total = Number(orderTotal || 0);
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.max(1, Math.floor(total / 50));
}

export function resolveTier(points) {
  const total = Number(points || 0);
  if (!Number.isFinite(total) || total < 0) return TIERS[0];
  return TIERS.reduce((acc, tier) => (total >= tier.minPoints ? tier : acc), TIERS[0]);
}

export function getTierById(id) {
  return TIERS.find((tier) => tier.id === id) || TIERS[0];
}

export function getAllTiers() {
  return TIERS;
}

export function getNextTierProgress(points) {
  const total = Number(points || 0);
  const current = resolveTier(total);
  const tiers = getAllTiers();
  const currentIndex = tiers.findIndex((tier) => tier.id === current.id);
  const next = tiers[currentIndex + 1];
  if (!next) {
    return { current, next: null, progress: 1, pointsToNext: 0 };
  }
  const range = next.minPoints - current.minPoints || next.minPoints;
  const earnedWithinTier = total - current.minPoints;
  const progress = Math.min(1, Math.max(0, earnedWithinTier / range));
  const pointsToNext = Math.max(0, next.minPoints - total);
  return { current, next, progress, pointsToNext };
}

export function formatTierLabel(id) {
  return getTierById(id).label;
}
