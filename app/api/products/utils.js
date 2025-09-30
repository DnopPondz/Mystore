function toNumber(value) {
  if (value === null || value === undefined) return undefined;
  const normalized = typeof value === "string" ? value.replace(/,/g, "").trim() : value;
  if (normalized === "") return undefined;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function toNonNegativeNumber(value) {
  const parsed = toNumber(value);
  if (parsed === undefined) return undefined;
  return Math.max(0, parsed);
}

function toNonNegativeInteger(value) {
  const parsed = toNumber(value);
  if (parsed === undefined) return undefined;
  return Math.max(0, Math.round(parsed));
}

export function normalizeProductPayload(payload) {
  const data = { ...payload };

  const price = toNonNegativeNumber(data.price);
  if (price !== undefined) data.price = price;
  else if ("price" in data) delete data.price;

  const cost = toNonNegativeNumber(data.cost);
  if (cost !== undefined) data.cost = cost;
  else if ("cost" in data) delete data.cost;

  const stock = toNonNegativeInteger(data.stock);
  if (stock !== undefined) data.stock = stock;
  else if ("stock" in data) delete data.stock;

  if ("active" in data) {
    data.active = Boolean(data.active);
  }

  if (Array.isArray(data.tags)) {
    data.tags = data.tags.map((tag) => String(tag || "").trim()).filter(Boolean);
  }

  if (Array.isArray(data.images)) {
    data.images = data.images.map((img) => String(img || "").trim()).filter(Boolean);
  }

  return data;
}
