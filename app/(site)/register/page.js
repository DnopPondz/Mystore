"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(data?.error || "Register failed");
    setMsg("สมัครเสร็จแล้ว ลองไปล็อกอิน");
  }

  return (
    <main className="relative min-h-[70vh] overflow-hidden bg-[var(--color-cream)]">
      <div className="absolute inset-0 bg-[var(--color-cream)]" />
      <div className="absolute -top-24 left-16 h-64 w-64 rounded-full bg-[var(--color-rose)]/18 blur-3xl" />
      <div className="absolute -bottom-28 right-12 h-72 w-72 rounded-full bg-[var(--color-gold)]/20 blur-3xl" />

      <div className="relative flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-[var(--color-burgundy)] bg-white/90 p-8 shadow-2xl shadow-[rgba(12,116,108,0.24)] backdrop-blur">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[var(--color-rose-dark)]">สร้างบัญชีใหม่</h1>
            <p className="mt-2 text-sm text-[var(--color-rose-dark)]/70">
              สมัครสมาชิกเพื่อรับข่าวสาร โปรโมชั่น และสะสมคะแนนสำหรับลูกค้าประจำ
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-rose-dark)]/80">ชื่อ-นามสกุล</label>
              <input
                name="name"
                placeholder="ชื่อเต็ม"
                className="w-full rounded-2xl border border-[var(--color-burgundy)] bg-white/80 px-4 py-3 text-sm text-[var(--color-rose-dark)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/30"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-rose-dark)]/80">อีเมล</label>
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-[var(--color-burgundy)] bg-white/80 px-4 py-3 text-sm text-[var(--color-rose-dark)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/30"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-rose-dark)]/80">รหัสผ่าน (6 ตัวอักษรขึ้นไป)</label>
              <input
                name="password"
                type="password"
                placeholder="รหัสผ่าน"
                minLength={6}
                className="w-full rounded-2xl border border-[var(--color-burgundy)] bg-white/80 px-4 py-3 text-sm text-[var(--color-rose-dark)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/30"
                required
              />
            </div>
            <button
              disabled={loading}
              className="w-full rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(255,135,70,0.4)] transition hover:bg-[#ff7125] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
            </button>
          </form>

          {msg && (
            <p className={`mt-4 text-sm ${msg.includes("เสร็จ") ? "text-[var(--color-rose)]" : "text-[#b84d4d]"}`}>
              {String(msg)}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-[var(--color-rose-dark)]/70">
            มีบัญชีอยู่แล้ว?
            <Link href="/login" className="ml-2 font-semibold text-[var(--color-rose)] hover:text-[var(--color-rose)]">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
