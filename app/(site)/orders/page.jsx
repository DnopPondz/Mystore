"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/my/orders", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Load orders failed");
        setOrders(data);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <main className="flex min-h-[60vh] items-center justify-center text-[var(--color-choco)]/70">
        กำลังโหลด...
      </main>
    );
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
            {orders.map((o) => (
              <Link
                href={`/orders/${o._id}`}
                key={o._id}
                className="group block rounded-3xl bg-white/90 p-6 shadow-lg shadow-[#f065831a] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm uppercase tracking-[0.2em] text-[var(--color-rose)]">Order</div>
                    <div className="text-xl font-semibold text-[var(--color-choco)]">
                      #{o._id.slice(-8)}
                    </div>
                  </div>
                  <span className="rounded-full bg-[#fff1dd] px-3 py-1 text-xs font-semibold text-[var(--color-choco)]/80">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-[var(--color-choco)]/70">
                  <div className="flex items-center justify-between">
                    <span>ยอดสุทธิ</span>
                    <span className="font-semibold text-[var(--color-rose-dark)]">฿{o.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>สถานะ</span>
                    <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-semibold text-emerald-600">
                      {o.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 line-clamp-2 text-xs text-[var(--color-choco)]/60">
                  {o.items.map((it, idx) => (
                    <span key={`${o._id}-${it.productId || it.title}-${idx}`}>
                      {it.title} × {it.qty}
                      {idx < o.items.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
