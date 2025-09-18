"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(""); setLoading(true);
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
    <main className="max-w-md mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input name="name" placeholder="ชื่อ" className="w-full border rounded px-3 py-2" required />
        <input name="email" type="email" placeholder="อีเมล" className="w-full border rounded px-3 py-2" required />
        <input name="password" type="password" placeholder="รหัสผ่าน (6+)" className="w-full border rounded px-3 py-2" required />
        <button disabled={loading} className="w-full bg-black text-white rounded py-2">
          {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
        </button>
      </form>
      {msg && <p className="text-sm text-gray-700 mt-4">{String(msg)}</p>}
    </main>
  );
}
