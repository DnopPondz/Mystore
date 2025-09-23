"use client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";

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
      new: "รอจัดเตรียม",
      preparing: "กำลังจัดเตรียม",
      shipped: "กำลังจัดส่ง",
      done: "จัดส่งสำเร็จ",
      cancelled: "ยกเลิก",
    }),
    []
  );

  const paymentLabel = useMemo(
    () => ({
      pending: "รอยืนยัน",
      paid: "ชำระแล้ว",
      failed: "ไม่สำเร็จ",
    }),
    []
  );

  if (loading)
    return (
      <main className="flex min-h-[60vh] items-center justify-center text-[var(--color-choco)]/70">
        กำลังโหลด...
      </main>
    );

  if (needsAuth && status !== "loading") {
    return (
      <main className="relative min-h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ffe9f2] via-[#fff7f0] to-[#ffe1d0]" />
        <div className="relative flex min-h-[60vh] items-center justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-3xl bg-white/90 p-10 text-center shadow-xl shadow-[#f0658320]">
            <h1 className="text-2xl font-semibold text-[var(--color-rose-dark)]">เข้าสู่ระบบเพื่อดูคำสั่งซื้อ</h1>
            <p className="mt-3 text-sm text-[var(--color-choco)]/70">
              บัญชีผู้ใช้จำเป็นสำหรับเชื่อมคำสั่งซื้อกับคุณ กรุณาเข้าสู่ระบบหรือสมัครสมาชิกใหม่เพื่อดูประวัติการสั่งซื้อทั้งหมดของคุณ
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

  if (err)
    return (
      <main className="flex min-h-[60vh] items-center justify-center text-rose-600">
        {err}
      </main>
    );

  return (
    <main className="relative min-h-[70vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ffe9f2] via-[#fff7f0] to-[#ffe1d0]" />
      <div className="absolute -top-24 right-20 h-60 w-60 rounded-full bg-[#f06583]/15 blur-3xl" />
      <div className="absolute -bottom-20 left-12 h-72 w-72 rounded-full bg-[#f6c34a]/20 blur-3xl" />

      <div className="relative max-w-screen-xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-rose-dark)]">คำสั่งซื้อของฉัน</h1>
            <p className="mt-1 text-sm text-[var(--color-choco)]/70">
              ติดตามสถานะคำสั่งซื้อและดูรายละเอียดการชำระเงินย้อนหลังได้ที่นี่
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-rose)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#f0658333] hover:bg-[var(--color-rose-dark)]"
          >
            เลือกสินค้าเพิ่ม
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-3xl bg-white/85 p-10 text-center shadow-lg shadow-[#f0658322]">
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
              const paymentStatus = o?.payment?.status || "pending";
              const displayPayment = paymentLabel[paymentStatus] || paymentStatus;
              const displayStatus = statusLabel[o?.status] || o?.status;

              return (
                <Link
                  href={`/orders/${orderId}`}
                  key={orderId}
                  className="group block rounded-3xl bg-white/90 p-6 shadow-lg shadow-[#f065831a] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm uppercase tracking-[0.2em] text-[var(--color-rose)]">Order</div>
                      <div className="text-xl font-semibold text-[var(--color-choco)]">
                        #{orderId.slice(-8)}
                      </div>
                    </div>
                    <span className="rounded-full bg-[#fff1dd] px-3 py-1 text-xs font-semibold text-[var(--color-choco)]/80">
                      {createdAt ? createdAt.toLocaleDateString() : "-"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[var(--color-choco)]/70">
                    <div className="flex items-center justify-between">
                      <span>ยอดสุทธิ</span>
                      <span className="font-semibold text-[var(--color-rose-dark)]">฿{o.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>สถานะ</span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          o.status === "cancelled"
                            ? "bg-rose-100 text-rose-600"
                            : o.status === "done"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-[#ecfdf5] text-emerald-600"
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
                            ? "bg-emerald-100 text-emerald-600"
                            : paymentStatus === "failed"
                            ? "bg-rose-100 text-rose-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {displayPayment}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 line-clamp-2 text-xs text-[var(--color-choco)]/60">
                    {o.items.map((it, idx) => (
                      <span key={`${orderId}-${it.productId || it.title}-${idx}`}>
                        {it.title} × {it.qty}
                        {idx < o.items.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                  {paymentStatus === "pending" ? (
                    <div className="mt-4 text-xs font-semibold text-[var(--color-rose-dark)]/80">
                      แตะเพื่อแนบสลิปและยืนยันการชำระเงิน
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
