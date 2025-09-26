"use client";
import { useCart } from "@/components/cart/CartProvider";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const cart = useCart();
  const { status } = useSession();
  const router = useRouter();
  const [code, setCode] = useState(cart.coupon?.code || "");
  const [applying, setApplying] = useState(false);
  const [err, setErr] = useState("");
  const hasDeposit = useMemo(() => cart.items.some((item) => item.kind === "preorder-deposit"), [cart.items]);
  const fmt = (value) =>
    Number(value || 0).toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/cart")}`);
    }
  }, [status, router]);

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
    <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/75 p-6 text-[var(--color-text)] shadow-lg shadow-black/40 backdrop-blur">
      <div className="flex items-center justify-between text-lg font-semibold text-[var(--color-gold)]">
        <span>ยอดรวม</span>
        <span>฿{fmt(cart.subtotal)}</span>
      </div>
      {cart.coupon?.discount ? (
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy-dark)]/60 px-4 py-2 text-xs text-[var(--color-gold)]/85">
          <span>
            ใช้คูปอง {cart.coupon.code} ({cart.coupon.description})
          </span>
          <span>-฿{fmt(cart.coupon.discount)}</span>
        </div>
      ) : null}
      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-rose-dark)] px-6 py-3 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-[rgba(0,0,0,0.35)] transition hover:shadow-xl"
        >
          ไปหน้าชำระเงิน
        </Link>
        <button
          className="rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/50 px-6 py-3 text-sm font-medium text-[var(--color-gold)] transition hover:bg-[var(--color-burgundy)]/60"
          onClick={cart.clear}
        >
          ลบสินค้าทั้งหมด
        </button>
      </div>
    </div>
  );

  if (status === "loading") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[var(--color-burgundy-dark)]/60">
        <div className="rounded-full border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/70 px-6 py-3 text-sm text-[var(--color-gold)] shadow-inner">
          กำลังตรวจสอบสถานะการเข้าสู่ระบบ...
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[var(--color-burgundy-dark)]/60">
        <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/75 px-8 py-10 text-center text-[var(--color-text)] shadow-xl shadow-black/40 backdrop-blur">
          <p className="text-lg font-semibold text-[var(--color-gold)]">กรุณาเข้าสู่ระบบเพื่อเปิดตะกร้าสินค้า</p>
          <p className="mt-3 text-sm text-[var(--color-text)]/70">
            ระบบกำลังพาไปยังหน้าเข้าสู่ระบบอัตโนมัติ หากไม่เปลี่ยนหน้า
            <Link
              href={`/login?callbackUrl=${encodeURIComponent("/cart")}`}
              className="ml-1 font-semibold text-[var(--color-rose)] underline"
            >
              คลิกที่นี่เพื่อเข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[70vh] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,200,105,0.12),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(58,16,16,0.7),transparent_55%),linear-gradient(135deg,rgba(20,2,2,0.95),rgba(58,16,16,0.85))]" />
      <div className="absolute -top-24 right-8 h-64 w-64 rounded-full bg-[var(--color-rose)]/25 blur-3xl" />
      <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-[var(--color-rose-dark)]/25 blur-3xl" />

      <div className="relative max-w-screen-xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-rose)]">ตะกร้าของฉัน</h1>
              <p className="mt-1 text-sm text-[var(--color-text)]/70">ตรวจสอบสินค้า และใช้คูปองส่วนลดก่อนชำระเงิน</p>
            </div>
          </div>

          {cart.items.length === 0 ? (
            <div className="rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/70 p-10 text-center text-[var(--color-text)] shadow-lg shadow-black/40 backdrop-blur">
              <p className="text-lg font-medium text-[var(--color-gold)]">ตะกร้าของคุณยังว่าง</p>
              <p className="mt-2 text-sm text-[var(--color-text)]/70">
                ลองกลับไปเลือกเมนูโปรดดูนะคะ —
                <Link href="/" className="ml-1 font-semibold text-[var(--color-rose)] underline">
                  หน้าร้านหลัก
                </Link>
              </p>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-4">
                {cart.items.map((it) => {
                  const isDeposit = it.kind === "preorder-deposit";
                  return (
                    <div
                      key={it.id}
                      className="flex flex-col gap-3 rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/70 p-6 text-[var(--color-text)] shadow-lg shadow-black/30 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="text-lg font-semibold text-[var(--color-gold)]">{it.title}</div>
                        <div className="text-sm text-[var(--color-text)]/70">
                          ฿{fmt(it.price)} {isDeposit ? "มัดจำ (50%)" : "ต่อชิ้น"}
                        </div>
                        {isDeposit && (
                          <div className="mt-2 text-xs text-[var(--color-text)]/60">
                            ยอดทั้งงาน {fmt(it.totalPrice || it.price * 2)} บาท — ชำระมัดจำล่วงหน้า 50%
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {isDeposit ? (
                          <div className="text-sm font-medium text-[var(--color-gold)]">จำนวน {it.qty} รายการ</div>
                        ) : (
                          <input
                            type="number"
                            min={1}
                            value={it.qty}
                            onChange={(e) => cart.setQty(it.id, parseInt(e.target.value || "1", 10))}
                            className="h-11 w-24 rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 text-center text-sm font-medium text-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/30"
                          />
                        )}
                        <button
                          className="text-sm font-medium text-[var(--color-rose)] underline decoration-dotted"
                          onClick={() => (isDeposit ? cart.clear() : cart.remove(it.id))}
                        >
                          ลบออก
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-6">
                {hasDeposit ? (
                  <div className="rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/70 p-6 text-[var(--color-text)] shadow-lg shadow-black/40 backdrop-blur">
                    <h2 className="text-lg font-semibold text-[var(--color-gold)]">มัดจำพรีออเดอร์</h2>
                    <p className="mt-2 text-xs text-[var(--color-text)]/70">
                      การสั่งมัดจำไม่สามารถใช้คูปองส่วนลดได้ ระบบจะบันทึกการชำระและแจ้งทีมงานให้อัปเดตสถานะทันทีที่ได้รับสลิปชำระเงิน
                    </p>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/70 p-6 text-[var(--color-text)] shadow-lg shadow-black/40 backdrop-blur">
                    <h2 className="text-lg font-semibold text-[var(--color-gold)]">ใช้คูปอง</h2>
                    <p className="mt-1 text-xs text-[var(--color-text)]/70">กรอกโค้ดเพื่อรับส่วนลดพิเศษ</p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="เช่น SWEET10"
                        className="flex-1 rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-5 py-3 text-sm text-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/30"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={applying}
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-rose-dark)] px-6 py-3 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-[rgba(0,0,0,0.35)] transition disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {applying ? "กำลังตรวจสอบ..." : "ใช้คูปอง"}
                      </button>
                      {cart.coupon && (
                        <button
                          onClick={() => cart.clearCoupon()}
                          className="rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/50 px-5 py-3 text-sm font-medium text-[var(--color-gold)] transition hover:bg-[var(--color-burgundy)]/60"
                        >
                          ลบคูปอง
                        </button>
                      )}
                    </div>
                    {err && <div className="mt-3 text-sm text-rose-600">{err}</div>}
                    {cart.coupon && (
                      <div className="mt-3 rounded-2xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-sm text-[var(--color-gold)]/85">
                        ใช้คูปอง {cart.coupon.code} — {cart.coupon.description} (คำนวณอีกครั้งตอนชำระเงิน)
                      </div>
                    )}
                  </div>
                )}

                {summary}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
