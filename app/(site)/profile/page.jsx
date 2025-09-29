"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

function extractErrorMessage(error) {
  if (!error) return "เกิดข้อผิดพลาด";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.error) return extractErrorMessage(error.error);
  if (error.formErrors && Array.isArray(error.formErrors) && error.formErrors.length > 0) {
    return error.formErrors[0];
  }
  if (error.fieldErrors) {
    const first = Object.values(error.fieldErrors)
      .flat()
      .find(Boolean);
    if (first) return first;
  }
  return "เกิดข้อผิดพลาด";
}

function formatJoinedDate(value) {
  if (!value) return "";
  try {
    const date = new Date(value);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const { status, update } = useSession();
  const [form, setForm] = useState(emptyProfile);
  const [baseline, setBaseline] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [joinedAt, setJoinedAt] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?redirect=/profile");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/my/profile", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(extractErrorMessage(data?.error));
        }
        if (!cancelled && data?.user) {
          const next = {
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            address: data.user.address || "",
          };
          setForm(next);
          setBaseline(next);
          setJoinedAt(formatJoinedDate(data.user.createdAt));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "ไม่สามารถโหลดข้อมูลส่วนตัวได้");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [status]);

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(baseline);
  }, [form, baseline]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving || !isDirty) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/my/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(extractErrorMessage(data?.error));
      }
      if (data?.user) {
        const next = {
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
        };
        setForm(next);
        setBaseline(next);
        setJoinedAt(formatJoinedDate(data.user.createdAt));
        setSuccess("บันทึกข้อมูลเรียบร้อยแล้ว");
        try {
          await update({
            name: data.user.name,
            email: data.user.email,
          });
        } catch (e) {
          console.error("Failed to refresh session", e);
        }
      }
    } catch (e) {
      setError(e.message || "ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setSaving(false);
    }
  }

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center text-[#3c1a09]/70">
        กำลังนำทางไปยังหน้าล็อกอิน...
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden bg-[#fff7eb] text-[#3c1a09]">
      <div className="absolute inset-0">
        <div className="absolute -top-28 left-12 h-72 w-72 rounded-full bg-[#5b3dfc]/15 blur-3xl" />
        <div className="absolute -bottom-24 right-16 h-72 w-72 rounded-full bg-[#f7931e]/18 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#5b3dfc]">โปรไฟล์ของฉัน</h1>
          <p className="mt-2 text-sm text-[#3c1a09]/70">
            ตรวจสอบและอัปเดตข้อมูลติดต่อของคุณ เพื่อให้เราบริการได้ครบถ้วน
          </p>
          {joinedAt && (
            <p className="mt-1 text-xs text-[#3c1a09]/60">เป็นสมาชิกตั้งแต่ {joinedAt}</p>
          )}
        </header>

        <section className="rounded-[2.5rem] border border-[#f5c486] bg-white/95 shadow-2xl shadow-[rgba(60,26,9,0.18)] backdrop-blur">
          <div className="border-b border-[#f5c486]/60 px-6 py-5 sm:px-10">
            <h2 className="text-lg font-semibold text-[#5b3dfc]">ข้อมูลส่วนตัว</h2>
            <p className="mt-1 text-xs text-[#3c1a09]/70">อัปเดตชื่อ อีเมล และข้อมูลติดต่อของคุณได้ที่นี่</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-8 sm:px-10">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((key) => (
                  <div key={key} className="animate-pulse">
                    <div className="mb-2 h-3 w-24 rounded-full bg-[#5b3dfc]/20" />
                    <div className="h-11 rounded-2xl bg-white/70" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-[#3c1a09]/75">ชื่อ-นามสกุล</span>
                    <input
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      required
                      className="rounded-2xl border border-[#f5c486] bg-white/80 px-4 py-3 text-sm text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                      placeholder="ชื่อที่จะแสดงในคำสั่งซื้อ"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-[#3c1a09]/75">อีเมล</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      required
                      className="rounded-2xl border border-[#f5c486] bg-white/80 px-4 py-3 text-sm text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                      placeholder="name@example.com"
                    />
                  </label>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-[#3c1a09]/75">เบอร์โทรศัพท์</span>
                    <input
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="rounded-2xl border border-[#f5c486] bg-white/80 px-4 py-3 text-sm text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                      placeholder="0X-XXX-XXXX"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm sm:col-span-1">
                    <span className="font-medium text-[#3c1a09]/75">ที่อยู่สำหรับจัดส่ง</span>
                    <textarea
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      className="min-h-[100px] rounded-2xl border border-[#f5c486] bg-white/80 px-4 py-3 text-sm text-[#3c1a09] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b3dfc]/30"
                      placeholder="บ้านเลขที่ ซอย ถนน ตำบล/อำเภอ จังหวัด รหัสไปรษณีย์"
                    />
                  </label>
                </div>

                {error ? <p className="text-sm text-[#b84d4d]">{error}</p> : null}
                {success ? <p className="text-sm text-[#5b3dfc]">{success}</p> : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[#3c1a09]/60">กรุณากดบันทึกเมื่อแก้ไขข้อมูลเสร็จเรียบร้อยแล้ว</p>
                  <button
                    type="submit"
                    disabled={saving || !isDirty}
                    className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(247,147,30,0.35)] transition ${
                      saving || !isDirty
                        ? "bg-white/60 text-[#3c1a09]/50 cursor-not-allowed"
                        : "bg-[#f7931e] hover:bg-[#df7f0f]"
                    }`}
                  >
                    {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                  </button>
                </div>
              </>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
