"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminPopup } from "@/components/admin/AdminPopupProvider";

const statusOptions = ["all", "new", "contacted", "quoted", "confirmed", "closed"];

const statusLabels = {
  all: "ทั้งหมด",
  new: "คำขอใหม่",
  contacted: "ติดต่อแล้ว",
  quoted: "ส่งใบเสนอราคา",
  confirmed: "ยืนยันออเดอร์",
  closed: "ปิดงาน",
};

const statusStyles = {
  new: "bg-amber-100/30 text-amber-200",
  contacted: "bg-sky-100/20 text-sky-200",
  quoted: "bg-indigo-100/20 text-indigo-200",
  confirmed: "bg-emerald-100/25 text-emerald-200",
  closed: "bg-rose-100/20 text-rose-200",
};

const quickTemplates = [
  {
    key: "cake",
    label: "Re-order เค้ก",
    description: "เค้ก 2 ปอนด์ ตกแต่งธีมเฉพาะ",
    defaults: {
      flavourIdeas: "เค้กสองปอนด์ ตกแต่งธีมตามที่ลูกค้าขอ พร้อม personalized topper",
      servings: 12,
      budget: 1800,
      notes: "ลูกค้าเก่า Re-order เค้กวันเกิด",
    },
  },
  {
    key: "cupcake",
    label: "Re-order คัพเค้ก",
    description: "คัพเค้กคละรส 24 ชิ้น",
    defaults: {
      flavourIdeas: "คัพเค้กวานิลลาครีมชีส + ช็อกโกแลตกันน้ำตาล 24 ชิ้น",
      servings: 24,
      budget: 2200,
      notes: "ลูกค้าประจำสั่งคัพเค้กสำหรับแจกบริษัท",
    },
  },
  {
    key: "macaron",
    label: "Re-order มาการอง",
    description: "มาการองกล่องของฝาก",
    defaults: {
      flavourIdeas: "มาการอง 3 รส (ราสป์เบอร์รี่, ช็อกโกแลต, พิสตาชิโอ) กล่องของฝาก 10 กล่อง",
      servings: 50,
      budget: 3500,
      notes: "สั่งซ้ำสำหรับลูกค้า corporate",
    },
  },
  {
    key: "break",
    label: "สั่งชุดขนมเบรก",
    description: "ชุดของว่างประชุม 40 เซต",
    defaults: {
      flavourIdeas: "ชุดขนมเบรก ประกอบด้วยบราวนี่, เครปโรลชาเขียว, ชีสทาร์ต (40 เซต)",
      servings: 40,
      budget: 3200,
      notes: "ลูกค้าขอสั่งขนมเบรกสำหรับประชุมเช้า",
    },
  },
];

const initialQuickForm = {
  name: "",
  phone: "",
  email: "",
  eventDate: "",
  eventTime: "",
  servings: "",
  budget: "",
  flavourIdeas: "",
  notes: "",
  preferredContact: "phone",
};

function formatDate(value) {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
    }
  } catch (error) {
    // ignore
  }
  return value;
}

