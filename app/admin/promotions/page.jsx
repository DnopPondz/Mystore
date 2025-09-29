"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminAccentButton,
  adminInsetCardShell,
  adminSurfaceShell,
  adminTableShell,
} from "@/app/admin/theme";
import { useAdminPopup } from "@/components/admin/AdminPopupProvider";
import { summarizePromotion, formatPromotionSchedule } from "@/lib/promotionUtils";

const emptyPromotion = {
  title: "",
  description: "",
  type: "buy_x_get_y",
  buyQuantity: 1,
  getQuantity: 1,
  stampGoal: 10,
  stampReward: "ขนมฟรี 1 ชิ้น",
  startAt: "",
  endAt: "",
  active: true,
};

const typeOptions = [
  { value: "buy_x_get_y", label: "ซื้อ X แถม Y" },
  { value: "stamp_card", label: "บัตรสะสมแต้ม" },
  { value: "custom", label: "ข้อความกำหนดเอง" },
];

function StatBubble({ label, value, color }) {
  const palette = {
    blue: {
      bg: "bg-[#F1F6FE]",
      border: "border-[#C8DBF5]",
      accent: "text-[#2B6AA3]",
    },
    green: {
      bg: "bg-[#F0F9ED]",
      border: "border-[#C3E7C4]",
      accent: "text-[#2F7A3D]",
    },
    orange: {
      bg: "bg-[#FFF4E5]",
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
    <div className={`rounded-[1.5rem] border ${tone.border} ${tone.bg} p-4 shadow-[0_14px_26px_-24px_rgba(63,42,26,0.5)]`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${tone.accent}`}>{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#2F2A1F]">{value}</p>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block text-sm font-medium text-[#3F2A1A]">
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
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#C67C45] focus:ring-offset-2 ${
        isActive ? "bg-[#2F7A3D]" : "bg-[#D4D4D8]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      title={isActive ? "คลิกเพื่อปิดการใช้งาน" : "คลิกเพื่อเปิดใช้งาน"}
      type="button"
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

export default function AdminPromotionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(() => ({ ...emptyPromotion }));
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const popup = useAdminPopup();

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/promotions", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "โหลดข้อมูลไม่สำเร็จ");
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
    setForm({ ...emptyPromotion });
  }

  function startEdit(promotion) {
    setEditing(promotion);
    setForm({
      title: promotion.title || "",
      description: promotion.description || "",
      type: promotion.type || "custom",
      buyQuantity: Number(promotion.buyQuantity || 0) || 0,
      getQuantity: Number(promotion.getQuantity || 0) || 0,
      stampGoal: Number(promotion.stampGoal || 0) || 0,
      stampReward: promotion.stampReward || "",
      startAt: promotion.startAt ? new Date(promotion.startAt).toISOString().slice(0, 16) : "",
      endAt: promotion.endAt ? new Date(promotion.endAt).toISOString().slice(0, 16) : "",
      active: Boolean(promotion.active),
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      startAt: form.startAt || "",
      endAt: form.endAt || "",
      active: Boolean(form.active),
    };

    if (form.type === "buy_x_get_y") {
      payload.buyQuantity = Number(form.buyQuantity || 0);
      payload.getQuantity = Number(form.getQuantity || 0);
    }
    if (form.type === "stamp_card") {
      payload.stampGoal = Number(form.stampGoal || 0);
      payload.stampReward = form.stampReward || "";
    }

    const url = editing?._id ? `/api/promotions/${editing._id}` : "/api/promotions";
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

  async function onDelete(promotion) {
    const confirmed = await popup.confirm(`ลบโปรโมชัน "${promotion.title}" ?`, {
      title: "ยืนยันการลบโปรโมชัน",
      confirmText: "ลบโปรโมชัน",
      cancelText: "ยกเลิก",
      tone: "error",
    });
    if (confirmed === false) return;

    const res = await fetch(`/api/promotions/${promotion._id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      await popup.alert(data?.error || "ลบโปรโมชันไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        tone: "error",
      });
      return;
    }
    await load();
  }

  async function toggleActive(promotion) {
    const newValue = !promotion.active;
    const res = await fetch(`/api/promotions/${promotion._id}`, {
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
    setItems((prev) => prev.map((item) => (item._id === promotion._id ? { ...item, active: newValue } : item)));
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((p) =>
      `${p.title} ${p.description} ${summarizePromotion(p)}`.toLowerCase().includes(term)
    );
  }, [items, search]);

  const activeCount = filtered.filter((p) => p.active).length;
  const upcomingCount = filtered.filter((p) => {
    if (!p.startAt) return false;
    return new Date(p.startAt) > new Date();
  }).length;
  const endingSoonCount = filtered.filter((p) => {
    if (!p.endAt) return false;
    const end = new Date(p.endAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <main className="space-y-8 text-[#3F2A1A]">
      <section className={`${adminSurfaceShell} p-8`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#3F2A1A]">จัดการโปรโมชัน</h2>
            <p className="mt-1 text-[#6F4A2E]">
              วางกลยุทธ์ ซื้อ 1 แถม 1 หรือโปรสะสมแต้มให้ลูกค้ากลับมาซื้อซ้ำได้ง่าย ๆ
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อหรือเงื่อนไขโปรโมชัน"
                className="w-60 rounded-full border border-[#E2C39A] bg-white px-4 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_3px_rgba(63,42,26,0.12)] focus:border-[#C67C45] focus:outline-none"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#8A5A33]">🔍</span>
            </div>
            <button className={adminAccentButton} onClick={startCreate}>
              🎁 สร้างโปรโมชัน
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBubble label="โปรโมชันทั้งหมด" value={filtered.length} color="blue" />
          <StatBubble label="เปิดใช้งาน" value={activeCount} color="green" />
          <StatBubble label="เริ่มเร็ว ๆ นี้" value={upcomingCount} color="orange" />
          <StatBubble label="ใกล้หมดเขต" value={endingSoonCount} color="purple" />
        </div>
      </section>

      <section className={adminTableShell}>
        <header className="flex flex-col gap-2 border-b border-[#F3E0C7] bg-[#FFF4E5]/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#3F2A1A]">รายการโปรโมชัน</h3>
            <p className="text-xs text-[#6F4A2E]">จัดการเงื่อนไขเพื่อให้ลูกค้าเห็นโปรพิเศษทุกหน้า</p>
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-[#8A5A33]">{filtered.length} รายการที่แสดง</span>
        </header>

        {loading && (
          <div className="flex items-center justify-center px-6 py-8">
            <div className="flex items-center gap-3 text-sm text-[#6F4A2E]">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#C67C45] border-t-transparent" />
              <span>กำลังโหลดข้อมูลโปรโมชัน...</span>
            </div>
          </div>
        )}

        {err && !loading && (
          <div className="flex items-center justify-center px-6 py-8">
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-6 py-4 text-center text-sm text-red-600 shadow-[0_18px_30px_-24px_rgba(63,42,26,0.35)]">
              <span className="mb-2 block text-2xl">⚠️</span>
              <span>{err}</span>
            </div>
          </div>
        )}

        {!loading && !err && (
          <div className="overflow-hidden">
            <div className="block space-y-4 p-4 lg:hidden">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-[#6F4A2E]">
                  <span className="mb-4 block text-4xl">🎁</span>
                  <span>ยังไม่มีโปรโมชันที่ตรงกับคำค้นหา</span>
                </div>
              ) : (
                filtered.map((p) => (
                  <div key={p._id} className={`${adminInsetCardShell} bg-white/95 p-4 shadow-[0_14px_28px_-24px_rgba(63,42,26,0.5)]`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="truncate font-semibold text-[#3F2A1A]">{p.title}</h4>
                        <p className="text-xs text-[#6F4A2E]">{summarizePromotion(p)}</p>
                        {p.description ? (
                          <p className="mt-2 text-sm text-[#5B3A21] line-clamp-2">{p.description}</p>
                        ) : null}
                        <div className="mt-2 text-xs text-[#6F4A2E]">{formatPromotionSchedule(p)}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <SlidingToggle isActive={p.active} onToggle={() => toggleActive(p)} />
                          <span className="text-xs text-[#6F4A2E]">{p.active ? "ใช้งานอยู่" : "ปิดใช้งาน"}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="rounded-full border border-[#E2C39A] px-3 py-1 text-xs font-semibold text-[#8A5A33] transition hover:bg-[#FFF4E5]"
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
                ))
              )}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F3E0C7] bg-[#FFF3E0]">
                    <th className="px-6 py-4 text-left font-semibold text-[#3F2A1A]">ชื่อโปรโมชัน</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#3F2A1A]">เงื่อนไข</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#3F2A1A]">ช่วงเวลา</th>
                    <th className="px-6 py-4 text-left font-semibold text-[#3F2A1A]">สถานะ</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#3F2A1A]">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3E0C7]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[#6F4A2E]">
                        <div className="flex flex-col items-center">
                          <span className="mb-4 text-4xl">🎁</span>
                          <span>ยังไม่มีโปรโมชันที่ตรงกับคำค้นหา</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p, idx) => (
                      <tr
                        key={p._id}
                        className={`${idx % 2 === 0 ? "bg-white" : "bg-[#FFF7EA]"} transition-colors hover:bg-[#FFEFD8]`}
                      >
                        <td className="max-w-xs px-6 py-4 align-top">
                          <div className="font-semibold text-[#3F2A1A]">{p.title}</div>
                          {p.description ? (
                            <div className="mt-1 text-xs text-[#6F4A2E] line-clamp-3">{p.description}</div>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 text-[#5B3A21]">{summarizePromotion(p)}</td>
                        <td className="px-6 py-4 text-xs text-[#6F4A2E]">{formatPromotionSchedule(p)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <SlidingToggle isActive={p.active} onToggle={() => toggleActive(p)} />
                            <span className="text-xs text-[#6F4A2E]">{p.active ? "ใช้งานอยู่" : "ปิดใช้งาน"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="rounded-full border border-[#E2C39A] px-4 py-1 text-xs font-semibold text-[#8A5A33] transition hover:bg-[#FFF4E5]"
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
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#F2D5AF] bg-[#FFF9F3] shadow-[0_30px_60px_-30px_rgba(63,42,26,0.6)]">
            <div className="flex items-center justify-between border-b border-[#F3E0C7] bg-[#FFF4E5]/70 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-[#3F2A1A]">{editing?._id ? "แก้ไขโปรโมชัน" : "สร้างโปรโมชัน"}</h3>
                <p className="text-xs text-[#6F4A2E]">
                  ระบุรายละเอียดโปรโมชันเพื่อให้แสดงทุกหน้าของร้านและกระตุ้นยอดขาย
                </p>
              </div>
              <button
                className="rounded-full border border-[#E2C39A] bg-white px-3 py-1 text-xs font-semibold text-[#8A5A33] transition hover:bg-[#FFF4E5]"
                onClick={() => setEditing(null)}
              >
                ปิด
              </button>
            </div>

            <form onSubmit={onSubmit} className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                <Field label="ชื่อโปรโมชัน" required>
                  <input
                    className="w-full rounded-[1rem] border border-[#E2C39A] bg-white px-4 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_3px_rgba(63,42,26,0.12)] focus:border-[#C67C45] focus:outline-none"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    required
                  />
                </Field>
                <Field label="คำอธิบายเพิ่มเติม">
                  <textarea
                    className="h-32 w-full rounded-[1rem] border border-[#E2C39A] bg-white px-4 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_3px_rgba(63,42,26,0.12)] focus:border-[#C67C45] focus:outline-none"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </Field>
                <Field label="ประเภทโปรโมชัน">
                  <select
                    className="w-full rounded-[1rem] border border-[#E2C39A] bg-white px-4 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_3px_rgba(63,42,26,0.12)] focus:border-[#C67C45] focus:outline-none"
                    value={form.type}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      setForm((f) => {
                        if (nextType === "buy_x_get_y") {
                          return {
                            ...f,
                            type: nextType,
                            buyQuantity: f.buyQuantity || 1,
                            getQuantity: f.getQuantity || 1,
                            stampGoal: 0,
                            stampReward: "",
                          };
                        }
                        if (nextType === "stamp_card") {
                          return {
                            ...f,
                            type: nextType,
                            stampGoal: f.stampGoal || 10,
                            stampReward: f.stampReward || "ขนมฟรี 1 ชิ้น",
                            buyQuantity: 0,
                            getQuantity: 0,
                          };
                        }
                        return {
                          ...f,
                          type: nextType,
                          buyQuantity: 0,
                          getQuantity: 0,
                          stampGoal: 0,
                          stampReward: "",
                        };
                      });
                    }}
                  >
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                {form.type === "buy_x_get_y" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="จำนวนที่ต้องซื้อ" required>
                      <input
                        type="number"
                        min={1}
                        className="w-full rounded-[1rem] border border-[#E2C39A] bg-white px-4 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_3px_rgba(63,42,26,0.12)] focus:border-[#C67C45] focus:outline-none"
                        value={form.buyQuantity}
                        onChange={(e) => setForm((f) => ({ ...f, buyQuantity: Number(e.target.value || 0) }))}
                        required
                      />
                    </Field>
                    <Field label="จำนวนที่แถม" required>
                      <input
                        type="number"
                        min={1}
                        className="w-full rounded-[1rem] border border-[#E2C39A] bg-white px-4 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_3px_rgba(63,42,26,0.12)] focus:border-[#C67C45] focus:outline-none"
                        value={form.getQuantity}
                        onChange={(e) => setForm((f) => ({ ...f, getQuantity: Number(e.target.value || 0) }))}
                        required
                      />
                    </Field>
                  </div>
                )}

                {form.type === "stamp_card" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="จำนวนแต้มที่ต้องสะสม" required>
                      <input
                        type="number"
                        min={1}
                        className="w-full rounded-[1rem] border border-[#E2C39A] bg-white px-4 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_3px_rgba(63,42,26,0.12)] focus:border-[#C67C45] focus:outline-none"
                        value={form.stampGoal}
                        onChange={(e) => setForm((f) => ({ ...f, stampGoal: Number(e.target.value || 0) }))}
                        required
                      />
                    </Field>
                    <Field label="ของรางวัล">
                      <input
                        type="text"
                        className="w-full rounded-[1rem] border border-[#E2C39A] bg-white px-4 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_3px_rgba(63,42,26,0.12)] focus:border-[#C67C45] focus:outline-none"
                        value={form.stampReward}
                        onChange={(e) => setForm((f) => ({ ...f, stampReward: e.target.value }))}
                      />
                    </Field>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Field label="วัน/เวลาเริ่มต้น">
                  <input
                    type="datetime-local"
                    className="w-full rounded-[1rem] border border-[#E2C39A] bg-white px-4 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_3px_rgba(63,42,26,0.12)] focus:border-[#C67C45] focus:outline-none"
                    value={form.startAt}
                    onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))}
                  />
                </Field>
                <Field label="วัน/เวลาสิ้นสุด">
                  <input
                    type="datetime-local"
                    className="w-full rounded-[1rem] border border-[#E2C39A] bg-white px-4 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_3px_rgba(63,42,26,0.12)] focus:border-[#C67C45] focus:outline-none"
                    value={form.endAt}
                    onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
                  />
                </Field>

                <div className="flex items-center gap-3">
                  <SlidingToggle isActive={form.active} onToggle={() => setForm((f) => ({ ...f, active: !f.active }))} />
                  <label className="text-sm font-medium text-[#3F2A1A]">เปิดใช้งานทันที</label>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-4">
                  <button
                    type="button"
                    className="rounded-full border border-[#E2C39A] px-5 py-2 text-sm font-semibold text-[#8A5A33] transition hover:bg-[#FFF4E5]"
                    onClick={() => setEditing(null)}
                  >
                    ยกเลิก
                  </button>
                  <button className={`${adminAccentButton} disabled:cursor-not-allowed disabled:opacity-60`} disabled={saving}>
                    {saving ? "กำลังบันทึก..." : editing?._id ? "บันทึกโปรโมชัน" : "สร้างโปรโมชัน"}
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
