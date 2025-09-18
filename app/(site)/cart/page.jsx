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
  setErr(""); setApplying(true);
  try {
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotal: cart.subtotal }),
    });

    // ---------- อ่าน response แบบกันตาย ----------
    const raw = await res.text();                // ได้ text เสมอ
    let data = null;
    try { data = raw ? JSON.parse(raw) : null; } // พยายาม parse ถ้าไม่ใช่ JSON จะไม่พัง
    catch { /* ไม่เป็น JSON */ }

    if (!res.ok) {
      throw new Error(data?.error || raw || "Validate failed");
    }

    if (!data?.ok) {
      const reason = data?.reason || "INVALID";
      const msg =
        reason === "NOT_FOUND" ? "ไม่พบคูปอง" :
        reason === "INACTIVE" ? "คูปองถูกปิดใช้งาน" :
        reason === "EXPIRED" ? "คูปองหมดอายุ" :
        reason === "MIN_SUBTOTAL" ? "ยอดยังไม่ถึงขั้นต่ำ" :
        "คูปองไม่ถูกต้อง";
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

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {cart.items.length === 0 ? (
        <div className="border rounded-xl p-6 text-gray-600">
          ตะกร้าของคุณยังว่าง <Link href="/" className="underline">เลือกสินค้า</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.items.map((it) => (
              <div key={it.productId} className="border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{it.title}</div>
                  <div className="text-sm text-gray-500">฿{it.price} ×</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={1} value={it.qty}
                    onChange={(e) => cart.setQty(it.productId, parseInt(e.target.value || "1", 10))}
                    className="w-16 border rounded px-2 py-1"
                  />
                  <button className="text-sm underline" onClick={() => cart.remove(it.productId)}>remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border rounded-xl p-6 space-y-4">
            {/* Coupon box */}
            <div>
              <label className="text-sm block mb-1">คูปองส่วนลด</label>
              <div className="flex gap-2">
                <input
                  value={code} onChange={(e)=> setCode(e.target.value)}
                  placeholder="เช่น BUN10"
                  className="flex-1 border rounded px-3 py-2"
                />
                <button
                  onClick={applyCoupon} disabled={applying}
                  className="px-4 py-2 rounded bg-black text-white"
                >
                  {applying ? "กำลังตรวจสอบ..." : "ใช้คูปอง"}
                </button>
                {cart.coupon && (
                  <button onClick={() => cart.clearCoupon()} className="px-4 py-2 rounded border">ลบคูปอง</button>
                )}
              </div>
              {err && <div className="text-sm text-red-600 mt-2">{err}</div>}
              {cart.coupon && (
                <div className="text-sm text-green-700 mt-2">
                  ใช้คูปอง {cart.coupon.code} — {cart.coupon.description} (ชั่วคราว; คิดจริงตอนชำระ)
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between">
              <div>รวม</div>
              <div className="text-lg font-semibold">฿{cart.subtotal}</div>
            </div>
            {cart.coupon?.discount ? (
              <div className="flex items-center justify-between text-green-700">
                <div>ส่วนลด (ประมาณ)</div>
                <div>-฿{cart.coupon.discount}</div>
              </div>
            ) : null}
            <div className="flex items-center gap-3">
              <Link href="/checkout" className="px-4 py-2 rounded bg-black text-white">Checkout</Link>
              <button className="px-4 py-2 rounded border" onClick={cart.clear}>Clear</button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
