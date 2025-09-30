import slugify from "slugify";

const SALE_MODES = ["regular", "preorder", "both"];
const DEPOSIT_TYPES = ["full", "half"];

function sanitizeMoney(value) {
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.,-]/g, "").replace(/,/g, "");
    const parsed = Number.parseFloat(cleaned);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.round(parsed * 100) / 100;
    }
    return 0;
  }
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.round(value * 100) / 100;
  }
  return 0;
}

function sanitizeInteger(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value));
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed)) {
    return Math.max(0, parsed);
  }
  return 0;
}

function sanitizeArrayOfStrings(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => String(entry || "").trim())
    .filter((entry) => entry.length > 0);
}

function sanitizeTags(value) {
  if (Array.isArray(value)) {
    return sanitizeArrayOfStrings(value);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }
  return [];
}

function sanitizeSaleMode(value) {
  if (SALE_MODES.includes(value)) return value;
  return "regular";
}

function sanitizeDepositType(value) {
  if (DEPOSIT_TYPES.includes(value)) return value;
  return "full";
}

function ensureSlug(value, fallbackTitle) {
  const base = value && String(value).trim().length > 0 ? value : fallbackTitle;
  return slugify(String(base || ""), { lower: true, strict: true, trim: true });
}

export function buildProductPayload(raw = {}) {
  return {
    title: String(raw.title || "").trim(),
    slug: ensureSlug(raw.slug, raw.title),
    description: String(raw.description || ""),
    images: sanitizeArrayOfStrings(raw.images),
    price: sanitizeMoney(raw.price),
    costPrice: sanitizeMoney(raw.costPrice),
    stock: sanitizeInteger(raw.stock),
    active: raw.active === undefined ? true : Boolean(raw.active),
    tags: sanitizeTags(raw.tags),
    saleMode: sanitizeSaleMode(raw.saleMode),
    preorderDepositType: sanitizeDepositType(raw.preorderDepositType),
    preorderNote: String(raw.preorderNote || ""),
  };
}

export function buildProductUpdate(raw = {}) {
  const update = {};

  if (Object.prototype.hasOwnProperty.call(raw, "title")) {
    update.title = String(raw.title || "").trim();
  }
  if (Object.prototype.hasOwnProperty.call(raw, "slug")) {
    update.slug = ensureSlug(raw.slug, raw.title);
  }
  if (Object.prototype.hasOwnProperty.call(raw, "description")) {
    update.description = String(raw.description || "");
  }
  if (Object.prototype.hasOwnProperty.call(raw, "images")) {
    update.images = sanitizeArrayOfStrings(raw.images);
  }
  if (Object.prototype.hasOwnProperty.call(raw, "price")) {
    update.price = sanitizeMoney(raw.price);
  }
  if (Object.prototype.hasOwnProperty.call(raw, "costPrice")) {
    update.costPrice = sanitizeMoney(raw.costPrice);
  }
  if (Object.prototype.hasOwnProperty.call(raw, "stock")) {
    update.stock = sanitizeInteger(raw.stock);
  }
  if (Object.prototype.hasOwnProperty.call(raw, "active")) {
    update.active = Boolean(raw.active);
  }
  if (Object.prototype.hasOwnProperty.call(raw, "tags")) {
    update.tags = sanitizeTags(raw.tags);
  }
  if (Object.prototype.hasOwnProperty.call(raw, "saleMode")) {
    update.saleMode = sanitizeSaleMode(raw.saleMode);
  }
  if (Object.prototype.hasOwnProperty.call(raw, "preorderDepositType")) {
    update.preorderDepositType = sanitizeDepositType(raw.preorderDepositType);
  }
  if (Object.prototype.hasOwnProperty.call(raw, "preorderNote")) {
    update.preorderNote = String(raw.preorderNote || "");
  }

  return update;
}
