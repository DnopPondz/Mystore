"use client";

import { useEffect, useMemo, useState } from "react";
import slugify from "slugify";
import { useAdminPopup } from "@/components/admin/AdminPopupProvider";

const emptyProduct = {
  title: "",
  price: 0,
  stock: 0,
  description: "",
  image: "",
  slug: "",
  active: true,
  tags: "",
};

function toSlug(s) {
  return slugify(String(s || ""), { lower: true, strict: true, trim: true });
}

// New Sliding Toggle Component
function SlidingToggle({ isActive, onToggle, disabled = false }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#D2691E] focus:ring-offset-2 ${
        isActive 
          ? 'bg-[#228B22]' 
          : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isActive ? "คลิกเพื่อซ่อนสินค้า" : "คลิกเพื่อแสดงสินค้า"}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
          isActive ? 'translate-x-7' : 'translate-x-1'
        }`}
      >
        <span className="flex h-full w-full items-center justify-center text-xs">
          {isActive ? '✓' : '✕'}
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

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load failed");
      setItems(data);
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
    setForm(emptyProduct);
  }

  function startEdit(p) {
    setEditing(p);
    setForm({
      title: p.title || "",
      price: Number(p.price || 0),
      stock: Number(p.stock || 0),
      description: p.description || "",
      image: Array.isArray(p.images) && p.images[0] ? p.images[0] : "",
      slug: p.slug || toSlug(p.title || ""),
      active: !!p.active,
      tags: Array.isArray(p.tags) ? p.tags.join(",") : "",
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
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      active: Boolean(form.active),
      tags: String(form.tags || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
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
    <main className="space-y-8">
      {/* Header Section */}
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-[rgba(139,69,19,0.2)] backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#8B4513]">จัดการสินค้า</h2>
            <p className="mt-1 text-[#8B4513]/70">
              เพิ่ม แก้ไข และควบคุมการแสดงผลสินค้าให้ตรงกับสต็อกจริงในร้าน
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาสินค้า ชื่อ หรือแท็ก"
                className="w-60 rounded-full border border-[#D2691E]/30 bg-white/70 px-4 py-2 text-sm text-[#8B4513] shadow-inner focus:border-[#D2691E] focus:outline-none"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#8B4513]/50">
                🔍
              </span>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-[#D2691E] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(139,69,19,0.25)] transition hover:bg-[#8B4513]"
              onClick={startCreate}
            >
              ➕ เพิ่มสินค้าใหม่
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBubble label="สินค้าทั้งหมด" value={filteredItems.length} color="blue" />
          <StatBubble label="กำลังขาย" value={activeCount} color="green" />
          <StatBubble label="ซ่อนอยู่" value={hiddenCount} color="orange" />
          <StatBubble label="สถานะ" value={loading ? "กำลังโหลด" : "พร้อมจัดการ"} color="purple" />
        </div>
      </section>

      {/* Products Table */}
      <section className="rounded-[2rem] border border-white/70 bg-white/80 shadow-xl shadow-[rgba(139,69,19,0.15)] backdrop-blur overflow-hidden">
        <header className="flex flex-col gap-2 border-b border-white/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#8B4513]">รายการสินค้า</h3>
            <p className="text-xs text-[#8B4513]/60">
              อัปเดตสต็อกและราคาได้ทันที ตารางรองรับการเลื่อนในแนวนอนได้บนมือถือ
            </p>
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-[#8B4513]/50">
            {filteredItems.length} รายการที่แสดง
          </span>
        </header>

        {loading && (
          <div className="flex items-center justify-center px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#D2691E] border-t-transparent"></div>
              <span className="text-sm text-[#8B4513]/70">กำลังโหลดข้อมูลสินค้า...</span>
            </div>
          </div>
        )}

        {err && !loading && (
          <div className="flex items-center justify-center px-6 py-8">
            <div className="rounded-[1.5rem] bg-red-50 border border-red-200 px-6 py-4 text-center">
              <span className="text-2xl mb-2 block">⚠️</span>
              <span className="text-sm text-red-600">{err}</span>
            </div>
          </div>
        )}

        {!loading && !err && (
          <div className="overflow-hidden">
            {/* Mobile Cards */}
            <div className="block lg:hidden p-4 space-y-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🛍️</span>
                  <span className="text-[#8B4513]/60">ไม่พบสินค้าที่ตรงกับคำค้นหา</span>
                </div>
              ) : (
                filteredItems.map((p) => (
                  <div key={p._id} className="rounded-[1.5rem] bg-white/90 border border-white/60 p-4 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-[1rem] bg-[#F5DEB3]/30 flex-shrink-0">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-[#8B4513]/40">
                            ไม่มีรูป
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#8B4513] truncate">{p.title}</h4>
                        <p className="text-xs text-[#8B4513]/50 truncate">{p.slug}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="font-semibold text-[#8B4513]">฿{p.price}</span>
                          <span className="text-[#8B4513]/70">สต็อก: {p.stock}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            <SlidingToggle 
                              isActive={p.active}
                              onToggle={() => toggleActive(p)}
                            />
                            <span className="text-xs text-[#8B4513]/70">
                              {p.active ? "กำลังขาย" : "ซ่อนอยู่"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="rounded-full border border-[#D2691E]/30 px-3 py-1 text-xs font-semibold text-[#D2691E] transition hover:bg-[#D2691E]/10"
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

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full text-sm ">
                <thead>
                  <tr className="bg-[#F5DEB3]/30 border-b border-white/40">
                    <th className="px-6 py-4 text-left font-semibold text-[#8B4513]">สินค้า</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#8B4513]">ราคา</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#8B4513]">สต็อก</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#8B4513]">สถานะ</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#8B4513]">แท็ก</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#8B4513]">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-4xl mb-4">🛍️</span>
                          <span className="text-[#8B4513]/60">ไม่พบสินค้าที่ตรงกับคำค้นหา</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((p, idx) => (
                      <tr key={p._id} className={`transition-colors hover:bg-white/70 ${idx % 2 === 0 ? 'bg-white/50' : 'bg-[#FFF8DC]/30'}`}>
                        <td className="px-6 py-4 ">
                          <div className="flex items-center gap-3">
                            <div className="h-16 w-16 overflow-hidden rounded-[1rem] bg-[#F5DEB3]/30 flex-shrink-0">
                              {p.images?.[0] ? (
                                <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-[#8B4513]/40">
                                  ไม่มีรูป
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-[#8B4513]">{p.title}</p>
                              <p className="text-xs text-[#8B4513]/50">{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#8B4513]">฿{p.price}</td>
                        <td className="px-6 py-4 text-[#8B4513]">{p.stock}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <SlidingToggle 
                              isActive={p.active}
                              onToggle={() => toggleActive(p)}
                            />
                            <span className="text-xs text-[#8B4513]/70">
                              {p.active ? "กำลังขาย" : "ซ่อนอยู่"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#8B4513]/60">
                          {Array.isArray(p.tags) && p.tags.length > 0 ? p.tags.join(", ") : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="rounded-full border border-[#D2691E]/30 px-4 py-1 text-xs font-semibold text-[#D2691E] transition hover:border-[#D2691E] hover:bg-[#D2691E]/10"
                              onClick={() => startEdit(p)}
                            >
                              แก้ไข
                            </button>
                            <button
                              className="rounded-full border border-red-200 px-4 py-1 text-xs font-semibold text-red-500 transition hover:border-red-400 hover:bg-red-50"
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

      {/* Modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 shadow-2xl shadow-[rgba(139,69,19,0.3)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/60 bg-[#F5DEB3]/20 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-[#8B4513]">
                  {isEdit ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
                </h3>
                <p className="text-xs text-[#8B4513]/60">
                  กรอกข้อมูลให้ครบถ้วนเพื่อให้หน้าเว็บแสดงผลสวยงามและถูกต้อง
                </p>
              </div>
              <button
                className="rounded-full border border-[#8B4513]/20 bg-white px-3 py-1 text-xs font-semibold text-[#8B4513]/70 transition hover:border-[#8B4513]/30 hover:text-[#8B4513]"
                onClick={() => setEditing(null)}
              >
                ปิด
              </button>
            </div>

            <form onSubmit={onSubmit} className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_1fr] ">
              <div className="space-y-4">
                <Field label="ชื่อสินค้า" required>
                  <input
                    className="w-full rounded-[1rem] border border-[#D2691E]/20 bg-white/80 px-4 py-2 text-sm text-[#8B4513] shadow-inner focus:border-[#D2691E] focus:outline-none"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        title: e.target.value,
                        slug: f.slug ? f.slug : toSlug(e.target.value),
                      }))
                    }
                  />
                </Field>
                <Field label="Slug">
                  <input
                    className="w-full rounded-[1rem] border border-[#D2691E]/20 bg-white/80 px-4 py-2 text-sm text-[#8B4513] shadow-inner focus:border-[#D2691E] focus:outline-none"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="ราคา">
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded-[1rem] border border-[#D2691E]/20 bg-white/80 px-4 py-2 text-sm text-[#8B4513] shadow-inner focus:border-[#D2691E] focus:outline-none"
                      value={form.price}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, price: Number(e.target.value || 0) }))
                      }
                    />
                  </Field>
                  <Field label="สต็อก">
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded-[1rem] border border-[#D2691E]/20 bg-white/80 px-4 py-2 text-sm text-[#8B4513] shadow-inner focus:border-[#D2691E] focus:outline-none"
                      value={form.stock}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, stock: Number(e.target.value || 0) }))
                      }
                    />
                  </Field>
                </div>
                <Field label="แท็ก (คั่นด้วย ,)">
                  <input
                    className="w-full rounded-[1rem] border border-[#D2691E]/20 bg-white/80 px-4 py-2 text-sm text-[#8B4513] shadow-inner focus:border-[#D2691E] focus:outline-none"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  />
                </Field>
                <div className="flex items-center gap-3">
                  <SlidingToggle 
                    isActive={form.active}
                    onToggle={() => setForm((f) => ({ ...f, active: !f.active }))}
                  />
                  <label className="text-sm font-medium text-[#8B4513]/80">
                    แสดงสินค้าบนหน้าร้าน
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <Field label="คำอธิบาย">
                  <textarea
                    className="h-32 w-full rounded-[1rem] border border-[#D2691E]/20 bg-white/80 px-4 py-2 text-sm text-[#8B4513] shadow-inner focus:border-[#D2691E] focus:outline-none"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </Field>
                <Field label="รูปสินค้า">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="h-28 w-28 overflow-hidden rounded-[1rem] border border-white/70 bg-[#F5DEB3]/30 shadow-inner flex-shrink-0">
                      {form.image ? (
                        <img src={form.image} alt="preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[#8B4513]/50">
                          รออัปโหลด
                        </div>
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
                        className="w-full rounded-[1rem] border border-dashed border-[#D2691E]/40 bg-white/70 px-4 py-3 text-sm text-[#8B4513]/70 file:mr-4 file:rounded-full file:border-0 file:bg-[#D2691E]/10 file:px-4 file:py-2 file:text-[#D2691E]"
                      />
                      <input
                        className="w-full rounded-[1rem] border border-[#D2691E]/20 bg-white/80 px-4 py-2 text-sm text-[#8B4513] shadow-inner focus:border-[#D2691E] focus:outline-none"
                        placeholder="หรือวาง URL รูปสินค้า"
                        value={form.image}
                        onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                      />
                    </div>
                  </div>
                </Field>

                <div className="flex flex-wrap justify-end gap-3 pt-4">
                  <button
                    type="button"
                    className="rounded-full border border-[#8B4513]/20 px-5 py-2 text-sm font-semibold text-[#8B4513]/70 transition hover:border-[#8B4513]/40 hover:text-[#8B4513]"
                    onClick={() => setEditing(null)}
                  >
                    ยกเลิก
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-[#D2691E] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(139,69,19,0.25)] transition hover:bg-[#8B4513] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={saving}
                  >
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

function Field({ label, required, children }) {
  return (
    <label className="block text-sm font-medium text-[#8B4513]/80">
      <span className="mb-2 block">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function StatBubble({ label, value, color }) {
  const colorConfig = {
    blue: { bg: "bg-[#E6F3FF]/60", border: "border-[#87CEEB]/40", accent: "bg-[#87CEEB]/20" },
    green: { bg: "bg-[#F0F8E6]/60", border: "border-[#98FB98]/40", accent: "bg-[#98FB98]/20" },
    orange: { bg: "bg-[#FFF8E1]/60", border: "border-[#FFB74D]/40", accent: "bg-[#FFB74D]/20" },
    purple: { bg: "bg-[#F5F0FF]/60", border: "border-[#DDA0DD]/40", accent: "bg-[#DDA0DD]/20" }
  };

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <div className={`relative overflow-hidden rounded-[1.5rem] border ${config.border} ${config.bg} p-4 shadow-sm hover:shadow-md transition-shadow backdrop-blur`}>
      <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full ${config.accent}`} />
      <div className="relative">
        <p className="text-xs uppercase tracking-wide text-[#8B4513]/60 font-semibold">{label}</p>
        <p className="mt-2 text-xl font-bold text-[#8B4513]">{value}</p>
      </div>
    </div>
  );
}