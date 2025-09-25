"use client";

import { useEffect, useMemo, useState } from "react";

const emptyCoupon = {
  code: "",
  type: "percent",
  value: 10,
  minSubtotal: 0,
  expiresAt: "",
  active: true,
};

export default function AdminCouponsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCoupon);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/coupons", { cache: "no-store" });
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
    setForm(emptyCoupon);
  }

  function startEdit(coupon) {
    setEditing(coupon);
    setForm({
      code: coupon.code || "",
      type: coupon.type || "percent",
      value: Number(coupon.value || 0),
      minSubtotal: Number(coupon.minSubtotal || 0),
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : "",
      active: !!coupon.active,
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    const payload = {
      code: form.code,
      type: form.type,
      value: Number(form.value || 0),
      minSubtotal: Number(form.minSubtotal || 0),
      expiresAt: form.expiresAt || "",
      active: Boolean(form.active),
    };

    const url = editing?._id ? `/api/coupons/${editing._id}` : "/api/coupons";
    const method = editing?._id ? "PATCH" : "POST";
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

  async function toggleActive(coupon) {
    const res = await fetch(`/api/coupons/${coupon._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Update failed");
      return;
    }
    setItems((prev) => prev.map((c) => (c._id === coupon._id ? { ...c, active: !coupon.active } : c)));
  }

  async function onDelete(coupon) {
    if (!confirm(`ลบคูปอง "${coupon.code}" ?`)) return;
    const res = await fetch(`/api/coupons/${coupon._id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Delete failed");
      return;
    }
    await load();
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((coupon) => `${coupon.code} ${coupon.type}`.toLowerCase().includes(term));
  }, [items, search]);

  const activeCount = filtered.filter((coupon) => coupon.active).length;
  const percentCount = filtered.filter((coupon) => coupon.type === "percent").length;
  const amountCount = filtered.filter((coupon) => coupon.type === "amount").length;

  return (
    <main className="space-y-10">
      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-[rgba(240,200,105,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-rose-dark)]">คูปองและโปรโมชัน</h2>
            <p className="mt-1 text-sm text-[var(--color-choco)]/70">
              สร้างข้อเสนอพิเศษเพื่อดึงดูดลูกค้า และกำหนดเงื่อนไขให้ตรงกับกลยุทธ์การขาย
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาคูปอง"
              className="w-52 rounded-full border border-[var(--color-rose)]/30 bg-white/70 px-4 py-2 text-sm text-[var(--color-choco)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
            />
            <button
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-rose)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(240,200,105,0.33)] transition hover:bg-[var(--color-rose-dark)]"
              onClick={startCreate}
            >
              🎉 สร้างคูปองใหม่
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CouponStat label="คูปองทั้งหมด" value={filtered.length} />
          <CouponStat label="เปิดใช้งาน" value={activeCount} tone="from-[#7cd1b8]/30" />
          <CouponStat label="ส่วนลด %" value={percentCount} tone="from-[#f3d36b]/30" />
          <CouponStat label="ส่วนลดเป็นจำนวน" value={amountCount} tone="from-[#f7c68b]/30" />
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/70 shadow-xl shadow-[rgba(240,200,105,0.09)]">
        <header className="flex flex-col gap-2 border-b border-white/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-choco)]">รายการคูปอง</h3>
            <p className="text-xs text-[var(--color-choco)]/60">เปิด/ปิดการใช้งานและแก้ไขเงื่อนไขได้ทุกเมื่อ</p>
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-choco)]/50">
            {filtered.length} รายการ
          </span>
        </header>

        {loading && <p className="px-6 py-6 text-sm text-[var(--color-choco)]/70">กำลังโหลดข้อมูล...</p>}
        {err && !loading && <p className="px-6 py-6 text-sm text-rose-600">{err}</p>}

        {!loading && !err && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 px-4 py-4 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-choco)]/50">
                  <th className="px-4 py-2">โค้ด</th>
                  <th className="px-4 py-2">ประเภท</th>
                  <th className="px-4 py-2">มูลค่า</th>
                  <th className="px-4 py-2">ขั้นต่ำ</th>
                  <th className="px-4 py-2">หมดอายุ</th>
                  <th className="px-4 py-2">สถานะ</th>
                  <th className="px-4 py-2 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((coupon) => (
                  <tr key={coupon._id} className="rounded-3xl bg-white/80 shadow shadow-[rgba(240,200,105,0.07)]">
                    <td className="px-4 py-4 font-semibold text-[var(--color-choco)]">{coupon.code}</td>
                    <td className="px-4 py-4 text-[var(--color-choco)]/70">{coupon.type}</td>
                    <td className="px-4 py-4 text-[var(--color-choco)]">
                      {coupon.type === "percent" ? `${coupon.value}%` : formatCurrency(coupon.value)}
                    </td>
                    <td className="px-4 py-4 text-[var(--color-choco)]">{formatCurrency(coupon.minSubtotal)}</td>
                    <td className="px-4 py-4 text-xs text-[var(--color-choco)]/60">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleString("th-TH") : "ไม่มีกำหนด"}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleActive(coupon)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                          coupon.active
                            ? "bg-[var(--color-rose)]/15 text-[var(--color-rose)]"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <span className="text-base">{coupon.active ? "💡" : "🌙"}</span>
                        {coupon.active ? "ใช้งานอยู่" : "ปิดการใช้งาน"}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-full border border-[var(--color-rose)]/40 px-4 py-1 text-xs font-semibold text-[var(--color-rose)] transition hover:border-[var(--color-rose)] hover:bg-[var(--color-rose)]/10"
                          onClick={() => startEdit(coupon)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="rounded-full border border-rose-200 px-4 py-1 text-xs font-semibold text-rose-500 transition hover:border-rose-400 hover:bg-rose-100"
                          onClick={() => onDelete(coupon)}
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
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-2xl shadow-[rgba(240,200,105,0.3)]">
            <div className="flex items-center justify-between border-b border-white/60 bg-[var(--color-rose)]/10 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-choco)]">
                  {editing?._id ? "แก้ไขคูปอง" : "สร้างคูปองใหม่"}
                </h3>
                <p className="text-xs text-[var(--color-choco)]/60">
                  เติมรายละเอียดเพื่อกำหนดสิทธิ์ให้ลูกค้าตามกลยุทธ์ของคุณ
                </p>
              </div>
              <button
                className="rounded-full border border-[var(--color-choco)]/10 bg-white px-3 py-1 text-xs font-semibold text-[var(--color-choco)]/70 transition hover:border-[var(--color-choco)]/30 hover:text-[var(--color-choco)]"
                onClick={() => setEditing(null)}
              >
                ปิด
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 px-6 py-6">
              <Field label="รหัสคูปอง" required>
                <input
                  className="w-full rounded-2xl border border-[var(--color-rose)]/20 bg-white/80 px-4 py-2 text-sm text-[var(--color-choco)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="ประเภทส่วนลด">
                  <select
                    className="w-full rounded-2xl border border-[var(--color-rose)]/20 bg-white/80 px-4 py-2 text-sm text-[var(--color-choco)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    <option value="percent">เปอร์เซ็นต์ (%)</option>
                    <option value="amount">จำนวนเงิน (บาท)</option>
                  </select>
                </Field>
                <Field label="มูลค่าส่วนลด">
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-[var(--color-rose)]/20 bg-white/80 px-4 py-2 text-sm text-[var(--color-choco)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value || 0) }))}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="ยอดสั่งซื้อขั้นต่ำ (บาท)">
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-[var(--color-rose)]/20 bg-white/80 px-4 py-2 text-sm text-[var(--color-choco)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
                    value={form.minSubtotal}
                    onChange={(e) => setForm((f) => ({ ...f, minSubtotal: Number(e.target.value || 0) }))}
                  />
                </Field>
                <Field label="วันหมดอายุ">
                  <input
                    type="datetime-local"
                    className="w-full rounded-2xl border border-[var(--color-rose)]/20 bg-white/80 px-4 py-2 text-sm text-[var(--color-choco)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
                    value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  />
                </Field>
              </div>

              <label className="flex items-center gap-3 text-sm font-medium text-[var(--color-choco)]/80">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="h-4 w-4 rounded border-[var(--color-rose)]/40 text-[var(--color-rose)] focus:ring-[var(--color-rose)]"
                />
                เปิดใช้งานคูปองทันที
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-full border border-[var(--color-choco)]/20 px-5 py-2 text-sm font-semibold text-[var(--color-choco)]/70 transition hover:border-[var(--color-choco)]/40 hover:text-[var(--color-choco)]"
                  onClick={() => setEditing(null)}
                >
                  ยกเลิก
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-rose)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(240,200,105,0.33)] transition hover:bg-[var(--color-rose-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "กำลังบันทึก..." : editing?._id ? "บันทึกการแก้ไข" : "สร้างคูปอง"}
                </button>
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

function CouponStat({ label, value, tone }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-4 text-sm font-semibold text-[var(--color-choco)] shadow-inner">
      {tone ? <div className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${tone}`} /> : null}
      <div className="relative">
        <p className="text-xs uppercase tracking-wide text-[var(--color-choco)]/50">{label}</p>
        <p className="mt-2 text-xl text-[var(--color-rose-dark)]">{value}</p>
      </div>
    </div>
  );
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `฿${amount.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
