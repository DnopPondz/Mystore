"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAdminPopup } from "@/components/admin/AdminPopupProvider";

const statusFilters = [
  { value: "all", label: "ทั้งหมด" },
  { value: "new", label: "คำขอใหม่" },
  { value: "contacted", label: "ติดต่อแล้ว" },
  { value: "quoted", label: "ส่งใบเสนอราคา" },
  { value: "confirmed", label: "ชำระมัดจำแล้ว" },
  { value: "closed", label: "ปิดงาน" },
];

const statusLabels = {
  new: "คำขอใหม่",
  contacted: "ติดต่อแล้ว",
  quoted: "ส่งใบเสนอราคา",
  confirmed: "ชำระมัดจำแล้ว",
  closed: "ปิดงาน",
};

const statusStyles = {
  new: "bg-amber-100 text-amber-600",
  contacted: "bg-sky-100 text-sky-600",
  quoted: "bg-purple-100 text-purple-600",
  confirmed: "bg-emerald-100 text-emerald-600",
  closed: "bg-zinc-200 text-zinc-600",
};

const planLabels = {
  full: "ชำระเต็มจำนวน",
  half: "มัดจำ 50%",
};

const paymentStatusLabels = {
  unpaid: "ยังไม่จ่าย",
  verifying: "รอตรวจสอบ",
  paid: "ชำระแล้ว",
  invalid: "ไม่ถูกต้อง",
  cash: "เงินสด",
};

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `฿${amount.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("ไม่สามารถอ่านไฟล์ได้"));
    reader.readAsDataURL(file);
  });
}

export default function AdminPreordersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ quotedTotal: "", paymentPlan: "full", quoteSummary: "", internalNotes: "" });
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingQuote, setSavingQuote] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipFile, setSlipFile] = useState(null);
  const [slipAmount, setSlipAmount] = useState("");
  const [slipRef, setSlipRef] = useState("");
  const popup = useAdminPopup();

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    if (!selectedId && items.length > 0) {
      setSelectedId(items[0]._id);
      fetchDetail(items[0]._id);
    }
  }, [items, selectedId]);

  async function loadList() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/preorders", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "โหลดคำขอไม่สำเร็จ");
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setErr(String(error.message || error));
    } finally {
      setLoading(false);
    }
  }

  async function fetchDetail(id) {
    if (!id) return;
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/preorders/${id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "โหลดรายละเอียดไม่สำเร็จ");
      setSelected(data);
      setQuoteForm({
        quotedTotal: data?.quotedTotal ? String(Number(data.quotedTotal).toFixed(2)) : "",
        paymentPlan: data?.paymentPlan || "full",
        quoteSummary: data?.quoteSummary || "",
        internalNotes: data?.internalNotes || "",
      });
      const orderDeposit = data?.order?.preorder?.depositAmount;
      if (orderDeposit != null) {
        setSlipAmount(String(Number(orderDeposit).toFixed(2)));
      } else if (data?.depositAmount) {
        setSlipAmount(String(Number(data.depositAmount).toFixed(2)));
      }
    } catch (error) {
      setSelected(null);
      await popup.alert(error?.message || "โหลดรายละเอียดไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        tone: "error",
      });
    } finally {
      setDetailLoading(false);
    }
  }

  function updateCollection(updated) {
    setItems((prev) =>
      prev.map((item) => (item._id === updated._id ? { ...item, ...updated } : item))
    );
    setSelected(updated);
    setQuoteForm({
      quotedTotal: updated?.quotedTotal ? String(Number(updated.quotedTotal).toFixed(2)) : "",
      paymentPlan: updated?.paymentPlan || "full",
      quoteSummary: updated?.quoteSummary || "",
      internalNotes: updated?.internalNotes || "",
    });
    const orderDeposit = updated?.order?.preorder?.depositAmount;
    if (orderDeposit != null) {
      setSlipAmount(String(Number(orderDeposit).toFixed(2)));
    } else if (updated?.depositAmount) {
      setSlipAmount(String(Number(updated.depositAmount).toFixed(2)));
    }
  }

  async function changeStatus(nextStatus) {
    if (!selected?._id || selected.status === nextStatus) return;
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/preorders/${selected._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "อัปเดตสถานะไม่สำเร็จ");
      updateCollection(data);
    } catch (error) {
      await popup.alert(error?.message || "อัปเดตสถานะไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        tone: "error",
      });
    } finally {
      setSavingStatus(false);
    }
  }

  async function saveQuote() {
    if (!selected?._id) return;
    const quotedTotal = Number(quoteForm.quotedTotal || 0);
    if (!Number.isFinite(quotedTotal) || quotedTotal <= 0) {
      await popup.alert("กรุณากรอกยอดเสนอราคาให้ถูกต้อง", { tone: "error", title: "ข้อมูลไม่ครบ" });
      return;
    }
    setSavingQuote(true);
    try {
      const payload = {
        quotedTotal,
        paymentPlan: quoteForm.paymentPlan,
        quoteSummary: quoteForm.quoteSummary,
        internalNotes: quoteForm.internalNotes,
      };
      const res = await fetch(`/api/admin/preorders/${selected._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "บันทึกใบเสนอราคาไม่สำเร็จ");
      updateCollection(data);
      await popup.alert("บันทึกใบเสนอราคาเรียบร้อย", { tone: "success", title: "สำเร็จ" });
    } catch (error) {
      await popup.alert(error?.message || "บันทึกใบเสนอราคาไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        tone: "error",
      });
    } finally {
      setSavingQuote(false);
    }
  }

  async function createOrUpdateOrder() {
    if (!selected?._id) return;
    setCreatingOrder(true);
    try {
      const res = await fetch(`/api/admin/preorders/${selected._id}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "สร้างคำสั่งซื้อไม่สำเร็จ");
      updateCollection(data);
      await popup.alert("สร้างคำสั่งซื้อสำหรับชำระเงินแล้ว", { tone: "success", title: "สำเร็จ" });
    } catch (error) {
      await popup.alert(error?.message || "สร้างคำสั่งซื้อไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        tone: "error",
      });
    } finally {
      setCreatingOrder(false);
    }
  }

  async function handleUploadSlip() {
    if (!selected?.order?._id) {
      await popup.alert("ยังไม่มีคำสั่งซื้อให้แนบสลิป", {
        title: "ไม่สามารถดำเนินการได้",
        tone: "warning",
      });
      return;
    }
    if (!slipFile) {
      await popup.alert("กรุณาเลือกไฟล์สลิปก่อน", { tone: "warning", title: "ข้อมูลไม่ครบ" });
      return;
    }
    const amount = Number(slipAmount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      await popup.alert("กรุณากรอกยอดโอนให้ถูกต้อง", { tone: "warning", title: "ข้อมูลไม่ครบ" });
      return;
    }
    setUploadingSlip(true);
    try {
      const dataUrl = await readFileAsDataUrl(slipFile);
      const res = await fetch(`/api/orders/${selected.order._id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slip: dataUrl,
          filename: slipFile.name || "payment-slip.jpg",
          amount,
          reference: slipRef,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "บันทึกสลิปไม่สำเร็จ");
      await popup.alert("ส่งหลักฐานการโอนเงินแล้ว", { tone: "success", title: "สำเร็จ" });
      setSlipFile(null);
      setSlipRef("");
      await fetchDetail(selected._id);
    } catch (error) {
      await popup.alert(error?.message || "บันทึกสลิปไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        tone: "error",
      });
    } finally {
      setUploadingSlip(false);
    }
  }

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.status === filter);
  }, [items, filter]);

  if (loading)
    return (
      <main className="rounded-3xl border border-white/80 bg-white/80 px-6 py-10 text-[var(--color-choco)]/70 shadow-lg shadow-[rgba(240,200,105,0.08)]">
        กำลังโหลดคำขอ Pre-order...
      </main>
    );

  if (err)
    return (
      <main className="rounded-3xl border border-rose-200 bg-rose-50/80 px-6 py-10 text-rose-600 shadow-lg">
        {err}
      </main>
    );

  return (
    <main className="grid gap-8 lg:grid-cols-[1.1fr_1.6fr]">
      <section className="space-y-4 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-lg shadow-[rgba(240,200,105,0.08)] backdrop-blur">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-[var(--color-rose-dark)]">คำขอ Pre-order</h2>
          <p className="text-sm text-[var(--color-choco)]/70">ติดตามสถานะการติดต่อและยอดเสนอราคาที่ต้องตามงาน</p>
        </div>
        <label className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/30 bg-white/80 px-4 py-2 text-xs font-semibold text-[var(--color-choco)]/70 shadow-inner">
          <span>กรองตามสถานะ</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-full border border-transparent bg-transparent text-[var(--color-rose)] focus:outline-none"
          >
            {statusFilters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="max-h-[70vh] space-y-3 overflow-auto pr-1">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--color-rose)]/30 bg-white/70 px-4 py-8 text-center text-sm text-[var(--color-choco)]/60">
              ไม่พบคำขอในสถานะนี้
            </div>
          ) : (
            filteredItems.map((item) => {
              const active = item._id === selectedId;
              const badgeClass = statusStyles[item.status] || "bg-gray-100 text-gray-600";
              return (
                <button
                  type="button"
                  key={item._id}
                  onClick={() => {
                    setSelectedId(item._id);
                    fetchDetail(item._id);
                  }}
                  className={`w-full rounded-2xl border px-4 py-3 text-left shadow transition ${
                    active
                      ? "border-[var(--color-rose)]/40 bg-[var(--color-burgundy)]/80 text-[var(--color-rose)]"
                      : "border-white/70 bg-white/70 text-[var(--color-choco)]/80 hover:border-[var(--color-rose)]/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-[var(--color-choco)]/60">{item.phone}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                      {statusLabels[item.status] || item.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--color-choco)]/60">
                    <span>ยอดเสนอราคา: {formatCurrency(item.quotedTotal || 0)}</span>
                    {item.paymentPlan ? <span>{planLabels[item.paymentPlan]}</span> : null}
                    {item.order?.payment?.status ? (
                      <span>
                        ชำระเงิน: {paymentStatusLabels[item.order.payment.status] || item.order.payment.status}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-[rgba(240,200,105,0.1)] backdrop-blur">
        {detailLoading ? (
          <div className="text-sm text-[var(--color-choco)]/70">กำลังโหลดรายละเอียด...</div>
        ) : !selected ? (
          <div className="text-sm text-[var(--color-choco)]/70">เลือกคำขอจากด้านซ้ายเพื่อดูรายละเอียด</div>
        ) : (
          <div className="space-y-6">
            <header className="flex flex-col gap-3 rounded-2xl border border-[var(--color-rose)]/25 bg-[var(--color-rose)]/10 px-5 py-4 text-sm text-[var(--color-choco)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-rose-dark)]">{selected.name}</h3>
                  <p className="text-xs text-[var(--color-choco)]/60">
                    {selected.phone}
                    {selected.email ? ` · ${selected.email}` : ""}
                  </p>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selected.status] || "bg-gray-200 text-gray-600"}`}>
                  {statusLabels[selected.status] || selected.status}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-choco)]/60">
                <span>ส่งคำขอเมื่อ {formatDateTime(selected.createdAt)}</span>
                {selected.contactedAt ? <span>ติดต่อเมื่อ {formatDateTime(selected.contactedAt)}</span> : null}
                {selected.quotedAt ? <span>ออกใบเสนอราคาวันที่ {formatDateTime(selected.quotedAt)}</span> : null}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-[var(--color-choco)]/60">
                <span>ช่องทางติดต่อที่ลูกค้าสะดวก: {selected.preferredContact}</span>
                {selected.eventDate ? <span>วันที่จัดงาน: {selected.eventDate}</span> : null}
                {selected.eventTime ? <span>เวลา: {selected.eventTime}</span> : null}
              </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-[var(--color-choco)] shadow-inner">
                <h4 className="font-semibold text-[var(--color-rose-dark)]">รายละเอียดที่ลูกค้าต้องการ</h4>
                <p className="mt-2 whitespace-pre-wrap text-xs text-[var(--color-choco)]/70">
                  {selected.flavourIdeas || "-"}
                </p>
                {selected.notes ? (
                  <p className="mt-3 rounded-xl bg-[var(--color-rose)]/15 px-3 py-2 text-xs text-[var(--color-rose-dark)]">
                    บันทึกเพิ่มเติม: {selected.notes}
                  </p>
                ) : null}
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-[var(--color-choco)] shadow-inner">
                <h4 className="font-semibold text-[var(--color-rose-dark)]">ใบเสนอราคา</h4>
                <div className="mt-3 space-y-3">
                  <label className="flex flex-col gap-1 text-xs font-medium">
                    ยอดเสนอราคา (รวมทั้งหมด)
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={quoteForm.quotedTotal}
                      onChange={(e) => setQuoteForm((prev) => ({ ...prev, quotedTotal: e.target.value }))}
                      className="rounded-full border border-[var(--color-rose)]/35 bg-white/70 px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium">
                    รูปแบบการชำระ
                    <select
                      value={quoteForm.paymentPlan}
                      onChange={(e) => setQuoteForm((prev) => ({ ...prev, paymentPlan: e.target.value }))}
                      className="rounded-full border border-[var(--color-rose)]/35 bg-white/70 px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                    >
                      <option value="full">ชำระเต็มจำนวน</option>
                      <option value="half">มัดจำ 50%</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium">
                    สรุปรายละเอียดใบเสนอราคา
                    <textarea
                      rows={3}
                      value={quoteForm.quoteSummary}
                      onChange={(e) => setQuoteForm((prev) => ({ ...prev, quoteSummary: e.target.value }))}
                      className="rounded-[1rem] border border-[var(--color-rose)]/35 bg-white/70 px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium">
                    บันทึกภายในทีม
                    <textarea
                      rows={3}
                      value={quoteForm.internalNotes}
                      onChange={(e) => setQuoteForm((prev) => ({ ...prev, internalNotes: e.target.value }))}
                      className="rounded-[1rem] border border-[var(--color-rose)]/35 bg-white/70 px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={saveQuote}
                      disabled={savingQuote}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--color-rose)] px-4 py-2 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-[rgba(240,200,105,0.2)] transition hover:bg-[var(--color-rose-dark)] disabled:opacity-60"
                    >
                      💾 บันทึกใบเสนอราคา
                    </button>
                    <button
                      type="button"
                      onClick={() => changeStatus("quoted")}
                      disabled={savingStatus || selected.status === "quoted"}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/40 bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--color-rose)] shadow-inner transition hover:bg-white disabled:opacity-60"
                    >
                      📤 ตั้งค่าสถานะเป็น "ส่งใบเสนอราคา"
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-[var(--color-choco)] shadow-inner">
              <h4 className="font-semibold text-[var(--color-rose-dark)]">สรุปยอดและสถานะ</h4>
              <div className="mt-3 grid gap-3 text-xs text-[var(--color-choco)]/70 sm:grid-cols-2">
                <div className="rounded-xl bg-[var(--color-rose)]/10 px-3 py-2">
                  <p className="font-semibold text-[var(--color-rose-dark)]">ยอดเสนอราคาทั้งหมด</p>
                  <p>{formatCurrency(selected.quotedTotal || 0)}</p>
                </div>
                <div className="rounded-xl bg-[var(--color-rose)]/10 px-3 py-2">
                  <p className="font-semibold text-[var(--color-rose-dark)]">ยอดมัดจำ/จ่ายรอบแรก</p>
                  <p>{formatCurrency(selected.depositAmount || 0)}</p>
                </div>
                <div className="rounded-xl bg-[var(--color-rose)]/10 px-3 py-2">
                  <p className="font-semibold text-[var(--color-rose-dark)]">ยอดคงเหลือ</p>
                  <p>{formatCurrency(selected.balanceAmount || 0)}</p>
                </div>
                <div className="rounded-xl bg-[var(--color-rose)]/10 px-3 py-2">
                  <p className="font-semibold text-[var(--color-rose-dark)]">รูปแบบการชำระ</p>
                  <p>{planLabels[selected.paymentPlan] || "-"}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => changeStatus("contacted")}
                  disabled={savingStatus || selected.status === "contacted"}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/40 bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--color-rose)] shadow-inner transition hover:bg-white disabled:opacity-60"
                >
                  ☎️ ตั้งค่าสถานะเป็น "ติดต่อแล้ว"
                </button>
                <button
                  type="button"
                  onClick={() => changeStatus("confirmed")}
                  disabled={savingStatus || selected.status === "confirmed"}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100/60 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-inner transition hover:bg-emerald-100 disabled:opacity-60"
                >
                  ✅ ยืนยันว่าลูกค้าชำระแล้ว
                </button>
                <button
                  type="button"
                  onClick={() => changeStatus("closed")}
                  disabled={savingStatus || selected.status === "closed"}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 shadow-inner transition hover:bg-gray-50 disabled:opacity-60"
                >
                  🏁 ปิดงาน
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-[var(--color-choco)] shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="font-semibold text-[var(--color-rose-dark)]">การชำระเงิน</h4>
                <button
                  type="button"
                  onClick={createOrUpdateOrder}
                  disabled={creatingOrder}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-rose)] px-4 py-2 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-[rgba(240,200,105,0.2)] transition hover:bg-[var(--color-rose-dark)] disabled:opacity-60"
                >
                  💳 {selected.order ? "อัปเดตคำสั่งซื้อ" : "สร้างคำสั่งซื้อเพื่อให้ลูกค้าชำระ"}
                </button>
              </div>
              {selected.order ? (
                <div className="mt-3 space-y-3 text-xs text-[var(--color-choco)]/70">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>คำสั่งซื้อ #: {selected.order._id}</span>
                    <span>
                      ยอดที่ต้องชำระ: {formatCurrency(selected.order.preorder?.depositAmount || selected.order.total || selected.depositAmount || 0)}
                    </span>
                    <span>สถานะชำระเงิน: {paymentStatusLabels[selected.order.payment?.status] || selected.order.payment?.status || "-"}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/orders/${selected.order._id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/40 bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--color-rose)] shadow-inner hover:bg-white"
                    >
                      🔍 เปิดหน้าลูกค้า
                    </Link>
                    <Link
                      href="/admin/orders"
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/40 bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--color-rose)] shadow-inner hover:bg-white"
                    >
                      📄 ไปยังหน้าคำสั่งซื้อทั้งหมด
                    </Link>
                  </div>
                  <div className="rounded-xl border border-dashed border-[var(--color-rose)]/30 bg-white/70 px-3 py-3">
                    <p className="font-semibold text-[var(--color-rose-dark)]">แนบหลักฐานการโอน (สำหรับแอดมิน)</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-1 text-xs font-medium">
                        เลือกไฟล์สลิป
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                          className="rounded-full border border-[var(--color-rose)]/30 bg-white/70 px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-medium">
                        ยอดโอน (บาท)
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          value={slipAmount}
                          onChange={(e) => setSlipAmount(e.target.value)}
                          className="rounded-full border border-[var(--color-rose)]/30 bg-white/70 px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                        />
                      </label>
                    </div>
                    <label className="mt-3 flex flex-col gap-1 text-xs font-medium">
                      หมายเหตุ/เลขอ้างอิง
                      <input
                        value={slipRef}
                        onChange={(e) => setSlipRef(e.target.value)}
                        className="rounded-full border border-[var(--color-rose)]/30 bg-white/70 px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                        placeholder="อ้างอิงโอนเงิน (ถ้ามี)"
                      />
                    </label>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleUploadSlip}
                        disabled={uploadingSlip}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-rose)] px-4 py-2 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-[rgba(240,200,105,0.2)] transition hover:bg-[var(--color-rose-dark)] disabled:opacity-60"
                      >
                        📎 แนบสลิป
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSlipFile(null);
                          setSlipRef("");
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/30 bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--color-rose)] shadow-inner hover:bg-white"
                      >
                        ล้างข้อมูล
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-[var(--color-choco)]/60">
                  ยังไม่ได้สร้างคำสั่งซื้อสำหรับการชำระเงิน ลูกค้าจะสามารถชำระเมื่อกดปุ่มด้านบนเพื่อสร้างคำสั่งซื้อ
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-xs text-[var(--color-choco)]/70 shadow-inner">
              <h4 className="text-sm font-semibold text-[var(--color-rose-dark)]">ประวัติการเปลี่ยนสถานะ</h4>
              <ul className="mt-2 space-y-2">
                {Array.isArray(selected.statusHistory) && selected.statusHistory.length > 0 ? (
                  selected.statusHistory
                    .slice()
                    .reverse()
                    .map((item, index) => (
                      <li key={`${item.status}-${index}`} className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 px-3 py-2">
                        <span>{statusLabels[item.status] || item.status}</span>
                        <span>{formatDateTime(item.changedAt)}</span>
                      </li>
                    ))
                ) : (
                  <li className="rounded-xl border border-dashed border-white/60 px-3 py-2 text-center">ยังไม่มีประวัติ</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
