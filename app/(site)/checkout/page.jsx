"use client";

import { useEffect, useMemo, useState } from "react";
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

  const [paymentMethod, setPaymentMethod] = useState("promptpay");
  const [err, setErr] = useState("");
  const [creating, setCreating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [updatingMethod, setUpdatingMethod] = useState(false);
  const [order, setOrder] = useState(null);
  const [slipData, setSlipData] = useState("");
  const [slipName, setSlipName] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [reference, setReference] = useState("");
  const promotionsLoading = Boolean(cart.promotions?.loading);
  const promotionsError = cart.promotions?.error || "";

  const baseTotals = useMemo(() => {
    const subtotal = Number(cart.subtotal || 0);
    const promotionDiscount = Math.max(
      0,
      Number(cart.promotionDiscount ?? cart.promotions?.discount ?? 0),
    );
    const couponDiscount = Math.max(
      0,
      Number(cart.couponDiscount ?? cart.coupon?.discount ?? 0),
    );
    const rawTotalDiscount = Math.max(
      0,
      Number(cart.totalDiscount ?? couponDiscount + promotionDiscount),
    );
    const discount = Math.min(subtotal, rawTotalDiscount);
    const total = Math.max(0, subtotal - discount);

    return {
      items: cart.items.map((it) => ({
        ...it,
        lineTotal: (Number(it.price) || 0) * Number(it.qty || 0),
      })),
      subtotal,
      discount,
      total,
      coupon: cart.coupon
        ? {
            code: cart.coupon.code,
            description: cart.coupon.description,
            discount: couponDiscount,
          }
        : null,
      couponDiscount,
      promotionDiscount,
      promotions: cart.promotions?.applied || [],
    };
  }, [
    cart.items,
    cart.subtotal,
    cart.coupon,
    cart.promotions,
    cart.couponDiscount,
    cart.promotionDiscount,
    cart.totalDiscount,
  ]);

  const currentTotals = order?.orderPreview
    ? {
        ...order.orderPreview,
        couponDiscount: Number(
          order.orderPreview.couponDiscount ??
            order.orderPreview.coupon?.discount ??
            0,
        ),
        promotionDiscount: Number(order.orderPreview.promotionDiscount || 0),
        promotions: order.orderPreview.promotions || [],
      }
    : baseTotals;

  const promotionItems = currentTotals.promotions || [];

  const freebiesByProduct = useMemo(() => {
    const map = new Map();
    promotionItems.forEach((promotion) => {
      (promotion.items || []).forEach((item) => {
        const productId = item.productId;
        if (!productId) return;
        const key = String(productId);
        const prev = map.get(key) || { qty: 0, discount: 0, titles: [] };
        const freeQty = Number(item.freeQty || 0);
        const discount = Number(item.discount || 0);
        const label = promotion.title || promotion.summary || "โปรโมชั่น";
        const titles = prev.titles.includes(label) ? prev.titles : [...prev.titles, label];
        map.set(key, {
          qty: prev.qty + freeQty,
          discount: prev.discount + discount,
          titles,
        });
      });
    });
    return map;
  }, [promotionItems]);

  useEffect(() => {
    if (order?.orderPreview?.total != null) {
      setTransferAmount(Number(order.orderPreview.total || 0).toFixed(2));
      setReference("");
    } else {
      setTransferAmount("");
      setReference("");
    }
  }, [order]);

  const needsPayment = (order?.orderPreview?.total || 0) > 0;

  async function handleSelectMethod(nextMethod) {
    if (paymentMethod === nextMethod && (!order || order.method === nextMethod)) {
      return;
    }

    setPaymentMethod(nextMethod);

    if (!order) {
      return;
    }

    setUpdatingMethod(true);
    setErr("");

    try {
      const res = await fetch(`/api/orders/${order.orderId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: nextMethod }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : null;
      if (!res.ok || !data?.ok) throw new Error(data?.error || "ไม่สามารถเปลี่ยนวิธีการชำระเงินได้");

      setOrder(data);
      setPaymentMethod(data.method || nextMethod);
      setSlipData("");
      setSlipName("");
      setReference("");
    } catch (e) {
      setErr(String(e.message || e));
      setPaymentMethod(order.method || paymentMethod);
    } finally {
      setUpdatingMethod(false);
    }
  }

  async function placeOrder() {
    if (order) {
      setErr("คุณได้สร้างคำสั่งซื้อแล้ว กรุณาใช้ปุ่มด้านล่างเพื่อยืนยันการชำระเงินหรือติดต่อร้านค้าเพื่อแก้ไข");
      return;
    }

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
    setSlipData("");
    setSlipName("");
    setTransferAmount("");
    setReference("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: paymentMethod,
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
      setPaymentMethod(data.method || paymentMethod);
      cart.clear();
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

    if (needsPayment && !transferAmount) {
      setErr("กรุณากรอกจำนวนเงินที่โอน");
      return;
    }

    setErr("");
    setConfirming(true);

    try {
      const res = await fetch(`/api/orders/${order.orderId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slip: slipData,
          filename: slipName,
          amount: transferAmount,
          reference,
        }),
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
      <div className="absolute inset-0 bg-[var(--color-burgundy-dark)]" />
      <div className="absolute -top-24 left-20 h-64 w-64 rounded-full bg-[var(--color-rose)]/18 blur-3xl" />
      <div className="absolute -bottom-28 right-10 h-72 w-72 rounded-full bg-[var(--color-gold)]/18 blur-3xl" />

      <div className="relative max-w-screen-xl mx-auto px-6 lg:px-8 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--color-rose)]">ชำระเงิน</p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--color-rose-dark)]">รายละเอียดจัดส่ง &amp; ยืนยันการโอน</h1>
          <p className="mt-2 text-sm text-[var(--color-choco)]/70">
            กรอกข้อมูลการจัดส่ง แล้วระบบจะสร้าง QR PromptPay พร้อมให้แนบสลิปยืนยัน เพื่อให้ทีมงานเริ่มจัดเตรียมสินค้าอย่างรวดเร็ว
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-8 shadow-2xl shadow-black/45 backdrop-blur space-y-6">
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
                    className={`w-full rounded-2xl border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40 ${
                      REQUIRED_FIELDS.includes(key) && !form[key] ? "border-rose-300" : ""
                    }`}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--color-rose)]/30">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-choco)]">เลือกวิธีการชำระเงิน</h3>
                <p className="mt-1 text-xs text-[var(--color-choco)]/70">
                  รองรับทั้งการโอนผ่าน PromptPay และการโอนเข้าบัญชีธนาคาร พร้อมแนบสลิปเพื่อให้ระบบตรวจสอบยอดให้อัตโนมัติ
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[{ value: "promptpay", label: "PromptPay QR", description: "สแกนจ่ายได้ทันที" }, { value: "bank", label: "โอนผ่านบัญชี", description: "โอนเข้าบัญชีธนาคาร" }].map((option) => {
                  const active = paymentMethod === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectMethod(option.value)}
                      disabled={updatingMethod && paymentMethod !== option.value}
                      className={`rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40 ${
                        active
                          ? "border-[var(--color-rose)] bg-[rgba(240,200,105,0.16)] text-[var(--color-rose)] shadow-lg shadow-black/40"
                          : "border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/55 text-[var(--color-text)]/80"
                      } ${updatingMethod ? "cursor-wait" : ""}`}
                    >
                      <div className="text-sm font-semibold">{option.label}</div>
                      <div className="mt-1 text-xs text-[var(--color-text)]/70">{option.description}</div>
                    </button>
                  );
                })}
              </div>
              {order ? (
                <p className="text-xs text-[var(--color-choco)]/60">
                  สร้างคำสั่งซื้อแล้ว สามารถสลับวิธีการชำระเงินได้ตลอดโดยไม่ต้องสร้างคำสั่งซื้อใหม่
                </p>
              ) : null}

              <button
                onClick={placeOrder}
                disabled={creating || cart.items.length === 0 || Boolean(order)}
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(240,200,105,0.33)] transition ${
                  creating || cart.items.length === 0 || order
                    ? "bg-[var(--color-burgundy-dark)]/40 cursor-not-allowed"
                    : "bg-[var(--color-rose)] hover:shadow-xl"
                }`}
              >
                {order
                  ? "สร้างคำสั่งซื้อเรียบร้อยแล้ว"
                  : creating
                  ? "กำลังสร้างคำสั่งซื้อ..."
                  : paymentMethod === "bank"
                  ? "สร้างคำสั่งซื้อเพื่อโอน"
                  : "สร้างคำสั่งซื้อและ QR"}
              </button>
            </div>

            {err && <div className="text-sm text-[var(--color-rose)]">{err}</div>}
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-6 shadow-2xl shadow-black/40 backdrop-blur">
              <h2 className="text-lg font-semibold text-[var(--color-choco)]">สรุปรายการ</h2>
              <div className="mt-4 space-y-3 text-sm">
                {currentTotals.items.map((it) => {
                  const bonus = freebiesByProduct.get(String(it.productId));
                  return (
                    <div key={`${it.productId}-${it.title}`} className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span>
                          {it.title} × {it.qty}
                        </span>
                        <span>฿{fmt(it.lineTotal ?? (it.price || 0) * it.qty)}</span>
                      </div>
                      {bonus?.qty ? (
                        <div className="flex justify-between text-xs text-[var(--color-rose)]/85">
                          <span>
                            รับฟรี {bonus.qty} ชิ้นจากโปร {bonus.titles.join(", ")}
                          </span>
                          <span>-฿{fmt(bonus.discount)}</span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2 border-t border-[var(--color-rose)]/30 pt-4 text-sm">
                <div className="flex justify-between text-[var(--color-choco)]/80">
                  <span>รวม</span>
                  <span>฿{fmt(currentTotals.subtotal)}</span>
                </div>
                {currentTotals.promotionDiscount ? (
                  <div className="flex justify-between text-[var(--color-rose)]/85">
                    <span>ส่วนลดโปรโมชันอัตโนมัติ</span>
                    <span>-฿{fmt(currentTotals.promotionDiscount)}</span>
                  </div>
                ) : null}
                {!currentTotals.promotionDiscount && promotionsLoading ? (
                  <div className="flex justify-between text-xs text-[var(--color-choco)]/60">
                    <span>กำลังตรวจสอบโปรโมชัน...</span>
                    <span className="font-semibold text-[var(--color-choco)]/70">รอสักครู่</span>
                  </div>
                ) : null}
                {promotionsError && !currentTotals.promotionDiscount && !promotionsLoading ? (
                  <div className="rounded-2xl bg-rose-500/15 px-3 py-2 text-xs text-rose-200">
                    {promotionsError}
                  </div>
                ) : null}
                {currentTotals.couponDiscount ? (
                  <div className="flex justify-between text-[var(--color-gold)]">
                    <span>
                      คูปอง {currentTotals.coupon?.code}
                      {currentTotals.coupon?.description ? ` (${currentTotals.coupon.description})` : ""}
                    </span>
                    <span>-฿{fmt(currentTotals.couponDiscount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-base font-semibold text-[var(--color-rose-dark)]">
                  <span>ยอดสุทธิ</span>
                  <span>฿{fmt(currentTotals.total)}</span>
                </div>
              </div>
              {currentTotals.promotions?.length ? (
                <div className="mt-4 rounded-2xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy-dark)]/40 px-4 py-3 text-xs text-[var(--color-text)]/80">
                  <h3 className="text-sm font-semibold text-[var(--color-gold)]">โปรโมชันที่ใช้ในคำสั่งซื้อนี้</h3>
                  <ul className="mt-2 space-y-2">
                    {currentTotals.promotions.map((promo, idx) => (
                      <li key={`${promo.promotionId || promo.id || promo.title || "promo"}-${idx}`} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-3">
                          <span>{promo.title || promo.summary || "โปรโมชั่น"}</span>
                          <span className="font-semibold text-[var(--color-rose)]">-฿{fmt(promo.discount)}</span>
                        </div>
                        {promo.freeQty ? (
                          <span className="text-[var(--color-text)]/60">รับฟรี {promo.freeQty} ชิ้น</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-6 shadow-2xl shadow-black/40 backdrop-blur space-y-4">
              <h2 className="text-lg font-semibold text-[var(--color-choco)]">ยืนยันการโอน</h2>
              {order ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[var(--color-rose)]/35 bg-[rgba(240,200,105,0.12)] px-4 py-3 text-sm text-[var(--color-gold)]">
                    สร้างคำสั่งซื้อ #{order.orderId} แล้ว กรุณาชำระเงินและแนบสลิปเพื่อยืนยัน ระบบจะตรวจสอบยอดที่ชำระให้อัตโนมัติ
                  </div>
                  {order.promptpay ? (
                    <QrBox
                      payload={order.promptpay.payload}
                      amount={order.orderPreview.total}
                      title="สแกนเพื่อชำระเงิน"
                    />
                  ) : paymentMethod === "bank" && order.bankAccount ? (
                    <div className="space-y-3 rounded-2xl border border-[var(--color-rose)]/35 bg-[rgba(240,200,105,0.12)] p-4 text-sm text-[var(--color-choco)]">
                      <div className="font-semibold text-[var(--color-rose-dark)]">รายละเอียดบัญชีสำหรับโอน</div>
                      <div>ธนาคาร: {order.bankAccount.bank}</div>
                      <div>เลขบัญชี: {order.bankAccount.number}</div>
                      <div>ชื่อบัญชี: {order.bankAccount.name}</div>
                      {order.bankAccount.promptpayId ? (
                        <div className="text-xs text-[var(--color-choco)]/70">
                          หรือโอนผ่าน PromptPay ID: {order.bankAccount.promptpayId}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-sm text-[var(--color-choco)]/70">ออเดอร์นี้ไม่ต้องชำระเงินเพิ่มเติม</div>
                  )}

                  {needsPayment ? (
                    <div className="space-y-2 text-sm">
                      <label className="font-medium">จำนวนเงินที่โอน (บาท) *</label>
                      <input
                        type="text"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        className="w-full rounded-2xl border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                        placeholder={`ยอดที่ต้องชำระ ฿${fmt(order.orderPreview.total)}`}
                      />
                      <p className="text-xs text-[var(--color-choco)]/60">ยอดที่ต้องชำระทั้งหมด ฿{fmt(order.orderPreview.total)}</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/40 px-4 py-3 text-sm text-[var(--color-text)]/75">
                      ออเดอร์นี้ไม่มียอดที่ต้องชำระเพิ่มเติม
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <label className="font-medium">หมายเลขอ้างอิงการโอน (ถ้ามี)</label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full rounded-2xl border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                      placeholder="เช่น เลขที่รายการ หรือเลขอ้างอิงจากแอปธนาคาร"
                    />
                  </div>

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
                    disabled={confirming || updatingMethod || !slipData || (needsPayment && !transferAmount)}
                    className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(240,200,105,0.33)] transition ${
                      confirming || updatingMethod || !slipData || (needsPayment && !transferAmount)
                        ? "bg-[var(--color-burgundy-dark)]/40 cursor-not-allowed"
                        : "bg-[var(--color-rose)] hover:shadow-xl"
                    }`}
                  >
                    {confirming ? "กำลังยืนยัน..." : updatingMethod ? "กำลังอัปเดตวิธีชำระเงิน..." : "ยืนยันการชำระเงิน"}
                  </button>
                </div>
              ) : (
                <div className="text-sm text-[var(--color-choco)]/70">
                  กดปุ่ม "สร้างคำสั่งซื้อ" เพื่อสร้างคำสั่งซื้อและรับรายละเอียดการชำระเงิน
                </div>
              )}
              {err && order && <div className="text-sm text-[var(--color-rose)]">{err}</div>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
