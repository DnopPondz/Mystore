"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import QrBox from "@/components/QrBox";

export default function CheckoutPage() {
  const cart = useCart();

  // ฟอร์มลูกค้า/ที่อยู่จัดส่ง
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    district: "",
    province: "",
    postcode: "",
    note: "",
  });

  // สถานะการทำงาน
  const [err, setErr] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingPlace, setLoadingPlace] = useState(false);

  // ผลลัพธ์จาก API
  const [preview, setPreview] = useState(null);
  const [placed, setPlaced] = useState(null);

  // helper
  const fmt = (n) => Number(n || 0).toLocaleString("th-TH");

  // ฟิลด์จำเป็น
  const requiredFields = ["name", "phone", "email", "address1", "province", "postcode"];
  const isFormValid = requiredFields.every((key) => String(form[key]).trim() !== "");

  // --- พรีวิว ---
  async function doPreview() {
    setErr("");
    setPreview(null);
    setPlaced(null);
    try {
      setLoadingPreview(true);
      const res = await fetch("/api/checkout/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "promptpay",
          items: cart.items.map((x) => ({ productId: x.productId, qty: x.qty })),
          couponCode: cart.coupon?.code || null,
        }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : null;
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Preview failed");
      setPreview(data);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoadingPreview(false);
    }
  }

  // --- สร้างออเดอร์จริง ---
  async function placeOrder() {
    if (!isFormValid) {
      setErr("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    setErr("");
    setPlaced(null);
    try {
      setLoadingPlace(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "promptpay",
          items: cart.items.map((x) => ({ productId: x.productId, qty: x.qty })),
          couponCode: cart.coupon?.code || null,
          customer: { name: form.name, phone: form.phone, email: form.email },
          shipping: {
            address1: form.address1,
            address2: form.address2,
            district: form.district,
            province: form.province,
            postcode: form.postcode,
            note: form.note,
          },
        }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : null;
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Checkout failed");
      setPlaced(data);
      // cart.clear(); // ถ้าต้องการล้างตะกร้าทันที
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoadingPlace(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-6">
      {/* ซ้าย: ฟอร์มผู้รับ */}
      <section className="border rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">Checkout</h1>

        <div className="grid grid-cols-1 gap-3">
          {[
            ["name", "ชื่อ-นามสกุล *"],
            ["phone", "เบอร์โทร *"],
            ["email", "อีเมล *"],
            ["address1", "ที่อยู่ *"],
            ["address2", "ที่อยู่ (บรรทัด 2)"],
            ["district", "เขต/อำเภอ"],
            ["province", "จังหวัด *"],
            ["postcode", "รหัสไปรษณีย์ *"],
            ["note", "หมายเหตุถึงร้าน"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-sm block mb-1">{label}</label>
              <input
                className={`w-full border rounded px-3 py-2 ${
                  requiredFields.includes(key) && !form[key] ? "border-red-400" : ""
                }`}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={doPreview}
            disabled={loadingPreview || cart.items.length === 0}
            className="px-4 py-2 rounded border"
          >
            {loadingPreview ? "กำลังพรีวิว..." : "ดู QR (พรีวิว)"}
          </button>

          <button
            onClick={placeOrder}
            disabled={loadingPlace || cart.items.length === 0 || !isFormValid}
            className={`px-4 py-2 rounded text-white ${
              !isFormValid || loadingPlace || cart.items.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black"
            }`}
          >
            {loadingPlace ? "กำลังสร้างคำสั่งซื้อ..." : "ยืนยันสั่งซื้อ"}
          </button>
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}
      </section>

      {/* ขวา: สรุปรายการ + QR */}
      <section className="border rounded-2xl p-6 space-y-3">
        <h2 className="text-xl font-semibold">สรุปรายการ</h2>

        <div className="space-y-2">
          {cart.items.map((it) => (
            <div key={it.productId} className="flex justify-between">
              <span>
                {it.title} × {it.qty}
              </span>
              <span>฿{fmt(it.price * it.qty)}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 space-y-1">
          <div className="flex justify-between">
            <span>รวม</span>
            <span>฿{fmt(cart.subtotal)}</span>
          </div>
          {cart.coupon?.discount ? (
            <div className="flex justify-between text-green-700">
              <span>
                คูปอง {cart.coupon.code} ({cart.coupon.description})
              </span>
              <span>-฿{fmt(cart.coupon.discount)}</span>
            </div>
          ) : null}
        </div>

        {/* พรีวิว */}
        {/* {preview && (
          <div className="mt-3">
            <div className="font-medium mb-2">
              พรีวิวยอดสุทธิ: ฿{fmt(preview.orderPreview.total)}
            </div>
            <QrBox
              payload={preview.promptpay?.payload}
              amount={preview.orderPreview.total}
              title="สแกนทดสอบ (พรีวิว)"
            />
          </div>
        )} */}

        {/* ออเดอร์จริง */}
        {placed && (
          <div className="mt-3">
            <div className="font-medium mb-2">
              สร้างออเดอร์แล้ว #{placed.orderId} — ยอดสุทธิ: ฿{fmt(placed.orderPreview.total)}
            </div>
            <QrBox
              payload={placed.promptpay?.payload}
              amount={placed.orderPreview.total}
              title="สแกนเพื่อชำระเงินจริง"
            />
          </div>
        )}
      </section>
    </main>
  );
}
