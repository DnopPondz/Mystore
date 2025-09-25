"use client";

import { useState } from "react";

const initialState = {
  name: "",
  phone: "",
  email: "",
  lineId: "",
  company: "",
  eventDate: "",
  eventTime: "",
  servings: "",
  budget: "",
  deliveryArea: "",
  occasion: "",
  flavourIdeas: "",
  notes: "",
  moodboardUrl: "",
  referenceImage: "",
  preferredContact: "phone",
};

const planningSteps = [
  {
    title: "พูดคุยคอนเซ็ปต์",
    description: "แจ้งจำนวนแขก งบประมาณ และสไตล์ที่ชอบ ทีมงานจะช่วยแนะนำไส้และรูปแบบการจัดวางให้เหมาะกับงาน",
  },
  {
    title: "ชิมตัวอย่าง",
    description: "สำหรับออเดอร์มากกว่า 80 ชิ้น สามารถนัดชิมตัวอย่างได้ล่วงหน้าอย่างน้อย 3 วัน",
  },
  {
    title: "ยืนยันและจัดส่ง",
    description: "เราจัดเตรียมและส่งถึงสถานที่ พร้อมจัดเซตซาลาเปา-ขนมจีบให้น่ารับประทาน",
  },
];

const deliveryNotes = [
  "ส่งฟรีในเขตเทศบาลเมืองลำพูนเมื่อสั่งครบ 1,500 บาท",
  "มีบริการจัดส่งต่างอำเภอโดยร่วมกับไรเดอร์ในพื้นที่ (มีค่าใช้จ่ายตามระยะทาง)",
  "สามารถรับสินค้าเองได้ที่หน้าร้าน ซอยรอบเมือง 7 ตำบลในเมือง",
];

