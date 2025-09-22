"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const { status } = useSession();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/my/orders/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (res.status === 401) {
          setNeedsAuth(true);
          return;
        }
        if (!res.ok) throw new Error(data?.error || "Load order failed");
        setOrder(data);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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
                  order.status === "cancelled"
                    ? "bg-rose-100 text-rose-600"
                    : order.status === "done"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-[#ecfdf5] text-emerald-600"
                }`}
              >
                {statusLabel[order.status] || order.status}
              </span>
            </header>
            <div className="mt-4 grid gap-3 text-sm text-[var(--color-choco)]/80">
              <div className="flex items-center justify-between rounded-2xl bg-[#fff6ee] px-4 py-3">
                <span>การชำระเงิน</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    order.payment?.status === "paid"
                      ? "bg-emerald-100 text-emerald-600"
                      : order.payment?.status === "failed"
                      ? "bg-rose-100 text-rose-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {paymentLabel[order.payment?.status] || order.payment?.status}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#fef9ff] px-4 py-3">
                <span>ช่องทาง</span>
                <span className="font-medium text-[var(--color-rose-dark)]">
                  {order.payment?.method === "bank" ? "โอนผ่านธนาคาร" : "พร้อมเพย์"}
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
