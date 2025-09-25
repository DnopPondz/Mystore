"use client";

import { useState } from "react";

export default function NewsletterForm({ className = "" }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) {
      setStatus({ type: "error", message: "กรุณากรอกอีเมล" });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer", marketingOptIn: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "สมัครรับข่าวสารไม่สำเร็จ");
      }
      setStatus({ type: "success", message: "บันทึกอีเมลเรียบร้อยแล้ว ขอบคุณที่ติดตาม Bao Lamphun" });
      setEmail("");
    } catch (error) {
      setStatus({ type: "error", message: error.message || "สมัครรับข่าวสารไม่สำเร็จ" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <label htmlFor="newsletter-email" className="sr-only">
        อีเมลของคุณ
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy)]/60 px-4 py-2 text-sm text-[var(--color-gold)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
          placeholder="your@email.com"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[var(--color-rose)] px-5 py-2 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-black/40 transition hover:bg-[var(--color-rose-dark)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "กำลังบันทึก..." : "ติดตาม"}
        </button>
      </div>
      <p className="text-xs text-[var(--color-gold)]/60">
        *เราจะส่งอัปเดตเมนูใหม่และโปรโมชันไม่เกินสัปดาห์ละ 1 ครั้ง และคุณสามารถยกเลิกได้ทุกเมื่อ
      </p>
      {status && (
        <p
          className={`text-xs font-medium ${
            status.type === "success"
              ? "text-[var(--color-gold)]"
              : "text-[var(--color-rose)]"
          }`}
        >
          {status.message}
        </p>
      )}
    </form>
  );
}
