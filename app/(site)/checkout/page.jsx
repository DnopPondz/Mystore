"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import QrBox from "@/components/QrBox";

const REQUIRED_FIELDS = ["name", "phone", "email", "address1", "province", "postcode"];

function isFormValid(form) {
  return REQUIRED_FIELDS.every((key) => String(form[key]).trim() !== "");
}

function fmt(n) {
  return Number(n || 0).toLocaleString("th-TH");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("ไม่สามารถอ่านไฟล์ได้"));
    reader.readAsDataURL(file);
  });
}

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();

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

  const [err, setErr] = useState("");
  const [creating, setCreating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [order, setOrder] = useState(null);
  const [slipData, setSlipData] = useState("");
  const [slipName, setSlipName] = useState("");

  const currentTotals = order?.orderPreview ?? {
    items: cart.items.map((it) => ({ ...it, lineTotal: (it.price || 0) * it.qty })),
    subtotal: cart.subtotal,
    discount: cart.coupon?.discount || 0,
    total: cart.subtotal - (cart.coupon?.discount || 0),
    coupon: cart.coupon
      ? { code: cart.coupon.code, description: cart.coupon.description, discount: cart.coupon.discount }
      : null,
  };

  async function placeOrder() {
    if (cart.items.length === 0) {
      setErr("ตะกร้าว่างเปล่า");
      return;
    }

    if (!isFormValid(form)) {
      setErr("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    setErr("");
    setCreating(true);
    setOrder(null);
    setSlipData("");
    setSlipName("");

    try {
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
      setOrder(data);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setCreating(false);
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
      setErr("รองรับเฉพาะไฟล์รูปภาพเท่านั้น");
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (typeof dataUrl !== "string") throw new Error("ไม่สามารถอ่านไฟล์ได้");
      setSlipData(dataUrl);
      setSlipName(file.name || "สลิปการโอน");
      setErr("");
    } catch (e) {
      setErr(String(e.message || e));
      setSlipData("");
      setSlipName("");
      event.target.value = "";
    }
  }

  async function confirmPayment() {
    if (!order?.orderId) {
      setErr("ยังไม่มีคำสั่งซื้อให้ยืนยัน");
      return;
    }
    if (!slipData) {
      setErr("กรุณาแนบสลิปการโอนก่อนยืนยัน");
      return;
    }

    setErr("");
    setConfirming(true);

    try {
      const res = await fetch(`/api/orders/${order.orderId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slip: slipData, filename: slipName }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : null;
      if (!res.ok || !data?.ok) throw new Error(data?.error || "ไม่สามารถยืนยันการชำระเงินได้");

      cart.clear();
      router.push(`/hook?order=${order.orderId}`);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setConfirming(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ffe1ea] via-[#fff7f0] to-[#ffe9d6]" />
      <div className="absolute -top-24 left-20 h-64 w-64 rounded-full bg-[#f06583]/20 blur-3xl" />
      <div className="absolute -bottom-28 right-10 h-72 w-72 rounded-full bg-[#f6c34a]/25 blur-3xl" />

      <div className="relative max-w-screen-xl mx-auto px-6 lg:px-8 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--color-rose)]">ชำระเงิน</p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--color-rose-dark)]">รายละเอียดจัดส่ง &amp; ยืนยันการโอน</h1>
          <p className="mt-2 text-sm text-[var(--color-choco)]/70">
            กรอกข้อมูลการจัดส่ง แล้วระบบจะสร้าง QR PromptPay พร้อมให้แนบสลิปยืนยัน เพื่อให้ทีมงานเริ่มจัดเตรียมสินค้าอย่างรวดเร็ว
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-[#f065831f] space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-choco)]">ข้อมูลผู้รับและที่อยู่</h2>
              <p className="mt-1 text-xs text-[var(--color-choco)]/70">ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {["name", "phone", "email", "address1", "address2", "district", "province", "postcode", "note"].map((key) => (
                <div key={key} className={key === "note" ? "sm:col-span-2" : key === "address1" ? "sm:col-span-2" : ""}>
                  <label className="mb-1 block text-sm font-medium">
                    {key === "name"
                      ? "ชื่อ-นามสกุล *"
                      : key === "phone"
                      ? "เบอร์โทร *"
                      : key === "email"
                      ? "อีเมล *"
                      : key === "address1"
                      ? "ที่อยู่ (บรรทัด 1) *"
                      : key === "address2"
                      ? "ที่อยู่ (บรรทัด 2)"
                      : key === "district"
                      ? "เขต/อำเภอ"
                      : key === "province"
                      ? "จังหวัด *"
                      : key === "postcode"
                      ? "รหัสไปรษณีย์ *"
                      : "หมายเหตุถึงร้าน"}
                  </label>
                  <input
                    className={`w-full rounded-2xl border border-[#f7b267]/60 bg-white px-4 py-3 text-sm text-[var(--color-choco)] focus:outline-none focus:ring-2 focus:ring-[#f06583]/30 ${
                      REQUIRED_FIELDS.includes(key) && !form[key] ? "border-rose-300" : ""
                    }`}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={placeOrder}
              disabled={creating || cart.items.length === 0}
              className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#f0658333] transition ${
                creating || cart.items.length === 0
                  ? "bg-[#f3b6c7] cursor-not-allowed"
                  : "bg-gradient-to-r from-[#f06583] to-[#f78da7] hover:shadow-xl"
              }`}
            >
              {creating ? "กำลังสร้าง QR..." : "สร้าง QR สำหรับชำระเงิน"}
            </button>

            {err && !order && <div className="text-sm text-rose-600">{err}</div>}
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-[#f065831a]">
              <h2 className="text-lg font-semibold text-[var(--color-choco)]">สรุปรายการ</h2>
              <div className="mt-4 space-y-3 text-sm">
                {currentTotals.items.map((it) => (
                  <div key={`${it.productId}-${it.title}`} className="flex justify-between">
                    <span>
                      {it.title} × {it.qty}
                    </span>
                    <span>฿{fmt(it.lineTotal ?? (it.price || 0) * it.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-[#f7b267]/40 pt-4 text-sm">
                <div className="flex justify-between text-[var(--color-choco)]/80">
                  <span>รวม</span>
                  <span>฿{fmt(currentTotals.subtotal)}</span>
                </div>
                {currentTotals.discount ? (
                  <div className="flex justify-between text-emerald-600">
                    <span>
                      คูปอง {currentTotals.coupon?.code}
                      {currentTotals.coupon?.description ? ` (${currentTotals.coupon.description})` : ""}
                    </span>
                    <span>-฿{fmt(currentTotals.discount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-base font-semibold text-[var(--color-rose-dark)]">
                  <span>ยอดสุทธิ</span>
                  <span>฿{fmt(currentTotals.total)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-[#f065831a] space-y-4">
              <h2 className="text-lg font-semibold text-[var(--color-choco)]">ยืนยันการโอน</h2>
              {order ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    สร้างคำสั่งซื้อ #{order.orderId} แล้ว กรุณาชำระเงินและแนบสลิปเพื่อยืนยัน
                  </div>
                  {order.promptpay ? (
                    <QrBox
                      payload={order.promptpay.payload}
                      amount={order.orderPreview.total}
                      title="สแกนเพื่อชำระเงิน"
                    />
                  ) : (
                    <div className="text-sm text-[var(--color-choco)]/70">ออเดอร์นี้ไม่ต้องชำระเงินเพิ่มเติม</div>
                  )}
                  <div className="space-y-2 text-sm">
                    <label className="font-medium">แนบสลิปการโอน *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSlipChange}
                      className="text-sm"
                    />
                    {slipName && <div className="text-xs text-[var(--color-choco)]/60">ไฟล์: {slipName}</div>}
                  </div>
                  <button
                    onClick={confirmPayment}
                    disabled={confirming || !slipData}
                    className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#f0658333] transition ${
                      confirming || !slipData
                        ? "bg-[#f3b6c7] cursor-not-allowed"
                        : "bg-gradient-to-r from-[#f06583] to-[#f6c34a] hover:shadow-xl"
                    }`}
                  >
                    {confirming ? "กำลังยืนยัน..." : "ยืนยันการชำระเงิน"}
                  </button>
                </div>
              ) : (
                <div className="text-sm text-[var(--color-choco)]/70">
                  กดปุ่ม "สร้าง QR สำหรับชำระเงิน" เพื่อสร้างคำสั่งซื้อและรับ QR PromptPay
                </div>
              )}
              {err && order && <div className="text-sm text-rose-600">{err}</div>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
