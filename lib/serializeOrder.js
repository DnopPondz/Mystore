const FULFILLMENT_STATUS_MAP = {
  preparing: "pending",
  shipped: "shipping",
  done: "success",
  cancelled: "cancel",
};

const PAYMENT_STATUS_MAP = {
  pending: "unpaid",
  failed: "invalid",
};

const VALID_FULFILLMENT = new Set(["new", "pending", "shipping", "success", "cancel"]);
const VALID_PAYMENT = new Set(["unpaid", "verifying", "paid", "invalid", "cash"]);

function normalizeFulfillmentStatus(value) {
  if (!value) return "new";
  const mapped = FULFILLMENT_STATUS_MAP[value] || value;
  return VALID_FULFILLMENT.has(mapped) ? mapped : "new";
}

function normalizePaymentStatus(value, total) {
  const mapped = PAYMENT_STATUS_MAP[value] || value;
  if (VALID_PAYMENT.has(mapped)) return mapped;
  return Number(total || 0) > 0 ? "unpaid" : "paid";
}

export function serializeOrder(order, { includeSlip = false } = {}) {
  if (!order) return null;
  const plain = typeof order.toObject === "function" ? order.toObject() : order;

  const safeDate = (value) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  };

  const normalizeId = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (typeof value.toString === "function") return value.toString();
    return null;
  };

  const items = Array.isArray(plain.items)
    ? plain.items.map((item) => ({
        ...item,
        _id: normalizeId(item?._id),
        productId: normalizeId(item?.productId),
      }))
    : [];

  const payment = plain.payment || {};
  const total = Number(plain.total || 0);

  const sanitized = {
    ...plain,
    _id: normalizeId(plain._id),
    id: normalizeId(plain._id),
    userId: normalizeId(plain.userId),
    createdAt: safeDate(plain.createdAt),
    updatedAt: safeDate(plain.updatedAt),
    items,
    status: normalizeFulfillmentStatus(plain.status),
    payment: {
      method: payment.method || "promptpay",
      status: normalizePaymentStatus(payment.status, total),
      ref: payment.ref || "",
      amountPaid: typeof payment.amountPaid === "number" ? payment.amountPaid : null,
      confirmedAt: safeDate(payment.confirmedAt),
      slip: includeSlip ? payment.slip || "" : undefined,
      slipFilename: includeSlip ? payment.slipFilename || "" : undefined,
    },
    total,
    loyaltyEarned: Number.isFinite(Number(plain.loyaltyEarned))
      ? Number(plain.loyaltyEarned)
      : 0,
  };

  if (!includeSlip) {
    delete sanitized.payment.slip;
    delete sanitized.payment.slipFilename;
  }

  if ("__v" in sanitized) {
    delete sanitized.__v;
  }

  return sanitized;
}
