const DEFAULT_NEW_ARRIVAL_WINDOW_DAYS = 14;

export function isNewArrival(product, options = {}) {
  if (!product || typeof product !== "object") {
    return false;
  }

  const {
    days = DEFAULT_NEW_ARRIVAL_WINDOW_DAYS,
    now = new Date(),
    field = "createdAt",
  } = options;

  const windowDays = Math.max(0, Number(days));
  if (!Number.isFinite(windowDays) || windowDays <= 0) {
    return false;
  }

  const referenceDate = normalizeDate(now);
  const createdAtValue = field in product ? product[field] : product.createdAt;
  const createdAtDate = normalizeDate(createdAtValue);

  if (!referenceDate || !createdAtDate) {
    return false;
  }

  const threshold = new Date(referenceDate.getTime());
  threshold.setDate(threshold.getDate() - windowDays);

  return createdAtDate >= threshold;
}

function normalizeDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}
