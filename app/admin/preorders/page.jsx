"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  adminAccentButton,
  adminFilterPill,
  adminInsetCardShell,
  adminSoftBadge,
  adminSubSurfaceShell,
  adminSurfaceShell,
} from "@/app/admin/theme";
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
  new: "border border-[#F5D4A6] bg-[#FFF4E5] text-[#8A5A33]",
  contacted: "border border-[#C8DBF5] bg-[#F1F6FE] text-[#2B6AA3]",
  quoted: "border border-[#DCC7F0] bg-[#F8F2FF] text-[#7A4CB7]",
  confirmed: "border border-[#BDE5C1] bg-[#EEF9F0] text-[#2F7A3D]",
  closed: "border border-[#E5E4E0] bg-[#FAF7F2] text-[#6B7280]",
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
      <main className={`${adminSurfaceShell} p-6`}>
        <div className="flex items-center gap-3 text-sm text-[#6F4A2E]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#C67C45] border-t-transparent" />
          <span>กำลังโหลดคำขอ Pre-order...</span>
        </div>
      </main>
    );

  if (err)
    return (
      <main className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-600 shadow-[0_20px_45px_-25px_rgba(244,63,94,0.3)]">
        {err}
      </main>
    );

  return (
    <main className="grid gap-8 text-[#3F2A1A] lg:grid-cols-[1.1fr_1.6fr]">
      <section className={`${adminSubSurfaceShell} space-y-4 p-6`}>
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-[#3F2A1A]">คำขอ Pre-order</h2>
          <p className="text-sm text-[#6F4A2E]">ติดตามสถานะการติดต่อและยอดเสนอราคาที่ต้องตามงาน</p>
        </div>
        <label className={adminFilterPill}>
          <span>กรองตามสถานะ</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-full border border-transparent bg-transparent text-[#8A5A33] focus:outline-none"
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
            <div className="rounded-2xl border border-dashed border-[#F2D5AF] bg-white/70 px-4 py-8 text-center text-sm text-[#6F4A2E]">
              ไม่พบคำขอในสถานะนี้
            </div>
          ) : (
            filteredItems.map((item) => {
              const active = item._id === selectedId;
              const badgeClass = statusStyles[item.status] || "border border-[#F3E0C7] bg-white text-[#3F2A1A]";
              return (
                <button
                  type="button"
                  key={item._id}
                  onClick={() => {
                    setSelectedId(item._id);
                    fetchDetail(item._id);
                  }}
                  className={`${adminSubSurfaceShell} rounded-2xl px-4 py-3 text-left transition-all shadow-[0_16px_30px_-24px_rgba(63,42,26,0.45)] ${
                    active
                      ? "border border-[#E6C79C] bg-[#FFF2DD] text-[#3F2A1A]"
                      : "border border-transparent bg-white/80 text-[#6F4A2E] hover:border-[#E6C79C]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#3F2A1A]">{item.name}</p>
                      <p className="text-xs text-[#8A5A33]/70">{item.phone}</p>
                    </div>
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-[0_12px_24px_-20px_rgba(63,42,26,0.4)] ${badgeClass}`}>
                      {statusLabels[item.status] || item.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#6F4A2E]">
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

      <section className={`${adminSurfaceShell} p-8`}>
        {detailLoading ? (
          <div className="text-sm text-[#6F4A2E]">กำลังโหลดรายละเอียด...</div>
        ) : !selected ? (
          <div className="text-sm text-[#6F4A2E]">เลือกคำขอจากด้านซ้ายเพื่อดูรายละเอียด</div>
        ) : (
          <div className="space-y-6">
            <header className="flex flex-col gap-3 rounded-[1.5rem] border border-[#F2D5AF] bg-[#FFF4E5]/70 px-5 py-4 text-sm text-[#5B3A21] shadow-[0_16px_32px_-26px_rgba(63,42,26,0.45)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#3F2A1A]">{selected.name}</h3>
                  <p className="text-xs text-[#8A5A33]/70">
                    {selected.phone}
                    {selected.email ? ` · ${selected.email}` : ""}
                  </p>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-[0_12px_24px_-20px_rgba(63,42,26,0.4)] ${
                  statusStyles[selected.status] || "border border-[#F3E0C7] bg-white text-[#3F2A1A]"
                }`}>
                  {statusLabels[selected.status] || selected.status}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#8A5A33]/70">
                <span>ส่งคำขอเมื่อ {formatDateTime(selected.createdAt)}</span>
                {selected.contactedAt ? <span>ติดต่อเมื่อ {formatDateTime(selected.contactedAt)}</span> : null}
                {selected.quotedAt ? <span>ออกใบเสนอราคาวันที่ {formatDateTime(selected.quotedAt)}</span> : null}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-[#8A5A33]/70">
                <span>ช่องทางติดต่อที่ลูกค้าสะดวก: {selected.preferredContact}</span>
                {selected.eventDate ? <span>วันที่จัดงาน: {selected.eventDate}</span> : null}
                {selected.eventTime ? <span>เวลา: {selected.eventTime}</span> : null}
              </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className={`${adminInsetCardShell} bg-white/90 p-4 text-sm text-[#5B3A21]`}>
                <h4 className="font-semibold text-[#3F2A1A]">รายละเอียดที่ลูกค้าต้องการ</h4>
                <p className="mt-2 whitespace-pre-wrap text-xs text-[#6F4A2E]">{selected.flavourIdeas || "-"}</p>
                {selected.notes ? (
                  <p className="mt-3 rounded-[1rem] border border-[#DCC7F0] bg-[#F8F2FF] px-3 py-2 text-xs text-[#7A4CB7]">
                    บันทึกเพิ่มเติม: {selected.notes}
                  </p>
                ) : null}
              </div>
              <div className={`${adminInsetCardShell} bg-white/90 p-4 text-sm text-[#5B3A21]`}>
                <h4 className="font-semibold text-[#3F2A1A]">ใบเสนอราคา</h4>
                <div className="mt-3 space-y-3 text-xs">
                  <label className="flex flex-col gap-1 font-medium text-[#3F2A1A]">
                    ยอดเสนอราคา (รวมทั้งหมด)
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={quoteForm.quotedTotal}
                      onChange={(e) => setQuoteForm((prev) => ({ ...prev, quotedTotal: e.target.value }))}
                      className="rounded-full border border-[#E6C79C] bg-white px-3 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_4px_rgba(63,42,26,0.08)] focus:border-[#C67C45] focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1 font-medium text-[#3F2A1A]">
                    รูปแบบการชำระ
                    <select
                      value={quoteForm.paymentPlan}
                      onChange={(e) => setQuoteForm((prev) => ({ ...prev, paymentPlan: e.target.value }))}
                      className="rounded-full border border-[#E6C79C] bg-white px-3 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_4px_rgba(63,42,26,0.08)] focus:border-[#C67C45] focus:outline-none"
                    >
                      <option value="full">ชำระเต็มจำนวน</option>
                      <option value="half">มัดจำ 50%</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 font-medium text-[#3F2A1A]">
                    สรุปรายละเอียดใบเสนอราคา
                    <textarea
                      rows={3}
                      value={quoteForm.quoteSummary}
                      onChange={(e) => setQuoteForm((prev) => ({ ...prev, quoteSummary: e.target.value }))}
                      className="rounded-[1rem] border border-[#E6C79C] bg-white px-3 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_4px_rgba(63,42,26,0.08)] focus:border-[#C67C45] focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1 font-medium text-[#3F2A1A]">
                    บันทึกภายในทีม
                    <textarea
                      rows={3}
                      value={quoteForm.internalNotes}
                      onChange={(e) => setQuoteForm((prev) => ({ ...prev, internalNotes: e.target.value }))}
                      className="rounded-[1rem] border border-[#E6C79C] bg-white px-3 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_4px_rgba(63,42,26,0.08)] focus:border-[#C67C45] focus:outline-none"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={saveQuote}
                      disabled={savingQuote}
                      className={`${adminAccentButton} px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      💾 บันทึกใบเสนอราคา
                    </button>
                    <button
                      type="button"
                      onClick={() => changeStatus("quoted")}
                      disabled={savingStatus || selected.status === "quoted"}
                      className={`${adminSoftBadge} px-4 py-2 text-sm shadow-[0_12px_24px_-20px_rgba(63,42,26,0.45)] transition hover:bg-[#FFF2DD] disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      📤 ตั้งค่าสถานะเป็น "ส่งใบเสนอราคา"
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${adminInsetCardShell} bg-white/90 p-4 text-sm text-[#5B3A21]`}>
              <h4 className="font-semibold text-[#3F2A1A]">สรุปยอดและสถานะ</h4>
              <div className="mt-3 grid gap-3 text-xs text-[#6F4A2E] sm:grid-cols-2">
                <div className="rounded-[1rem] border border-[#F2D5AF] bg-[#FFF4E5] px-3 py-2">
                  <p className="font-semibold text-[#8A5A33]">ยอดเสนอราคาทั้งหมด</p>
                  <p>{formatCurrency(selected.quotedTotal || 0)}</p>
                </div>
                <div className="rounded-[1rem] border border-[#F2D5AF] bg-[#FFF4E5] px-3 py-2">
                  <p className="font-semibold text-[#8A5A33]">ยอดมัดจำ/จ่ายรอบแรก</p>
                  <p>{formatCurrency(selected.depositAmount || 0)}</p>
                </div>
                <div className="rounded-[1rem] border border-[#F2D5AF] bg-[#FFF4E5] px-3 py-2">
                  <p className="font-semibold text-[#8A5A33]">ยอดคงเหลือ</p>
                  <p>{formatCurrency(selected.balanceAmount || 0)}</p>
                </div>
                <div className="rounded-[1rem] border border-[#F2D5AF] bg-[#FFF4E5] px-3 py-2">
                  <p className="font-semibold text-[#8A5A33]">รูปแบบการชำระ</p>
                  <p>{planLabels[selected.paymentPlan] || "-"}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => changeStatus("contacted")}
                  disabled={savingStatus || selected.status === "contacted"}
                  className={`${adminSoftBadge} px-4 py-2 text-sm shadow-[0_12px_24px_-20px_rgba(63,42,26,0.45)] transition hover:bg-[#FFF2DD] disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  ☎️ ตั้งค่าสถานะเป็น "ติดต่อแล้ว"
                </button>
                <button
                  type="button"
                  onClick={() => changeStatus("confirmed")}
                  disabled={savingStatus || selected.status === "confirmed"}
                  className="inline-flex items-center gap-2 rounded-full border border-[#C3E7C4] bg-[#F0F9ED] px-4 py-2 text-sm font-semibold text-[#2F7A3D] shadow-[0_12px_24px_-20px_rgba(63,42,26,0.45)] transition hover:bg-[#E6F4E4] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ✅ ยืนยันว่าลูกค้าชำระแล้ว
                </button>
                <button
                  type="button"
                  onClick={() => changeStatus("closed")}
                  disabled={savingStatus || selected.status === "closed"}
                  className="inline-flex items-center gap-2 rounded-full border border-[#E5E4E0] bg-[#FAF7F2] px-4 py-2 text-sm font-semibold text-[#6B7280] shadow-[0_12px_24px_-20px_rgba(63,42,26,0.45)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  🏁 ปิดงาน
                </button>
              </div>
            </div>

            <div className={`${adminInsetCardShell} bg-white/90 p-4 text-sm text-[#5B3A21]`}>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <h4 className="font-semibold text-[#3F2A1A]">การชำระเงิน</h4>
                <button
                  type="button"
                  onClick={createOrUpdateOrder}
                  disabled={creatingOrder}
                  className={`${adminAccentButton} px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  💳 {selected.order ? "อัปเดตคำสั่งซื้อ" : "สร้างคำสั่งซื้อเพื่อให้ลูกค้าชำระ"}
                </button>
              </div>
              {selected.order ? (
                <div className="mt-3 space-y-3 text-xs text-[#6F4A2E]">
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
                      className={`${adminSoftBadge} px-3 py-1 text-xs shadow-[0_12px_24px_-20px_rgba(63,42,26,0.45)] hover:bg-[#FFF2DD]`}
                    >
                      🔍 เปิดหน้าลูกค้า
                    </Link>
                    <Link
                      href="/admin/orders"
                      className={`${adminSoftBadge} px-3 py-1 text-xs shadow-[0_12px_24px_-20px_rgba(63,42,26,0.45)] hover:bg-[#FFF2DD]`}
                    >
                      📄 ไปยังหน้าคำสั่งซื้อทั้งหมด
                    </Link>
                  </div>
                  <div className="rounded-[1rem] border border-dashed border-[#E6C79C] bg-[#FFF4E5] px-3 py-3">
                    <p className="font-semibold text-[#8A5A33]">แนบหลักฐานการโอน (สำหรับแอดมิน)</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-1 text-xs font-medium text-[#3F2A1A]">
                        เลือกไฟล์สลิป
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                          className="rounded-full border border-[#E6C79C] bg-white px-3 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_4px_rgba(63,42,26,0.08)] focus:border-[#C67C45] focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-medium text-[#3F2A1A]">
                        ยอดโอน (บาท)
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          value={slipAmount}
                          onChange={(e) => setSlipAmount(e.target.value)}
                          className="rounded-full border border-[#E6C79C] bg-white px-3 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_4px_rgba(63,42,26,0.08)] focus:border-[#C67C45] focus:outline-none"
                        />
                      </label>
                    </div>
                    <label className="mt-3 flex flex-col gap-1 text-xs font-medium text-[#3F2A1A]">
                      หมายเหตุ/เลขอ้างอิง
                      <input
                        value={slipRef}
                        onChange={(e) => setSlipRef(e.target.value)}
                        className="rounded-full border border-[#E6C79C] bg-white px-3 py-2 text-sm text-[#3F2A1A] shadow-[inset_0_1px_4px_rgba(63,42,26,0.08)] focus:border-[#C67C45] focus:outline-none"
                        placeholder="อ้างอิงโอนเงิน (ถ้ามี)"
                      />
                    </label>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleUploadSlip}
                        disabled={uploadingSlip}
                        className="inline-flex items-center gap-2 rounded-full bg-[#8A5A33] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_30px_-20px_rgba(63,42,26,0.55)] transition hover:bg-[#714528] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        📎 แนบสลิป
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSlipFile(null);
                          setSlipRef("");
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-[#E6C79C] bg-white/85 px-4 py-2 text-sm font-semibold text-[#8A5A33] shadow-[0_12px_24px_-20px_rgba(63,42,26,0.45)] hover:bg-[#FFF2DD]"
                      >
                        ล้างข้อมูล
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-[#6F4A2E]">
                  ยังไม่ได้สร้างคำสั่งซื้อสำหรับการชำระเงิน ลูกค้าจะสามารถชำระเมื่อกดปุ่มด้านบนเพื่อสร้างคำสั่งซื้อ
                </p>
              )}
            </div>

            <div className={`${adminInsetCardShell} bg-white/95 p-4 text-xs text-[#5B3A21]`}>
              <h4 className="text-sm font-semibold text-[#3F2A1A]">ประวัติการเปลี่ยนสถานะ</h4>
              <ul className="mt-2 space-y-2">
                {Array.isArray(selected.statusHistory) && selected.statusHistory.length > 0 ? (
                  selected.statusHistory
                    .slice()
                    .reverse()
                    .map((item, index) => (
                      <li key={`${item.status}-${index}`} className="flex items-center justify-between rounded-[1rem] border border-[#F3E0C7] bg-white px-3 py-2 text-[#5B3A21]">
                        <span>{statusLabels[item.status] || item.status}</span>
                        <span>{formatDateTime(item.changedAt)}</span>
                      </li>
                    ))
                ) : (
                  <li className="rounded-[1rem] border border-dashed border-[#F3E0C7] px-3 py-2 text-center text-[#6F4A2E]">ยังไม่มีประวัติ</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
