"use client";

import { useState } from "react";

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
};

export default function PreOrderPage() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const updateField = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(initialState);
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
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#fff0e1] via-[#fff8ef] to-white" aria-hidden />

      <section className="relative max-w-screen-xl mx-auto px-6 lg:px-10 pt-16 pb-10 space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-sm font-semibold text-[var(--color-rose-dark)] shadow">
              สั่งทำขนมพิเศษ
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-choco)] leading-tight">
              ออกแบบของหวานสำหรับงานของคุณ
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-choco)]/80">
              ไม่ว่าจะเป็นงานวันเกิด งานหมั้น งานองค์กร หรือของฝากพิเศษ ทีมเชฟของเราพร้อมช่วยออกแบบเมนูตามความต้องการ พร้อมที่ปรึกษาด้านรสชาติและงบประมาณ
            </p>
            <div className="grid gap-4 sm:grid-cols-2 text-sm text-[var(--color-choco)]/70">
              <div className="rounded-3xl bg-white/90 p-5 shadow-md shadow-[rgba(240,200,105,0.08)]">
                <p className="font-semibold text-[var(--color-choco)]">บริการที่ได้รับ</p>
                <ul className="mt-3 space-y-2 list-disc list-inside">
                  <li>ออกแบบรสชาติและหน้าตาขนม</li>
                  <li>ตัวอย่างชิมก่อนวันงาน</li>
                  <li>จัดส่งและจัดเซตในสถานที่</li>
                </ul>
              </div>
              <div className="rounded-3xl bg-white/90 p-5 shadow-md shadow-[rgba(240,200,105,0.08)]">
                <p className="font-semibold text-[var(--color-choco)]">ระยะเวลาแนะนำ</p>
                <ul className="mt-3 space-y-2 list-disc list-inside">
                  <li>แจ้งล่วงหน้าอย่างน้อย 3-5 วัน</li>
                  <li>ออเดอร์ใหญ่กว่า 100 ชิ้น ควรแจ้ง 10 วัน</li>
                  <li>ทีมงานตอบกลับภายใน 24 ชั่วโมง</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="rounded-[46%] bg-gradient-to-br from-white via-[#fff2e2] to-[#ffe8d2] p-10 shadow-2xl shadow-[rgba(240,200,105,0.25)] text-center">
              <p className="text-sm font-semibold tracking-[0.3em] uppercase text-[var(--color-rose)]">Made to Order</p>
              <p className="mt-3 text-3xl font-black text-[var(--color-choco)]">Pre-order ขนมชิ้นโปรด</p>
              <p className="mt-4 text-sm text-[var(--color-choco)]/70">
                เลือกธีม สี หรือไอเดียที่คุณชอบ แล้วปล่อยให้เราเนรมิตของหวานให้เข้ากับบรรยากาศงานของคุณ
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative max-w-screen-xl mx-auto px-6 lg:px-10 pb-20 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-[rgba(240,200,105,0.08)] space-y-6"
        >
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-choco)]">กรอกรายละเอียดสำหรับสั่งทำพิเศษ</h2>
            <p className="mt-2 text-sm text-[var(--color-choco)]/70">
              ทีมงานจะตรวจสอบข้อมูลและติดต่อกลับพร้อมใบเสนอราคาภายใน 24 ชั่วโมงทำการ
            </p>
          </div>

          {status && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-[var(--color-rose-dark)]"
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm font-medium gap-2">
              ชื่อ-นามสกุล*
              <input
                type="text"
                value={form.name}
                onChange={updateField("name")}
                className="rounded-full border border-white/0 bg-[rgba(255,241,236,0.7)] px-4 py-3 text-[var(--color-choco)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]"
                placeholder="ชื่อผู้ติดต่อ"
                required
              />
            </label>
            <label className="flex flex-col text-sm font-medium gap-2">
              เบอร์ติดต่อ*
              <input
                type="tel"
                value={form.phone}
                onChange={updateField("phone")}
                className="rounded-full border border-white/0 bg-[rgba(255,241,236,0.7)] px-4 py-3 text-[var(--color-choco)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]"
                placeholder="0X-XXX-XXXX"
                required
              />
            </label>
            <label className="flex flex-col text-sm font-medium gap-2">
              อีเมล
              <input
                type="email"
                value={form.email}
                onChange={updateField("email")}
                className="rounded-full border border-white/0 bg-[rgba(255,241,236,0.7)] px-4 py-3 text-[var(--color-choco)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]"
                placeholder="name@example.com"
              />
            </label>
            <label className="flex flex-col text-sm font-medium gap-2">
              ช่องทางที่สะดวกให้ติดต่อกลับ
              <select
                value={form.preferredContact}
                onChange={updateField("preferredContact")}
                className="rounded-full border border-white/0 bg-[rgba(255,241,236,0.7)] px-4 py-3 text-[var(--color-choco)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]"
              >
                <option value="phone">โทรศัพท์</option>
                <option value="line">LINE</option>
                <option value="email">อีเมล</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col text-sm font-medium gap-2">
              วันที่จัดงาน
              <input
                type="date"
                value={form.eventDate}
                onChange={updateField("eventDate")}
                className="rounded-full border border-white/0 bg-[rgba(255,241,236,0.7)] px-4 py-3 text-[var(--color-choco)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]"
              />
            </label>
            <label className="flex flex-col text-sm font-medium gap-2">
              เวลาโดยประมาณ
              <input
                type="time"
                value={form.eventTime}
                onChange={updateField("eventTime")}
                className="rounded-full border border-white/0 bg-[rgba(255,241,236,0.7)] px-4 py-3 text-[var(--color-choco)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]"
              />
            </label>
            <label className="flex flex-col text-sm font-medium gap-2">
              จำนวนโดยประมาณ
              <input
                type="number"
                min="0"
                value={form.servings}
                onChange={updateField("servings")}
                className="rounded-full border border-white/0 bg-[rgba(255,241,236,0.7)] px-4 py-3 text-[var(--color-choco)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]"
                placeholder="เช่น 50 ชิ้น"
              />
            </label>
          </div>

          <label className="flex flex-col text-sm font-medium gap-2">
            งบประมาณคร่าวๆ (บาท)
            <input
              type="number"
              min="0"
              step="100"
              value={form.budget}
              onChange={updateField("budget")}
              className="rounded-full border border-white/0 bg-[rgba(255,241,236,0.7)] px-4 py-3 text-[var(--color-choco)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]"
              placeholder="ระบุช่วงงบประมาณ"
            />
          </label>

          <label className="flex flex-col text-sm font-medium gap-2">
            รายละเอียดขนมที่ต้องการ*
            <textarea
              value={form.flavourIdeas}
              onChange={updateField("flavourIdeas")}
              rows={4}
              className="rounded-3xl border border-white/0 bg-[rgba(255,241,236,0.7)] px-4 py-3 text-[var(--color-choco)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]"
              placeholder="ระบุธีม รสชาติ รูปแบบ หรือไอเดียที่อยากได้"
              required
            />
          </label>

          <label className="flex flex-col text-sm font-medium gap-2">
            ข้อมูลเพิ่มเติมที่อยากให้เราทราบ
            <textarea
              value={form.notes}
              onChange={updateField("notes")}
              rows={3}
              className="rounded-3xl border border-white/0 bg-[rgba(255,241,236,0.7)] px-4 py-3 text-[var(--color-choco)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]"
              placeholder="แจ้งอาการแพ้ อุปกรณ์ตกแต่งเพิ่มเติม หรือรูปแบบการจัดส่ง"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--color-choco)]/60">
              *กรอกข้อมูลให้ครบถ้วนเพื่อให้ทีมสามารถเสนอรายละเอียดได้แม่นยำขึ้น
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-rose)] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(240,200,105,0.33)] transition hover:bg-[var(--color-rose-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "กำลังส่งคำขอ..." : "ส่งคำขอออกแบบเมนู"}
            </button>
          </div>
        </form>

        <aside className="rounded-3xl bg-white/80 p-8 shadow-xl shadow-[rgba(240,200,105,0.08)] space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-choco)]">ปรึกษาฟรี</h2>
            <p className="mt-2 text-sm text-[var(--color-choco)]/70">
              ทีมคอนเซียจของเราพร้อมให้คำแนะนำทุกวัน 09:00 - 18:00 น. สามารถเลือกช่องทางที่สะดวกด้านล่างได้เลย
            </p>
          </div>
          <div className="space-y-4 text-sm text-[var(--color-choco)]/80">
            <a
              href="tel:021234567"
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow hover:shadow-md transition"
            >
              <span className="text-xl">📞</span>
              <div>
                <p className="font-semibold text-[var(--color-choco)]">โทรศัพท์</p>
                <p className="text-xs text-[var(--color-choco)]/60">02-123-4567</p>
              </div>
            </a>
            <a
              href="https://line.me/ti/p/@sweetcravings"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow hover:shadow-md transition"
            >
              <span className="text-xl">💬</span>
              <div>
                <p className="font-semibold text-[var(--color-choco)]">LINE Official</p>
                <p className="text-xs text-[var(--color-choco)]/60">@sweetcravings</p>
              </div>
            </a>
            <a
              href="mailto:hello@sweetcravings.co"
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow hover:shadow-md transition"
            >
              <span className="text-xl">📧</span>
              <div>
                <p className="font-semibold text-[var(--color-choco)]">อีเมล</p>
                <p className="text-xs text-[var(--color-choco)]/60">hello@sweetcravings.co</p>
              </div>
            </a>
          </div>
          <div className="rounded-3xl bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-gold)] px-5 py-6 text-white shadow-lg shadow-[rgba(240,200,105,0.33)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">Tip</p>
            <p className="mt-2 text-sm">
              หากมี moodboard หรือรูปตัวอย่างที่ชื่นชอบ สามารถแนบส่งผ่านอีเมลหรือ LINE หลังจากกรอกแบบฟอร์มเพื่อให้ทีมออกแบบได้แม่นยำขึ้น
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
