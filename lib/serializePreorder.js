import { serializeOrder } from "@/lib/serializeOrder";

const STATUS_VALUES = ["new", "contacted", "quoted", "confirmed", "closed"];
const PAYMENT_PLAN_VALUES = ["full", "half"];

function normalizeStatus(value) {
  return STATUS_VALUES.includes(value) ? value : "new";
}

function normalizePlan(value) {
  return PAYMENT_PLAN_VALUES.includes(value) ? value : "full";
}

function normalizeId(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value.toString === "function") return value.toString();
  return null;
}

function normalizeDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function serializePreorder(preorder, { order } = {}) {
  if (!preorder) return null;
  const plain = typeof preorder.toObject === "function" ? preorder.toObject() : preorder;
  const normalizedStatus = normalizeStatus(plain.status);
  const plan = normalizePlan(plain.paymentPlan);
  const linkedOrder = order || plain.order || null;

  const serializedOrder = linkedOrder ? serializeOrder(linkedOrder) : null;

  const history = Array.isArray(plain.statusHistory)
    ? plain.statusHistory
        .map((entry) => ({
          status: normalizeStatus(entry?.status),
          changedAt: normalizeDate(entry?.changedAt),
        }))
        .filter((entry) => entry.status)
    : [];

  return {
    ...plain,
    _id: normalizeId(plain._id),
    id: normalizeId(plain._id),
    userId: normalizeId(plain.userId),
    requestedProduct: normalizeId(plain.requestedProduct),
    orderId: normalizeId(plain.orderId),
    status: normalizedStatus,
    paymentPlan: plan,
    quotedTotal: Number(plain.quotedTotal || 0),
    depositAmount: Number(plain.depositAmount || 0),
    balanceAmount: Number(plain.balanceAmount || 0),
    contactedAt: normalizeDate(plain.contactedAt),
    quotedAt: normalizeDate(plain.quotedAt),
    createdAt: normalizeDate(plain.createdAt),
    updatedAt: normalizeDate(plain.updatedAt),
    statusHistory: history,
    order: serializedOrder,
  };
}
