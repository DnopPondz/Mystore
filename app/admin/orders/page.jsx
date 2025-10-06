"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminAccentButton,
  adminFilterPill,
  adminInsetCardShell,
  adminSoftBadge,
  adminSubSurfaceShell,
  adminSurfaceShell,
} from "@/app/admin/theme";
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
  new: "border border-[#F5D4A6] bg-[#eaf8f4] text-[#0ea5a0]",
  pending: "border border-[#C3E7C4] bg-[#e2faf5] text-[#2F7A3D]",
  shipping: "border border-[#C8DBF5] bg-[#F1F6FE] text-[#2B6AA3]",
  success: "border border-[#b7f0e2] bg-[#e4faf5] text-[#2F7A3D]",
  cancel: "border border-rose-200 bg-rose-50 text-rose-600",
  preparing: "border border-[#C3E7C4] bg-[#e2faf5] text-[#2F7A3D]",
  shipped: "border border-[#C8DBF5] bg-[#F1F6FE] text-[#2B6AA3]",
  done: "border border-[#b7f0e2] bg-[#e4faf5] text-[#2F7A3D]",
  cancelled: "border border-rose-200 bg-rose-50 text-rose-600",
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
  unpaid: "border border-[#F5D4A6] bg-[#eaf8f4] text-[#0ea5a0]",
  verifying: "border border-[#F5D4A6] bg-[#eaf8f4] text-[#0ea5a0]",
  paid: "border border-[#b7f0e2] bg-[#e4faf5] text-[#2F7A3D]",
  invalid: "border border-rose-200 bg-rose-50 text-rose-600",
  cash: "border border-[#C8DBF5] bg-[#F1F6FE] text-[#2B6AA3]",
  pending: "border border-[#F5D4A6] bg-[#eaf8f4] text-[#0ea5a0]",
  failed: "border border-rose-200 bg-rose-50 text-rose-600",
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
      <main className={`${adminSurfaceShell} p-8`}>
        <div className="flex items-center gap-3 text-sm text-[#145f4b]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0ea5a0] border-t-transparent" />
          <span>กำลังโหลดคำสั่งซื้อ...</span>
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
    <main className="space-y-8 text-[#0b3b31]">
      <section className={`${adminSurfaceShell} p-8`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0b3b31]">คำสั่งซื้อทั้งหมด</h2>
            <p className="mt-1 text-sm text-[#145f4b]">
              ติดตามสถานะการจ่ายเงิน จัดเตรียมสินค้า และการจัดส่งให้ครบถ้วนในที่เดียว
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className={`${adminFilterPill}`}>
              <span>กรองตามสถานะ</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-full border border-transparent bg-transparent text-[#0ea5a0] focus:outline-none"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <a href="/api/admin/export/orders" className={adminAccentButton}>
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
          <div className={`${adminSubSurfaceShell} px-6 py-16 text-center text-[#145f4b]`}>
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
            const promotionDiscount = Number(order.promotionDiscount || 0);
            const couponDiscount =
              order.coupon?.discount != null
                ? Number(order.coupon.discount || 0)
                : Math.max(0, Number(order.discount || 0) - promotionDiscount);
            const freebiesByProduct = (() => {
              const map = new Map();
              const promos = Array.isArray(order.promotions) ? order.promotions : [];
              promos.forEach((promo) => {
                const items = Array.isArray(promo?.items) ? promo.items : [];
                items.forEach((item) => {
                  const productId = item?.productId;
                  if (!productId) return;
                  const key = String(productId);
                  const prev = map.get(key) || { qty: 0, discount: 0, titles: [] };
                  const freeQty = Number(item?.freeQty || 0);
                  const discount = Number(item?.discount || 0);
                  const label = promo?.title || promo?.summary || "โปรโมชั่น";
                  const titles = prev.titles.includes(label) ? prev.titles : [...prev.titles, label];
                  map.set(key, {
                    qty: prev.qty + freeQty,
                    discount: prev.discount + discount,
                    titles,
                  });
                });
              });
              return map;
            })();

            return (
              <article key={order._id} className={`${adminSubSurfaceShell} p-6 shadow-[0_24px_50px_-28px_rgba(10,83,73,0.45)]`}>
                <header className="flex flex-col gap-3 border-b border-[#c9f6ef] pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0ea5a0]/70">คำสั่งซื้อ #{order._id.slice(-6)}</p>
                    <h3 className="text-xl font-semibold text-[#0b3b31]">
                      {order.customer?.name || "ลูกค้าทั่วไป"}
                    </h3>
                    <p className="text-xs text-[#145f4b]">
                      {new Date(order.createdAt).toLocaleString("th-TH")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-[0_12px_24px_-20px_rgba(10,83,73,0.4)] ${
                      statusStyles[normalizedStatus] || "bg-white text-[#0b3b31]"
                    }`}>
                      <span className="text-base">📦</span>
                      {statusLabels[normalizedStatus] || normalizedStatus}
                    </span>
                    {order.preorder ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#DCC7F0] bg-[#F8F2FF] px-3 py-1 text-xs font-semibold text-[#7A4CB7]">
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
                            ? "cursor-not-allowed border border-[#9be6dc] bg-white/60 text-[#0ea5a0]/50"
                            : "bg-gradient-to-r from-[#0ea5a0] via-[#0c8d86] to-[#0a5f56] text-white shadow-[0_18px_36px_-22px_rgba(10,83,73,0.55)] hover:from-[#0c8d86] hover:via-[#0a7c73] hover:to-[#084f47]"
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
                    <label className={`${adminFilterPill} px-3 py-2`}>
                      <span className="font-semibold text-[#0ea5a0]">อัปเดตสถานะ</span>
                      <select
                        value={normalizedStatus}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="rounded-full border border-transparent bg-transparent text-[#0ea5a0] focus:outline-none"
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
                    <div className={`${adminInsetCardShell} p-5`}>
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-[#0ea5a0]/70">
                        รายการสินค้า
                      </h4>
                      <ul className="mt-3 space-y-2 text-sm text-[#0b3b31]">
                        {order.items.map((item, idx) => {
                          const bonus = freebiesByProduct.get(String(item.productId));
                          return (
                            <li key={`${order._id}-${idx}`} className="flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-3">
                                <span>
                                  {item.title} × {item.qty}
                                </span>
                                <span className="font-semibold">{formatCurrency(item.price * item.qty)}</span>
                              </div>
                              {bonus?.qty ? (
                                <div className="flex items-center justify-between gap-3 text-xs text-[#7A4CB7]">
                                  <span>
                                    รับฟรี {bonus.qty} ชิ้น (-{formatCurrency(bonus.discount)}) จากโปร {bonus.titles.join(", ")}
                                  </span>
                                </div>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className={`${adminInsetCardShell} p-5`}>
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-[#0ea5a0]/70">
                        ที่อยู่จัดส่ง
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-[#0f5349]">
                        {order.shipping?.address1}
                        {order.shipping?.address2 ? ` ${order.shipping.address2}` : ""}
                        <br />
                        {order.shipping?.district} {order.shipping?.province} {order.shipping?.postcode}
                      </p>
                      {order.shipping?.note ? (
                        <p className="mt-2 rounded-[1rem] border border-[#DCC7F0] bg-[#F8F2FF] px-3 py-2 text-xs text-[#7A4CB7]">
                          บันทึกจากลูกค้า: {order.shipping.note}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className={`${adminInsetCardShell} p-5 text-sm text-[#0f5349]`}>
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-[#0ea5a0]/70">
                        สรุปยอดชำระ
                      </h4>
                      <div className="mt-3 space-y-2">
                        <SummaryRow label="ยอดสินค้า" value={formatCurrency(order.subtotal)} />
                        {promotionDiscount ? (
                          <SummaryRow
                            label="ส่วนลดโปรโมชัน"
                            value={formatCurrency(-promotionDiscount)}
                            negative
                          />
                        ) : null}
                        {couponDiscount ? (
                          <SummaryRow
                            label="ส่วนลดคูปอง"
                            value={formatCurrency(-couponDiscount)}
                            negative
                          />
                        ) : null}
                        <SummaryRow
                          label="ส่วนลดรวม"
                          value={formatCurrency(-order.discount)}
                          negative={order.discount > 0}
                        />
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
                      {order.promotions?.length ? (
                        <div className="mt-3 rounded-[1.2rem] border border-[#DCC7F0] bg-[#F8F2FF] px-3 py-2 text-xs text-[#0f5349]">
                          <h5 className="font-semibold text-[#7A4CB7]">โปรโมชันที่ใช้</h5>
                          <ul className="mt-1 space-y-1">
                            {order.promotions.map((promo, idx) => (
                              <li key={`${order._id}-promo-${idx}`} className="flex items-center justify-between gap-3">
                                <span>{promo.title || promo.summary || "โปรโมชั่น"}</span>
                                <span className="font-semibold text-[#7A4CB7]">-{formatCurrency(promo.discount || 0)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {order.coupon?.code ? (
                        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#DCC7F0] bg-[#F8F2FF] px-3 py-1 text-xs font-semibold text-[#7A4CB7]">
                          ใช้คูปอง {order.coupon.code} (-{formatCurrency(couponDiscount)})
                        </p>
                      ) : null}
                    </div>

                    <div className={`${adminInsetCardShell} border border-[#E4CFE8] bg-[#FDF9FF] p-5 text-sm text-[#0f5349]`}>
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-[#7A4CB7]/70">
                        การชำระเงิน
                      </h4>
                      <div className="mt-2 flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-4">
                          <span>
                            วิธีชำระ: <strong>{methodDisplay}</strong>
                          </span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold shadow-[0_12px_22px_-20px_rgba(10,83,73,0.45)] ${
                            paymentStatusStyles[paymentState] || "border border-[#c9f6ef] bg-white text-[#0b3b31]"
                          }`}>
                            {paymentStatusLabels[paymentState] || paymentState}
                          </span>
                        </div>
                        <label className={`${adminFilterPill} px-3 py-2`}>
                          <span className="font-semibold text-[#0ea5a0]">สถานะชำระเงิน</span>
                          <select
                            value={paymentState}
                            onChange={(e) => updatePaymentStatus(order, e.target.value)}
                            className="rounded-full border border-transparent bg-transparent text-[#0ea5a0] focus:outline-none"
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
                          <p className="text-sm text-[#145f4b]">
                            ยอดที่ลูกค้าแจ้ง: {formatCurrency(order.payment.amountPaid)}
                          </p>
                        ) : null}
                        {order.payment?.ref ? (
                          <p className="text-xs text-[#0ea5a0]/70">เลขอ้างอิง: {order.payment.ref}</p>
                        ) : null}
                        {order.payment?.slip ? (
                          <button
                            className={`${adminSoftBadge} gap-2 px-4 py-2 text-xs shadow-[0_12px_24px_-20px_rgba(10,83,73,0.45)] transition hover:bg-[#e5f8f3]`}
                            onClick={() => setSelectedSlip({
                              slip: order.payment.slip,
                              filename: order.payment.slipFilename || `slip-${order._id}.jpg`,
                            })}
                          >
                            🧾 ดูสลิปการโอน
                          </button>
                        ) : null}
                        {order.payment?.confirmedAt ? (
                          <p className="text-xs text-[#0ea5a0]/70">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10 backdrop-blur-sm"
          onClick={() => setSelectedSlip(null)}
        >
          <div
            className={`max-h-full w-full max-w-xl overflow-hidden ${adminSubSurfaceShell} shadow-[0_30px_60px_-32px_rgba(10,83,73,0.65)]`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#c9f6ef] bg-[#eaf8f4]/70 px-5 py-3 text-sm font-semibold text-[#0b3b31]">
              สลิปการโอน
              <button
                className="rounded-full border border-[#9be6dc] bg-white/80 px-3 py-1 text-xs text-[#0ea5a0] transition hover:bg-[#e5f8f3]"
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
              className="block bg-white px-5 py-3 text-center text-sm font-semibold text-[#0ea5a0] transition hover:bg-[#e5f8f3]"
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
      className={`${adminInsetCardShell} px-4 py-4 text-sm font-semibold shadow-[0_14px_26px_-24px_rgba(10,83,73,0.45)] ${
        subtle ? "bg-[#edf9f6] text-[#0ea5a0]/70" : "bg-white text-[#0b3b31]"
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-[#0ea5a0]/70">{label}</p>
      <p className="mt-2 text-xl text-[#0b3b31]">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, strong = false, negative = false }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#0ea5a0]/70">{label}</span>
      <span
        className={`${strong ? "text-lg font-semibold text-[#0b3b31]" : "font-medium text-[#0f5349]"} ${
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
