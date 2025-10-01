import { Order } from "@/models/Order";

export function getCouponDiscount(coupon, subtotal) {
  if (!coupon) return { discount: 0, reason: "NOT_FOUND" };
  if (!coupon.active) return { discount: 0, reason: "INACTIVE" };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { discount: 0, reason: "EXPIRED" };
  }
  if (subtotal < (coupon.minSubtotal || 0)) {
    return { discount: 0, reason: "MIN_SUBTOTAL" };
  }

  let discount = 0;
  if (coupon.type === "percent") discount = Math.floor((subtotal * coupon.value) / 100);
  else discount = Math.floor(coupon.value);
  discount = Math.max(0, Math.min(discount, subtotal));
  return { discount, reason: "OK" };
}

export async function evaluateCouponUsageLimit({ coupon, userId }) {
  const maxUses =
    typeof coupon?.maxUsesPerUser === "number" && coupon.maxUsesPerUser > 0
      ? coupon.maxUsesPerUser
      : null;

  if (!maxUses) {
    return { ok: true, maxUses: null, usedCount: 0 };
  }

  if (!userId) {
    return { ok: false, reason: "LOGIN_REQUIRED", maxUses, usedCount: 0 };
  }

  const usedCount = await Order.countDocuments({
    userId,
    "coupon.code": coupon.code,
    status: { $ne: "cancel" },
  });

  if (usedCount >= maxUses) {
    return { ok: false, reason: "LIMIT_REACHED", maxUses, usedCount };
  }

  return { ok: true, maxUses, usedCount };
}

export async function evaluateCouponForUser({ coupon, subtotal, userId }) {
  const { discount, reason } = getCouponDiscount(coupon, subtotal);
  if (reason !== "OK") {
    return { ok: false, reason, discount: 0 };
  }

  const usage = await evaluateCouponUsageLimit({ coupon, userId });
  if (!usage.ok) {
    return { ok: false, reason: usage.reason, discount: 0, usage };
  }

  return {
    ok: true,
    reason: "OK",
    discount,
    usage,
    used: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
    },
  };
}
