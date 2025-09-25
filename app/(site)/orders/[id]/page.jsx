"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import QrBox from "@/components/QrBox";

/** ---------------- Icons (inline SVG, no external deps) ---------------- */
function UploadIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5-5 5 5" />
      <path d="M12 15V5" />
    </svg>
  );
}
function ImageIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}
/** --------------------------------------------------------------------- */

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("ไม่สามารถอ่านไฟล์ได้"));
    reader.readAsDataURL(file);
  });
}

function fmt(n) {
  return Number(n || 0).toLocaleString("th-TH");
}

function normalizeStatus(status) {
  const map = { preparing: "pending", shipped: "shipping", done: "success", cancelled: "cancel" };
  return map[status] || status;
}

function normalizePaymentStatus(status, total) {
  const map = { pending: "unpaid", failed: "invalid" };
  const fallback = Number(total || 0) > 0 ? "unpaid" : "paid";
  return map[status] || status || fallback;
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const { status } = useSession();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("promptpay");
  const [slipData, setSlipData] = useState("");
  const [slipName, setSlipName] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [reference, setReference] = useState("");
  const [actionErr, setActionErr] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [updatingMethod, setUpdatingMethod] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);

  async function reloadOrder() {
    if (!id) return null;
    const res = await fetch(`/api/my/orders/${id}`, { cache: "no-store" });
    const data = await res.json();
    if (res.status === 401) {
      setNeedsAuth(true);
      setOrder(null);
      const error = new Error(data?.error || "Unauthorized");
      error.status = 401;
      throw error;
    }
    if (!res.ok) {
      const error = new Error(data?.error || "ไม่สามารถโหลดคำสั่งซื้อได้");
      error.status = res.status;
      throw error;
    }
    setNeedsAuth(false);
    setOrder(data);
    return data;
  }

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    setLoading(true);
    setErr("");
    reloadOrder()
      .catch((e) => {
        if (ignore) return;
        if (e?.status && e.status !== 401) setErr(String(e.message || e));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, [id]);

  const statusLabel = useMemo(
    () => ({
      new: "คำสั่งซื้อใหม่",
      pending: "กำลังเตรียมสินค้า",
      shipping: "กำลังจัดส่ง",
      success: "จัดส่งสำเร็จ",
      cancel: "ยกเลิก",
      preparing: "กำลังเตรียมสินค้า",
      shipped: "กำลังจัดส่ง",
      done: "จัดส่งสำเร็จ",
      cancelled: "ยกเลิก",
    }),
    []
  );

  const paymentLabel = useMemo(
    () => ({
      unpaid: "ยังไม่จ่าย",
      verifying: "รอยืนยัน",
      paid: "ชำระแล้ว",
      invalid: "ไม่ถูกต้อง",
      cash: "เงินสด",
      pending: "ยังไม่จ่าย",
      failed: "ไม่ถูกต้อง",
    }),
    []
  );

  const paymentOptions = useMemo(
    () => [
      { value: "promptpay", label: "PromptPay QR", description: "สแกนจ่ายได้ทันที" },
      { value: "bank", label: "โอนผ่านบัญชี", description: "โอนเข้าบัญชีธนาคาร" },
    ],
    []
  );

  const orderIdSafe = order?.id || order?._id || "";
  const paymentStatus = normalizePaymentStatus(order?.payment?.status, order?.total);
  const isPaid = ["paid", "cash"].includes(paymentStatus);
  const amountDue = Number(order?.total || 0);
  const awaitingReview = paymentStatus === "verifying";
  const needsAmountInput = amountDue > 0;

  useEffect(() => {
    if (!order) return;
    setPaymentMethod(order.payment?.method || "promptpay");
    const normalized = normalizePaymentStatus(order.payment?.status, order?.total);
    if (!["paid", "cash"].includes(normalized)) {
      if (needsAmountInput) setTransferAmount(amountDue.toFixed(2));
      else setTransferAmount("");
    }
    if (["paid", "cash"].includes(normalized)) {
      setSlipData("");
      setSlipName("");
      setReference("");
    }
  }, [order, amountDue, needsAmountInput]);

  useEffect(() => {
    if (!awaitingReview) setEditingPayment(false);
  }, [awaitingReview]);

  useEffect(() => {
    if (!orderIdSafe || isPaid) {
      setPaymentInfo(null);
      setLoadingPayment(false);
      return;
    }
    let ignore = false;
    setLoadingPayment(true);
    (async () => {
      try {
        const res = await fetch(`/api/orders/${orderIdSafe}/payment`, { cache: "no-store" });
        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : null;
        if (!res.ok || !data?.ok) throw new Error(data?.error || "ไม่สามารถโหลดข้อมูลการชำระเงินได้");
        if (ignore) return;
        setPaymentInfo(data);
        setPaymentMethod(data.method || order.payment?.method || "promptpay");
        setActionErr("");
      } catch (e) {
        if (!ignore) setActionErr(String(e.message || e));
      } finally {
        if (!ignore) setLoadingPayment(false);
      }
    })();
    return () => { ignore = true; };
  }, [orderIdSafe, order?.payment?.method, order?.payment?.status, isPaid]);

  async function handleSelectMethod(nextMethod) {
    if (!orderIdSafe) return;
    if (paymentMethod === nextMethod && order?.payment?.method === nextMethod) return;

    setUpdatingMethod(true);
    setActionErr("");
    setActionSuccess("");

    try {
      const res = await fetch(`/api/orders/${orderIdSafe}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: nextMethod }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : null;
      if (!res.ok || !data?.ok) throw new Error(data?.error || "ไม่สามารถเปลี่ยนวิธีการชำระเงินได้");

      setPaymentInfo(data);
      setPaymentMethod(data.method || nextMethod);
      setOrder((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          payment: {
            ...prev.payment,
            method: data.method || nextMethod,
            status: data.paymentStatus || (Number(prev.total || 0) > 0 ? "unpaid" : "paid"),
          },
        };
      });
      setSlipData("");
      setSlipName("");
      setReference("");
      if (needsAmountInput) setTransferAmount(amountDue.toFixed(2));
    } catch (e) {
      setActionErr(String(e.message || e));
      setPaymentMethod(order?.payment?.method || paymentMethod);
    } finally {
      setUpdatingMethod(false);
    }
  }

  async function processSlipFile(file) {
    if (!file) {
      setSlipData("");
      setSlipName("");
      return;
    }
    if (!file.type?.startsWith("image/")) {
      setActionErr("รองรับเฉพาะไฟล์รูปภาพเท่านั้น");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (typeof dataUrl !== "string") throw new Error("ไม่สามารถอ่านไฟล์ได้");
      setSlipData(dataUrl);
      setSlipName(file.name || "สลิปการโอน");
      setActionErr("");
      setActionSuccess("");
    } catch (e) {
      setActionErr(String(e.message || e));
      setSlipData("");
      setSlipName("");
    }
  }

  async function handleSlipChange(event) {
    const file = event.target.files?.[0];
    await processSlipFile(file);
    if (event?.target) event.target.value = ""; // อนุญาตเลือกไฟล์เดิมซ้ำ
  }

  async function confirmPayment() {
    if (!orderIdSafe) return;
    if (isPaid) {
      setActionErr("คำสั่งซื้อนี้ชำระเงินเรียบร้อยแล้ว");
      return;
    }
    if (!slipData) {
      setActionErr("กรุณาแนบสลิปการโอนก่อนยืนยัน");
      return;
    }
    if (needsAmountInput && !transferAmount) {
      setActionErr("กรุณากรอกจำนวนเงินที่โอน");
      return;
    }

    setConfirming(true);
    setActionErr("");
    setActionSuccess("");

    try {
      const res = await fetch(`/api/orders/${orderIdSafe}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slip: slipData,
          filename: slipName,
          amount: transferAmount,
          reference,
        }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : null;
      if (!res.ok || !data?.ok) throw new Error(data?.error || "ไม่สามารถยืนยันการชำระเงินได้");

      await reloadOrder();
      setActionSuccess("ส่งข้อมูลการชำระเงินเรียบร้อยแล้ว กรุณารอการตรวจสอบ");
      setSlipData("");
      setSlipName("");
      setReference("");
      setEditingPayment(false);
    } catch (e) {
      setActionErr(String(e.message || e));
    } finally {
      setConfirming(false);
    }
  }

  if (loading)
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[var(--color-burgundy-dark)]/60 text-[var(--color-text)]/70">
        กำลังโหลด...
      </main>
    );

  if (needsAuth && status !== "loading") {
    return (
      <main className="relative min-h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,200,105,0.12),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(58,16,16,0.7),transparent_55%),linear-gradient(140deg,rgba(20,2,2,0.95),rgba(58,16,16,0.85))]" />
        <div className="relative flex min-h-[60vh] items-center justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/75 p-10 text-center text-[var(--color-text)] shadow-2xl shadow-black/40 backdrop-blur">
            <h1 className="text-2xl font-semibold text-[var(--color-rose)]">เข้าสู่ระบบก่อนดูรายละเอียด</h1>
            <p className="mt-3 text-sm text-[var(--color-text)]/75">
              โปรดเข้าสู่ระบบเพื่อยืนยันตัวตนก่อนเข้าถึงรายละเอียดคำสั่งซื้อ
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-rose-dark)] px-5 py-3 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-[rgba(0,0,0,0.35)] hover:shadow-xl"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-rose)]/40 bg-[var(--color-burgundy-dark)]/50 px-5 py-3 text-sm font-semibold text-[var(--color-gold)] transition hover:bg-[var(--color-burgundy)]/60"
              >
                สมัครสมาชิกใหม่
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (err) return <main className="max-w-3xl mx-auto px-6 py-10 text-[var(--color-rose)]">{err}</main>;
  if (!order) return null;

  const normalizedStatus = normalizeStatus(order.status);
  const statusText = statusLabel[normalizedStatus] || normalizedStatus;
  const paymentText = paymentLabel[paymentStatus] || paymentStatus;
  const paymentBadgeClass =
    paymentStatus === "paid"
      ? "bg-[var(--color-gold)]/20 text-[var(--color-burgundy-dark)]"
      : paymentStatus === "cash"
      ? "bg-[var(--color-burgundy-dark)]/40 text-[var(--color-text)]/80"
      : paymentStatus === "invalid"
      ? "bg-[var(--color-rose)]/15 text-[var(--color-rose)]"
      : paymentStatus === "verifying"
      ? "bg-[var(--color-rose)]/10 text-[var(--color-text)]/75"
      : "bg-[var(--color-burgundy-dark)]/40 text-[var(--color-gold)]/80";

  return (
    <main className="relative min-h-[70vh] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,200,105,0.12),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(58,16,16,0.65),transparent_55%),linear-gradient(140deg,rgba(20,2,2,0.95),rgba(58,16,16,0.85))]" />
      <div className="absolute -top-24 right-16 h-64 w-64 rounded-full bg-[var(--color-rose)]/20 blur-3xl" />
      <div className="absolute -bottom-20 left-20 h-72 w-72 rounded-full bg-[var(--color-rose-dark)]/20 blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-rose)]">
              คำสั่งซื้อ #{(order.id || order._id).slice(-8)}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text)]/70">
              อัปเดตล่าสุดเมื่อ {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : "-"}
            </p>
          </div>
          <Link
            href="/orders"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-rose-dark)] px-5 py-2 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-[rgba(0,0,0,0.35)] transition hover:shadow-xl"
          >
            ← กลับไปหน้ารายการทั้งหมด
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <section className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-6 shadow-2xl shadow-black/40 backdrop-blur">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">สถานะคำสั่งซื้อ</h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  normalizedStatus === "cancel"
                    ? "bg-[var(--color-rose)]/15 text-[var(--color-rose)]"
                    : normalizedStatus === "success"
                    ? "bg-[var(--color-gold)]/20 text-[var(--color-burgundy-dark)]"
                    : "bg-[var(--color-burgundy-dark)]/40 text-[var(--color-text)]/80"
                }`}
              >
                {statusText}
              </span>
            </header>

            <div className="mt-4 grid gap-3 text-sm text-[var(--color-text)]/80">
              <div className="flex items-center justify-between rounded-2xl bg-[var(--color-burgundy-dark)]/35 px-4 py-3">
                <span>การชำระเงิน</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass}`}>
                  {paymentText}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[var(--color-burgundy-dark)]/30 px-4 py-3">
                <span>ช่องทาง</span>
                <span className="font-medium text-[var(--color-rose)]">
                  {paymentStatus === "cash"
                    ? "เงินสดหน้างาน"
                    : order.payment?.method === "bank"
                    ? "โอนผ่านธนาคาร"
                    : "พร้อมเพย์"}
                </span>
              </div>
              {typeof order.payment?.amountPaid === "number" ? (
                <div className="flex items-center justify-between rounded-2xl bg-[var(--color-burgundy-dark)]/35 px-4 py-3">
                  <span>จำนวนที่โอน</span>
                  <span className="font-semibold text-[var(--color-gold)]">฿{order.payment.amountPaid.toFixed(2)}</span>
                </div>
              ) : null}
              {order.payment?.confirmedAt ? (
                <div className="flex items-center justify-between rounded-2xl bg-[var(--color-burgundy-dark)]/40 px-4 py-3">
                  <span>ยืนยันเมื่อ</span>
                  <span>{new Date(order.payment.confirmedAt).toLocaleString()}</span>
                </div>
              ) : null}
            </div>

            {order.payment?.slip ? (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[var(--color-choco)]">สลิปการโอน</h3>
                <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy-dark)]/45 shadow-inner">
                  <img
                    src={order.payment.slip}
                    alt={order.payment.slipFilename || "หลักฐานการโอน"}
                    className="max-h-[420px] w-full object-contain"
                  />
                </div>
              </div>
            ) : null}

            {!isPaid ? (
              <div className="mt-6 space-y-4 rounded-2xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy-dark)]/30 p-5">
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-choco)]">
                    {awaitingReview ? "เรากำลังตรวจสอบการชำระเงินของคุณ" : "ชำระเงินสำหรับคำสั่งซื้อนี้"}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--color-choco)]/70">
                    {awaitingReview
                      ? "เราได้รับสลิปของคุณแล้ว ระบบกำลังตรวจสอบโดยทีมงาน หากต้องการแก้ไขสามารถส่งข้อมูลใหม่ได้"
                      : "เลือกช่องทางที่สะดวก แนบสลิป แล้วระบบจะบันทึกข้อมูลพร้อมรอทีมงานตรวจสอบให้โดยอัตโนมัติ"}
                  </p>
                </div>

                {paymentStatus === "verifying" ? (
                  <div className="space-y-3 rounded-2xl border border-[var(--color-rose)]/35 bg-[rgba(240,200,105,0.12)] px-4 py-3 text-xs text-[var(--color-gold)]">
                    <div className="font-semibold">สลิปของคุณอยู่ระหว่างการตรวจสอบ</div>
                    <p className="text-[var(--color-text)]/75">
                      ทีมงานจะยืนยันสถานะการชำระเงินให้โดยเร็วที่สุด หากมีข้อมูลผิดพลาดสามารถกด "แก้ไขข้อมูลการชำระเงิน" เพื่อส่งสลิปใหม่ได้
                    </p>
                    {!editingPayment ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPayment(true);
                          setSlipData("");
                          setSlipName("");
                          if (typeof order.payment?.amountPaid === "number") {
                            setTransferAmount(order.payment.amountPaid.toFixed(2));
                          } else if (needsAmountInput) {
                            setTransferAmount(amountDue.toFixed(2));
                          }
                          setReference(order.payment?.reference || "");
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-[var(--color-rose)]/40 bg-[var(--color-burgundy-dark)]/40 px-4 py-1.5 text-[var(--color-rose)] transition hover:bg-[var(--color-burgundy-dark)]/25"
                      >
                        แก้ไขข้อมูลการชำระเงิน
                      </button>
                    ) : null}
                  </div>
                ) : paymentStatus === "invalid" ? (
                  <div className="rounded-2xl border border-[var(--color-rose)]/40 bg-[rgba(120,32,32,0.55)] px-4 py-2 text-xs font-semibold text-[var(--color-rose)]">
                    ยอดโอนที่แจ้งมาไม่ตรงกับยอดที่ต้องชำระ กรุณาแนบสลิปใหม่อีกครั้ง
                  </div>
                ) : null}

                {(!awaitingReview || editingPayment) && (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {paymentOptions.map((option) => {
                        const active = paymentMethod === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelectMethod(option.value)}
                            disabled={
                              updatingMethod ||
                              confirming ||
                              paymentStatus === "cash" ||
                              (awaitingReview && !editingPayment)
                            }
                            className={`rounded-2xl border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/35 ${
                              active
                                ? "border-[var(--color-rose)] bg-[rgba(240,200,105,0.16)] text-[var(--color-rose)] shadow-lg shadow-black/40"
                                : "border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/55 text-[var(--color-text)]/80"
                            } ${updatingMethod || confirming ? "cursor-wait" : ""}`}
                          >
                            <div className="font-semibold">{option.label}</div>
                            <div className="mt-1 text-xs text-[var(--color-text)]/70">{option.description}</div>
                          </button>
                        );
                      })}
                    </div>

                    {loadingPayment ? (
                      <div className="rounded-2xl border border-dashed border-[var(--color-rose)]/40 bg-[var(--color-burgundy-dark)]/35 px-4 py-3 text-sm text-[var(--color-text)]/75">
                        กำลังโหลดรายละเอียดการชำระเงิน...
                      </div>
                    ) : paymentInfo?.promptpay ? (
                      <QrBox payload={paymentInfo.promptpay.payload} amount={paymentInfo.promptpay.amount} title="สแกนเพื่อชำระเงิน" />
                    ) : paymentMethod === "bank" && paymentInfo?.bankAccount ? (
                      <div className="space-y-2 rounded-2xl border border-[#f4c689]/50 bg-[rgba(240,200,105,0.12)] p-4 text-sm text-[var(--color-choco)]">
                        <div className="font-semibold text-[var(--color-rose-dark)]">รายละเอียดบัญชีสำหรับโอน</div>
                        <div>ธนาคาร: {paymentInfo.bankAccount.bank}</div>
                        <div>เลขบัญชี: {paymentInfo.bankAccount.number}</div>
                        <div>ชื่อบัญชี: {paymentInfo.bankAccount.name}</div>
                        {paymentInfo.bankAccount.promptpayId ? (
                          <div className="text-xs text-[var(--color-choco)]/60">หรือ PromptPay ID: {paymentInfo.bankAccount.promptpayId}</div>
                        ) : null}
                      </div>
                    ) : amountDue <= 0 ? (
                      <div className="rounded-2xl border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/30 px-4 py-3 text-sm text-[var(--color-text)]/75">
                        ออเดอร์นี้ไม่มียอดที่ต้องชำระเพิ่มเติม
                      </div>
                    ) : null}

                    <div className="space-y-2 text-sm">
                      <label className="font-medium">
                        {needsAmountInput ? "จำนวนเงินที่โอน" : "จำนวนเงิน (ถ้ามี)"}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="w-full rounded-2xl border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                          placeholder="กรอกจำนวนเงินที่โอน"
                        />
                        {needsAmountInput ? (
                          <button
                            type="button"
                            onClick={() => setTransferAmount(amountDue.toFixed(2))}
                            className="rounded-full border border-[var(--color-rose)]/40 px-3 py-1 text-xs text-[var(--color-rose)] transition hover:bg-[var(--color-burgundy-dark)]/35"
                          >
                            ใส่ยอดเต็ม
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <label className="font-medium">สลิปการโอน</label>
                      <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/40 p-4 text-xs text-[var(--color-text)]/70">
                        {slipData ? (
                          <div className="w-full space-y-2">
                            <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-burgundy-dark)]/60 px-3 py-2 text-[var(--color-text)]">
                              <div className="flex items-center gap-2 text-xs font-medium">
                                <ImageIcon className="h-3.5 w-3.5" />
                                <span>{slipName || "สลิปการโอน"}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSlipData("");
                                  setSlipName("");
                                }}
                                className="inline-flex items-center gap-1 rounded-full border border-[var(--color-rose)]/35 px-2 py-1 text-[var(--color-rose)] transition hover:bg-[var(--color-burgundy-dark)]/40"
                              >
                                <XIcon className="h-3 w-3" />
                                ลบไฟล์
                              </button>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-[var(--color-rose)]/20 bg-black/20">
                              <img src={slipData} alt={slipName || "หลักฐานการโอน"} className="max-h-72 w-full object-contain" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <p>แนบรูปสลิปเพื่อยืนยันการโอนเงิน (รองรับไฟล์ .jpg, .png)</p>
                            <label
                              htmlFor="slip"
                              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-gold)] px-4 py-2 text-xs font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-[rgba(240,200,105,0.35)] transition hover:shadow-xl"
                            >
                              <UploadIcon className="h-4 w-4" />
                              แนบสลิปการโอน
                            </label>
                            <input id="slip" type="file" accept="image/*" className="hidden" onChange={handleSlipChange} />
                          </>
                        )}
                        {slipData ? (
                          <label
                            htmlFor="slip"
                            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[var(--color-rose)]/40 bg-[var(--color-burgundy-dark)]/45 px-4 py-1.5 text-xs font-semibold text-[var(--color-rose)] hover:bg-[var(--color-burgundy-dark)]/30"
                          >
                            <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                            เปลี่ยนรูป
                          </label>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <label className="font-medium">หมายเลขอ้างอิงการโอน (ถ้ามี)</label>
                      <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="w-full rounded-2xl border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                        placeholder="เช่น เลขที่รายการ หรือเลขอ้างอิงจากแอปธนาคาร"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        onClick={confirmPayment}
                        disabled={
                          confirming ||
                          updatingMethod ||
                          loadingPayment ||
                          !slipData ||
                          (needsAmountInput && !transferAmount)
                        }
                        className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(240,200,105,0.33)] transition sm:w-auto ${
                          confirming ||
                          updatingMethod ||
                          loadingPayment ||
                          !slipData ||
                          (needsAmountInput && !transferAmount)
                            ? "cursor-not-allowed bg-[var(--color-burgundy-dark)]/30"
                            : "bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-gold)] hover:shadow-xl"
                        }`}
                      >
                        {confirming
                          ? "กำลังยืนยัน..."
                          : updatingMethod
                          ? "กำลังอัปเดตวิธีชำระเงิน..."
                          : awaitingReview
                          ? "ส่งสลิปใหม่"
                          : "ยืนยันการชำระเงิน"}
                      </button>
                      {awaitingReview ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPayment(false);
                            setSlipData("");
                            setSlipName("");
                            if (typeof order.payment?.amountPaid === "number") {
                              setTransferAmount(order.payment.amountPaid.toFixed(2));
                            } else if (needsAmountInput) {
                              setTransferAmount(amountDue.toFixed(2));
                            } else {
                              setTransferAmount("");
                            }
                            setReference(order.payment?.reference || "");
                          }}
                          className="inline-flex items-center justify-center rounded-full border border-[var(--color-rose)]/40 px-6 py-3 text-sm font-semibold text-[var(--color-rose)] transition hover:bg-[var(--color-burgundy-dark)]/35"
                        >
                          ยกเลิกการแก้ไข
                        </button>
                      ) : null}
                    </div>
                  </>
                )}

                {actionSuccess ? <div className="text-sm text-[var(--color-gold)]">{actionSuccess}</div> : null}
                {actionErr ? <div className="text-sm text-[var(--color-rose)]">{actionErr}</div> : null}
              </div>
            ) : null}
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-6 shadow-2xl shadow-black/40 backdrop-blur">
              <h2 className="text-lg font-semibold text-[var(--color-choco)]">รายละเอียดยอดชำระ</h2>
              <div className="mt-4 space-y-3 text-sm text-[var(--color-choco)]/80">
                <div className="flex justify-between">
                  <span>รวม</span>
                  <span>฿{order.subtotal}</span>
                </div>
                {order.discount ? (
                  <div className="flex justify-between text-[var(--color-gold)]">
                    <span>ส่วนลด</span>
                    <span>-฿{order.discount}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-base font-semibold text-[var(--color-rose-dark)]">
                  <span>ยอดสุทธิ</span>
                  <span>฿{order.total}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-6 shadow-2xl shadow-black/40 backdrop-blur">
              <h2 className="text-lg font-semibold text-[var(--color-choco)]">ข้อมูลจัดส่ง</h2>
              <div className="mt-4 space-y-2 text-sm text-[var(--color-choco)]/80">
                <div>
                  <div className="font-semibold">{order.customer?.name || "-"}</div>
                  <div>{order.customer?.phone || ""}</div>
                  <div>{order.customer?.email || ""}</div>
                </div>
                <div className="rounded-2xl bg-[var(--color-burgundy-dark)]/35 p-4 text-sm leading-relaxed">
                  <p>{order.shipping?.address1}</p>
                  {order.shipping?.address2 ? <p>{order.shipping.address2}</p> : null}
                  <p>
                    {order.shipping?.district || ""} {order.shipping?.province || ""} {order.shipping?.postcode || ""}
                  </p>
                  {order.shipping?.note ? (
                    <p className="mt-2 text-xs text-[var(--color-choco)]/60">หมายเหตุ: {order.shipping.note}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-6 shadow-2xl shadow-black/40 backdrop-blur">
              <h2 className="text-lg font-semibold text-[var(--color-choco)]">รายการสินค้า</h2>
              <div className="mt-4 divide-y divide-[var(--color-rose)]/10">
                {order.items.map((it, idx) => (
                  <div
                    key={`${order.id || order._id}-${it.productId || it.title}-${idx}`}
                    className="flex flex-col gap-2 py-4 text-sm text-[var(--color-choco)]/80 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-medium text-[var(--color-choco)]">{it.title}</div>
                      <div className="text-xs text-[var(--color-choco)]/60">จำนวน {it.qty}</div>
                    </div>
                    <div className="text-sm font-semibold text-[var(--color-rose-dark)]">฿{(it.price || 0) * (it.qty || 0)}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

      </div>
    </main>
  );
}
