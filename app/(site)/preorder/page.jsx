"use client";

import { useEffect, useState } from "react";

const initialState = {
  name: "",
  phone: "",
  email: "",
  eventDate: "",
  eventTime: "",
  servings: "",
  budget: "",
  flavourIdeas: "",
  notes: "",
  preferredContact: "phone",
  productId: "",
};

export default function PreOrderPage() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [productInfo, setProductInfo] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product");
    if (!productId) return;
    setForm((prev) => (prev.productId === productId ? prev : { ...prev, productId }));
    (async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) return;
        const data = await res.json();
        setProductInfo(data);
      } catch (error) {
        console.warn("ไม่สามารถโหลดข้อมูลสินค้าได้", error);
      }
    })();
  }, []);

  const updateField = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(initialState);
    setProductInfo(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    if (!form.name.trim() || !form.phone.trim() || !form.flavourIdeas.trim()) {
      setStatus({ type: "error", message: "กรุณากรอกชื่อ เบอร์ติดต่อ และรายละเอียดขนมที่ต้องการ" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/preorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }

      const data = await response.json();
      resetForm();
      setStatus({
        type: "success",
        message: data.stored
          ? "รับคำขอเรียบร้อยแล้ว ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง"
          : "รับคำขอเรียบร้อยแล้ว กรุณาติดต่อผ่านช่องทางหลักเพื่อยืนยันรายละเอียด",
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#fff7eb] text-[#3c1a09]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-16 h-72 w-72 rounded-full bg-[#5b3dfc]/15 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-[#f1c154]/18 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-screen-xl px-6 pb-10 pt-16 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#5b3dfc]/30 bg-[#fff3d6] px-4 py-1 text-sm font-semibold text-[#5b3dfc] shadow">
              สั่งทำขนมพิเศษ
            </span>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">ออกแบบของหวานสำหรับงานของคุณ</h1>
            <p className="text-base text-[#3c1a09]/80 sm:text-lg">
              ไม่ว่าจะเป็นงานวันเกิด งานหมั้น งานองค์กร หรือของฝากพิเศษ ทีมเชฟของเราพร้อมช่วยออกแบบเมนูตามความต้องการ พร้อมที่ปรึกษาด้านรสชาติและงบประมาณ
            </p>
            <div className="grid gap-4 sm:grid-cols-2 text-sm text-[#3c1a09]/70">
              <div className="rounded-3xl border border-[#e6c688] bg-white/95 p-5 shadow-xl shadow-[rgba(60,26,9,0.15)] backdrop-blur">
                <p className="font-semibold text-[#5b3dfc]">บริการที่ได้รับ</p>
                <ul className="mt-3 space-y-2 list-inside list-disc">
                  <li>ออกแบบรสชาติและหน้าตาขนม</li>
                  <li>ตัวอย่างชิมก่อนวันงาน</li>
                  <li>จัดส่งและจัดเซตในสถานที่</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-[#e6c688] bg-white/95 p-5 shadow-xl shadow-[rgba(60,26,9,0.15)] backdrop-blur">
                <p className="font-semibold text-[#5b3dfc]">ระยะเวลาแนะนำ</p>
                <ul className="mt-3 space-y-2 list-inside list-disc">
                  <li>แจ้งล่วงหน้าอย่างน้อย 3-5 วัน</li>
                  <li>ออเดอร์ใหญ่กว่า 100 ชิ้น ควรแจ้ง 10 วัน</li>
                  <li>ทีมงานตอบกลับภายใน 24 ชั่วโมง</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="rounded-[46%] border border-[#e6c688] bg-white p-10 text-center shadow-2xl shadow-[rgba(60,26,9,0.2)]">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#5b3dfc]">Made to Order</p>
              <p className="mt-3 text-3xl font-black">Pre-order ขนมชิ้นโปรด</p>
              <p className="mt-4 text-sm text-[#3c1a09]/70">
                เลือกธีม สี หรือไอเดียที่คุณชอบ แล้วปล่อยให้เราเนรมิตของหวานให้เข้ากับบรรยากาศงานของคุณ
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-screen-xl gap-8 px-6 pb-20 lg:grid-cols-[2fr_1fr] lg:px-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#e6c688] bg-white/95 p-8 shadow-2xl shadow-[rgba(60,26,9,0.15)] backdrop-blur space-y-6"
        >
          <div>
            <h2 className="text-2xl font-semibold text-[#5b3dfc]">กรอกรายละเอียดสำหรับสั่งทำพิเศษ</h2>
            <p className="mt-2 text-sm text-[#3c1a09]/70">
              ทีมงานจะตรวจสอบข้อมูลและติดต่อกลับพร้อมใบเสนอราคาภายใน 24 ชั่วโมงทำการ
            </p>
          </div>

          {status && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                status.type === "success"
                  ? "border border-[#5b3dfc]/30 bg-[#f5edff] text-[#5b3dfc]"
                  : "border border-[#e06a6a]/40 bg-[#fdeaea] text-[#b84d4d]"
              }`}
            >
              {status.message}
            </div>
          )}

          {productInfo ? (
            <div className="rounded-2xl border border-[#e6c688] bg-[#fff3d6] px-4 py-3 text-sm text-[#3c1a09]/80">
              <p className="font-semibold text-[#5b3dfc]">สั่งทำสำหรับสินค้า:</p>
              <p className="mt-1 text-[#3c1a09]">{productInfo.title}</p>
              <p className="text-xs text-[#3c1a09]/60">ราคาเริ่มต้น {Number(productInfo.price || 0).toLocaleString("th-TH")} บาท</p>
            </div>
          ) : form.productId ? (
            <div className="rounded-2xl border border-[#e6c688]/70 bg-white/80 px-4 py-3 text-xs text-[#3c1a09]/70">
              กำลังตรวจสอบรายละเอียดสินค้าแบบ Pre-order...
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              ชื่อ-นามสกุล*
              <input
                type="text"
                value={form.name}
                onChange={updateField("name")}
                className="rounded-full border border-[#e6c688] bg-white/80 px-4 py-3 text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                placeholder="ชื่อผู้ติดต่อ"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              เบอร์ติดต่อ*
              <input
                type="tel"
                value={form.phone}
                onChange={updateField("phone")}
                className="rounded-full border border-[#e6c688] bg-white/80 px-4 py-3 text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                placeholder="0X-XXX-XXXX"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              อีเมล
              <input
                type="email"
                value={form.email}
                onChange={updateField("email")}
                className="rounded-full border border-[#e6c688] bg-white/80 px-4 py-3 text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                placeholder="name@example.com"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              จำนวนที่ต้องการโดยประมาณ
              <input
                type="number"
                value={form.servings}
                onChange={updateField("servings")}
                className="rounded-full border border-[#e6c688] bg-white/80 px-4 py-3 text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                placeholder="เช่น 50 ชิ้น"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              วันที่ต้องการรับสินค้า
              <input
                type="date"
                value={form.eventDate}
                onChange={updateField("eventDate")}
                className="rounded-full border border-[#e6c688] bg-white/80 px-4 py-3 text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              เวลาที่สะดวก
              <input
                type="time"
                value={form.eventTime}
                onChange={updateField("eventTime")}
                className="rounded-full border border-[#e6c688] bg-white/80 px-4 py-3 text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
              งบประมาณต่อเซต (ถ้ามี)
              <input
                type="text"
                value={form.budget}
                onChange={updateField("budget")}
                className="rounded-full border border-[#e6c688] bg-white/80 px-4 py-3 text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                placeholder="เช่น 1,500 บาท"
              />
            </label>
          </div>

          <div className="grid gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium">
              ไส้/รสชาติที่อยากได้*
              <textarea
                value={form.flavourIdeas}
                onChange={updateField("flavourIdeas")}
                className="min-h-[120px] rounded-3xl border border-[#e6c688] bg-white/80 px-4 py-3 text-sm text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                placeholder="ระบุไส้ รสชาติ สี หรือธีมของขนมที่อยากได้"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              รายละเอียดเพิ่มเติม
              <textarea
                value={form.notes}
                onChange={updateField("notes")}
                className="min-h-[100px] rounded-3xl border border-[#e6c688] bg-white/80 px-4 py-3 text-sm text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                placeholder="แจ้งแพ็กเกจจิ้ง การจัดเซต หรือข้อจำกัดด้านอาหาร"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              ช่องทางที่อยากให้ติดต่อกลับ
              <select
                value={form.preferredContact}
                onChange={updateField("preferredContact")}
                className="rounded-full border border-[#e6c688] bg-white/80 px-4 py-3 text-sm text-[#3c1a09] focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
              >
                <option value="phone">โทรกลับ</option>
                <option value="line">LINE Official</option>
                <option value="email">อีเมล</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              รหัสสินค้า (ถ้ามี)
              <input
                type="text"
                value={form.productId}
                onChange={updateField("productId")}
                className="rounded-full border border-[#e6c688] bg-white/80 px-4 py-3 text-sm text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                placeholder="กรอกรหัสสินค้าจากหน้าเมนู"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-[#f1c154] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(247,201,72,0.35)] transition hover:bg-[#b6791c] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "กำลังส่งคำขอ..." : "ส่งคำขอสั่งทำพิเศษ"}
          </button>
        </form>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-[#e6c688] bg-white/95 p-6 shadow-xl shadow-[rgba(60,26,9,0.15)] backdrop-blur">
            <h3 className="text-lg font-semibold text-[#5b3dfc]">ไอเดียเมนูยอดนิยม</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#3c1a09]/75">
              <li>เซตซาลาเปาหลากรส 3 ไส้ สำหรับงานประชุม</li>
              <li>ขนมจีบกุ้งพร้อมน้ำจิ้มถ้วยส่วนตัว</li>
              <li>มินิซาลาเปาไส้หวานสีพาสเทลสำหรับงานเด็ก</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-[#e6c688] bg-white/95 p-6 shadow-xl shadow-[rgba(60,26,9,0.15)] backdrop-blur">
            <h3 className="text-lg font-semibold text-[#5b3dfc]">ช่องทางติดต่อด่วน</h3>
            <p className="mt-2 text-sm text-[#3c1a09]/70">
              โทร 08X-XXX-XXXX หรือ LINE: @baolamphun หากต้องการให้ทีมงานช่วยแนะนำเมนูด่วน
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
