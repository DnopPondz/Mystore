"use client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";

const normalizeStatus = (status) => {
  const map = { preparing: "pending", shipped: "shipping", done: "success", cancelled: "cancel" };
  return map[status] || status;
};

const normalizePaymentStatus = (status, total) => {
  const map = { pending: "unpaid", failed: "invalid" };
  const fallback = Number(total || 0) > 0 ? "unpaid" : "paid";
  return map[status] || status || fallback;
};

const formatCurrency = (value) =>
  `฿${Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const { status } = useSession();

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch("/api/my/orders", { cache: "no-store" });
        const data = await res.json();
        if (ignore) return;
        if (res.status === 401) {
          setNeedsAuth(true);
          setOrders([]);
          return;
        }
        if (!res.ok) throw new Error(data?.error || "Load orders failed");
        setOrders(data);
      } catch (e) {
        if (!ignore) setErr(String(e.message || e));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (status === "loading") {
      return () => {
        ignore = true;
      };
    }

    if (status !== "authenticated") {
      setNeedsAuth(true);
      setOrders([]);
      setLoading(false);
      return () => {
        ignore = true;
      };
    }

    setNeedsAuth(false);
    loadOrders();

    return () => {
      ignore = true;
    };
  }, [status]);

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
            <h1 className="text-2xl font-semibold text-[var(--color-rose)]">เข้าสู่ระบบเพื่อดูคำสั่งซื้อ</h1>
            <p className="mt-3 text-sm text-[var(--color-text)]/75">
              บัญชีผู้ใช้จำเป็นสำหรับเชื่อมคำสั่งซื้อกับคุณ กรุณาเข้าสู่ระบบหรือสมัครสมาชิกใหม่เพื่อดูประวัติการสั่งซื้อทั้งหมดของคุณ
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

  if (err)
    return (
      <main className="flex min-h-[60vh] items-center justify-center text-rose-600">
        {err}
      </main>
    );

  return (
    <main className="relative min-h-[70vh] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,200,105,0.12),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(58,16,16,0.65),transparent_55%),linear-gradient(140deg,rgba(20,2,2,0.95),rgba(58,16,16,0.85))]" />
      <div className="absolute -top-24 right-20 h-60 w-60 rounded-full bg-[var(--color-rose)]/20 blur-3xl" />
      <div className="absolute -bottom-20 left-12 h-72 w-72 rounded-full bg-[var(--color-rose-dark)]/20 blur-3xl" />

      <div className="relative max-w-screen-xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-rose)]">คำสั่งซื้อของฉัน</h1>
            <p className="mt-1 text-sm text-[var(--color-text)]/70">
              ติดตามสถานะคำสั่งซื้อและดูรายละเอียดการชำระเงินย้อนหลังได้ที่นี่
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-rose-dark)] px-5 py-3 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-[rgba(0,0,0,0.35)] transition hover:shadow-xl"
          >
            เลือกสินค้าเพิ่ม
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-3xl bg-white/85 p-10 text-center shadow-lg shadow-[rgba(240,200,105,0.22)]">
            <p className="text-lg font-semibold text-[var(--color-choco)]">
              ยังไม่มีคำสั่งซื้อ
            </p>
            <p className="mt-2 text-sm text-[var(--color-choco)]/70">
              เริ่มต้นสั่งขนมแสนอร่อยได้เลยที่
              <Link href="/" className="ml-1 underline">
                หน้าหลัก
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {orders.map((o) => {
              const orderId = o?.id || o?._id || "";
              const createdAt = o?.createdAt ? new Date(o.createdAt) : null;
              const normalizedStatus = normalizeStatus(o?.status);
              const paymentStatus = normalizePaymentStatus(o?.payment?.status, o?.total);
              const displayPayment = paymentLabel[paymentStatus] || paymentStatus;
              const displayStatus = statusLabel[normalizedStatus] || normalizedStatus;
              const isPreorder = Boolean(o?.preorder);
              const planLabel =
                o?.preorder?.paymentPlan === "half"
                  ? "มัดจำ 50%"
                  : o?.preorder?.paymentPlan === "full"
                  ? "ชำระเต็มจำนวน"
                  : null;
              const orderTotal = Number.isFinite(Number(o?.total)) ? Number(o.total) : 0;
              const depositAmount = Number(o?.preorder?.depositAmount ?? orderTotal);
              const quotedTotal = Number(o?.preorder?.quotedTotal ?? depositAmount);
              const remaining = Number(o?.preorder?.balanceAmount ?? 0);

              return (
                <Link
                  href={`/orders/${orderId}`}
                  key={orderId}
                  className="group block rounded-3xl bg-white/90 p-6 shadow-lg shadow-[rgba(240,200,105,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm uppercase tracking-[0.2em] text-[var(--color-rose)]">Order</div>
                      <div className="text-xl font-semibold text-[var(--color-choco)]">
                        #{orderId.slice(-8)}
                      </div>
                      {isPreorder ? (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-rose)]/15 px-3 py-1 text-xs font-semibold text-[var(--color-rose-dark)]">
                          🗓️ Pre-order{planLabel ? ` · ${planLabel}` : ""}
                        </div>
                      ) : null}
                    </div>
                    <span className="rounded-full bg-[var(--color-burgundy-dark)]/45 px-3 py-1 text-xs font-semibold text-[var(--color-text)]/80">
                      {createdAt ? createdAt.toLocaleDateString() : "-"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[var(--color-choco)]/70">
                    <div className="flex items-center justify-between">
                      <span>{isPreorder ? "ยอดมัดจำรอบนี้" : "ยอดสุทธิ"}</span>
                      <span className="font-semibold text-[var(--color-rose-dark)]">
                        {formatCurrency(isPreorder ? depositAmount : o.total)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>สถานะ</span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          normalizedStatus === "cancel"
                            ? "bg-[var(--color-rose)]/15 text-[var(--color-rose)]"
                            : normalizedStatus === "success"
                            ? "bg-[var(--color-gold)]/20 text-[var(--color-burgundy-dark)]"
                            : "bg-[var(--color-burgundy-dark)]/40 text-[var(--color-text)]/80"
                        }`}
                      >
                        {displayStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>การชำระเงิน</span>
                      <span
                        className={`rounded-full px-2 py-1 font-semibold ${
                          paymentStatus === "paid"
                            ? "bg-[var(--color-gold)]/20 text-[var(--color-burgundy-dark)]"
                            : paymentStatus === "cash"
                            ? "bg-[var(--color-burgundy-dark)]/40 text-[var(--color-text)]/80"
                            : paymentStatus === "invalid"
                            ? "bg-[var(--color-rose)]/15 text-[var(--color-rose)]"
                            : paymentStatus === "verifying"
                            ? "bg-[var(--color-rose)]/10 text-[var(--color-text)]/75"
                            : "bg-[var(--color-burgundy-dark)]/40 text-[var(--color-gold)]/80"
                        }`}
                      >
                        {displayPayment}
                      </span>
                    </div>
                    {isPreorder ? (
                      <div className="space-y-1 rounded-2xl bg-[var(--color-rose)]/10 px-3 py-2 text-xs text-[var(--color-choco)]/70">
                        <div className="flex items-center justify-between">
                          <span>ยอดใบเสนอราคา</span>
                          <span className="font-semibold text-[var(--color-rose-dark)]">
                            {formatCurrency(quotedTotal)}
                          </span>
                        </div>
                        {remaining > 0 ? (
                          <div className="flex items-center justify-between">
                            <span>ยอดคงเหลือ</span>
                            <span className="font-semibold text-[var(--color-choco)]">
                              {formatCurrency(remaining)}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 line-clamp-2 text-xs text-[var(--color-choco)]/60">
                    {o.items.map((it, idx) => (
                      <span key={`${orderId}-${it.productId || it.title}-${idx}`}>
                        {it.title} × {it.qty}
                        {idx < o.items.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                  {promotionDiscount > 0 || couponDiscount > 0 ? (
                    <div className="mt-2 text-xs text-[var(--color-choco)]/60">
                      {promotionDiscount > 0 ? (
                        <span>🎁 โปรโมชัน -{formatCurrency(promotionDiscount)}</span>
                      ) : null}
                      {couponDiscount > 0 ? (
                        <span>
                          {promotionDiscount > 0 ? " · " : ""}คูปอง -{formatCurrency(couponDiscount)}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  {paymentStatus === "unpaid" ? (
                    <div className="mt-4 text-xs font-semibold text-[var(--color-rose-dark)]/80">
                      แตะเพื่อแนบสลิปและยืนยันการชำระเงิน
                    </div>
                  ) : paymentStatus === "verifying" ? (
                    <div className="mt-4 text-xs font-semibold text-amber-600">
                      รอทีมงานตรวจสอบสลิปที่ส่งมา
                    </div>
                  ) : paymentStatus === "invalid" ? (
                    <div className="mt-4 text-xs font-semibold text-rose-600">
                      ยอดโอนไม่ถูกต้อง กรุณาอัปโหลดสลิปใหม่
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
