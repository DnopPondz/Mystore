"use client";

import { useEffect, useMemo, useState } from "react";
import slugify from "slugify";
import {
  adminAccentButton,
  adminInsetCardShell,
  adminSurfaceShell,
  adminTableShell,
} from "@/app/admin/theme";
import { useAdminPopup } from "@/components/admin/AdminPopupProvider";

const emptyProduct = {
  title: "",
  price: "",
  costPrice: "",
  stock: 0,
  description: "",
  image: "",
  slug: "",
  active: true,
  tags: "",
  saleMode: "regular",
  preorderDepositType: "full",
  preorderNote: "",
};

function toSlug(s) {
  return slugify(String(s || ""), { lower: true, strict: true, trim: true });
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatInputAmount(value) {
  if (value === null || value === undefined) return "";
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return num.toString();
}

function normalizeAmountInput(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0) return 0;
    return Math.round(value * 100) / 100;
  }
  const cleaned = String(value || "").replace(/[^0-9.,-]/g, "").replace(/,/g, "");
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.round(parsed * 100) / 100;
}

function SlidingToggle({ isActive, onToggle, disabled = false }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5a0] focus:ring-offset-2 ${
        isActive ? "bg-[#2F7A3D]" : "bg-[#D4D4D8]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      title={isActive ? "คลิกเพื่อซ่อนสินค้า" : "คลิกเพื่อแสดงสินค้า"}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-300 ${
          isActive ? "translate-x-7" : "translate-x-1"
        }`}
      >
        <span className="flex h-full w-full items-center justify-center text-xs">
          {isActive ? "✓" : "✕"}
        </span>
      </span>
    </button>
  );
}

export default function AdminProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const popup = useAdminPopup();

  const isEdit = useMemo(() => Boolean(editing?._id), [editing]);

  function normalizeProduct(product) {
    if (!product || typeof product !== "object") return null;
    const id = product._id ? String(product._id) : product.id ? String(product.id) : undefined;
    const priceSource = product.price ?? product.unitPrice ?? 0;
    const costSource =
      product.costPrice ??
      product.cost ??
      (product.pricing && typeof product.pricing === "object" ? product.pricing.cost : undefined);
    const priceValue = Number(priceSource);
    const costValue = Number(costSource);
    const price = Number.isFinite(priceValue) ? priceValue : 0;
    const costPrice = Number.isFinite(costValue) ? costValue : 0;
    const stockValue = Number(product.stock);
    const stock = Number.isFinite(stockValue) ? stockValue : Number.parseInt(product.stock ?? 0, 10) || 0;
    return {
      ...product,
      _id: id || product._id,
      price,
      costPrice,
      stock,
    };
  }

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/products", { cache: "no-store", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load failed");
      const normalized = Array.isArray(data)
        ? data
            .map((item) => normalizeProduct(item))
            .filter(Boolean)
        : [];
      setItems(normalized);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setEditing({});
    setForm({ ...emptyProduct });
  }

  function startEdit(p) {
    const normalized = normalizeProduct(p) || p;
    setEditing(normalized);
    setForm({
      title: normalized.title || "",
      price: formatInputAmount(normalized.price),
      costPrice: formatInputAmount(normalized.costPrice),
      stock: Number(normalized.stock || 0),
      description: normalized.description || "",
      image: Array.isArray(normalized.images) && normalized.images[0] ? normalized.images[0] : "",
      slug: normalized.slug || toSlug(normalized.title || ""),
      active: !!normalized.active,
      tags: Array.isArray(normalized.tags) ? normalized.tags.join(",") : "",
      saleMode: normalized.saleMode || "regular",
      preorderDepositType: normalized.preorderDepositType || "full",
      preorderNote: normalized.preorderNote || "",
    });
  }

  async function onUpload(file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Upload failed");
    setForm((prev) => ({ ...prev, image: data.url }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    const payload = {
      title: form.title,
      slug: form.slug || toSlug(form.title),
      description: form.description,
      images: form.image ? [form.image] : [],
      price: normalizeAmountInput(form.price),
      costPrice: normalizeAmountInput(form.costPrice),
      stock: Number(form.stock || 0),
      active: Boolean(form.active),
      tags: String(form.tags || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      saleMode: ["regular", "preorder", "both"].includes(form.saleMode) ? form.saleMode : "regular",
      preorderDepositType: ["full", "half"].includes(form.preorderDepositType)
        ? form.preorderDepositType
        : "full",
      preorderNote: String(form.preorderNote || ""),
    };

    const url = isEdit ? `/api/products/${editing._id}` : "/api/products";
    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      await popup.alert(data?.error || "บันทึกข้อมูลไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        tone: "error",
      });
      return;
    }
    const normalizedProduct =
      normalizeProduct(data) ||
      normalizeProduct({ ...payload, _id: editing?._id || data?._id }) ||
      null;

    if (normalizedProduct?._id) {
      setItems((prev) => {
        if (isEdit) {
          return prev.map((item) => (item._id === normalizedProduct._id ? { ...item, ...normalizedProduct } : item));
        }
        return [normalizedProduct, ...prev];
      });
    }

    setEditing(null);
    await load();
  }

  async function onDelete(p) {
    const confirmed = await popup.confirm(`ลบสินค้า "${p.title}" ?`, {
      title: "ยืนยันการลบสินค้า",
      confirmText: "ลบสินค้า",
      cancelText: "ยกเลิก",
      tone: "error",
    });
    if (!confirmed) return;
    const res = await fetch(`/api/products/${p._id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      await popup.alert(data?.error || "ลบสินค้าไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        tone: "error",
      });
      return;
    }
    await load();
  }

  async function toggleActive(p) {
    const newValue = !p.active;
    const res = await fetch(`/api/products/${p._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: newValue }),
    });
    const data = await res.json();
    if (!res.ok) {
      await popup.alert(data?.error || "อัปเดตสถานะไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        tone: "error",
      });
      return;
    }
    setItems((prev) => prev.map((x) => (x._id === p._id ? { ...x, active: newValue } : x)));
  }

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((p) => {
      const text = `${p.title} ${p.slug} ${(p.tags || []).join(" ")}`.toLowerCase();
      return text.includes(term);
    });
  }, [items, search]);

  const activeCount = filteredItems.filter((p) => p.active).length;
  const hiddenCount = filteredItems.length - activeCount;

  return (
    <main className="space-y-8 text-[#0b3b31]">
      <section className={`${adminSurfaceShell} p-8`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0b3b31]">จัดการสินค้า</h2>
            <p className="mt-1 text-[#145f4b]">เพิ่ม แก้ไข และควบคุมการแสดงผลสินค้าให้ตรงกับสต็อกจริงในร้าน</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาสินค้า ชื่อ หรือแท็ก"
                className="w-60 rounded-full border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#0ea5a0]">🔍</span>
            </div>
            <button className={adminAccentButton} onClick={startCreate}>
              ➕ เพิ่มสินค้าใหม่
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBubble label="สินค้าทั้งหมด" value={filteredItems.length} color="blue" />
          <StatBubble label="กำลังขาย" value={activeCount} color="green" />
          <StatBubble label="ซ่อนอยู่" value={hiddenCount} color="orange" />
          <StatBubble label="สถานะ" value={loading ? "กำลังโหลด" : "พร้อมจัดการ"} color="purple" />
        </div>
      </section>

      <section className={adminTableShell}>
        <header className="flex flex-col gap-2 border-b border-[#c9f6ef] bg-[#eaf8f4]/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0b3b31]">รายการสินค้า</h3>
            <p className="text-xs text-[#145f4b]">อัปเดตสต็อกและราคาได้ทันที ตารางรองรับการเลื่อนในแนวนอนได้บนมือถือ</p>
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-[#0ea5a0]">{filteredItems.length} รายการที่แสดง</span>
        </header>

        {loading && (
          <div className="flex items-center justify-center px-6 py-8">
            <div className="flex items-center gap-3 text-sm text-[#145f4b]">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0ea5a0] border-t-transparent" />
              <span>กำลังโหลดข้อมูลสินค้า...</span>
            </div>
          </div>
        )}

        {err && !loading && (
          <div className="flex items-center justify-center px-6 py-8">
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-6 py-4 text-center text-sm text-red-600 shadow-[0_18px_30px_-24px_rgba(10,83,73,0.35)]">
              <span className="mb-2 block text-2xl">⚠️</span>
              <span>{err}</span>
            </div>
          </div>
        )}

        {!loading && !err && (
          <div className="overflow-hidden">
            <div className="block space-y-4 p-4 lg:hidden">
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-[#145f4b]">
                  <span className="mb-4 block text-4xl">🛍️</span>
                  <span>ไม่พบสินค้าที่ตรงกับคำค้นหา</span>
                </div>
              ) : (
                filteredItems.map((p) => (
                  <div key={p._id} className={`${adminInsetCardShell} bg-white/95 p-4 shadow-[0_14px_28px_-24px_rgba(10,83,73,0.5)]`}>
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-[#c9f6ef] bg-[#eaf8f4]">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs text-[#0ea5a0]">ไม่มีรูป</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-[#0b3b31]">{p.title}</h4>
                        <p className="truncate text-xs text-[#145f4b]">{p.slug}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                          <span className="font-semibold text-[#0b3b31]">ราคาขาย: ฿{formatCurrency(p.price)}</span>
                          <span className="text-[#0f5349]">ต้นทุน: ฿{formatCurrency(p.costPrice)}</span>
                          <span className="text-[#0f5349]">สต็อก: {p.stock}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <SlidingToggle isActive={p.active} onToggle={() => toggleActive(p)} />
                            <span className="text-xs text-[#145f4b]">{p.active ? "กำลังขาย" : "ซ่อนอยู่"}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="rounded-full border border-[#a4ebdf] px-3 py-1 text-xs font-semibold text-[#0ea5a0] transition hover:bg-[#eaf8f4]"
                              onClick={() => startEdit(p)}
                            >
                              แก้ไข
                            </button>
                            <button
                              className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                              onClick={() => onDelete(p)}
                            >
                              ลบ
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[#c9f6ef] bg-[#FFF3E0]">
                    <th className="px-6 py-4 text-left font-semibold text-[#0b3b31]">สินค้า</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#0b3b31]">ราคา</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#0b3b31]">ต้นทุน</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#0b3b31]">สต็อก</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#0b3b31]">สถานะ</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#0b3b31]">แท็ก</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#0b3b31]">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c9f6ef]">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[#145f4b]">
                        <div className="flex flex-col items-center">
                          <span className="mb-4 text-4xl">🛍️</span>
                          <span>ไม่พบสินค้าที่ตรงกับคำค้นหา</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((p, idx) => (
                      <tr
                        key={p._id}
                        className={`${idx % 2 === 0 ? "bg-white" : "bg-[#FFF7EA]"} transition-colors hover:bg-[#FFEFD8]`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-[#c9f6ef] bg-[#eaf8f4]">
                              {p.images?.[0] ? (
                                <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-xs text-[#0ea5a0]">ไม่มีรูป</span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-[#0b3b31]">{p.title}</p>
                              <p className="text-xs text-[#145f4b]">{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#0b3b31]">฿{formatCurrency(p.price)}</td>
                        <td className="px-6 py-4 text-[#0f5349]">฿{formatCurrency(p.costPrice)}</td>
                        <td className="px-6 py-4 text-[#0f5349]">{p.stock}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <SlidingToggle isActive={p.active} onToggle={() => toggleActive(p)} />
                            <span className="text-xs text-[#145f4b]">{p.active ? "กำลังขาย" : "ซ่อนอยู่"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#145f4b]">
                          {Array.isArray(p.tags) && p.tags.length > 0 ? p.tags.join(", ") : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="rounded-full border border-[#a4ebdf] px-4 py-1 text-xs font-semibold text-[#0ea5a0] transition hover:bg-[#eaf8f4]"
                              onClick={() => startEdit(p)}
                            >
                              แก้ไข
                            </button>
                            <button
                              className="rounded-full border border-red-200 px-4 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                              onClick={() => onDelete(p)}
                            >
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#bff4ec] bg-[#f2fbf8] shadow-[0_30px_60px_-30px_rgba(10,83,73,0.6)]">
            <div className="flex items-center justify-between border-b border-[#c9f6ef] bg-[#eaf8f4]/70 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-[#0b3b31]">{isEdit ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h3>
                <p className="text-xs text-[#145f4b]">กรอกข้อมูลให้ครบถ้วนเพื่อให้หน้าเว็บแสดงผลสวยงามและถูกต้อง</p>
              </div>
              <button
                className="rounded-full border border-[#a4ebdf] bg-white px-3 py-1 text-xs font-semibold text-[#0ea5a0] transition hover:bg-[#eaf8f4]"
                onClick={() => setEditing(null)}
              >
                ปิด
              </button>
            </div>

            <form onSubmit={onSubmit} className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                <Field label="ชื่อสินค้า" required>
                  <input
                    className="w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        title: e.target.value,
                        slug: f.slug ? f.slug : toSlug(e.target.value),
                      }))
                    }
                    required
                  />
                </Field>
                <Field label="Slug">
                  <input
                    className="w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="ราคา">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      className="w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </Field>
                  <Field label="ต้นทุนต่อหน่วย">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      className="w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
                      value={form.costPrice}
                      onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
                    />
                  </Field>
                  <Field label="สต็อก">
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
                      value={form.stock}
                      onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value || 0) }))}
                    />
                  </Field>
                </div>
                <Field label="แท็ก (คั่นด้วย ,)">
                  <input
                    className="w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  />
                </Field>
                <div className="flex items-center gap-3">
                  <SlidingToggle isActive={form.active} onToggle={() => setForm((f) => ({ ...f, active: !f.active }))} />
                  <label className="text-sm font-medium text-[#0b3b31]">แสดงสินค้าบนหน้าร้าน</label>
                </div>
                <Field label="โหมดการขาย">
                  <select
                    className="w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
                    value={form.saleMode}
                    onChange={(e) => setForm((f) => ({ ...f, saleMode: e.target.value }))}
                  >
                    <option value="regular">ขายปกติ</option>
                    <option value="preorder">เฉพาะ Pre-order</option>
                    <option value="both">ขายปกติ + Pre-order</option>
                  </select>
                </Field>
                {form.saleMode !== "regular" ? (
                  <div className="rounded-[1.2rem] border border-[#bff4ec] bg-[#e5f8f3] p-4 text-sm text-[#0f5349] shadow-[inset_0_1px_3px_rgba(10,83,73,0.08)]">
                    <p className="font-semibold text-[#0b3b31]">การรับชำระสำหรับ Pre-order</p>
                    <div className="mt-3 flex flex-col gap-2">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="depositType"
                          value="full"
                          checked={form.preorderDepositType === "full"}
                          onChange={() => setForm((f) => ({ ...f, preorderDepositType: "full" }))}
                        />
                        ชำระเต็มจำนวน
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="depositType"
                          value="half"
                          checked={form.preorderDepositType === "half"}
                          onChange={() => setForm((f) => ({ ...f, preorderDepositType: "half" }))}
                        />
                        มัดจำ 50% ก่อน
                      </label>
                    </div>
                    <textarea
                      className="mt-3 w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-3 py-2 text-xs text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
                      rows={3}
                      placeholder="บันทึกเงื่อนไขหรือรายละเอียดพิเศษสำหรับการสั่งแบบ Pre-order"
                      value={form.preorderNote}
                      onChange={(e) => setForm((f) => ({ ...f, preorderNote: e.target.value }))}
                    />
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                <Field label="คำอธิบาย">
                  <textarea
                    className="h-32 w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </Field>
                <Field label="รูปสินค้า">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-[#c9f6ef] bg-[#eaf8f4]">
                      {form.image ? (
                        <img src={form.image} alt="preview" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs text-[#0ea5a0]">รออัปโหลด</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-3 text-sm">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            await onUpload(file);
                          } catch (error) {
                            await popup.alert(String(error.message || error), {
                              title: "อัปโหลดรูปไม่สำเร็จ",
                              tone: "error",
                            });
                          }
                        }}
                        className="w-full rounded-[1rem] border border-dashed border-[#a4ebdf] bg-white px-4 py-3 text-sm text-[#0f5349] file:mr-4 file:rounded-full file:border-0 file:bg-[#0ea5a0]/10 file:px-4 file:py-2 file:text-[#0ea5a0]"
                      />
                      <input
                        className="w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
                        value={form.image}
                        onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                        placeholder="หรือวางลิงก์รูปสินค้า"
                      />
                    </div>
                  </div>
                </Field>
                <div className="flex flex-wrap justify-end gap-3 pt-4">
                  <button
                    type="button"
                    className="rounded-full border border-[#a4ebdf] px-5 py-2 text-sm font-semibold text-[#0ea5a0] transition hover:bg-[#eaf8f4]"
                    onClick={() => setEditing(null)}
                  >
                    ยกเลิก
                  </button>
                  <button className={`${adminAccentButton} disabled:cursor-not-allowed disabled:opacity-60`} disabled={saving}>
                    {saving ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "สร้างสินค้า"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function StatBubble({ label, value, color }) {
  const palette = {
    blue: {
      bg: "bg-[#F1F6FE]",
      border: "border-[#C8DBF5]",
      accent: "text-[#2B6AA3]",
    },
    green: {
      bg: "bg-[#e2faf5]",
      border: "border-[#C3E7C4]",
      accent: "text-[#2F7A3D]",
    },
    orange: {
      bg: "bg-[#eaf8f4]",
      border: "border-[#F5D4A6]",
      accent: "text-[#C46A1C]",
    },
    purple: {
      bg: "bg-[#F8F2FF]",
      border: "border-[#DCC7F0]",
      accent: "text-[#7A4CB7]",
    },
  };
  const tone = palette[color] || palette.blue;
  return (
    <div className={`rounded-[1.5rem] border ${tone.border} ${tone.bg} p-4 shadow-[0_14px_26px_-24px_rgba(10,83,73,0.5)]`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${tone.accent}`}>{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#2F2A1F]">{value}</p>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block text-sm font-medium text-[#0b3b31]">
      <span className="mb-2 block">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}

