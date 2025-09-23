"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import QrBox from "@/components/QrBox";

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
        if (e?.status && e.status !== 401) {
          setErr(String(e.message || e));
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
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
      if (needsAmountInput) {
        setTransferAmount(amountDue.toFixed(2));
      } else {
        setTransferAmount("");
      }
    }
    if (["paid", "cash"].includes(normalized)) {
      setSlipData("");
      setSlipName("");
      setReference("");
    }
  }, [order, amountDue, needsAmountInput]);

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

    return () => {
      ignore = true;
    };
  }, [orderIdSafe, order?.payment?.method, order?.payment?.status, isPaid]);

  async function handleSelectMethod(nextMethod) {
    if (!orderIdSafe) return;
    if (paymentMethod === nextMethod && order?.payment?.method === nextMethod) {
      return;
    }

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
      if (needsAmountInput) {
        setTransferAmount(amountDue.toFixed(2));
      }
    } catch (e) {
      setActionErr(String(e.message || e));
      setPaymentMethod(order?.payment?.method || paymentMethod);
    } finally {
      setUpdatingMethod(false);
    }
  }

  async function handleSlipChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setSlipData("");
      setSlipName("");
      return;
    }

    if (!file.type?.startsWith("image/")) {
      setActionErr("รองรับเฉพาะไฟล์รูปภาพเท่านั้น");
      event.target.value = "";
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
      event.target.value = "";
    }
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
    } catch (e) {
      setActionErr(String(e.message || e));
    } finally {
      setConfirming(false);
    }
  }

  if (loading)
    return <main className="max-w-3xl mx-auto px-6 py-10 text-[var(--color-choco)]/70">กำลังโหลด...</main>;

  if (needsAuth && status !== "loading") {
    return (
      <main className="relative min-h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ffe9f2] via-[#fff7f0] to-[#ffe1d0]" />
        <div className="relative flex min-h-[60vh] items-center justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-3xl bg-white/90 p-10 text-center shadow-xl shadow-[#f0658320]">
            <h1 className="text-2xl font-semibold text-[var(--color-rose-dark)]">เข้าสู่ระบบก่อนดูรายละเอียด</h1>
            <p className="mt-3 text-sm text-[var(--color-choco)]/70">
              โปรดเข้าสู่ระบบเพื่อยืนยันตัวตนก่อนเข้าถึงรายละเอียดคำสั่งซื้อ
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-rose)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#f0658333] hover:bg-[var(--color-rose-dark)]"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-rose)] px-5 py-3 text-sm font-semibold text-[var(--color-rose-dark)] hover:bg-[var(--color-rose)]/10"
              >
                สมัครสมาชิกใหม่
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (err) return <main className="max-w-3xl mx-auto px-6 py-10 text-rose-600">{err}</main>;
  if (!order) return null;

  const normalizedStatus = normalizeStatus(order.status);
  const statusText = statusLabel[normalizedStatus] || normalizedStatus;
  const paymentText = paymentLabel[paymentStatus] || paymentStatus;
  const paymentBadgeClass =
    paymentStatus === "paid"
      ? "bg-emerald-100 text-emerald-600"
      : paymentStatus === "cash"
      ? "bg-sky-100 text-sky-600"
      : paymentStatus === "invalid"
      ? "bg-rose-100 text-rose-600"
      : paymentStatus === "verifying"
      ? "bg-[#fff1dd] text-[var(--color-choco)]"
      : "bg-amber-100 text-amber-600";

  return (
    <main className="relative min-h-[70vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ffe9f2] via-[#fff7f0] to-[#ffe1d0]" />
      <div className="absolute -top-24 right-16 h-64 w-64 rounded-full bg-[#f06583]/15 blur-3xl" />
      <div className="absolute -bottom-20 left-20 h-72 w-72 rounded-full bg-[#f6c34a]/20 blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-rose-dark)]">
              คำสั่งซื้อ #{(order.id || order._id).slice(-8)}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-choco)]/70">
              อัปเดตล่าสุดเมื่อ {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : "-"}
            </p>
          </div>
          <Link
            href="/orders"
            className="inline-flex items-center justify-center rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-[var(--color-rose-dark)] shadow hover:bg-white"
          >
            ← กลับไปหน้ารายการทั้งหมด
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <section className="rounded-3xl bg-white/95 p-6 shadow-lg shadow-[#f0658315]">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--color-choco)]">สถานะคำสั่งซื้อ</h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  normalizedStatus === "cancel"
                    ? "bg-rose-100 text-rose-600"
                    : normalizedStatus === "success"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-[#ecfdf5] text-emerald-600"
                }`}
              >
                {statusText}
              </span>
            </header>
            <div className="mt-4 grid gap-3 text-sm text-[var(--color-choco)]/80">
              <div className="flex items-center justify-between rounded-2xl bg-[#fff6ee] px-4 py-3">
                <span>การชำระเงิน</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass}`}>
                  {paymentText}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#fef9ff] px-4 py-3">
                <span>ช่องทาง</span>
                <span className="font-medium text-[var(--color-rose-dark)]">
                  {paymentStatus === "cash"
                    ? "เงินสดหน้างาน"
                    : order.payment?.method === "bank"
                    ? "โอนผ่านธนาคาร"
                    : "พร้อมเพย์"}
                </span>
              </div>
              {typeof order.payment?.amountPaid === "number" ? (
                <div className="flex items-center justify-between rounded-2xl bg-[#ecfdf5] px-4 py-3">
                  <span>จำนวนที่โอน</span>
                  <span className="font-semibold text-emerald-600">฿{order.payment.amountPaid.toFixed(2)}</span>
                </div>
              ) : null}
              {order.payment?.confirmedAt ? (
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <span>ยืนยันเมื่อ</span>
                  <span>{new Date(order.payment.confirmedAt).toLocaleString()}</span>
                </div>
              ) : null}
            </div>

            {order.payment?.slip ? (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[var(--color-choco)]">สลิปการโอน</h3>
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/60 shadow-inner">
                  <img
                    src={order.payment.slip}
                    alt={order.payment.slipFilename || "หลักฐานการโอน"}
                    className="max-h-[420px] w-full object-contain bg-white"
                  />
                </div>
              </div>
            ) : null}

            {!isPaid ? (
              <div className="mt-6 space-y-4 rounded-2xl border border-[var(--color-rose)]/25 bg-[#fff9fb] p-5">
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-choco)]">ชำระเงินสำหรับคำสั่งซื้อนี้</h3>
                  <p className="mt-1 text-xs text-[var(--color-choco)]/70">
                    เลือกช่องทางที่สะดวก แนบสลิป แล้วระบบจะบันทึกข้อมูลพร้อมรอทีมงานตรวจสอบให้โดยอัตโนมัติ
                  </p>
                </div>

                {awaitingReview ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
                    สลิปของคุณอยู่ระหว่างการตรวจสอบ หากต้องการแก้ไขสามารถอัปโหลดใหม่ได้เลย
                  </div>
                ) : paymentStatus === "invalid" ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700">
                    ยอดโอนที่แจ้งมาไม่ตรงกับยอดที่ต้องชำระ กรุณาแนบสลิปใหม่อีกครั้ง
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {paymentOptions.map((option) => {
                    const active = paymentMethod === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectMethod(option.value)}
                        disabled={updatingMethod || confirming || awaitingReview || paymentStatus === "cash"}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/30 ${
                          active
                            ? "border-[var(--color-rose)] bg-[#fff1f5] text-[var(--color-rose-dark)] shadow"
                            : "border-[#f7b267]/60 bg-white text-[var(--color-choco)]/80"
                        } ${updatingMethod || confirming ? "cursor-wait" : ""}`}
                      >
                        <div className="font-semibold">{option.label}</div>
                        <div className="mt-1 text-xs text-[var(--color-choco)]/60">{option.description}</div>
                      </button>
                    );
                  })}
                </div>

                {loadingPayment ? (
                  <div className="rounded-2xl border border-dashed border-[var(--color-rose)]/40 bg-white/70 px-4 py-3 text-sm text-[var(--color-choco)]/70">
                    กำลังโหลดรายละเอียดการชำระเงิน...
                  </div>
                ) : paymentInfo?.promptpay ? (
                  <QrBox payload={paymentInfo.promptpay.payload} amount={paymentInfo.promptpay.amount} title="สแกนเพื่อชำระเงิน" />
                ) : paymentMethod === "bank" && paymentInfo?.bankAccount ? (
                  <div className="space-y-2 rounded-2xl border border-[#f7b267]/50 bg-[#fff8f1] p-4 text-sm text-[var(--color-choco)]">
                    <div className="font-semibold text-[var(--color-rose-dark)]">รายละเอียดบัญชีสำหรับโอน</div>
                    <div>ธนาคาร: {paymentInfo.bankAccount.bank}</div>
                    <div>เลขบัญชี: {paymentInfo.bankAccount.number}</div>
                    <div>ชื่อบัญชี: {paymentInfo.bankAccount.name}</div>
                    {paymentInfo.bankAccount.promptpayId ? (
                      <div className="text-xs text-[var(--color-choco)]/60">หรือ PromptPay ID: {paymentInfo.bankAccount.promptpayId}</div>
                    ) : null}
                  </div>
                ) : amountDue <= 0 ? (
                  <div className="rounded-2xl border border-[#f7b267]/40 bg-[#fff9f4] px-4 py-3 text-sm text-[var(--color-choco)]/70">
                    ออเดอร์นี้ไม่มียอดที่ต้องชำระเพิ่มเติม
                  </div>
                ) : null}

                {needsAmountInput ? (
                  <div className="space-y-2 text-sm">
                    <label className="font-medium">จำนวนเงินที่โอน (บาท) *</label>
                    <input
                      type="text"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full rounded-2xl border border-[#f7b267]/60 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/30"
                      placeholder={`ยอดที่ต้องชำระ ฿${fmt(amountDue)}`}
                    />
                    <p className="text-xs text-[var(--color-choco)]/60">ยอดที่ต้องชำระทั้งหมด ฿{fmt(amountDue)}</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#f7b267]/40 bg-[#fff9f4] px-4 py-3 text-sm text-[var(--color-choco)]/70">
                    ออเดอร์นี้ไม่มียอดที่ต้องชำระเพิ่มเติม
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <label className="font-medium">หมายเลขอ้างอิงการโอน (ถ้ามี)</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full rounded-2xl border border-[#f7b267]/60 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/30"
                    placeholder="เช่น เลขที่รายการ หรือเลขอ้างอิงจากแอปธนาคาร"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <label className="font-medium">แนบสลิปการโอน *</label>
                  <input type="file" accept="image/*" onChange={handleSlipChange} className="text-sm" />
                  {slipName ? <div className="text-xs text-[var(--color-choco)]/60">ไฟล์: {slipName}</div> : null}
                </div>

                <button
                  onClick={confirmPayment}
                  disabled={
                    confirming ||
                    updatingMethod ||
                    loadingPayment ||
                    !slipData ||
                    (needsAmountInput && !transferAmount)
                  }
                  className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#f0658333] transition ${
                    confirming || updatingMethod || loadingPayment || !slipData || (needsAmountInput && !transferAmount)
                      ? "cursor-not-allowed bg-[#f3b6c7]"
                      : "bg-gradient-to-r from-[#f06583] to-[#f6c34a] hover:shadow-xl"
                  }`}
                >
                  {confirming ? "กำลังยืนยัน..." : updatingMethod ? "กำลังอัปเดตวิธีชำระเงิน..." : "ยืนยันการชำระเงิน"}
                </button>

                {actionSuccess ? <div className="text-sm text-emerald-600">{actionSuccess}</div> : null}
                {actionErr ? <div className="text-sm text-rose-600">{actionErr}</div> : null}
              </div>
            ) : null}

          </section>

          <section className="space-y-6">
            <div className="rounded-3xl bg-white/95 p-6 shadow-lg shadow-[#f0658315]">
              <h2 className="text-lg font-semibold text-[var(--color-choco)]">รายละเอียดยอดชำระ</h2>
              <div className="mt-4 space-y-3 text-sm text-[var(--color-choco)]/80">
                <div className="flex justify-between">
                  <span>รวม</span>
                  <span>฿{order.subtotal}</span>
                </div>
                {order.discount ? (
                  <div className="flex justify-between text-emerald-600">
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

            <div className="rounded-3xl bg-white/95 p-6 shadow-lg shadow-[#f0658315]">
              <h2 className="text-lg font-semibold text-[var(--color-choco)]">ข้อมูลจัดส่ง</h2>
              <div className="mt-4 space-y-2 text-sm text-[var(--color-choco)]/80">
                <div>
                  <div className="font-semibold">{order.customer?.name || "-"}</div>
                  <div>{order.customer?.phone || ""}</div>
                  <div>{order.customer?.email || ""}</div>
                </div>
                <div className="rounded-2xl bg-[#fff6ee] p-4 text-sm leading-relaxed">
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
          </section>
        </div>

        <section className="mt-10 rounded-3xl bg-white/95 p-6 shadow-lg shadow-[#f0658315]">
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
        </section>
      </div>
    </main>
  );
}
