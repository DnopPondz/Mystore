"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminAccentButton,
  adminInsetCardShell,
  adminSurfaceShell,
  adminTableShell,
} from "@/app/admin/theme";
import { useAdminPopup } from "@/components/admin/AdminPopupProvider";

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

function SlidingToggle({ isActive, onToggle, disabled = false }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5a0] focus:ring-offset-2 ${
        isActive ? "bg-[#2F7A3D]" : "bg-[#D4D4D8]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      title={isActive ? "คลิกเพื่อปิดการใช้งาน" : "คลิกเพื่อเปิดใช้งาน"}
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

const emptyCoupon = {
  code: "",
  type: "percent",
  value: 10,
  minSubtotal: 0,
  maxUsesPerUser: "",
  expiresAt: "",
  active: true,
};

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `฿${amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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
      maxUsesPerUser: c.maxUsesPerUser ? String(c.maxUsesPerUser) : "",
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
      maxUsesPerUser: (() => {
        if (form.maxUsesPerUser === "" || form.maxUsesPerUser === null) return null;
        const limit = Number(form.maxUsesPerUser);
        return Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : null;
      })(),
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
      `${c.code} ${c.type} ${c.value} ${c.minSubtotal} ${c.maxUsesPerUser ?? ""}`
        .toLowerCase()
        .includes(term),
    );
  }, [items, search]);

  const activeCount = filtered.filter((c) => c.active).length;
  const percentCount = filtered.filter((c) => c.type === "percent").length;
  const amountCount = filtered.filter((c) => c.type === "amount").length;

  return (
    <main className="space-y-8 text-[#0b3b31]">
      <section className={`${adminSurfaceShell} p-8`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0b3b31]">จัดการคูปอง</h2>
            <p className="mt-1 text-[#145f4b]">สร้าง/แก้ไข และเปิดปิดการใช้งานคูปองให้ตรงกับกลยุทธ์การขาย</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาโค้ด ประเภท หรือมูลค่า"
                className="w-60 rounded-full border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#0ea5a0]">🔍</span>
            </div>
            <button className={adminAccentButton} onClick={startCreate}>
              🎉 สร้างคูปองใหม่
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBubble label="คูปองทั้งหมด" value={filtered.length} color="blue" />
          <StatBubble label="เปิดใช้งาน" value={activeCount} color="green" />
          <StatBubble label="ส่วนลด %" value={percentCount} color="orange" />
          <StatBubble label="ส่วนลดจำนวนเงิน" value={amountCount} color="purple" />
        </div>
      </section>

      <section className={adminTableShell}>
        <header className="flex flex-col gap-2 border-b border-[#c9f6ef] bg-[#eaf8f4]/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0b3b31]">รายการคูปอง</h3>
            <p className="text-xs text-[#145f4b]">แก้ไขเงื่อนไขและเปิด/ปิดการใช้งานได้ทันที</p>
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-[#0ea5a0]">{filtered.length} รายการที่แสดง</span>
        </header>

        {loading && (
          <div className="flex items-center justify-center px-6 py-8">
            <div className="flex items-center gap-3 text-sm text-[#145f4b]">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0ea5a0] border-t-transparent" />
              <span>กำลังโหลดข้อมูลคูปอง...</span>
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
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-[#145f4b]">
                  <span className="mb-4 block text-4xl">🎟️</span>
                  <span>ไม่พบคูปองที่ตรงกับคำค้นหา</span>
                </div>
              ) : (
                  filtered.map((c) => (
                    <div key={c._id} className={`${adminInsetCardShell} bg-white/95 p-4 shadow-[0_14px_28px_-24px_rgba(10,83,73,0.5)]`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="truncate font-semibold text-[#0b3b31]">{c.code}</h4>
                        <p className="text-xs text-[#145f4b]">
                          {c.type === "percent" ? `ส่วนลด ${c.value}%` : `ส่วนลด ${formatCurrency(c.value)}`}
                        </p>
                        <div className="mt-2 text-sm text-[#0f5349]">ขั้นต่ำ: {formatCurrency(c.minSubtotal)}</div>
                        <div className="mt-1 text-xs text-[#145f4b]">
                          จำกัด: {c.maxUsesPerUser ? `${c.maxUsesPerUser} ครั้ง/ผู้ใช้` : "ไม่จำกัด"}
                        </div>
                        <div className="mt-1 text-xs text-[#145f4b]">
                          หมดอายุ: {c.expiresAt ? new Date(c.expiresAt).toLocaleString("th-TH") : "ไม่มีกำหนด"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <SlidingToggle isActive={c.active} onToggle={() => toggleActive(c)} />
                          <span className="text-xs text-[#145f4b]">{c.active ? "ใช้งานอยู่" : "ปิดใช้งาน"}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="rounded-full border border-[#a4ebdf] px-3 py-1 text-xs font-semibold text-[#0ea5a0] transition hover:bg-[#eaf8f4]"
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

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[#c9f6ef] bg-[#FFF3E0]">
                    <th className="px-6 py-4 text-left font-semibold text-[#0b3b31]">โค้ด</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#0b3b31]">ประเภท</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#0b3b31]">มูลค่า</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#0b3b31]">ขั้นต่ำ</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#0b3b31]">จำกัด/ผู้ใช้</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#0b3b31]">หมดอายุ</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#0b3b31]">สถานะ</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#0b3b31]">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c9f6ef]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-[#145f4b]">
                        <div className="flex flex-col items-center">
                          <span className="mb-4 text-4xl">🎟️</span>
                          <span>ไม่พบคูปองที่ตรงกับคำค้นหา</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c, idx) => (
                      <tr
                        key={c._id}
                        className={`${idx % 2 === 0 ? "bg-white" : "bg-[#FFF7EA]"} transition-colors hover:bg-[#FFEFD8]`}
                      >
                        <td className="px-6 py-4 font-semibold text-[#0b3b31]">{c.code}</td>
                        <td className="px-6 py-4 text-[#0f5349]">{c.type}</td>
                        <td className="px-6 py-4 text-[#0f5349]">
                          {c.type === "percent" ? `${c.value}%` : formatCurrency(c.value)}
                        </td>
                        <td className="px-6 py-4 text-[#0f5349]">{formatCurrency(c.minSubtotal)}</td>
                        <td className="px-6 py-4 text-[#0f5349]">
                          {c.maxUsesPerUser ? `${c.maxUsesPerUser} ครั้ง` : "ไม่จำกัด"}
                        </td>
                        <td className="px-6 py-4 text-xs text-[#145f4b]">
                          {c.expiresAt ? new Date(c.expiresAt).toLocaleString("th-TH") : "ไม่มีกำหนด"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <SlidingToggle isActive={c.active} onToggle={() => toggleActive(c)} />
                            <span className="text-xs text-[#145f4b]">{c.active ? "ใช้งานอยู่" : "ปิดใช้งาน"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="rounded-full border border-[#a4ebdf] px-4 py-1 text-xs font-semibold text-[#0ea5a0] transition hover:bg-[#eaf8f4]"
                              onClick={() => startEdit(c)}
                            >
                              แก้ไข
                            </button>
                            <button
                              className="rounded-full border border-red-200 px-4 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50"
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

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-[#bff4ec] bg-[#f2fbf8] shadow-[0_30px_60px_-30px_rgba(10,83,73,0.6)]">
            <div className="flex items-center justify-between border-b border-[#c9f6ef] bg-[#eaf8f4]/70 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-[#0b3b31]">{editing?._id ? "แก้ไขคูปอง" : "สร้างคูปองใหม่"}</h3>
                <p className="text-xs text-[#145f4b]">กำหนดรายละเอียดและเงื่อนไขคูปองให้เหมาะกับแคมเปญของคุณ</p>
              </div>
              <button
                className="rounded-full border border-[#a4ebdf] bg-white px-3 py-1 text-xs font-semibold text-[#0ea5a0] transition hover:bg-[#eaf8f4]"
                onClick={() => setEditing(null)}
              >
                ปิด
              </button>
            </div>

            <form onSubmit={onSubmit} className="grid gap-6 px-6 py-6 md:grid-cols-[1.1fr_1fr]">
              <div className="space-y-4">
                <Field label="รหัสคูปอง" required>
                  <input
                    className="w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
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
                      className="w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
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
                      className="w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
                      value={form.value}
                      onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value || 0) }))}
                    />
                  </Field>
                </div>
                <Field label="ยอดสั่งซื้อขั้นต่ำ (บาท)">
                  <input
                    type="number"
                    className="w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
                    value={form.minSubtotal}
                    onChange={(e) => setForm((f) => ({ ...f, minSubtotal: Number(e.target.value || 0) }))}
                  />
                </Field>
                <Field label="จำกัดจำนวนครั้งต่อผู้ใช้">
                  <input
                    type="number"
                    min={1}
                    placeholder="เว้นว่าง = ไม่จำกัด"
                    className="w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
                    value={form.maxUsesPerUser}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        maxUsesPerUser: e.target.value === "" ? "" : e.target.value.replace(/[^0-9]/g, ""),
                      }))
                    }
                  />
                </Field>
              </div>

              <div className="space-y-4">
                <Field label="วันหมดอายุ">
                  <input
                    type="datetime-local"
                    className="w-full rounded-[1rem] border border-[#a4ebdf] bg-white px-4 py-2 text-sm text-[#0b3b31] shadow-[inset_0_1px_3px_rgba(10,83,73,0.12)] focus:border-[#0ea5a0] focus:outline-none"
                    value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  />
                </Field>

                <div className="flex items-center gap-3">
                  <SlidingToggle isActive={form.active} onToggle={() => setForm((f) => ({ ...f, active: !f.active }))} />
                  <label className="text-sm font-medium text-[#0b3b31]">เปิดใช้งานคูปองทันที</label>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-4">
                  <button
                    type="button"
                    className="rounded-full border border-[#a4ebdf] px-5 py-2 text-sm font-semibold text-[#0ea5a0] transition hover:bg-[#eaf8f4]"
                    onClick={() => setEditing(null)}
                  >
                    ยกเลิก
                  </button>
                  <button className={`${adminAccentButton} disabled:cursor-not-allowed disabled:opacity-60`} disabled={saving}>
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

