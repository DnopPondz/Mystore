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
    <main className="relative min-h-[70vh] overflow-hidden bg-[#fef3e5]">
      <div className="absolute inset-0 bg-[#fef3e5]" />
      <div className="absolute -top-24 right-20 h-64 w-64 rounded-full bg-[#5b3dfc]/18 blur-3xl" />
      <div className="absolute -bottom-28 left-12 h-72 w-72 rounded-full bg-[#f7931e]/22 blur-3xl" />

      <div className="relative flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-[#f5c486] bg-white/90 p-8 shadow-2xl shadow-[rgba(60,26,9,0.18)] backdrop-blur">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#3c1a09]">ยินดีต้อนรับกลับ</h1>
            <p className="mt-2 text-sm text-[#3c1a09]/70">
              เข้าสู่ระบบเพื่อจัดการคำสั่งซื้อและดูสถานะการจัดส่งของคุณ
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#3c1a09]/80">อีเมล</label>
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-[#f5c486] bg-white/80 px-4 py-3 text-sm text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#3c1a09]/80">รหัสผ่าน</label>
              <input
                name="password"
                type="password"
                placeholder="รหัสผ่าน"
                className="w-full rounded-2xl border border-[#f5c486] bg-white/80 px-4 py-3 text-sm text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                required
              />
            </div>
            <button
              disabled={loading}
              className="w-full rounded-full bg-[#f7931e] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(247,147,30,0.4)] transition hover:bg-[#df7f0f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          {err && <p className="mt-4 text-sm text-[#b84d4d]">{err}</p>}

          <p className="mt-6 text-center text-sm text-[#3c1a09]/70">
            ยังไม่มีบัญชี?
            <Link href="/register" className="ml-2 font-semibold text-[#5b3dfc] hover:text-[#4529c4]">
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
        <main className="flex min-h-[60vh] items-center justify-center text-[#3c1a09]/70">
          กำลังโหลดฟอร์มเข้าสู่ระบบ...
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
