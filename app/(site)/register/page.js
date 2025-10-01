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
    <main className="relative min-h-[70vh] overflow-hidden bg-[#f0d6a1]">
      <div className="absolute inset-0 bg-[#f0d6a1]" />
      <div className="absolute -top-24 left-16 h-64 w-64 rounded-full bg-[#5b3dfc]/18 blur-3xl" />
      <div className="absolute -bottom-28 right-12 h-72 w-72 rounded-full bg-[#f1c154]/20 blur-3xl" />

      <div className="relative flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-[#e6c688] bg-white/90 p-8 shadow-2xl shadow-[rgba(60,26,9,0.18)] backdrop-blur">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#3c1a09]">สร้างบัญชีใหม่</h1>
            <p className="mt-2 text-sm text-[#3c1a09]/70">
              สมัครสมาชิกเพื่อรับข่าวสาร โปรโมชั่น และสะสมคะแนนสำหรับลูกค้าประจำ
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#3c1a09]/80">ชื่อ-นามสกุล</label>
              <input
                name="name"
                placeholder="ชื่อเต็ม"
                className="w-full rounded-2xl border border-[#e6c688] bg-white/80 px-4 py-3 text-sm text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#3c1a09]/80">อีเมล</label>
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-[#e6c688] bg-white/80 px-4 py-3 text-sm text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#3c1a09]/80">รหัสผ่าน (6 ตัวอักษรขึ้นไป)</label>
              <input
                name="password"
                type="password"
                placeholder="รหัสผ่าน"
                minLength={6}
                className="w-full rounded-2xl border border-[#e6c688] bg-white/80 px-4 py-3 text-sm text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                required
              />
            </div>
            <button
              disabled={loading}
              className="w-full rounded-full bg-[#f1c154] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(247,201,72,0.4)] transition hover:bg-[#b6791c] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
            </button>
          </form>

          {msg && (
            <p className={`mt-4 text-sm ${msg.includes("เสร็จ") ? "text-[#5b3dfc]" : "text-[#b84d4d]"}`}>
              {String(msg)}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-[#3c1a09]/70">
            มีบัญชีอยู่แล้ว?
            <Link href="/login" className="ml-2 font-semibold text-[#5b3dfc] hover:text-[#4529c4]">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
