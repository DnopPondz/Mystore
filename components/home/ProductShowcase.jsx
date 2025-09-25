"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

const TAG_TITLES = {
  savory: "ซาลาเปาไส้คาว",
  sweet: "ซาลาเปาไส้หวาน",
  dimsum: "ขนมจีบ",
  seasonal: "เมนูตามฤดูกาล",
  classic: "เมนูประจำ",
};

const STATUS_BADGES = {
  "best-seller": { label: "ขายดี", tone: "bg-[var(--color-rose)]/20 text-[var(--color-rose)]" },
  seasonal: { label: "เมนูพิเศษ", tone: "bg-[var(--color-gold)]/15 text-[var(--color-gold)]" },
  limited: { label: "เหลือน้อย", tone: "bg-amber-500/20 text-amber-200" },
  preorder: { label: "ต้องพรีออเดอร์", tone: "bg-sky-500/20 text-sky-200" },
};

function normalize(value = "") {
  return String(value || "").toLowerCase();
}

function deriveCategory(product) {
  const tags = product.tags || [];
  if (tags.includes("savory") || /หมู|ไส้เค็ม|หมูสับ/i.test(product.title)) return "savory";
  if (tags.includes("dimsum") || /ขนมจีบ|กุ้ง/i.test(product.title)) return "dimsum";
  if (tags.includes("sweet") || /ครีม|ถั่ว|งาดำ|มันม่วง/i.test(product.title)) return "sweet";
  if (tags.includes("seasonal")) return "seasonal";
  return "classic";
}

function getStatusTags(product) {
  const tags = new Set(product.tags || []);
  const statuses = [];
  if (tags.has("best-seller")) statuses.push("best-seller");
  if (tags.has("seasonal")) statuses.push("seasonal");
  if (tags.has("limited")) statuses.push("limited");
  if (tags.has("preorder")) statuses.push("preorder");
  if (!statuses.length && typeof product.stock === "number") {
    if (product.stock <= 0) {
      statuses.push("preorder");
    } else if (product.stock > 0 && product.stock <= 12) {
      statuses.push("limited");
    }
  }
  return statuses;
}

export default function ProductShowcase({ products = [] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [highlight, setHighlight] = useState("all");
  const [quantities, setQuantities] = useState({});

  const enrichedProducts = useMemo(
    () =>
      products.map((product) => ({
        ...product,
        category: deriveCategory(product),
        statusTags: getStatusTags(product),
      })),
    [products],
  );

  const categories = useMemo(() => {
    const unique = new Set(enrichedProducts.map((p) => p.category));
    return ["all", ...Array.from(unique)];
  }, [enrichedProducts]);

  const filtered = useMemo(() => {
    const keyword = normalize(search);
    return enrichedProducts.filter((product) => {
      if (keyword) {
        const haystack = normalize(`${product.title} ${product.description}`);
        if (!haystack.includes(keyword)) return false;
      }
      if (category !== "all" && product.category !== category) return false;
      if (highlight === "best" && !product.statusTags.includes("best-seller")) return false;
      if (highlight === "limited" && !product.statusTags.includes("limited")) return false;
      if (highlight === "preorder" && !product.statusTags.includes("preorder")) return false;
      return true;
    });
  }, [enrichedProducts, search, category, highlight]);

  const handleQtyChange = (id, value) => {
    const qty = Math.max(1, Number(value) || 1);
    setQuantities((prev) => ({ ...prev, [id]: qty }));
  };

  return (
    <section id="menu" className="relative overflow-hidden py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(240,200,105,0.12),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(58,16,16,0.7),transparent_60%),linear-gradient(135deg,rgba(20,2,2,0.9),rgba(76,25,18,0.85))]" />
      <div className="relative mx-auto flex max-w-screen-xl flex-col gap-12 px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-rose)]/90">Bao & Dim Sum</p>
            <h2 className="mt-2 text-3xl font-bold text-[var(--color-rose)]">เมนูซาลาเปา & ขนมจีบวันนี้</h2>
            <p className="mt-2 text-[var(--color-text)]/70 max-w-2xl">
              เลือกหมวดไส้ที่ชอบ กรองเมนูขายดีหรือเมนูพรีออเดอร์ แล้วเพิ่มลงตะกร้าได้ทันที แม้ยังไม่ได้เข้าสู่ระบบ
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาเมนู"
              className="w-full rounded-full border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/70 px-4 py-2 text-sm text-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40 sm:w-56"
            />
            <select
              value={highlight}
              onChange={(event) => setHighlight(event.target.value)}
              className="rounded-full border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/70 px-4 py-2 text-sm text-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
            >
              <option value="all">แสดงทั้งหมด</option>
              <option value="best">เฉพาะเมนูขายดี</option>
              <option value="limited">เฉพาะเมนูเหลือน้อย</option>
              <option value="preorder">เฉพาะเมนูพรีออเดอร์</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                category === key
                  ? "border-[var(--color-rose)] bg-[var(--color-burgundy)]/80 text-[var(--color-rose)]"
                  : "border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/60 text-[var(--color-gold)]/70 hover:text-[var(--color-rose)]"
              }`}
            >
              {key === "all" ? "ทั้งหมด" : TAG_TITLES[key] || key}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/80 p-10 text-center text-[var(--color-text)]/80 shadow-lg shadow-black/40 backdrop-blur">
            ยังไม่มีเมนูตามเงื่อนไขที่เลือก ลองเปลี่ยนตัวกรองหรือค้นหาคำอื่นนะคะ 🥟
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => {
              const quantity = quantities[product._id] || 1;
              const detailHref = `/products/${product.slug || product._id}`;
              return (
                <div
                  key={product._id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/75 shadow-lg shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative overflow-hidden">
                    <div className="aspect-square w-full bg-[radial-gradient(circle_at_30%_30%,rgba(240,200,105,0.25),rgba(58,16,16,0.65))] flex items-center justify-center">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-4xl">🥟</span>
                      )}
                    </div>
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {product.statusTags.length > 0
                        ? product.statusTags.map((tag) => (
                            <span
                              key={tag}
                              className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${
                                STATUS_BADGES[tag]?.tone || "bg-[var(--color-rose)]/15 text-[var(--color-rose)]"
                              }`}
                            >
                              {STATUS_BADGES[tag]?.label || "พร้อมเสิร์ฟ"}
                            </span>
                          ))
                        : (
                            <span className="rounded-full bg-[var(--color-rose)]/15 px-3 py-1 text-xs font-semibold text-[var(--color-rose)]">
                              พร้อมเสิร์ฟทุกวัน
                            </span>
                          )}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--color-rose)]">{product.title}</h3>
                      <p className="mt-1 text-sm text-[var(--color-text)]/70 line-clamp-3">{product.description}</p>
                    </div>
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-[var(--color-gold)]">฿{product.price}</span>
                        <span className="text-xs text-[var(--color-text)]/60">
                          {TAG_TITLES[product.category] || "เมนู Bao"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-xs text-[var(--color-text)]/70">
                          จำนวน
                          <input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(event) => handleQtyChange(product._id, event.target.value)}
                            className="h-10 w-20 rounded-full border border-[var(--color-rose)]/25 bg-[var(--color-burgundy-dark)]/60 px-3 text-center text-sm text-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                          />
                        </label>
                        <AddToCartButton product={product} quantity={quantity} />
                      </div>
                      <Link
                        href={detailHref}
                        className="inline-flex items-center justify-center rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy)]/60 px-4 py-2 text-xs font-semibold text-[var(--color-rose)] transition hover:bg-[var(--color-burgundy)]"
                      >
                        ดูรายละเอียดสินค้า
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
