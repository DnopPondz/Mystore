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

      <section className="rounded-3xl border border-white/70 bg-white/70 shadow-xl shadow-[#f5a25d18]">
        <header className="flex flex-col gap-2 border-b border-white/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-choco)]">รายการผู้ใช้งาน</h3>
            <p className="text-xs text-[var(--color-choco)]/60">
              สามารถเปลี่ยนสิทธิ์การใช้งานหรือระงับบัญชีชั่วคราวได้จากตารางด้านล่าง
            </p>
          </div>
          {loading && <span className="text-xs text-[var(--color-choco)]/60">กำลังโหลด...</span>}
        </header>

        {err ? (
          <div className="px-6 py-8 text-center text-sm text-rose-600">{err}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/60 text-sm text-[var(--color-choco)]">
              <thead className="bg-[#fff5e4] text-[var(--color-choco)]/80">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">ชื่อ</th>
                  <th className="px-6 py-3 text-left font-medium">อีเมล</th>
                  <th className="px-6 py-3 text-left font-medium">สิทธิ์</th>
                  <th className="px-6 py-3 text-left font-medium">สถานะ</th>
                  <th className="px-6 py-3 text-left font-medium">สร้างเมื่อ</th>
                  <th className="px-6 py-3 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-[var(--color-choco)]/60">
                      {loading ? "กำลังโหลดข้อมูลผู้ใช้..." : "ไม่พบผู้ใช้ที่ตรงกับคำค้นหา"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => {
                    const isBusy = !!busy[user.id];
                    return (
                      <tr key={user.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#fff7f0]"}>
                        <td className="px-6 py-4 font-medium">{user.name || "-"}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">
                          <select
                            className="rounded-full border border-[var(--color-rose)]/30 bg-white/80 px-3 py-1 text-xs font-semibold focus:border-[var(--color-rose)] focus:outline-none"
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
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                              user.banned
                                ? "bg-rose-100 text-rose-600"
                                : "bg-[#e7f8f0] text-[var(--color-rose-dark)]"
                            }`}
                          >
                            {user.banned ? "ถูกระงับ" : "ปกติ"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-[var(--color-choco)]/70">{formatDate(user.createdAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => toggleBan(user)}
                            disabled={isBusy}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold transition ${
                              user.banned
                                ? "bg-[#7cd1b8]/20 text-[#0b7b59] hover:bg-[#7cd1b8]/30"
                                : "bg-rose-100 text-rose-600 hover:bg-rose-200"
                            } ${isBusy ? "opacity-60" : ""}`}
                          >
                            {isBusy ? "กำลังบันทึก..." : user.banned ? "ปลดระงับ" : "ระงับการใช้งาน"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div
      className={`rounded-2xl border border-white/60 bg-white/70 p-4 text-center shadow-inner shadow-[#f5a25d1f] ${
        tone ? `bg-gradient-to-br ${tone}` : ""
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-choco)]/60">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--color-rose-dark)]">{value}</p>
    </div>
  );
}
