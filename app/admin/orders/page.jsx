"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminPopup } from "@/components/admin/AdminPopupProvider";

const statusOptions = ["all", "new", "pending", "shipping", "success", "cancel"];

const statusLabels = {
  all: "ทั้งหมด",
  new: "คำสั่งซื้อใหม่",
  pending: "กำลังเตรียมสินค้า",
  shipping: "ระหว่างจัดส่ง",
  success: "จัดส่งสำเร็จ",
  cancel: "ยกเลิก",
  preparing: "กำลังเตรียมสินค้า",
  shipped: "ระหว่างจัดส่ง",
  done: "จัดส่งสำเร็จ",
  cancelled: "ยกเลิก",
};

const statusStyles = {
  new: "bg-[#fff5e4] text-[var(--color-choco)]",
  pending: "bg-[#f3d36b]/30 text-[var(--color-choco)]",
  shipping: "bg-[#7cd1b8]/30 text-[#1f7a65]",
  success: "bg-[#7cd1b8]/40 text-[#1f7a65]",
  cancel: "bg-rose-100 text-rose-500",
  preparing: "bg-[#f3d36b]/30 text-[var(--color-choco)]",
  shipped: "bg-[#7cd1b8]/30 text-[#1f7a65]",
  done: "bg-[#7cd1b8]/40 text-[#1f7a65]",
  cancelled: "bg-rose-100 text-rose-500",
};

const paymentStatusOptions = ["unpaid", "verifying", "paid", "invalid", "cash"];

const paymentStatusLabels = {
  unpaid: "ยังไม่จ่าย",
  verifying: "รอยืนยัน",
  paid: "ชำระแล้ว",
  invalid: "ไม่ถูกต้อง",
  cash: "เงินสด",
  pending: "ยังไม่จ่าย",
  failed: "ไม่ถูกต้อง",
};

const paymentStatusStyles = {
  unpaid: "bg-amber-100 text-amber-600",
  verifying: "bg-[#fff5e4] text-[var(--color-choco)]",
  paid: "bg-emerald-100 text-emerald-600",
  invalid: "bg-rose-100 text-rose-600",
  cash: "bg-sky-100 text-sky-600",
  pending: "bg-amber-100 text-amber-600",
  failed: "bg-rose-100 text-rose-600",
};

const normalizeStatus = (status) => {
  const map = { preparing: "pending", shipped: "shipping", done: "success", cancelled: "cancel" };
  return map[status] || status;
};

