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
    <main className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-6">
      <section className="border rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-sm text-gray-600">
          กรอกข้อมูลสำหรับจัดส่งสินค้า จากนั้นระบบจะสร้าง QR PromptPay เพื่อให้ชำระเงินและแนบสลิปยืนยันอัตโนมัติ
        </p>

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
                  REQUIRED_FIELDS.includes(key) && !form[key] ? "border-red-400" : ""
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
          className={`px-4 py-2 rounded text-white ${
            creating || cart.items.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-black"
          }`}
        >
          {creating ? "กำลังสร้าง QR..." : "สร้าง QR สำหรับชำระเงิน"}
        </button>

        {err && <div className="text-sm text-red-600">{err}</div>}
      </section>

      <section className="border rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">สรุปรายการ</h2>

        <div className="space-y-2">
          {currentTotals.items.map((it) => (
            <div key={`${it.productId}-${it.title}`} className="flex justify-between">
              <span>
                {it.title} × {it.qty}
              </span>
              <span>฿{fmt(it.lineTotal ?? (it.price || 0) * it.qty)}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 space-y-1">
          <div className="flex justify-between">
            <span>รวม</span>
            <span>฿{fmt(currentTotals.subtotal)}</span>
          </div>
          {currentTotals.discount ? (
            <div className="flex justify-between text-green-700">
              <span>
                คูปอง {currentTotals.coupon?.code}
                {currentTotals.coupon?.description ? ` (${currentTotals.coupon.description})` : ""}
              </span>
              <span>-฿{fmt(currentTotals.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-semibold pt-1 border-t">
            <span>ยอดสุทธิ</span>
            <span>฿{fmt(currentTotals.total)}</span>
          </div>
        </div>

        {order ? (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
              สร้างคำสั่งซื้อ #{order.orderId} แล้ว กรุณาชำระเงินและแนบสลิปเพื่อยืนยันการสั่งซื้อ
            </div>
            {order.promptpay ? (
              <QrBox
                payload={order.promptpay.payload}
                amount={order.orderPreview.total}
                title="สแกนเพื่อชำระเงิน"
              />
            ) : (
              <div className="text-sm text-gray-600">ออเดอร์นี้ไม่ต้องชำระเงินเพิ่มเติม</div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">แนบสลิปการโอน *</label>
              <input type="file" accept="image/*" onChange={handleSlipChange} />
              {slipName && (
                <div className="text-xs text-gray-500">ไฟล์: {slipName}</div>
              )}
            </div>

            <button
              onClick={confirmPayment}
              disabled={confirming || !slipData}
              className={`px-4 py-2 rounded text-white ${
                confirming || !slipData ? "bg-gray-400 cursor-not-allowed" : "bg-black"
              }`}
            >
              {confirming ? "กำลังยืนยัน..." : "ยืนยันการชำระเงิน"}
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            กดปุ่ม "สร้าง QR สำหรับชำระเงิน" เพื่อสร้างคำสั่งซื้อและรับ QR PromptPay
          </div>
        )}
      </section>
    </main>
  );
}
