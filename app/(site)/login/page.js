"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const sp = useSearchParams();
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);
    if (!res || res.error) {
      setErr("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    const to = sp.get("redirect") || "/";
    router.push(to);
  }

  return (
    <main className="relative min-h-[70vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ffe1ef] via-[#fff7f0] to-[#ffe6d4]" />
      <div className="absolute -top-24 right-20 h-64 w-64 rounded-full bg-[#f5a25d]/20 blur-3xl" />
      <div className="absolute -bottom-28 left-12 h-72 w-72 rounded-full bg-[#f3d36b]/25 blur-3xl" />

      <div className="relative flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl shadow-[#f5a25d20]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[var(--color-rose-dark)]">ยินดีต้อนรับกลับ</h1>
            <p className="mt-2 text-sm text-[var(--color-choco)]/70">
              เข้าสู่ระบบเพื่อจัดการคำสั่งซื้อและดูสถานะการจัดส่งของคุณ
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">อีเมล</label>
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-[#f4c689]/60 bg-white px-4 py-3 text-sm text-[var(--color-choco)] focus:outline-none focus:ring-2 focus:ring-[#f5a25d]/30"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">รหัสผ่าน</label>
              <input
                name="password"
                type="password"
                placeholder="รหัสผ่าน"
                className="w-full rounded-2xl border border-[#f4c689]/60 bg-white px-4 py-3 text-sm text-[var(--color-choco)] focus:outline-none focus:ring-2 focus:ring-[#f5a25d]/30"
                required
              />
            </div>
            <button
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-[#f5a25d] to-[#f7c68b] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#f5a25d33] transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          {err && <p className="mt-4 text-sm text-rose-600">{err}</p>}

          <p className="mt-6 text-center text-sm text-[var(--color-choco)]/70">
            ยังไม่มีบัญชี?
            <Link href="/register" className="ml-2 font-semibold text-[var(--color-rose)] hover:text-[var(--color-rose-dark)]">
              สมัครสมาชิกเลย
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center text-[var(--color-choco)]/70">
          กำลังโหลดฟอร์มเข้าสู่ระบบ...
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
