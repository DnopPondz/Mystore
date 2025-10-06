"use client";

import { useEffect, useMemo, useState } from "react";
import { adminInsetCardShell, adminSurfaceShell, adminTableShell } from "@/app/admin/theme";
import { useAdminPopup } from "@/components/admin/AdminPopupProvider";

const roleLabels = {
  admin: "ผู้ดูแลระบบ",
  user: "ลูกค้าทั่วไป",
};


function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function extractErrorMessage(error) {
  if (!error) return "เกิดข้อผิดพลาด";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.error) return extractErrorMessage(error.error);
  if (Array.isArray(error.formErrors) && error.formErrors.length > 0) {
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState({});
  const popup = useAdminPopup();

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load failed");
      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setBusyFor(id, value) {
    setBusy((prev) => {
      const next = { ...prev };
      if (value) next[id] = true;
      else delete next[id];
      return next;
    });
  }

  async function updateUser(id, payload, options = {}) {
    const { confirmMessage } = options;
    if (confirmMessage) {
      const confirmed = await popup.confirm(confirmMessage, {
        title: "ยืนยันการทำรายการ",
        confirmText: "ยืนยัน",
        cancelText: "ยกเลิก",
        tone: "warning",
      });
      if (confirmed === false) {
        return;
      }
    }

    setBusyFor(id, true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = extractErrorMessage(data?.error) || "บันทึกไม่สำเร็จ";
        throw new Error(message);
      }
      if (data?.user) {
        setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
      }
    } catch (e) {
      await popup.alert(String(e.message || e), {
        title: "เกิดข้อผิดพลาด",
        tone: "error",
      });
    } finally {
      setBusyFor(id, false);
    }
  }

  function handleRoleChange(user, nextRole) {
    if (!nextRole || nextRole === user.role) return;
    const confirmMessage =
      nextRole === "admin"
        ? `ยืนยันการปรับ ${user.email} เป็นผู้ดูแลระบบหรือไม่?`
        : `ลดสิทธิ์ผู้ใช้ ${user.email} เป็นลูกค้าทั่วไป?`;
    updateUser(user.id, { role: nextRole }, { confirmMessage });
  }

  function toggleBan(user) {
    const willBan = !user.banned;
    const confirmMessage = willBan
      ? `ต้องการระงับการใช้งานของ ${user.email} หรือไม่?`
      : `ปลดการระงับบัญชี ${user.email} หรือไม่?`;
    updateUser(user.id, { banned: willBan }, { confirmMessage });
  }

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      const haystack = `${u.name || ""} ${u.email}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [search, users]);

  const stats = useMemo(() => {
    const total = users.length;
    const adminCount = users.filter((u) => u.role === "admin").length;
    const bannedCount = users.filter((u) => u.banned).length;
    return { total, adminCount, bannedCount };
  }, [users]);

  return (
    <div className="space-y-10 text-[#0b3b31]">
      <section className={`${adminSurfaceShell} p-6`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#0ea5a0]">Steaming Bun Market</p>
            <div>
              <h2 className="text-3xl font-bold text-[#0b3b31]">แผงควบคุมการจัดการร้าน</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#145f4b]">
                ตรวจสอบภาพรวมของผู้ใช้งาน ปรับบทบาท หรือจัดการบัญชีที่มีปัญหาให้พร้อมต่อการใช้งานอยู่เสมอ
              </p>
            </div>
          </div>
          <div className="w-full max-w-xs rounded-[1.5rem] border border-[#bff4ec] bg-white/90 p-4 shadow-[0_16px_32px_-24px_rgba(10,83,73,0.45)]">
            <label className="text-xs font-semibold text-[#0ea5a0]">ค้นหาผู้ใช้</label>
            <div className="mt-2 flex items-center rounded-full border border-[#9be6dc] bg-white px-3 py-1.5 shadow-[inset_0_1px_4px_rgba(10,83,73,0.08)] focus-within:border-[#0ea5a0]">
              <span className="text-xs text-[#0ea5a0]">🔍</span>
            <input
              type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อหรืออีเมลผู้ใช้"
                className="ml-2 w-full bg-transparent text-sm text-[#0b3b31] placeholder:text-[#0ea5a0]/60 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="ผู้ใช้ทั้งหมด" helper="จำนวนผู้ใช้งานทั้งหมด" value={stats.total} tone="peach" />
          <StatCard label="ผู้ดูแลระบบ" helper="สิทธิ์เข้าจัดการหลังบ้าน" value={stats.adminCount} tone="mint" />
          <StatCard label="ถูกระงับ" helper="บัญชีที่ปิดใช้งานชั่วคราว" value={stats.bannedCount} tone="rose" />
        </div>
      </section>

      <section className={adminTableShell}>
        <header className="flex flex-col gap-3 border-b border-[#c9f6ef] bg-[#eaf8f4]/70 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#0b3b31]">รายการผู้ใช้งาน</h3>
            <p className="text-sm text-[#145f4b]">ตรวจสอบบทบาทและสถานะการใช้งาน พร้อมระงับบัญชีที่ผิดปกติได้จากหน้าจอนี้</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#0ea5a0]">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#0ea5a0] border-t-transparent"></div>
              กำลังโหลด...
            </div>
          )}
        </header>

        {err ? (
          <div className="flex items-center justify-center px-6 py-12">
            <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-6 py-5 text-center text-sm text-rose-600 shadow-[0_18px_34px_-24px_rgba(244,63,94,0.35)]">
              <div className="mb-2 text-2xl">⚠️</div>
              <div className="font-medium">{err}</div>
              <button
                onClick={load}
                className="mt-3 inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-600 shadow-[0_12px_24px_-18px_rgba(244,63,94,0.35)] transition hover:bg-rose-50"
              >
                ลองอีกครั้ง
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.5rem]">
            <div className="block lg:hidden">
              {filteredUsers.length === 0 ? (
                <div className="px-6 py-12 text-center text-[#145f4b]">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#bff4ec] bg-[#eaf8f4] text-2xl">👤</div>
                  <div className="text-sm font-medium">
                    {loading ? "กำลังโหลดข้อมูลผู้ใช้..." : "ไม่พบผู้ใช้ที่ตรงกับคำค้นหา"}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {filteredUsers.map((user) => {
                    const isBusy = !!busy[user.id];
                    return (
                      <div key={user.id} className={`${adminInsetCardShell} bg-white/95 p-4 shadow-[0_16px_30px_-24px_rgba(10,83,73,0.45)]`}>
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-[#0b3b31]">{user.name || "ไม่ระบุชื่อ"}</h4>
                            <p className="text-sm text-[#145f4b]">{user.email}</p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                              user.banned
                                ? "border border-rose-200 bg-rose-50 text-rose-600"
                                : "border border-[#C3E7C4] bg-[#e2faf5] text-[#2F7A3D]"
                            }`}
                          >
                            {user.banned ? "🔒 ถูกระงับ" : "✅ ปกติ"}
                          </span>
                        </div>

                        <div className="mb-4 grid grid-cols-2 gap-3 text-xs text-[#145f4b]">
                          <div>
                            <span className="font-semibold text-[#0ea5a0]">สิทธิ์:</span>
                            <select
                              className="ml-2 rounded-full border border-[#9be6dc] bg-white px-2 py-1 text-xs font-semibold text-[#0b3b31] shadow-[inset_0_1px_4px_rgba(10,83,73,0.08)] focus:border-[#0ea5a0] focus:outline-none"
                              value={user.role}
                              disabled={isBusy}
                              onChange={(e) => handleRoleChange(user, e.target.value)}
                            >
                              {Object.entries(roleLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <span className="font-semibold text-[#0ea5a0]">สร้างเมื่อ:</span>
                            <div>{formatDate(user.createdAt)}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleBan(user)}
                          disabled={isBusy}
                          className={`w-full rounded-full border px-4 py-2 text-xs font-semibold transition ${
                            user.banned
                              ? "border-[#C3E7C4] bg-[#e2faf5] text-[#2F7A3D]"
                              : "border-rose-200 bg-rose-50 text-rose-600"
                          } ${isBusy ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5"}`}
                        >
                          {isBusy ? "⏳ กำลังบันทึก..." : user.banned ? "🔓 ปลดระงับ" : "🔒 ระงับการใช้งาน"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="hidden lg:block">
              <table className="min-w-full divide-y divide-[#c9f6ef] text-sm text-[#0f5349]">
                <thead className="bg-[#eaf8f4] text-[#0ea5a0]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">ผู้ใช้</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">อีเมล</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">บทบาท</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">สถานะ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide">สร้างเมื่อ</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c9f6ef]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#145f4b]">
                        {loading ? "กำลังโหลดข้อมูลผู้ใช้..." : "ไม่พบผู้ใช้ที่ตรงกับคำค้นหา"}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isBusy = !!busy[user.id];
                      return (
                        <tr key={user.id} className="transition-colors hover:bg-[#e5f8f3]">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold shadow-[0_10px_22px_-16px_rgba(10,83,73,0.4)] ${
                                  user.role === "admin" ? "bg-[#e2faf5] text-[#2F7A3D]" : "bg-[#eaf8f4] text-[#0ea5a0]"
                                }`}
                              >
                                {user.role === "admin" ? "👑" : "👤"}
                              </div>
                              <div>
                                <div className="font-semibold text-[#0b3b31]">{user.name || "ไม่ระบุชื่อ"}</div>
                                {user.name && <div className="mt-0.5 text-xs text-[#0ea5a0]/70">ID: {user.id.slice(0, 8)}...</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-medium text-[#0b3b31]">{user.email}</div>
                            <div className="mt-0.5 text-xs text-[#145f4b]">{user.emailVerified ? "✅ ยืนยันแล้ว" : "⏳ รอยืนยัน"}</div>
                          </td>
                          <td className="px-6 py-5">
                            <select
                              className={`rounded-full border border-[#9be6dc] bg-white px-3 py-2 text-xs font-semibold text-[#0b3b31] shadow-[inset_0_1px_4px_rgba(10,83,73,0.08)] transition ${
                                isBusy ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5"
                              }`}
                              value={user.role}
                              disabled={isBusy}
                              onChange={(e) => handleRoleChange(user, e.target.value)}
                            >
                              {Object.entries(roleLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                                user.banned
                                  ? "border border-rose-200 bg-rose-50 text-rose-600"
                                  : "border border-[#C3E7C4] bg-[#e2faf5] text-[#2F7A3D]"
                              }`}
                            >
                              {user.banned ? "🔒 ถูกระงับ" : "✅ ปกติ"}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-xs text-[#145f4b]">{formatDate(user.createdAt)}</td>
                          <td className="px-6 py-5 text-right">
                            <button
                              type="button"
                              onClick={() => toggleBan(user)}
                              disabled={isBusy}
                              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold shadow-[0_16px_30px_-24px_rgba(10,83,73,0.45)] ${
                                user.banned
                                  ? "border-[#C3E7C4] bg-[#e2faf5] text-[#2F7A3D]"
                                  : "border-rose-200 bg-rose-50 text-rose-600"
                              } ${isBusy ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5"}`}
                            >
                              {isBusy ? (
                                <>
                                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                  กำลังบันทึก...
                                </>
                              ) : user.banned ? (
                                <>🔓 ปลดระงับ</>
                              ) : (
                                <>🔒 ระงับการใช้งาน</>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, helper, value, tone = "peach" }) {
  const palette = {
    peach: {
      border: "border-[#bff4ec]",
      bg: "bg-[#eaf8f4]",
      accent: "text-[#0ea5a0]",
    },
    mint: {
      border: "border-[#C3E7C4]",
      bg: "bg-[#e2faf5]",
      accent: "text-[#2F7A3D]",
    },
    berry: {
      border: "border-[#DCC7F0]",
      bg: "bg-[#F8F2FF]",
      accent: "text-[#7A4CB7]",
    },
    rose: {
      border: "border-rose-200",
      bg: "bg-rose-50",
      accent: "text-rose-600",
    },
  };
  const theme = palette[tone] || palette.peach;
  return (
    <div className={`rounded-[1.5rem] border ${theme.border} ${theme.bg} p-5 text-left shadow-[0_16px_30px_-24px_rgba(10,83,73,0.45)]`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${theme.accent}`}>{label}</p>
      <p className="text-3xl font-bold text-[#0b3b31]">{value}</p>
      {helper ? <p className="text-xs text-[#145f4b]">{helper}</p> : null}
    </div>
  );
}
