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

  const sanitized = {
    ...plain,
    _id: normalizeId(plain._id),
    id: normalizeId(plain._id),
    userId: normalizeId(plain.userId),
    createdAt: safeDate(plain.createdAt),
    updatedAt: safeDate(plain.updatedAt),
    items,
    payment: {
      method: payment.method || "promptpay",
      status: payment.status || "pending",
      ref: payment.ref || "",
      amountPaid:
        typeof payment.amountPaid === "number" ? payment.amountPaid : null,
      confirmedAt: safeDate(payment.confirmedAt),
      slip: includeSlip ? payment.slip || "" : undefined,
      slipFilename: includeSlip ? payment.slipFilename || "" : undefined,
    },
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