function QuickReorderForm({ onCreated, onError }) {
  const [form, setForm] = useState(initialQuickForm);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedTemplate) return;
    const template = quickTemplates.find((tpl) => tpl.key === selectedTemplate);
    if (!template) return;
    setForm((prev) => ({
      ...prev,
      flavourIdeas: template.defaults.flavourIdeas,
      servings: String(template.defaults.servings ?? ""),
      budget: String(template.defaults.budget ?? ""),
      notes: template.defaults.notes || prev.notes,
    }));
  }, [selectedTemplate]);

  const updateField = (field) => (event) => {
    const value = event?.target?.value ?? "";
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.flavourIdeas.trim()) {
      onError?.("กรุณากรอกชื่อ เบอร์ และรายละเอียดคำขอ");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/preorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "ไม่สามารถสร้างคำขอได้");
      }

      await response.json();
      onCreated?.();
      setForm(initialQuickForm);
      setSelectedTemplate(null);
    } catch (error) {
      onError?.(error?.message || "ไม่สามารถสร้างคำขอได้");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-6 shadow-2xl shadow-black/30 backdrop-blur"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-rose)]">สร้างคำขออย่างรวดเร็ว</p>
          <h2 className="text-xl font-bold text-[var(--color-gold)]">Re-order & ขนมเบรก</h2>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-rose)] px-4 py-2 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-black/40 transition hover:bg-[var(--color-rose-dark)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "กำลังบันทึก..." : "บันทึกคำขอ"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {quickTemplates.map((template) => {
          const active = selectedTemplate === template.key;
          return (
            <button
              key={template.key}
              type="button"
              onClick={() => setSelectedTemplate(template.key)}
              className={`text-left transition rounded-2xl border px-4 py-3 text-sm shadow-inner ${
                active
                  ? "border-[var(--color-rose)] bg-[var(--color-burgundy-dark)]/80 text-[var(--color-rose)]"
                  : "border-[var(--color-rose)]/25 bg-[var(--color-burgundy-dark)]/50 text-[var(--color-gold)]/80 hover:border-[var(--color-rose)]/40 hover:text-[var(--color-gold)]"
              }`}
            >
              <p className="font-semibold">{template.label}</p>
              <p className="mt-1 text-xs text-[var(--color-gold)]/70">{template.description}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          ชื่อลูกค้า*
          <input
            value={form.name}
            onChange={updateField("name")}
            className="rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
            placeholder="ชื่อผู้ติดต่อ"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          เบอร์โทร*
          <input
            value={form.phone}
            onChange={updateField("phone")}
            className="rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
            placeholder="0X-XXX-XXXX"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          อีเมล
          <input
            type="email"
            value={form.email}
            onChange={updateField("email")}
            className="rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
            placeholder="name@example.com"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          ช่องทางติดต่อกลับ
          <select
            value={form.preferredContact}
            onChange={updateField("preferredContact")}
            className="rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
          >
            <option value="phone">โทรศัพท์</option>
            <option value="line">LINE</option>
            <option value="email">อีเมล</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm">
          วันที่จัดงาน
          <input
            type="date"
            value={form.eventDate}
            onChange={updateField("eventDate")}
            className="rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          เวลา
          <input
            type="time"
            value={form.eventTime}
            onChange={updateField("eventTime")}
            className="rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          จำนวนเสิร์ฟ (ชิ้น/คน)
          <input
            type="number"
            min="0"
            value={form.servings}
            onChange={updateField("servings")}
            className="rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          งบประมาณโดยประมาณ (บาท)
          <input
            type="number"
            min="0"
            value={form.budget}
            onChange={updateField("budget")}
            className="rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          รายละเอียดขนมที่ต้องการ*
          <textarea
            value={form.flavourIdeas}
            onChange={updateField("flavourIdeas")}
            rows={3}
            className="rounded-2xl border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
            placeholder="ระบุรสชาติหรือธีมที่ต้องการ"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        หมายเหตุเพิ่มเติม
        <textarea
          value={form.notes}
          onChange={updateField("notes")}
          rows={3}
          className="rounded-2xl border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
          placeholder="รายละเอียดเพิ่มเติม เช่น ช่องทางจัดส่ง"
        />
      </label>
    </form>
  );
}

export default function AdminPreordersPage() {
  const [preorders, setPreorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState("");
  const popup = useAdminPopup();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/preorders", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "ไม่สามารถโหลดข้อมูลได้");
      }
      setPreorders(data);
    } catch (err) {
      setError(err?.message || "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredPreorders = useMemo(() => {
    if (filter === "all") return preorders;
    return preorders.filter((item) => item.status === filter);
  }, [preorders, filter]);

  const stats = useMemo(() => {
    const base = Object.fromEntries(statusOptions.map((status) => [status, 0]));
    for (const preorder of preorders) {
      if (preorder.status && base[preorder.status] !== undefined) {
        base[preorder.status] += 1;
      }
    }
    const breakOrders = preorders.filter((item) => {
      const haystack = `${item.flavourIdeas || ""} ${item.notes || ""}`.toLowerCase();
      return haystack.includes("เบรก") || haystack.includes("break");
    }).length;
    return { ...base, breakOrders, total: preorders.length };
  }, [preorders]);

  const handleStatusChange = async (id, status) => {
    if (!id || !status) return;
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/preorders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "อัปเดตสถานะไม่สำเร็จ");
      }
      setPreorders((prev) => prev.map((item) => (item._id === id ? data : item)));
    } catch (err) {
      await popup.alert(err?.message || "อัปเดตสถานะไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        tone: "error",
      });
    } finally {
      setUpdatingId("");
    }
  };

  const handleCreate = () => {
    popup.alert("บันทึกคำขอใหม่เรียบร้อยแล้ว", {
      title: "สำเร็จ",
      tone: "success",
    });
    load();
  };

  const handleQuickError = (message) => {
    popup.alert(message || "ไม่สามารถสร้างคำขอได้", {
      title: "เกิดข้อผิดพลาด",
      tone: "error",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-rose)]">คำขอ Pre-order และขนมเบรก</h1>
          <p className="mt-2 text-sm text-[var(--color-gold)]/80">
            รวมคำขอทำขนมแบบสั่งพิเศษ และคำขอชุดขนมเบรกสำหรับงานต่าง ๆ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-2 text-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
                {status === "all" ? "" : ` (${stats[status] || 0})`}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/70 px-4 py-2 font-semibold text-[var(--color-rose)] transition hover:bg-[var(--color-burgundy)]"
          >
            🔄 รีเฟรช
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy-dark)]/60 p-5 shadow-xl">
          <p className="text-sm text-[var(--color-gold)]/70">คำขอทั้งหมด</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-rose)]">{stats.total || 0}</p>
        </div>
        <div className="rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy-dark)]/60 p-5 shadow-xl">
          <p className="text-sm text-[var(--color-gold)]/70">รอการติดต่อ</p>
          <p className="mt-2 text-3xl font-bold text-amber-200">{stats.new || 0}</p>
        </div>
        <div className="rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy-dark)]/60 p-5 shadow-xl">
          <p className="text-sm text-[var(--color-gold)]/70">ยืนยันงานแล้ว</p>
          <p className="mt-2 text-3xl font-bold text-emerald-200">{stats.confirmed || 0}</p>
        </div>
        <div className="rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy-dark)]/60 p-5 shadow-xl">
          <p className="text-sm text-[var(--color-gold)]/70">คำขอขนมเบรก</p>
          <p className="mt-2 text-3xl font-bold text-sky-200">{stats.breakOrders || 0}</p>
        </div>
      </div>

      <QuickReorderForm onCreated={handleCreate} onError={handleQuickError} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[var(--color-gold)]">รายการคำขอ</h2>
          {loading && <span className="text-sm text-[var(--color-gold)]/70">กำลังโหลด...</span>}
        </div>
        {error && (
          <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}
        {!loading && filteredPreorders.length === 0 && !error && (
          <div className="rounded-2xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy-dark)]/50 px-4 py-8 text-center text-sm text-[var(--color-gold)]/70">
            ไม่พบคำขอในสถานะนี้
          </div>
        )}

        <div className="space-y-4">
          {filteredPreorders.map((item) => (
            <div
              key={item._id}
              className="rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy-dark)]/70 p-6 shadow-xl shadow-black/30"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status] || "bg-[var(--color-rose)]/20 text-[var(--color-rose)]"}`}>
                    ● {statusLabels[item.status] || "ไม่ทราบสถานะ"}
                  </span>
                  <span className="text-[var(--color-gold)]/60">{formatDate(item.createdAt)}</span>
                  {item.eventDate && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-rose)]/20 px-3 py-1 text-xs text-[var(--color-gold)]/80">
                      📅 {item.eventDate} {item.eventTime && `เวลา ${item.eventTime}`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--color-gold)]/80">
                  <label className="flex items-center gap-2">
                    <span>อัปเดตสถานะ:</span>
                    <select
                      value={item.status || "new"}
                      onChange={(event) => handleStatusChange(item._id, event.target.value)}
                      disabled={updatingId === item._id}
                      className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy)]/70 px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                    >
                      {statusOptions
                        .filter((status) => status !== "all")
                        .map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <div className="space-y-2 text-sm text-[var(--color-gold)]/85">
                  <p className="text-base font-semibold text-[var(--color-rose)]">ข้อมูลลูกค้า</p>
                  <p>👤 {item.name || "-"}</p>
                  <p>📞 {item.phone || "-"}</p>
                  {item.email && <p>✉️ {item.email}</p>}
                  <p>ช่องทางที่สะดวก: {item.preferredContact === "line" ? "LINE" : item.preferredContact === "email" ? "อีเมล" : "โทรศัพท์"}</p>
                </div>

                <div className="space-y-2 text-sm text-[var(--color-gold)]/85">
                  <p className="text-base font-semibold text-[var(--color-rose)]">รายละเอียดขนม</p>
                  <p className="leading-relaxed whitespace-pre-wrap">{item.flavourIdeas || "-"}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-[var(--color-gold)]/70">
                    <span className="rounded-full border border-[var(--color-rose)]/25 px-3 py-1">จำนวน {item.servings || 0} ชิ้น</span>
                    <span className="rounded-full border border-[var(--color-rose)]/25 px-3 py-1">งบประมาณ ≈ {item.budget || 0} บาท</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-[var(--color-gold)]/80">
                  <p className="text-base font-semibold text-[var(--color-rose)]">หมายเหตุ</p>
                  <p className="leading-relaxed whitespace-pre-wrap">{item.notes || "-"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
