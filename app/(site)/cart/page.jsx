"use client";
import { useCart } from "@/components/cart/CartProvider";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  summarizePromotion,
  describePromotionUsage,
  getPromotionProgress,
} from "@/lib/promotionUtils";

const fmtCurrency = (value) =>
  Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function CartPage() {
  const cart = useCart();
  const { status } = useSession();
  const router = useRouter();
  const [code, setCode] = useState(cart.coupon?.code || "");
  const [applying, setApplying] = useState(false);
  const [err, setErr] = useState("");
  const promotions = cart.promotions || {};
  const promotionsLoading = Boolean(promotions.loading);
  const promotionsError = promotions.error || "";
  const appliedPromotions = promotions.applied || [];
  const activePromotions = promotions.active || [];
  const couponDiscount = Math.max(
    0,
    Number(cart.couponDiscount ?? cart.coupon?.discount ?? 0),
  );
  const promotionDiscount = Math.max(
    0,
    Number(cart.promotionDiscount ?? promotions.discount ?? 0),
  );
  const subtotalValue = Number(cart.subtotal || 0);
  const totalDiscount = Math.min(
    subtotalValue,
    Math.max(0, Number(cart.totalDiscount ?? couponDiscount + promotionDiscount)),
  );
  const totalValue = Number(
    cart.total != null ? cart.total : Math.max(0, subtotalValue - totalDiscount),
  );

  const freebiesByProduct = useMemo(() => {
    const map = new Map();
    appliedPromotions.forEach((promotion) => {
      (promotion.items || []).forEach((item) => {
        const productId = item.productId;
        if (!productId) return;
        const prev = map.get(String(productId)) || { qty: 0, discount: 0, titles: [] };
        const freeQty = Number(item.freeQty || 0);
        const discount = Number(item.discount || 0);
        const label = promotion.title || promotion.summary || "โปรโมชั่น";
        const titles = prev.titles.includes(label) ? prev.titles : [...prev.titles, label];
        map.set(String(productId), {
          qty: prev.qty + freeQty,
          discount: prev.discount + discount,
          titles,
        });
      });
    });
    return map;
  }, [appliedPromotions]);

  const cartItems = cart.items || [];

  const promotionStatuses = useMemo(() => {
    const appliedIds = new Set(
      appliedPromotions
        .map((p) => {
          const id = p.id || p.promotionId;
          return id ? String(id) : null;
        })
        .filter(Boolean),
    );
    return activePromotions.map((promotion, index) => {
      const rawId = promotion._id || promotion.id || promotion.promotionId || index;
      const id = String(rawId);
      const summary = summarizePromotion(promotion);
      const applied = appliedIds.has(id);
      const progress = getPromotionProgress(promotion, cartItems);
      let hint = "";

      if (!applied) {
        if (progress?.type === "buy_x_get_y") {
          if (!progress.hasAnyQuantity) {
            hint = describePromotionUsage(promotion);
          } else if (progress.neededToNextReward > 0) {
            const productLabel = progress.sampleProductTitle
              ? `เมนู ${progress.sampleProductTitle}`
              : "สินค้าเมนูเดียวกัน";
            hint = `หยิบ ${productLabel} เพิ่มอีก ${progress.neededToNextReward} ชิ้นเพื่อรับฟรี ${progress.get} ชิ้นจากโปรนี้`;
          }
        }

        if (!hint) {
          hint = describePromotionUsage(promotion);
        }
      }

      return {
        id,
        title: promotion.title || summary || "โปรโมชั่น",
        summary,
        applied,
        hint,
      };
    });
  }, [activePromotions, appliedPromotions, cartItems]);

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
    <div className="rounded-3xl border border-[#e6c688] bg-white/95 p-6 text-[#3c1a09] shadow-xl shadow-[rgba(60,26,9,0.12)] backdrop-blur">
      <div className="flex items-center justify-between text-lg font-semibold text-[#5b3dfc]">
        <span>ยอดรวม</span>
        <span>฿{fmtCurrency(subtotalValue)}</span>
      </div>
      {promotionDiscount ? (
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-[#e6c688]/70 bg-[#f0d6a1] px-4 py-2 text-xs text-[#3c1a09]">
          <span>ส่วนลดโปรโมชันอัตโนมัติ</span>
          <span>-฿{fmtCurrency(promotionDiscount)}</span>
        </div>
      ) : null}
      {!promotionDiscount && promotionsLoading ? (
        <div className="mt-3 rounded-2xl border border-[#e6c688]/60 bg-white/80 px-4 py-2 text-xs text-[#3c1a09]/70">
          กำลังตรวจสอบโปรโมชันที่ใช้ได้...
        </div>
      ) : null}
      {promotionsError && !promotionsLoading ? (
        <div className="mt-3 rounded-2xl border border-[#e06a6a]/50 bg-[#fdeaea] px-4 py-2 text-xs text-[#b84d4d]">
          {promotionsError}
        </div>
      ) : null}
      {couponDiscount ? (
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-[#5b3dfc]/30 bg-[#f5edff] px-4 py-2 text-xs text-[#5b3dfc]">
          <span>
            ใช้คูปอง {cart.coupon?.code}
            {cart.coupon?.description ? ` (${cart.coupon.description})` : ""}
          </span>
          <span>-฿{fmtCurrency(couponDiscount)}</span>
        </div>
      ) : null}
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#5b3dfc]/10 px-4 py-3 text-base font-semibold text-[#3c1a09]">
        <span>ยอดต้องชำระ</span>
        <span>฿{fmtCurrency(totalValue)}</span>
      </div>
      {appliedPromotions.length ? (
        <div className="mt-4 rounded-2xl border border-[#e6c688] bg-[#fff3d6] px-4 py-3 text-xs text-[#3c1a09]">
          <h3 className="text-sm font-semibold text-[#5b3dfc]">โปรโมชันที่ได้รับ</h3>
          <ul className="mt-2 space-y-2">
            {appliedPromotions.map((promo, idx) => (
              <li
                key={`${promo.id || promo.title || "promo"}-${idx}`}
                className="flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-3">
                  <span>{promo.title || promo.summary || "โปรโมชั่น"}</span>
                  <span className="font-semibold text-[#f6d889]">-฿{fmtCurrency(promo.discount)}</span>
                </div>
                {promo.freeQty ? (
                  <span className="text-[#3c1a09]/60">รับฟรี {promo.freeQty} ชิ้นจากโปรนี้</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {promotionStatuses.length ? (
        <div className="mt-4 rounded-2xl border border-[#e6c688]/80 bg-white/90 px-4 py-3 text-xs text-[#3c1a09]/80">
          <h3 className="text-sm font-semibold text-[#5b3dfc]">โปรโมชันอัตโนมัติในตอนนี้</h3>
          <ul className="mt-2 space-y-2">
            {promotionStatuses.map((promo) => (
              <li key={promo.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-[#3c1a09]">{promo.title}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                      promo.applied
                        ? "bg-[#5b3dfc]/15 text-[#5b3dfc]"
                        : "bg-[#f1c154]/15 text-[#f6d889]"
                    }`}
                  >
                    {promo.applied ? "ได้รับแล้ว" : "ยังไม่เข้าเงื่อนไข"}
                  </span>
                </div>
                {promo.summary ? (
                  <span className="text-[#3c1a09]/60">{promo.summary}</span>
                ) : null}
                {!promo.applied && promo.hint ? (
                  <span className="text-[#3c1a09]/55">{promo.hint}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center rounded-full bg-[#f1c154] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(247,201,72,0.35)] transition hover:bg-[#b6791c]"
        >
          ไปหน้าชำระเงิน
        </Link>
        <button
          className="rounded-full border border-[#5b3dfc]/30 bg-white px-6 py-3 text-sm font-medium text-[#5b3dfc] transition hover:bg-[#f5edff]"
          onClick={cart.clear}
        >
          ลบสินค้าทั้งหมด
        </button>
      </div>
    </div>
  );

  if (status === "loading") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#fff7eb]">
        <div className="rounded-full border border-[#e6c688] bg-white/95 px-6 py-3 text-sm text-[#5b3dfc] shadow">
          กำลังตรวจสอบสถานะการเข้าสู่ระบบ...
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#fff7eb]">
        <div className="rounded-3xl border border-[#e6c688] bg-white/95 px-8 py-10 text-center text-[#3c1a09] shadow-xl shadow-[rgba(60,26,9,0.18)] backdrop-blur">
          <p className="text-lg font-semibold text-[#5b3dfc]">กรุณาเข้าสู่ระบบเพื่อเปิดตะกร้าสินค้า</p>
          <p className="mt-3 text-sm text-[#3c1a09]/70">
            ระบบกำลังพาไปยังหน้าเข้าสู่ระบบอัตโนมัติ หากไม่เปลี่ยนหน้า
            <Link
              href={`/login?callbackUrl=${encodeURIComponent("/cart")}`}
              className="ml-1 font-semibold text-[#f6d889] underline"
            >
              คลิกที่นี่เพื่อเข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[70vh] overflow-hidden bg-[#fff7eb]">
      <div className="absolute inset-0 bg-[#fff7eb]" />
      <div className="absolute -top-24 right-8 h-64 w-64 rounded-full bg-[#5b3dfc]/18 blur-3xl" />
      <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-[#f1c154]/18 blur-3xl" />

      <div className="relative mx-auto max-w-screen-xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#3c1a09]">ตะกร้าของฉัน</h1>
              <p className="mt-1 text-sm text-[#3c1a09]/70">ตรวจสอบสินค้า และใช้คูปองส่วนลดก่อนชำระเงิน</p>
            </div>
          </div>

          {cart.items.length === 0 ? (
            <div className="rounded-3xl border border-[#e6c688] bg-white/95 p-10 text-center text-[#3c1a09] shadow-xl shadow-[rgba(60,26,9,0.18)] backdrop-blur">
              <p className="text-lg font-medium text-[#5b3dfc]">ตะกร้าของคุณยังว่าง</p>
              <p className="mt-2 text-sm text-[#3c1a09]/70">
                ลองกลับไปเลือกเมนูโปรดดูนะคะ —
                <Link href="/" className="ml-1 font-semibold text-[#f6d889] underline">
                  หน้าร้านหลัก
                </Link>
              </p>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-4">
                {cart.items.map((it) => {
                  const bonus = freebiesByProduct.get(String(it.productId));
                  return (
                    <div
                      key={it.productId}
                      className="flex flex-col gap-3 rounded-3xl border border-[#e6c688] bg-white/95 p-6 text-[#3c1a09] shadow-lg shadow-[rgba(60,26,9,0.15)] backdrop-blur sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="text-lg font-semibold text-[#5b3dfc]">{it.title}</div>
                        <div className="text-sm text-[#3c1a09]/70">฿{fmtCurrency(it.price)} ต่อชิ้น</div>
                        {bonus?.qty ? (
                          <div className="mt-2 flex flex-col gap-1 text-xs text-[#f6d889]">
                            <span>
                              ได้รับฟรี {bonus.qty} ชิ้น (มูลค่า ฿{fmtCurrency(bonus.discount)})
                            </span>
                            <span className="text-[#3c1a09]/60">
                              จากโปร {bonus.titles.join(", ")}
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center overflow-hidden rounded-full border border-[#e6c688] bg-[#fff3d6] shadow-inner">
                            <button
                              type="button"
                              aria-label="ลดจำนวน"
                              onClick={() => {
                                const nextQty = Math.max(1, Number(it.qty || 1) - 1);
                                cart.setQty(it.productId, nextQty);
                              }}
                              className="h-10 w-10 text-lg font-semibold text-[#5b3dfc] transition hover:bg-white"
                            >
                              −
                            </button>
                            <div className="min-w-[3rem] px-3 text-center text-sm font-semibold text-[#3c1a09]">
                              {it.qty}
                            </div>
                            <button
                              type="button"
                              aria-label="เพิ่มจำนวน"
                              onClick={() => cart.setQty(it.productId, Number(it.qty || 1) + 1)}
                              className="h-10 w-10 text-lg font-semibold text-[#5b3dfc] transition hover:bg-white"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          className="inline-flex items-center gap-2 rounded-full border border-[#e6c688] bg-[#fff3d6] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#f6d889] transition hover:bg-white hover:text-[#5b3dfc]"
                          onClick={() => cart.remove(it.productId)}
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f1c154] text-white shadow-md shadow-[rgba(247,201,72,0.35)]">
                            <svg
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            >
                              <path
                                d="M6 5.5h8m-6.5 0v-1A1.5 1.5 0 0 1 9 3h2a1.5 1.5 0 0 1 1.5 1.5v1M5.5 7h9l-.6 9.02a1.5 1.5 0 0 1-1.49 1.38H7.59a1.5 1.5 0 0 1-1.49-1.38L5.5 7Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          ลบออก
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-[#e6c688] bg-white/95 p-6 text-[#3c1a09] shadow-xl shadow-[rgba(60,26,9,0.12)] backdrop-blur">
                  <h2 className="text-lg font-semibold text-[#5b3dfc]">ใช้คูปอง</h2>
                  <p className="mt-1 text-xs text-[#3c1a09]/70">กรอกโค้ดเพื่อรับส่วนลดพิเศษ</p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="เช่น SWEET10"
                      className="flex-1 rounded-full border border-[#e6c688] bg-white/80 px-5 py-3 text-sm text-[#3c1a09] focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={applying}
                      className="inline-flex items-center justify-center rounded-full bg-[#f1c154] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(247,201,72,0.35)] transition hover:bg-[#b6791c] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {applying ? "กำลังตรวจสอบ..." : "ใช้คูปอง"}
                    </button>
                    {cart.coupon && (
                      <button
                        onClick={() => cart.clearCoupon()}
                        className="rounded-full border border-[#5b3dfc]/30 bg-white px-5 py-3 text-sm font-medium text-[#5b3dfc] transition hover:bg-[#f5edff]"
                      >
                        ลบคูปอง
                      </button>
                    )}
                  </div>
                  {err && <div className="mt-3 text-sm text-[#b84d4d]">{err}</div>}
                  {cart.coupon && (
                    <div className="mt-3 rounded-2xl border border-[#5b3dfc]/30 bg-[#f5edff] px-4 py-3 text-sm text-[#5b3dfc]">
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
