"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
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

    // v4 way
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
    // ถ้า login ok ให้ไปหน้า redirect (หรือหน้าแรก)
    const to = sp.get("redirect") || "/";
    router.push(to);
  }

  return (
    <main className="max-w-md mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input name="email" type="email" placeholder="อีเมล" className="w-full border rounded px-3 py-2" required />
        <input name="password" type="password" placeholder="รหัสผ่าน" className="w-full border rounded px-3 py-2" required />
        <button disabled={loading} className="w-full bg-black text-white rounded py-2">
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
      {err && <p className="text-sm text-red-600 mt-4">{err}</p>}
    </main>
  );
}
