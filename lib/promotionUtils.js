export function summarizePromotion(promotion) {
  if (!promotion) return "";
  const type = promotion.type;
  if (type === "buy_x_get_y") {
    const buy = Number(promotion.buyQuantity || 0);
    const get = Number(promotion.getQuantity || 0);
    if (buy > 0 && get > 0) {
      return `ซื้อ ${buy} แถม ${get}`;
    }
  }
  if (type === "stamp_card") {
    const goal = Number(promotion.stampGoal || 0);
    if (goal > 0) {
      const reward = promotion.stampReward?.trim();
      return `สะสม ${goal} ดวง รับ${reward ? ` ${reward}` : "ของรางวัล"}`;
    }
  }
  return promotion.description?.trim() || promotion.title || "โปรโมชั่น";
}

export function formatPromotionSchedule(promotion) {
  if (!promotion) return "";
  const start = promotion.startAt ? new Date(promotion.startAt) : null;
  const end = promotion.endAt ? new Date(promotion.endAt) : null;

  if (start && end) {
    return `${formatDate(start)} - ${formatDate(end)}`;
  }
  if (start) {
    return `เริ่ม ${formatDate(start)}`;
  }
  if (end) {
    return `ถึง ${formatDate(end)}`;
  }
  return "ใช้งานได้ตลอด";
}

function formatDate(date) {
  try {
    return date.toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch (error) {
    return date.toISOString();
  }
}
