"use client";
import { useCart } from "@/components/cart/CartProvider";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const cart = useCart();
  const [code, setCode] = useState(cart.coupon?.code || "");
  const [applying, setApplying] = useState(false);
  const [err, setErr] = useState("");

  async function applyCoupon() {
    setErr("");
    setApplying(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: cart.subtotal }),
      });

      const raw = await res.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {}

      if (!res.ok) {
        throw new Error(data?.error || raw || "Validate failed");
      }

      if (!data?.ok) {
        const reason = data?.reason || "INVALID";
        const msg =
          reason === "NOT_FOUND"
            ? "ไม่พบคูปอง"
            : reason === "INACTIVE"
            ? "คูปองถูกปิดใช้งาน"
            : reason === "EXPIRED"
            ? "คูปองหมดอายุ"
            : reason === "MIN_SUBTOTAL"
            ? "ยอดยังไม่ถึงขั้นต่ำ"
            : "คูปองไม่ถูกต้อง";
        setErr(msg);
        return;
      }
      cart.setCoupon({ code: data.code, discount: data.discount, description: data.description });
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setApplying(false);
    }
  }

  const summary = (
    <div className="rounded-3xl bg-white/90 p-6 shadow-lg shadow-[#f0658322]">
      <div className="flex items-center justify-between text-lg font-semibold text-[var(--color-choco)]">
        <span>ยอดรวม</span>
        <span>฿{cart.subtotal}</span>
      </div>
      {cart.coupon?.discount ? (
        <div className="mt-3 flex items-center justify-between text-sm text-emerald-600">
          <span>
            ใช้คูปอง {cart.coupon.code} ({cart.coupon.description})
          </span>
          <span>-฿{cart.coupon.discount}</span>
        </div>
      ) : null}
      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-rose)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#f0658333] hover:bg-[var(--color-rose-dark)]"
        >
          ไปหน้าชำระเงิน
        </Link>
        <button
          className="rounded-full border border-[#f7b267]/60 px-6 py-3 text-sm font-medium text-[var(--color-choco)] hover:bg-[#fff1dd]"
          onClick={cart.clear}
        >
          ลบสินค้าทั้งหมด
        </button>
      </div>
    </div>
  );

  return (
    <main className="relative min-h-[70vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ffe9d6] via-[#fff7f0] to-[#ffe8f1]" />
      <div className="absolute -top-24 right-8 h-64 w-64 rounded-full bg-[#f6c34a]/30 blur-3xl" />
      <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-[#f06583]/20 blur-3xl" />

      <div className="relative max-w-screen-xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-rose-dark)]">ตะกร้าของฉัน</h1>
              <p className="mt-1 text-sm text-[var(--color-choco)]/70">ตรวจสอบสินค้า และใช้คูปองส่วนลดก่อนชำระเงิน</p>
            </div>
          </div>

          {cart.items.length === 0 ? (
            <div className="rounded-3xl bg-white/80 p-10 text-center shadow-lg shadow-[#f0658322]">
              <p className="text-lg font-medium text-[var(--color-choco)]">ตะกร้าของคุณยังว่าง</p>
              <p className="mt-2 text-sm text-[var(--color-choco)]/70">
                ลองกลับไปเลือกเมนูโปรดดูนะคะ —
                <Link href="/" className="ml-1 underline">
                  หน้าร้านหลัก
                </Link>
              </p>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-4">
                {cart.items.map((it) => (
                  <div
                    key={it.productId}
                    className="flex flex-col gap-3 rounded-3xl bg-white/90 p-6 shadow-lg shadow-[#f065831a] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="text-lg font-semibold text-[var(--color-choco)]">{it.title}</div>
                      <div className="text-sm text-[var(--color-choco)]/70">฿{it.price} ต่อชิ้น</div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        value={it.qty}
                        onChange={(e) =>
                          cart.setQty(it.productId, parseInt(e.target.value || "1", 10))
                        }
                        className="h-11 w-24 rounded-full border border-[#f7b267]/60 bg-white px-4 text-center text-sm font-medium text-[var(--color-choco)] focus:outline-none focus:ring-2 focus:ring-[#f06583]/30"
                      />
                      <button
                        className="text-sm font-medium text-[var(--color-rose-dark)] underline decoration-dotted"
                        onClick={() => cart.remove(it.productId)}
                      >
                        ลบออก
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl bg-white/90 p-6 shadow-lg shadow-[#f0658322]">
                  <h2 className="text-lg font-semibold text-[var(--color-choco)]">ใช้คูปอง</h2>
                  <p className="mt-1 text-xs text-[var(--color-choco)]/70">กรอกโค้ดเพื่อรับส่วนลดพิเศษ</p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="เช่น SWEET10"
                      className="flex-1 rounded-full border border-[#f7b267]/60 bg-white px-5 py-3 text-sm text-[var(--color-choco)] focus:outline-none focus:ring-2 focus:ring-[#f06583]/30"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={applying}
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#f06583] to-[#f78da7] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#f0658333] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {applying ? "กำลังตรวจสอบ..." : "ใช้คูปอง"}
                    </button>
                    {cart.coupon && (
                      <button
                        onClick={() => cart.clearCoupon()}
                        className="rounded-full border border-[#f06583]/20 px-5 py-3 text-sm font-medium text-[var(--color-choco)] hover:bg-[#fff1dd]"
                      >
                        ลบคูปอง
                      </button>
                    )}
                  </div>
                  {err && <div className="mt-3 text-sm text-rose-600">{err}</div>}
                  {cart.coupon && (
                    <div className="mt-3 rounded-2xl bg-[#ecfdf5] px-4 py-3 text-sm text-emerald-700">
                      ใช้คูปอง {cart.coupon.code} — {cart.coupon.description} (คำนวณอีกครั้งตอนชำระเงิน)
                    </div>
                  )}
                </div>

                {summary}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
