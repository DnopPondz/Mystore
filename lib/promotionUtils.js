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

export function calculateCartPromotions(items, promotions) {
  const normalizedItems = normalizeCartItems(items);

  if (!normalizedItems.length) {
    return { discount: 0, applied: [] };
  }

  const activePromotions = Array.isArray(promotions)
    ? promotions.filter((promotion) => promotion && promotion.active !== false)
    : [];

  const breakdown = [];

  for (const promotion of activePromotions) {
    const type = promotion.type;
    if (type === "buy_x_get_y") {
      const result = applyBuyXGetYPromotion(promotion, normalizedItems);
      if (result) breakdown.push(result);
    }
  }

  const totalDiscount = roundCurrency(
    breakdown.reduce((sum, entry) => sum + Number(entry.discount || 0), 0),
  );

  return {
    discount: totalDiscount,
    applied: breakdown,
  };
}

export function describePromotionUsage(promotion) {
  if (!promotion) return "";

  if (promotion.type === "buy_x_get_y") {
    const buy = Math.max(1, Math.floor(Number(promotion.buyQuantity || 0)));
    const get = Math.max(0, Math.floor(Number(promotion.getQuantity || 0)));
    if (buy > 0 && get > 0) {
      const groupSize = buy + get;
      return `หยิบสินค้าเมนูเดียวกันให้ครบ ${groupSize} ชิ้น ระบบจะลดราคาให้ ${get} ชิ้นอัตโนมัติ`;
    }
  }

  if (promotion.type === "stamp_card") {
    const goal = Math.max(0, Math.floor(Number(promotion.stampGoal || 0)));
    const reward = promotion.stampReward?.trim();
    if (goal > 0) {
      return `สะสม ${goal} ดวงให้ครบ แล้วแจ้งพนักงานเพื่อแลกรับ${reward ? ` ${reward}` : "ของรางวัล"}`;
    }
  }

  return promotion.description?.trim() || "";
}

export function getPromotionProgress(promotion, items) {
  if (!promotion) return null;

  if (promotion.type === "buy_x_get_y") {
    const buy = Math.max(1, Math.floor(Number(promotion.buyQuantity || 0)));
    const get = Math.max(0, Math.floor(Number(promotion.getQuantity || 0)));

    if (buy <= 0 || get <= 0) {
      return null;
    }

    const groupSize = buy + get;
    const normalizedItems = normalizeCartItems(items);

    if (!normalizedItems.length) {
      return {
        type: "buy_x_get_y",
        buy,
        get,
        groupSize,
        neededToNextReward: groupSize,
        sampleProductTitle: "",
        currentSets: 0,
        hasAnyQuantity: false,
      };
    }

    let best = null;
    let hasAnyQuantity = false;

    for (const item of normalizedItems) {
      if (!item || item.qty <= 0) continue;
      hasAnyQuantity = true;
      const remainder = item.qty % groupSize;
      const groups = Math.floor(item.qty / groupSize);
      const needed = remainder === 0 ? groupSize : groupSize - remainder;
      if (
        !best ||
        needed < best.needed ||
        (needed === best.needed && groups > best.groups)
      ) {
        best = {
          needed,
          groups,
          title: item.title || "",
        };
      }
    }

    if (!best) {
      return {
        type: "buy_x_get_y",
        buy,
        get,
        groupSize,
        neededToNextReward: groupSize,
        sampleProductTitle: "",
        currentSets: 0,
        hasAnyQuantity,
      };
    }

    return {
      type: "buy_x_get_y",
      buy,
      get,
      groupSize,
      neededToNextReward: best.needed,
      sampleProductTitle: best.title,
      currentSets: best.groups,
      hasAnyQuantity,
    };
  }

  return null;
}

function applyBuyXGetYPromotion(promotion, items) {
  const buy = Math.max(1, Math.floor(Number(promotion.buyQuantity || 0)));
  const get = Math.max(0, Math.floor(Number(promotion.getQuantity || 0)));

  if (buy <= 0 || get <= 0) {
    return null;
  }

  const groupSize = buy + get;
  const appliedItems = [];
  let discount = 0;
  let totalFreeQty = 0;
  let totalGroups = 0;

  for (const item of items) {
    if (!item || item.qty < buy) continue;

    const groups = Math.floor(item.qty / groupSize);
    if (groups <= 0) continue;

    const freeQty = groups * get;
    if (freeQty <= 0) continue;

    const freeUnits = Math.min(freeQty, item.qty);
    const itemDiscount = roundCurrency(item.price * freeUnits);
    if (itemDiscount <= 0) continue;

    discount += itemDiscount;
    totalFreeQty += freeUnits;
    totalGroups += groups;

    appliedItems.push({
      productId: item.productId,
      title: item.title,
      freeQty: freeUnits,
      unitPrice: item.price,
      discount: itemDiscount,
      groups,
    });
  }

  if (discount <= 0) {
    return null;
  }

  const id = promotion._id || promotion.id || promotion.promotionId || null;

  return {
    id: id ? String(id) : null,
    title: promotion.title || summarizePromotion(promotion) || "โปรโมชั่น",
    description: promotion.description?.trim() || "",
    summary: summarizePromotion(promotion),
    type: promotion.type || "custom",
    discount: roundCurrency(discount),
    freeQty: totalFreeQty,
    metadata: {
      buyQuantity: buy,
      getQuantity: get,
      setsAwarded: totalGroups,
    },
    items: appliedItems,
  };
}

function normalizeCartItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => normalizeCartItem(item))
    .filter((item) => item && item.qty > 0 && item.price >= 0);
}

function normalizeCartItem(item) {
  if (!item || typeof item !== "object") return null;
  const price = roundCurrency(item.price);
  const qty = Math.max(0, Math.floor(Number(item.qty || 0)));
  const title = typeof item.title === "string" ? item.title : "";
  const productId = item.productId || item._id || null;
  if (!productId) return null;

  return { productId: String(productId), title, price, qty };
}

function roundCurrency(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100) / 100;
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