export default function PreOrderPage() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  const updateField = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(initialState);
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "อัปโหลดไฟล์ไม่สำเร็จ");
    }
    return data.url;
  };

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus(null);
    setUploading(true);
    try {
      const url = await handleFileUpload(file);
      setForm((prev) => ({ ...prev, referenceImage: url }));
      setStatus({ type: "success", message: "อัปโหลดไฟล์อ้างอิงเรียบร้อย" });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "อัปโหลดไฟล์ไม่สำเร็จ" });
    } finally {
      setUploading(false);
    }
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
          ? "รับคำขอเรียบร้อยแล้ว ทีม Bao Lamphun จะติดต่อกลับภายใน 24 ชั่วโมง"
          : "รับคำขอเรียบร้อยแล้ว กรุณาแอด LINE @baolamphun เพื่อยืนยันรายละเอียด",
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--color-burgundy-dark)] via-[rgba(58,16,16,0.9)] to-[var(--color-burgundy)]"
        aria-hidden
      />

      <section className="relative max-w-screen-xl mx-auto px-6 lg:px-10 pt-16 pb-10 space-y-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy)]/70 px-4 py-1 text-sm font-semibold text-[var(--color-rose)] shadow-lg shadow-black/40">
              Pre-order จาก Bao Lamphun
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-choco)] leading-tight">
              วางแผนซาลาเปา & ขนมจีบสำหรับงานพิเศษ
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-choco)]/80">
              ทีม Bao Lamphun พร้อมช่วยออกแบบชุดซาลาเปาและขนมจีบที่เหมาะกับแขกและบรรยากาศงานของคุณ ไม่ว่าจะเป็นงานประชุมยามเช้า งานบุญ หรืองานฉลองในครอบครัว
            </p>
            <div className="grid gap-4 sm:grid-cols-2 text-sm text-[var(--color-choco)]/70">
              {planningSteps.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-5 shadow-2xl shadow-black/40 backdrop-blur"
                >
                  <p className="font-semibold text-[var(--color-choco)]">{item.title}</p>
                  <p className="mt-2 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="rounded-[46%] border border-[var(--color-rose)]/30 bg-gradient-to-br from-[var(--color-burgundy-dark)] via-[rgba(58,16,16,0.85)] to-[var(--color-burgundy)] p-10 text-center shadow-2xl shadow-black/45">
              <p className="text-sm font-semibold tracking-[0.3em] uppercase text-[var(--color-rose)]">Made to Order</p>
              <p className="mt-3 text-3xl font-black text-[var(--color-choco)]">ปรับแต่งได้ตามธีมงาน</p>
              <p className="mt-4 text-sm text-[var(--color-choco)]/70">
                เลือกไส้ ขนาด และแพ็กเกจจิ้ง พร้อมบริการจัดส่งถึงสถานที่ในเขตเมืองลำพูนภายใน 07:00 - 18:00 น.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative max-w-screen-xl mx-auto px-6 lg:px-10 pb-20 grid gap-8 xl:grid-cols-[3fr_2fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-8 shadow-2xl shadow-black/45 backdrop-blur space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[var(--color-choco)]">กรอกรายละเอียดสำหรับสั่งทำพิเศษ</h2>
            <p className="text-sm text-[var(--color-choco)]/70">
              เราจะติดต่อกลับภายใน 24 ชั่วโมงทำการเพื่อยืนยันรายละเอียดและเสนอแพ็กเกจที่เหมาะสม
            </p>
          </div>

          {status && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                status.type === "success"
                  ? "border border-[var(--color-rose)]/35 bg-[rgba(240,200,105,0.12)] text-[var(--color-gold)]"
                  : "border border-[var(--color-rose)]/40 bg-[rgba(120,32,32,0.55)] text-[var(--color-rose)]"
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              ชื่อ-นามสกุล*
              <input
                type="text"
                value={form.name}
                onChange={updateField("name")}
                className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
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
                className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
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
                className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                placeholder="name@example.com"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              LINE ID
              <input
                type="text"
                value={form.lineId}
                onChange={updateField("lineId")}
                className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                placeholder="@baolamphun"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm font-medium">
              วันที่จัดงาน
              <input
                type="date"
                value={form.eventDate}
                onChange={updateField("eventDate")}
                className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              เวลาเริ่มงาน
              <input
                type="time"
                value={form.eventTime}
                onChange={updateField("eventTime")}
                className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              โอกาสพิเศษ
              <input
                type="text"
                value={form.occasion}
                onChange={updateField("occasion")}
                className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                placeholder="เช่น งานแต่ง, ประชุมบริษัท"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm font-medium">
              จำนวนชิ้นที่ต้องการ (โดยประมาณ)
              <input
                type="number"
                min="0"
                value={form.servings}
                onChange={updateField("servings")}
                className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                placeholder="เช่น 120"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              งบประมาณต่อชุด (บาท)
              <input
                type="number"
                min="0"
                value={form.budget}
                onChange={updateField("budget")}
                className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                placeholder="เช่น 45"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              พื้นที่จัดส่ง
              <input
                type="text"
                value={form.deliveryArea}
                onChange={updateField("deliveryArea")}
                className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                placeholder="เช่น ต.ในเมือง อ.เมือง"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              รายละเอียดรสชาติ / ไอเดียที่ต้องการ*
              <textarea
                rows={5}
                value={form.flavourIdeas}
                onChange={updateField("flavourIdeas")}
                className="rounded-3xl border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-sm text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                placeholder="เช่น ต้องการซาลาเปาไส้หมูสับ 80 ลูก ขนมจีบกุ้ง 40 ลูก จัดชุด 4 ลูกต่อกล่อง"
                required
              />
            </label>
            <div className="grid gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium">
                ลิงก์ moodboard (ถ้ามี)
                <input
                  type="url"
                  value={form.moodboardUrl}
                  onChange={updateField("moodboardUrl")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                  placeholder="ลิงก์ Google Drive หรือ Pinterest"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                แนบภาพตัวอย่าง
                <div className="flex items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-dashed border-[var(--color-rose)]/40 px-4 py-2 text-xs font-semibold text-[var(--color-rose)] transition hover:border-[var(--color-rose)] hover:bg-[var(--color-burgundy)]/40">
                    {uploading ? "กำลังอัปโหลด..." : "เลือกไฟล์"}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageSelect}
                      disabled={uploading}
                    />
                  </label>
                  {form.referenceImage && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, referenceImage: "" }))}
                      className="text-xs font-medium text-[var(--color-rose)] underline"
                    >
                      ลบรูป
                    </button>
                  )}
                </div>
                {form.referenceImage && (
                  <img
                    src={form.referenceImage}
                    alt="ตัวอย่างงาน"
                    className="mt-2 h-24 w-24 rounded-2xl object-cover shadow"
                  />
                )}
              </label>
            </div>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium">
            ข้อมูลเพิ่มเติมที่อยากแจ้งทีมงาน
            <textarea
              rows={4}
              value={form.notes}
              onChange={updateField("notes")}
              className="rounded-3xl border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-sm text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
              placeholder="เช่น ต้องการใบกำกับภาษี หรือให้จัดส่งเป็นรอบ ๆ"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              ช่องทางที่สะดวกให้ติดต่อกลับ
              <select
                value={form.preferredContact}
                onChange={updateField("preferredContact")}
                className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
              >
                <option value="phone">โทรศัพท์</option>
                <option value="line">LINE</option>
                <option value="email">อีเมล</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              องค์กร / บริษัท (ถ้ามี)
              <input
                type="text"
                value={form.company}
                onChange={updateField("company")}
                className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                placeholder="ชื่อบริษัทหรือทีมงาน"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--color-choco)]/60">
              โดยการส่งฟอร์มนี้ ถือว่ายินยอมให้ Bao Lamphun ติดต่อกลับผ่านช่องทางที่ระบุ เพื่อเสนอแพ็กเกจและยืนยันรายละเอียดงาน
            </p>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-[rgba(240,200,105,0.33)] transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "กำลังส่งคำขอ..." : "ส่งคำขอพรีออเดอร์"}
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-6 shadow-2xl shadow-black/45 backdrop-blur">
            <h3 className="text-lg font-semibold text-[var(--color-choco)]">เวลารับคำสั่งและจัดส่ง</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-choco)]/75">
              <li>เปิดรับออเดอร์ทุกวัน 07:00 - 18:00 น.</li>
              <li>แจ้งล่วงหน้าอย่างน้อย 3 วันสำหรับออเดอร์ 50-150 ชิ้น</li>
              <li>ออเดอร์มากกว่า 150 ชิ้น กรุณาแจ้งล่วงหน้า 5-7 วัน</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-6 shadow-2xl shadow-black/45 backdrop-blur">
            <h3 className="text-lg font-semibold text-[var(--color-choco)]">พื้นที่ให้บริการ</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-choco)]/75 list-disc list-inside">
              {deliveryNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-6 shadow-2xl shadow-black/45 backdrop-blur space-y-3">
            <h3 className="text-lg font-semibold text-[var(--color-choco)]">คอนเซียร์จสำหรับงานพิเศษ</h3>
            <p className="text-sm text-[var(--color-choco)]/75">
              ต้องการที่ปรึกษาแบบด่วน? ติดต่อพี่มีนได้ที่ <a href="tel:0612674523" className="font-semibold text-[var(--color-rose)]">061-267-4523</a>
              {" "}หรือ LINE <a href="https://line.me/R/ti/p/@baolamphun" target="_blank" rel="noreferrer" className="font-semibold text-[var(--color-rose)]">@baolamphun</a>
            </p>
            <p className="text-xs text-[var(--color-choco)]/60">
              เรามีทีมดูแลงานแต่ง งานบุญ และประชุมองค์กร พร้อมชุดทดลองชิมสำหรับลูกค้าใหม่
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
