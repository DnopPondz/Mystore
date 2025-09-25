"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminPopup } from "@/components/admin/AdminPopupProvider";

/* ---------- Shared UI (match Products page) ---------- */
function StatBubble({ label, value, color }) {
  const colorConfig = {
    blue: { bg: "bg-[#E6F3FF]/60", border: "border-[#87CEEB]/40", accent: "bg-[#87CEEB]/20" },
    green: { bg: "bg-[#F0F8E6]/60", border: "border-[#98FB98]/40", accent: "bg-[#98FB98]/20" },
    orange: { bg: "bg-[#FFF8E1]/60", border: "border-[#FFB74D]/40", accent: "bg-[#FFB74D]/20" },
    purple: { bg: "bg-[#F5F0FF]/60", border: "border-[#DDA0DD]/40", accent: "bg-[#DDA0DD]/20" },
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

// Same sliding toggle as Products page
function SlidingToggle({ isActive, onToggle, disabled = false }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#D2691E] focus:ring-offset-2 ${
        isActive ? "bg-[#228B22]" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      title={isActive ? "คลิกเพื่อปิดการใช้งาน" : "คลิกเพื่อเปิดใช้งาน"}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
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

/* ---------- Helpers ---------- */
const emptyCoupon = {
  code: "",
  type: "percent", // percent | amount
  value: 10,
  minSubtotal: 0,
  expiresAt: "",
  active: true,
};

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `฿${amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ---------- Page ---------- */
export default function AdminCouponsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCoupon);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const popup = useAdminPopup();

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

  function startEdit(c) {
    setEditing(c);
    setForm({
      code: c.code || "",
      type: c.type || "percent",
      value: Number(c.value || 0),
      minSubtotal: Number(c.minSubtotal || 0),
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : "",
      active: !!c.active,
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    const payload = {
      code: form.code.trim().toUpperCase(),
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
      await popup.alert(data?.error || "บันทึกข้อมูลไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        tone: "error",
      });
      return;
    }
    setEditing(null);
    await load();
  }

  async function onDelete(coupon) {
    const confirmed = await popup.confirm(`ลบคูปอง "${coupon.code}" ?`, {
      title: "ยืนยันการลบคูปอง",
      confirmText: "ลบคูปอง",
      cancelText: "ยกเลิก",
      tone: "error",
    });
    if (confirmed === false) return;
    const res = await fetch(`/api/coupons/${coupon._id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      await popup.alert(data?.error || "ลบคูปองไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        tone: "error",
      });
      return;
    }
    await load();
  }

  async function toggleActive(coupon) {
    const newValue = !coupon.active;
    const res = await fetch(`/api/coupons/${coupon._id}`, {
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
    setItems((prev) => prev.map((c) => (c._id === coupon._id ? { ...c, active: newValue } : c)));
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((c) =>
      `${c.code} ${c.type} ${c.value} ${c.minSubtotal}`.toLowerCase().includes(term)
    );
  }, [items, search]);

  const activeCount = filtered.filter((c) => c.active).length;
  const percentCount = filtered.filter((c) => c.type === "percent").length;
  const amountCount = filtered.filter((c) => c.type === "amount").length;

  return (
    <main className="space-y-8">
      {/* Header Section (match products) */}
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-[rgba(139,69,19,0.2)] backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#8B4513]">จัดการคูปอง</h2>
            <p className="mt-1 text-[#8B4513]/70">
              สร้าง/แก้ไข และเปิดปิดการใช้งานคูปองให้ตรงกับกลยุทธ์การขาย
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาโค้ด ประเภท หรือมูลค่า"
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
              🎉 สร้างคูปองใหม่
            </button>
          </div>
        </div>

        {/* Stats (use StatBubble like products) */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBubble label="คูปองทั้งหมด" value={filtered.length} color="blue" />
          <StatBubble label="เปิดใช้งาน" value={activeCount} color="green" />
          <StatBubble label="ส่วนลด %" value={percentCount} color="orange" />
          <StatBubble label="ส่วนลดจำนวนเงิน" value={amountCount} color="purple" />
        </div>
      </section>

      {/* Table/Card Section (match products) */}
      <section className="rounded-[2rem] border border-white/70 bg-white/80 shadow-xl shadow-[rgba(139,69,19,0.15)] backdrop-blur overflow-hidden">
        <header className="flex flex-col gap-2 border-b border-white/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#8B4513]">รายการคูปอง</h3>
            <p className="text-xs text-[#8B4513]/60">แก้ไขเงื่อนไขและเปิด/ปิดการใช้งานได้ทันที</p>
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-[#8B4513]/50">
            {filtered.length} รายการที่แสดง
          </span>
        </header>

        {loading && (
          <div className="flex items-center justify-center px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#D2691E] border-t-transparent"></div>
              <span className="text-sm text-[#8B4513]/70">กำลังโหลดข้อมูลคูปอง...</span>
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
              {filtered.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🎟️</span>
                  <span className="text-[#8B4513]/60">ไม่พบคูปองที่ตรงกับคำค้นหา</span>
                </div>
              ) : (
                filtered.map((c) => (
                  <div key={c._id} className="rounded-[1.5rem] bg-white/90 border border-white/60 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#8B4513] truncate">{c.code}</h4>
                        <p className="text-xs text-[#8B4513]/50">
                          {c.type === "percent" ? `ส่วนลด ${c.value}%` : `ส่วนลด ${formatCurrency(c.value)}`}
                        </p>
                        <div className="mt-2 text-sm text-[#8B4513]/80">
                          ขั้นต่ำ: {formatCurrency(c.minSubtotal)}
                        </div>
                        <div className="text-xs text-[#8B4513]/60 mt-1">
                          หมดอายุ: {c.expiresAt ? new Date(c.expiresAt).toLocaleString("th-TH") : "ไม่มีกำหนด"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <SlidingToggle isActive={c.active} onToggle={() => toggleActive(c)} />
                          <span className="text-xs text-[#8B4513]/70">{c.active ? "ใช้งานอยู่" : "ปิดใช้งาน"}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="rounded-full border border-[#D2691E]/30 px-3 py-1 text-xs font-semibold text-[#D2691E] transition hover:bg-[#D2691E]/10"
                            onClick={() => startEdit(c)}
                          >
                            แก้ไข
                          </button>
                          <button
                            className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                            onClick={() => onDelete(c)}
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#F5DEB3]/30 border-b border-white/40">
                    <th className="px-6 py-4 text-left font-semibold text-[#8B4513]">โค้ด</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#8B4513]">ประเภท</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#8B4513]">มูลค่า</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#8B4513]">ขั้นต่ำ</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#8B4513]">หมดอายุ</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#8B4513]">สถานะ</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#8B4513]">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-4xl mb-4">🎟️</span>
                          <span className="text-[#8B4513]/60">ไม่พบคูปองที่ตรงกับคำค้นหา</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c, idx) => (
                      <tr
                        key={c._id}
                        className={`transition-colors hover:bg-white/70 ${
                          idx % 2 === 0 ? "bg-white/50" : "bg-[#FFF8DC]/30"
                        }`}
                      >
                        <td className="px-6 py-4 font-semibold text-[#8B4513]">{c.code}</td>
                        <td className="px-6 py-4 text-[#8B4513]">{c.type}</td>
                        <td className="px-6 py-4 text-[#8B4513]">
                          {c.type === "percent" ? `${c.value}%` : formatCurrency(c.value)}
                        </td>
                        <td className="px-6 py-4 text-[#8B4513]">{formatCurrency(c.minSubtotal)}</td>
                        <td className="px-6 py-4 text-xs text-[#8B4513]/70">
                          {c.expiresAt ? new Date(c.expiresAt).toLocaleString("th-TH") : "ไม่มีกำหนด"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <SlidingToggle isActive={c.active} onToggle={() => toggleActive(c)} />
                            <span className="text-xs text-[#8B4513]/70">
                              {c.active ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="rounded-full border border-[#D2691E]/30 px-4 py-1 text-xs font-semibold text-[#D2691E] transition hover:border-[#D2691E] hover:bg-[#D2691E]/10"
                              onClick={() => startEdit(c)}
                            >
                              แก้ไข
                            </button>
                            <button
                              className="rounded-full border border-red-200 px-4 py-1 text-xs font-semibold text-red-500 transition hover:border-red-400 hover:bg-red-50"
                              onClick={() => onDelete(c)}
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

      {/* Modal (match products) */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 shadow-2xl shadow-[rgba(139,69,19,0.3)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/60 bg-[#F5DEB3]/20 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-[#8B4513]">
                  {editing?._id ? "แก้ไขคูปอง" : "สร้างคูปองใหม่"}
                </h3>
                <p className="text-xs text-[#8B4513]/60">
                  กำหนดรายละเอียดและเงื่อนไขคูปองให้เหมาะกับแคมเปญของคุณ
                </p>
              </div>
              <button
                className="rounded-full border border-[#8B4513]/20 bg-white px-3 py-1 text-xs font-semibold text-[#8B4513]/70 transition hover:border-[#8B4513]/30 hover:text-[#8B4513]"
                onClick={() => setEditing(null)}
              >
                ปิด
              </button>
            </div>

            <form onSubmit={onSubmit} className="grid gap-6 px-6 py-6 md:grid-cols-[1.1fr_1fr]">
              <div className="space-y-4">
                <Field label="รหัสคูปอง" required>
                  <input
                    className="w-full rounded-[1rem] border border-[#D2691E]/20 bg-white/80 px-4 py-2 text-sm text-[#8B4513] shadow-inner focus:border-[#D2691E] focus:outline-none"
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/\s+/g, "") }))
                    }
                    required
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="ประเภทส่วนลด">
                    <select
                      className="w-full rounded-[1rem] border border-[#D2691E]/20 bg-white/80 px-4 py-2 text-sm text-[#8B4513] shadow-inner focus:border-[#D2691E] focus:outline-none"
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
                      className="w-full rounded-[1rem] border border-[#D2691E]/20 bg-white/80 px-4 py-2 text-sm text-[#8B4513] shadow-inner focus:border-[#D2691E] focus:outline-none"
                      value={form.value}
                      onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value || 0) }))}
                    />
                  </Field>
                </div>
                <Field label="ยอดสั่งซื้อขั้นต่ำ (บาท)">
                  <input
                    type="number"
                    className="w-full rounded-[1rem] border border-[#D2691E]/20 bg-white/80 px-4 py-2 text-sm text-[#8B4513] shadow-inner focus:border-[#D2691E] focus:outline-none"
                    value={form.minSubtotal}
                    onChange={(e) => setForm((f) => ({ ...f, minSubtotal: Number(e.target.value || 0) }))}
                  />
                </Field>
              </div>

              <div className="space-y-4">
                <Field label="วันหมดอายุ">
                  <input
                    type="datetime-local"
                    className="w-full rounded-[1rem] border border-[#D2691E]/20 bg-white/80 px-4 py-2 text-sm text-[#8B4513] shadow-inner focus:border-[#D2691E] focus:outline-none"
                    value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  />
                </Field>

                <div className="flex items-center gap-3">
                  <SlidingToggle
                    isActive={form.active}
                    onToggle={() => setForm((f) => ({ ...f, active: !f.active }))}
                  />
                  <label className="text-sm font-medium text-[#8B4513]/80">เปิดใช้งานคูปองทันที</label>
                </div>

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
                    {saving ? "กำลังบันทึก..." : editing?._id ? "บันทึกการแก้ไข" : "สร้างคูปอง"}
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
