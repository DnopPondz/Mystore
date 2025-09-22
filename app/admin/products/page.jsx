"use client";

import { useEffect, useMemo, useState } from "react";
import slugify from "slugify";

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

export default function AdminProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

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
      alert(data?.error || "บันทึกข้อมูลไม่สำเร็จ");
      return;
    }
    setEditing(null);
    await load();
  }

  async function onDelete(p) {
    if (!confirm(`ลบสินค้า "${p.title}" ?`)) return;
    const res = await fetch(`/api/products/${p._id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Delete failed");
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
      alert(data?.error || "Update failed");
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
    <main className="space-y-10">
      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-[#f0658314] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-rose-dark)]">จัดการสินค้า</h2>
            <p className="mt-1 text-sm text-[var(--color-choco)]/70">
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
                className="w-60 rounded-full border border-[var(--color-rose)]/30 bg-white/70 px-4 py-2 text-sm text-[var(--color-choco)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--color-choco)]/50">
                🔍
              </span>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-rose)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#f0658333] transition hover:bg-[var(--color-rose-dark)]"
              onClick={startCreate}
            >
              ➕ เพิ่มสินค้าใหม่
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBubble label="สินค้าทั้งหมด" value={filteredItems.length} tone="from-[#f6c34a]/30 via-[#f78da7]/20 to-transparent" />
          <StatBubble label="กำลังขาย" value={activeCount} tone="from-[#7cd1b8]/30 via-[#f6c34a]/20 to-transparent" />
          <StatBubble label="ซ่อนอยู่" value={hiddenCount} tone="from-[#f06583]/30 via-[#f78da7]/20 to-transparent" />
          <StatBubble label="รอดำเนินการ" value={loading ? "กำลังโหลด" : "พร้อมจัดการ"} tone="from-[#c4b5fd]/30 via-[#f78da7]/10 to-transparent" />
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/70 shadow-xl shadow-[#f0658318]">
        <header className="flex flex-col gap-2 border-b border-white/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-choco)]">รายการสินค้า</h3>
            <p className="text-xs text-[var(--color-choco)]/60">
              อัปเดตสต็อกและราคาได้ทันที ตารางรองรับการเลื่อนในแนวนอนได้บนมือถือ
            </p>
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-choco)]/50">
            {filteredItems.length} รายการที่แสดง
          </span>
        </header>

        {loading && <p className="px-6 py-6 text-sm text-[var(--color-choco)]/70">กำลังโหลดข้อมูลสินค้า...</p>}
        {err && !loading && <p className="px-6 py-6 text-sm text-rose-600">{err}</p>}

        {!loading && !err && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 px-4 py-4 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-choco)]/50">
                  <th className="px-4 py-2">สินค้า</th>
                  <th className="px-4 py-2">ราคา</th>
                  <th className="px-4 py-2">สต็อก</th>
                  <th className="px-4 py-2">สถานะ</th>
                  <th className="px-4 py-2">แท็ก</th>
                  <th className="px-4 py-2 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((p) => (
                  <tr key={p._id} className="rounded-3xl bg-white/80 shadow shadow-[#f0658312]">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#fff1dd]">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-[var(--color-choco)]/40">
                              ไม่มีรูป
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-choco)]">{p.title}</p>
                          <p className="text-xs text-[var(--color-choco)]/50">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-[var(--color-choco)]">฿{p.price}</td>
                    <td className="px-4 py-4 text-[var(--color-choco)]">{p.stock}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                          p.active
                            ? "bg-[var(--color-rose)]/15 text-[var(--color-rose)]"
                            : "bg-gray-200 text-gray-500"
                        }`}
                        title={p.active ? "คลิกเพื่อซ่อนสินค้า" : "คลิกเพื่อแสดงสินค้า"}
                      >
                        <span className="text-base">{p.active ? "🟢" : "⚪️"}</span>
                        {p.active ? "กำลังขาย" : "ซ่อนอยู่"}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-xs text-[var(--color-choco)]/60">
                      {Array.isArray(p.tags) && p.tags.length > 0 ? p.tags.join(", ") : "-"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-full border border-[var(--color-rose)]/40 px-4 py-1 text-xs font-semibold text-[var(--color-rose)] transition hover:border-[var(--color-rose)] hover:bg-[var(--color-rose)]/10"
                          onClick={() => startEdit(p)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="rounded-full border border-rose-200 px-4 py-1 text-xs font-semibold text-rose-500 transition hover:border-rose-400 hover:bg-rose-100"
                          onClick={() => onDelete(p)}
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-2xl shadow-[#f0658330]">
            <div className="flex items-center justify-between border-b border-white/60 bg-[var(--color-rose)]/10 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-choco)]">
                  {isEdit ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
                </h3>
                <p className="text-xs text-[var(--color-choco)]/60">
                  กรอกข้อมูลให้ครบถ้วนเพื่อให้หน้าเว็บแสดงผลสวยงามและถูกต้อง
                </p>
              </div>
              <button
                className="rounded-full border border-[var(--color-choco)]/10 bg-white px-3 py-1 text-xs font-semibold text-[var(--color-choco)]/70 transition hover:border-[var(--color-choco)]/30 hover:text-[var(--color-choco)]"
                onClick={() => setEditing(null)}
              >
                ปิด
              </button>
            </div>

            <form onSubmit={onSubmit} className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                <Field label="ชื่อสินค้า" required>
                  <input
                    className="w-full rounded-2xl border border-[var(--color-rose)]/20 bg-white/80 px-4 py-2 text-sm text-[var(--color-choco)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
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
                    className="w-full rounded-2xl border border-[var(--color-rose)]/20 bg-white/80 px-4 py-2 text-sm text-[var(--color-choco)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="ราคา">
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded-2xl border border-[var(--color-rose)]/20 bg-white/80 px-4 py-2 text-sm text-[var(--color-choco)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
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
                      className="w-full rounded-2xl border border-[var(--color-rose)]/20 bg-white/80 px-4 py-2 text-sm text-[var(--color-choco)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
                      value={form.stock}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, stock: Number(e.target.value || 0) }))
                      }
                    />
                  </Field>
                </div>
                <Field label="แท็ก (คั่นด้วย ,)">
                  <input
                    className="w-full rounded-2xl border border-[var(--color-rose)]/20 bg-white/80 px-4 py-2 text-sm text-[var(--color-choco)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  />
                </Field>
                <label className="flex items-center gap-3 text-sm font-medium text-[var(--color-choco)]/80">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                    className="h-4 w-4 rounded border-[var(--color-rose)]/40 text-[var(--color-rose)] focus:ring-[var(--color-rose)]"
                  />
                  แสดงสินค้าบนหน้าร้าน
                </label>
              </div>

              <div className="space-y-4">
                <Field label="คำอธิบาย">
                  <textarea
                    className="h-32 w-full rounded-2xl border border-[var(--color-rose)]/20 bg-white/80 px-4 py-2 text-sm text-[var(--color-choco)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </Field>
                <Field label="รูปสินค้า">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="h-28 w-28 overflow-hidden rounded-2xl border border-white/70 bg-[#fff1dd] shadow-inner">
                      {form.image ? (
                        <img src={form.image} alt="preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[var(--color-choco)]/50">
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
                            alert(String(error.message || error));
                          }
                        }}
                        className="w-full rounded-2xl border border-dashed border-[var(--color-rose)]/40 bg-white/70 px-4 py-3 text-sm text-[var(--color-choco)]/70 file:mr-4 file:rounded-full file:border-0 file:bg-[var(--color-rose)]/10 file:px-4 file:py-2 file:text-[var(--color-rose)]"
                      />
                      <input
                        className="w-full rounded-2xl border border-[var(--color-rose)]/20 bg-white/80 px-4 py-2 text-sm text-[var(--color-choco)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
                        placeholder="หรือวาง URL รูปสินค้า"
                        value={form.image}
                        onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                      />
                    </div>
                  </div>
                </Field>

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="rounded-full border border-[var(--color-choco)]/20 px-5 py-2 text-sm font-semibold text-[var(--color-choco)]/70 transition hover:border-[var(--color-choco)]/40 hover:text-[var(--color-choco)]"
                    onClick={() => setEditing(null)}
                  >
                    ยกเลิก
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--color-rose)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#f0658333] transition hover:bg-[var(--color-rose-dark)] disabled:cursor-not-allowed disabled:opacity-60"
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
    <label className="block text-sm font-medium text-[var(--color-choco)]/80">
      <span className="mb-2 block">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function StatBubble({ label, value, tone }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-4 text-sm font-semibold text-[var(--color-choco)] shadow-inner">
      <div className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${tone}`} />
      <div className="relative">
        <p className="text-xs uppercase tracking-wide text-[var(--color-choco)]/50">{label}</p>
        <p className="mt-2 text-xl text-[var(--color-rose-dark)]">{value}</p>
      </div>
    </div>
  );
}