const normalizePaymentStatus = (status) => {
  const map = { pending: "unpaid", failed: "invalid" };
  return map[status] || status;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [updating, setUpdating] = useState("");
  const [updatingPayment, setUpdatingPayment] = useState("");
  const popup = useAdminPopup();

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load orders failed");
      setOrders(data);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id, status) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        await popup.alert(data?.error || "อัปเดตสถานะไม่สำเร็จ", {
          title: "เกิดข้อผิดพลาด",
          tone: "error",
        });
        return;
      }
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
    } catch (e) {
      await popup.alert(e?.message || "อัปเดตสถานะไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        tone: "error",
      });
    } finally {
      setUpdating("");
    }
  }

  async function updatePaymentStatus(order, nextStatus) {
    if (!order?._id) return;
    setUpdatingPayment(order._id);
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment: { status: nextStatus },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        await popup.alert(data?.error || "อัปเดตสถานะการชำระเงินไม่สำเร็จ", {
          title: "เกิดข้อผิดพลาด",
          tone: "error",
        });
        return;
      }
      setOrders((prev) => prev.map((o) => (o._id === order._id ? data : o)));
    } catch (e) {
      await popup.alert(e?.message || "อัปเดตสถานะการชำระเงินไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        tone: "error",
      });
    } finally {
      setUpdatingPayment("");
    }
  }

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    const target = normalizeStatus(filter);
    return orders.filter((o) => normalizeStatus(o.status) === target);
  }, [orders, filter]);

  const totalToday = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [filteredOrders]);

  if (loading)
    return (
      <main className="rounded-3xl border border-white/80 bg-white/80 px-6 py-10 text-[var(--color-choco)]/70 shadow-lg shadow-[rgba(240,200,105,0.08)]">
        กำลังโหลดคำสั่งซื้อ...
      </main>
    );

  if (err)
    return (
      <main className="rounded-3xl border border-rose-200 bg-rose-50/80 px-6 py-10 text-rose-600 shadow-lg">
        {err}
      </main>
    );

  return (
    <main className="space-y-10">
      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-[rgba(240,200,105,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-rose-dark)]">คำสั่งซื้อทั้งหมด</h2>
            <p className="mt-1 text-sm text-[var(--color-choco)]/70">
              ติดตามสถานะการจ่ายเงิน จัดเตรียมสินค้า และการจัดส่งให้ครบถ้วนในที่เดียว
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/30 bg-white/80 px-4 py-2 text-xs font-semibold text-[var(--color-choco)]/70 shadow-inner">
              <span>กรองตามสถานะ</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-full border border-transparent bg-transparent text-[var(--color-rose)] focus:outline-none"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <a
              href="/api/admin/export/orders"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-rose)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(240,200,105,0.33)] transition hover:bg-[var(--color-rose-dark)]"
            >
              ⬇️ ส่งออก CSV
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OrderHighlight label="รายการที่แสดง" value={filteredOrders.length} />
          <OrderHighlight label="ยอดรวม" value={formatCurrency(totalToday)} />
          <OrderHighlight label="คำสั่งซื้อที่รอจัดการ" value={orders.filter((o) => o.status === "new").length} />
          <OrderHighlight label="อัปเดตล่าสุด" value={new Date().toLocaleTimeString()} subtle />
        </div>
      </section>

      <section className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-white/70 bg-white/70 px-6 py-16 text-center text-[var(--color-choco)]/60 shadow-inner">
            ยังไม่มีคำสั่งซื้อในสถานะนี้
          </div>
        ) : (
          filteredOrders.map((order) => {
            const normalizedStatus = normalizeStatus(order.status);
            const paymentState = normalizePaymentStatus(
              order.payment?.status || (Number(order.total || 0) > 0 ? "unpaid" : "paid")
            );
            const canAccept = ["paid", "cash"].includes(paymentState);
            const isUpdating = updating === order._id;
            const methodDisplay =
              paymentState === "cash" ? "เงินสดหน้างาน" : formatPaymentMethod(order.payment?.method);

            return (
              <article
                key={order._id}
                className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-[rgba(240,200,105,0.08)] backdrop-blur"
              >
                <header className="flex flex-col gap-3 border-b border-white/60 pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-choco)]/60">คำสั่งซื้อ #{order._id.slice(-6)}</p>
                    <h3 className="text-xl font-semibold text-[var(--color-choco)]">
                      {order.customer?.name || "ลูกค้าทั่วไป"}
                    </h3>
                    <p className="text-xs text-[var(--color-choco)]/50">
                      {new Date(order.createdAt).toLocaleString("th-TH")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${statusStyles[normalizedStatus] || "bg-white"}`}>
                      <span className="text-base">📦</span>
                      {statusLabels[normalizedStatus] || normalizedStatus}
                    </span>
                    {order.preorder ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/40 bg-[var(--color-rose)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-rose)]">
                        🗓️ Pre-order · {order.preorder.paymentPlan === "half" ? "มัดจำ 50%" : "ชำระเต็ม"}
                      </span>
                    ) : null}
                    {normalizedStatus === "new" ? (
                      <button
                        type="button"
                        onClick={() => updateStatus(order._id, "pending")}
                        disabled={!canAccept || isUpdating}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                          !canAccept || isUpdating
                            ? "cursor-not-allowed bg-[var(--color-rose)]/20 text-[var(--color-choco)]/40"
                            : "bg-[var(--color-rose)] text-white shadow shadow-[rgba(240,200,105,0.33)] hover:bg-[var(--color-rose-dark)]"
                        }`}
                        title={
                          canAccept
                            ? "ยอมรับออเดอร์และเริ่มเตรียมสินค้า"
                            : "ต้องยืนยันการชำระเงินก่อน"
                        }
                      >
                        {isUpdating ? "กำลังอัปเดต..." : "ยอมรับออเดอร์"}
                      </button>
                    ) : null}
                    <label className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/40 bg-white/70 px-3 py-2 text-xs text-[var(--color-choco)]/70">
                      <span className="font-semibold text-[var(--color-choco)]">อัปเดตสถานะ</span>
                      <select
                        value={normalizedStatus}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="rounded-full border border-transparent bg-transparent text-[var(--color-rose)] focus:outline-none"
                        disabled={isUpdating}
                      >
                        {statusOptions
                          .filter((option) => option !== "all")
                          .map((option) => (
                            <option key={option} value={option}>
                              {statusLabels[option]}
                            </option>
                          ))}
                      </select>
                    </label>
                  </div>
                </header>

                <div className="mt-4 grid gap-6 lg:grid-cols-[2fr_1fr]">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-choco)]/50">
                        รายการสินค้า
                      </h4>
                      <ul className="mt-3 space-y-2 text-sm text-[var(--color-choco)]">
                        {order.items.map((item, idx) => (
                          <li key={`${order._id}-${idx}`} className="flex items-center justify-between gap-3">
                            <span>
                              {item.title} × {item.qty}
                            </span>
                            <span className="font-semibold">{formatCurrency(item.price * item.qty)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-choco)]/50">
                        ที่อยู่จัดส่ง
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-choco)]/75">
                        {order.shipping?.address1}
                        {order.shipping?.address2 ? ` ${order.shipping.address2}` : ""}
                        <br />
                        {order.shipping?.district} {order.shipping?.province} {order.shipping?.postcode}
                      </p>
                      {order.shipping?.note ? (
                        <p className="mt-2 rounded-2xl bg-[var(--color-rose)]/10 px-3 py-2 text-xs text-[var(--color-rose)]">
                          บันทึกจากลูกค้า: {order.shipping.note}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-sm text-[var(--color-choco)] shadow-inner">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-choco)]/50">
                        สรุปยอดชำระ
                      </h4>
                      <div className="mt-3 space-y-2">
                        <SummaryRow label="ยอดสินค้า" value={formatCurrency(order.subtotal)} />
                        <SummaryRow label="ส่วนลด" value={formatCurrency(-order.discount)} negative={order.discount > 0} />
                        <SummaryRow label="ยอดชำระรวม" value={formatCurrency(order.total)} strong />
                        {order.preorder ? (
                          <>
                            <SummaryRow label="ยอดใบเสนอราคา" value={formatCurrency(order.preorder.quotedTotal || order.total)} />
                            <SummaryRow label="ยอดมัดจำรอบแรก" value={formatCurrency(order.preorder.depositAmount || order.total)} />
                            {order.preorder.balanceAmount ? (
                              <SummaryRow label="ยอดคงเหลือ" value={formatCurrency(order.preorder.balanceAmount)} />
                            ) : null}
                          </>
                        ) : null}
                      </div>
                      {order.coupon?.code ? (
                        <p className="mt-3 rounded-full bg-[var(--color-rose)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-rose)]">
                          ใช้คูปอง {order.coupon.code}
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-2xl border border-[var(--color-rose)]/30 bg-[var(--color-rose)]/10 p-4 text-sm text-[var(--color-choco)] shadow-inner">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-choco)]/50">
                        การชำระเงิน
                      </h4>
                      <div className="mt-2 flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-4">
                          <span>
                            วิธีชำระ: <strong>{methodDisplay}</strong>
                          </span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusStyles[paymentState] || "bg-white"}`}>
                            {paymentStatusLabels[paymentState] || paymentState}
                          </span>
                        </div>
                        <label className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-2 text-xs text-[var(--color-choco)]/70">
                          <span className="font-semibold text-[var(--color-choco)]">สถานะชำระเงิน</span>
                          <select
                            value={paymentState}
                            onChange={(e) => updatePaymentStatus(order, e.target.value)}
                            className="rounded-full border border-transparent bg-transparent text-[var(--color-rose)] focus:outline-none"
                            disabled={updatingPayment === order._id}
                          >
                            {paymentStatusOptions.map((option) => (
                              <option key={option} value={option}>
                                {paymentStatusLabels[option]}
                              </option>
                            ))}
                          </select>
                        </label>
                        {order.payment?.amountPaid ? (
                          <p className="text-sm text-[var(--color-choco)]/70">
                            ยอดที่ลูกค้าแจ้ง: {formatCurrency(order.payment.amountPaid)}
                          </p>
                        ) : null}
                        {order.payment?.ref ? (
                          <p className="text-xs text-[var(--color-choco)]/60">เลขอ้างอิง: {order.payment.ref}</p>
                        ) : null}
                        {order.payment?.slip ? (
                          <button
                            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[var(--color-rose)] shadow hover:bg-white/90"
                            onClick={() => setSelectedSlip({
                              slip: order.payment.slip,
                              filename: order.payment.slipFilename || `slip-${order._id}.jpg`,
                            })}
                          >
                            🧾 ดูสลิปการโอน
                          </button>
                        ) : null}
                        {order.payment?.confirmedAt ? (
                          <p className="text-xs text-[var(--color-choco)]/60">
                            แนบสลิปเมื่อ {new Date(order.payment.confirmedAt).toLocaleString("th-TH")}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {selectedSlip ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-10 backdrop-blur"
          onClick={() => setSelectedSlip(null)}
        >
          <div
            className="max-h-full w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-[rgba(240,200,105,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/60 bg-[var(--color-rose)]/10 px-5 py-3 text-sm font-semibold text-[var(--color-choco)]">
              สลิปการโอน
              <button
                className="rounded-full border border-[var(--color-choco)]/20 px-3 py-1 text-xs text-[var(--color-choco)]/70"
                onClick={() => setSelectedSlip(null)}
              >
                ปิด
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto bg-black/5">
              <img src={selectedSlip.slip} alt="Payment slip" className="h-full w-full object-contain" />
            </div>
            <a
              href={selectedSlip.slip}
              download={selectedSlip.filename}
              className="block bg-white px-5 py-3 text-center text-sm font-semibold text-[var(--color-rose)] transition hover:bg-[var(--color-rose)]/10"
            >
              ดาวน์โหลดสลิป
            </a>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function OrderHighlight({ label, value, subtle = false }) {
  return (
    <div
      className={`rounded-3xl border border-white/70 px-4 py-4 text-sm font-semibold shadow-inner ${
        subtle ? "bg-white/60 text-[var(--color-choco)]/60" : "bg-white/80 text-[var(--color-choco)]"
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-[var(--color-choco)]/50">{label}</p>
      <p className="mt-2 text-xl text-[var(--color-rose-dark)]">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, strong = false, negative = false }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--color-choco)]/60">{label}</span>
      <span
        className={`${strong ? "text-lg font-semibold text-[var(--color-rose-dark)]" : "font-medium text-[var(--color-choco)]"} ${
          negative ? "text-rose-500" : ""
        }`}
      >
        {value}
      </span>
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

function formatPaymentMethod(method) {
  switch (method) {
    case "promptpay":
      return "PromptPay QR";
    case "bank":
      return "โอนผ่านบัญชีธนาคาร";
    default:
      return "ไม่ระบุ";
  }
}
