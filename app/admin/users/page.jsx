"use client";

import { useEffect, useMemo, useState } from "react";

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
    if (confirmMessage && !confirm(confirmMessage)) return;

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
      alert(String(e.message || e));
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
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-[#f5a25d14] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-rose-dark)]">จัดการผู้ใช้งาน</h2>
            <p className="mt-1 text-sm text-[var(--color-choco)]/70">
              ตรวจสอบสถานะผู้ใช้ ปรับสิทธิ์การเข้าถึง และระงับบัญชีที่มีปัญหาได้จากหน้านี้
            </p>
          </div>
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อหรืออีเมลผู้ใช้"
              className="w-64 rounded-full border border-[var(--color-rose)]/30 bg-white/70 px-4 py-2 text-sm text-[var(--color-choco)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--color-choco)]/50">
              🔍
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="ผู้ใช้ทั้งหมด" value={stats.total} tone="from-[#f3d36b]/30 via-[#f7c68b]/20 to-transparent" />
          <StatCard label="ผู้ดูแลระบบ" value={stats.adminCount} tone="from-[#7cd1b8]/30 via-[#f3d36b]/20 to-transparent" />
          <StatCard label="ถูกระงับ" value={stats.bannedCount} tone="from-[#f5a25d]/30 via-[#f7c68b]/20 to-transparent" />
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/70 shadow-xl shadow-[#f5a25d18] backdrop-blur-sm overflow-hidden">
        <header className="flex flex-col gap-2 border-b border-white/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-choco)]">รายการผู้ใช้งาน</h3>
            <p className="text-xs text-[var(--color-choco)]/60">
              สามารถเปลี่ยนสิทธิ์การใช้งานหรือระงับบัญชีชั่วคราวได้จากตารางด้านล่าง
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[var(--color-choco)]/60">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-rose)]/30 border-t-[var(--color-rose)]"></div>
              กำลังโหลด...
            </div>
          )}
        </header>

        {err ? (
                      <div className="flex items-center justify-center px-6 py-12">
            <div className="rounded-[1.5rem] bg-rose-50 border border-rose-200 px-6 py-4 text-center">
              <div className="mb-2 text-2xl">⚠️</div>
              <div className="text-sm font-medium text-rose-600">{err}</div>
                              <button 
                onClick={load}
                className="mt-3 rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition-colors"
              >
                ลองอีกครั้ง
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.5rem]">
            {/* Mobile Cards - แสดงเฉพาะใน mobile */}
            <div className="block lg:hidden">
              {filteredUsers.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-[var(--color-rose)]/10 flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div className="text-sm font-medium text-[var(--color-choco)]/60">
                    {loading ? "กำลังโหลดข้อมูลผู้ใช้..." : "ไม่พบผู้ใช้ที่ตรงกับคำค้นหา"}
                  </div>
                </div>
              ) : (
                                  <div className="space-y-3 p-4">
                  {filteredUsers.map((user) => {
                    const isBusy = !!busy[user.id];
                    return (
                      <div key={user.id} className="rounded-[1.5rem] bg-white/80 border border-white/60 p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-[var(--color-choco)]">{user.name || "ไม่ระบุชื่อ"}</h4>
                            <p className="text-sm text-[var(--color-choco)]/70">{user.email}</p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                              user.banned
                                ? "bg-rose-100 text-rose-600"
                                : "bg-[#e7f8f0] text-[var(--color-rose-dark)]"
                            }`}
                          >
                            {user.banned ? "🔒 ถูกระงับ" : "✅ ปกติ"}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                          <div>
                            <span className="text-[var(--color-choco)]/60">สิทธิ์:</span>
                            <select
                              className="ml-2 rounded-full border border-[var(--color-rose)]/30 bg-white/80 px-2 py-1 text-xs font-semibold focus:border-[var(--color-rose)] focus:outline-none"
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
                            <span className="text-[var(--color-choco)]/60">สร้างเมื่อ:</span>
                            <div className="text-[var(--color-choco)]/80 font-medium">{formatDate(user.createdAt)}</div>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => toggleBan(user)}
                          disabled={isBusy}
                          className={`w-full rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                            user.banned
                              ? "bg-[#7cd1b8]/20 text-[#0b7b59] hover:bg-[#7cd1b8]/30 hover:shadow-md"
                              : "bg-rose-100 text-rose-600 hover:bg-rose-200 hover:shadow-md"
                          } ${isBusy ? "opacity-60 cursor-not-allowed" : "hover:scale-105"}`}
                        >
                          {isBusy ? "⏳ กำลังบันทึก..." : user.banned ? "🔓 ปลดระงับ" : "🔒 ระงับการใช้งาน"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop Table - แสดงเฉพาะใน desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full text-sm text-[var(--color-choco)]">
                <thead>
                  <tr className="bg-gradient-to-r rounded-b-3xl rounded-t-none  from-[#fff5e4] to-[#fef7ed] border-b border-white/40">
                    <th className="px-6 py-4 text-left font-semibold text-[var(--color-choco)]/90 tracking-wide">
                      <div className="flex items-center gap-2">
                        👤 ชื่อผู้ใช้
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-[var(--color-choco)]/90 tracking-wide">
                      <div className="flex items-center gap-2">
                        ✉️ อีเมล
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-[var(--color-choco)]/90 tracking-wide">
                      <div className="flex items-center gap-2">
                        🔑 สิทธิ์
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-[var(--color-choco)]/90 tracking-wide">
                      <div className="flex items-center gap-2">
                        📊 สถานะ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-[var(--color-choco)]/90 tracking-wide">
                      <div className="flex items-center gap-2">
                        📅 วันที่สร้าง
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right font-semibold text-[var(--color-choco)]/90 tracking-wide">
                      <div className="flex items-center justify-end gap-2">
                        ⚙️ จัดการ
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-4 h-20 w-20 c-full bg-[var(--color-rose)]/10 flex items-center justify-center text-3xl">
                            👤
                          </div>
                          <div className="text-sm font-medium text-[var(--color-choco)]/60">
                            {loading ? "กำลังโหลดข้อมูลผู้ใช้..." : "ไม่พบผู้ใช้ที่ตรงกับคำค้นหา"}
                          </div>
                          {!loading && search && (
                            <div className="mt-2 text-xs text-[var(--color-choco)]/50">
                              ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองดู
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, idx) => {
                      const isBusy = !!busy[user.id];
                      const isEven = idx % 2 === 0;
                      return (
                        <tr 
                          key={user.id} 
                          className={`group transition-all duration-200 hover:bg-gradient-to-r hover:shadow-lg ${
                            isEven 
                              ? "bg-white/50 hover:from-white/80 hover:to-[#fff9f5]/60" 
                              : "bg-[#fff7f0]/40 hover:from-[#fff9f5]/70 hover:to-white/50"
                          } ${user.banned ? 'opacity-75' : ''}`}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                                user.role === 'admin' 
                                  ? 'bg-gradient-to-br from-[#7cd1b8] to-[#5fb3a3] text-white' 
                                  : 'bg-gradient-to-br from-[#f3d36b] to-[#e6c659] text-white'
                              }`}>
                                {user.role === 'admin' ? '👑' : '👤'}
                              </div>
                              <div>
                                <div className="font-semibold text-[var(--color-choco)]">
                                  {user.name || "ไม่ระบุชื่อ"}
                                </div>
                                {user.name && (
                                  <div className="text-xs text-[var(--color-choco)]/60 mt-0.5">
                                    ID: {user.id.slice(0, 8)}...
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-medium text-[var(--color-choco)]">{user.email}</div>
                            <div className="text-xs text-[var(--color-choco)]/60 mt-0.5">
                              {user.emailVerified ? '✅ ยืนยันแล้ว' : '⏳ รอยืนยัน'}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <select
                              className={`rounded-full border border-[var(--color-rose)]/30 bg-white/90 px-3 py-2 text-xs font-semibold shadow-sm transition-all duration-200 focus:border-[var(--color-rose)] focus:outline-none focus:shadow-md hover:shadow-md ${
                                isBusy ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white'
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
                              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm ${
                                user.banned
                                  ? "bg-gradient-to-r from-rose-100 to-rose-50 text-rose-600 border border-rose-200"
                                  : "bg-gradient-to-r from-[#e7f8f0] to-[#d1f2e7] text-[var(--color-rose-dark)] border border-green-200"
                              }`}
                            >
                              {user.banned ? "🔒 ถูกระงับ" : "✅ ปกติ"}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-xs text-[var(--color-choco)]/80 font-medium">
                              {formatDate(user.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              type="button"
                              onClick={() => toggleBan(user)}
                              disabled={isBusy}
                              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold shadow-sm transition-all duration-200 ${
                                user.banned
                                  ? "bg-gradient-to-r from-[#7cd1b8]/20 to-[#5fb3a3]/10 text-[#0b7b59] border border-[#7cd1b8]/30 hover:from-[#7cd1b8]/30 hover:to-[#5fb3a3]/20 hover:shadow-md"
                                  : "bg-gradient-to-r from-rose-100 to-rose-50 text-rose-600 border border-rose-200 hover:from-rose-200 hover:to-rose-100 hover:shadow-md"
                              } ${isBusy ? "opacity-60 cursor-not-allowed" : "hover:scale-105 group-hover:shadow-lg"}`}
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

function StatCard({ label, value, tone }) {
  return (
    <div
      className={`rounded-[1.5rem] border border-white/60 bg-white/70 p-4 text-center shadow-inner shadow-[#f5a25d1f] transition-all duration-200 hover:shadow-lg hover:scale-105 ${
        tone ? `bg-gradient-to-br ${tone}` : ""
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-choco)]/60">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--color-rose-dark)]">{value}</p>
    </div>
  );
}