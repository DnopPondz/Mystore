"use client";

import { useEffect, useMemo, useState } from "react";
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
    <div className="space-y-10">
      <section className="rounded-3xl border border-[rgba(229,189,119,0.28)] bg-[rgba(33,24,16,0.78)] p-6 shadow-[0_24px_44px_-32px_rgba(12,8,4,0.85)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-text)]">จัดการผู้ใช้งาน</h2>
            <p className="mt-1 text-sm text-[rgba(229,189,119,0.75)]">
              ตรวจสอบสถานะผู้ใช้ ปรับสิทธิ์การเข้าถึง และระงับบัญชีที่มีปัญหาได้จากหน้านี้
            </p>
          </div>
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อหรืออีเมลผู้ใช้"
              className="w-64 rounded-full border border-[rgba(229,189,119,0.35)] bg-[rgba(20,14,9,0.6)] px-4 py-2 text-sm text-[var(--color-text)] shadow-[inset_0_0_0_1px_rgba(229,189,119,0.1)] placeholder:text-[rgba(229,189,119,0.5)] focus:border-[var(--color-rose)] focus:outline-none focus:ring-2 focus:ring-[rgba(229,189,119,0.2)]"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[rgba(229,189,119,0.45)]">
              🔍
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="ผู้ใช้ทั้งหมด"
            value={stats.total}
            tone="bg-gradient-to-br from-[rgba(229,189,119,0.18)] via-[rgba(229,189,119,0.08)] to-transparent"
          />
          <StatCard
            label="ผู้ดูแลระบบ"
            value={stats.adminCount}
            tone="bg-gradient-to-br from-[rgba(124,209,184,0.22)] via-[rgba(229,189,119,0.12)] to-transparent"
          />
          <StatCard
            label="ถูกระงับ"
            value={stats.bannedCount}
            tone="bg-gradient-to-br from-[rgba(237,143,120,0.22)] via-[rgba(229,189,119,0.12)] to-transparent"
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-[rgba(229,189,119,0.28)] bg-[rgba(26,18,12,0.82)] shadow-[0_26px_52px_-28px_rgba(10,6,2,0.92)] overflow-hidden backdrop-blur-xl">
        <header className="flex flex-col gap-2 border-b border-[rgba(229,189,119,0.18)] bg-[rgba(18,12,8,0.55)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)]">รายการผู้ใช้งาน</h3>
            <p className="text-xs text-[rgba(229,189,119,0.7)]">
              สามารถเปลี่ยนสิทธิ์การใช้งานหรือระงับบัญชีชั่วคราวได้จากตารางด้านล่าง
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[rgba(229,189,119,0.65)]">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[rgba(229,189,119,0.25)] border-t-[var(--color-rose)]"></div>
              กำลังโหลด...
            </div>
          )}
        </header>

        {err ? (
          <div className="flex items-center justify-center px-6 py-12">
            <div className="rounded-[1.5rem] border border-[rgba(239,120,120,0.25)] bg-[rgba(68,24,24,0.72)] px-6 py-5 text-center shadow-[0_18px_34px_-24px_rgba(68,24,24,0.85)]">
              <div className="mb-2 text-2xl">⚠️</div>
              <div className="text-sm font-medium text-[rgba(244,197,197,0.85)]">{err}</div>
              <button
                onClick={load}
                className="mt-3 inline-flex items-center justify-center rounded-full border border-[rgba(244,166,166,0.4)] bg-[rgba(124,38,38,0.6)] px-4 py-2 text-xs font-semibold text-[rgba(255,221,221,0.9)] transition-colors hover:bg-[rgba(124,38,38,0.7)]"
              >
                ลองอีกครั้ง
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.5rem] border border-[rgba(229,189,119,0.16)] bg-[rgba(20,14,9,0.55)]">
            {/* Mobile Cards - แสดงเฉพาะใน mobile */}
            <div className="block lg:hidden">
              {filteredUsers.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(229,189,119,0.12)] text-2xl text-[var(--color-text)]">
                    👤
                  </div>
                  <div className="text-sm font-medium text-[rgba(229,189,119,0.7)]">
                    {loading ? "กำลังโหลดข้อมูลผู้ใช้..." : "ไม่พบผู้ใช้ที่ตรงกับคำค้นหา"}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {filteredUsers.map((user) => {
                    const isBusy = !!busy[user.id];
                    return (
                      <div
                        key={user.id}
                        className="rounded-[1.5rem] border border-[rgba(229,189,119,0.18)] bg-[rgba(24,16,11,0.78)] p-4 shadow-[0_18px_34px_-24px_rgba(8,5,2,0.88)]"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-[var(--color-text)]">{user.name || "ไม่ระบุชื่อ"}</h4>
                            <p className="text-sm text-[rgba(229,189,119,0.68)]">{user.email}</p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
                              user.banned
                                ? "border-[rgba(239,120,120,0.4)] bg-[rgba(124,38,38,0.45)] text-[rgba(255,221,221,0.9)]"
                                : "border-[rgba(124,209,184,0.35)] bg-[rgba(48,94,77,0.5)] text-[rgba(209,248,231,0.92)]"
                            }`}
                          >
                            {user.banned ? "🔒 ถูกระงับ" : "✅ ปกติ"}
                          </span>
                        </div>

                        <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[rgba(229,189,119,0.6)]">สิทธิ์:</span>
                            <select
                              className="ml-2 rounded-full border border-[rgba(229,189,119,0.25)] bg-[rgba(18,12,8,0.65)] px-2 py-1 text-xs font-semibold text-[var(--color-text)] transition focus:border-[var(--color-rose)] focus:outline-none focus:ring-1 focus:ring-[rgba(229,189,119,0.25)]"
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
                            <span className="text-[rgba(229,189,119,0.6)]">สร้างเมื่อ:</span>
                            <div className="font-medium text-[rgba(229,189,119,0.78)]">{formatDate(user.createdAt)}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleBan(user)}
                          disabled={isBusy}
                          className={`w-full rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                            user.banned
                              ? "border-[rgba(124,209,184,0.35)] bg-[rgba(48,94,77,0.5)] text-[rgba(209,248,231,0.92)]"
                              : "border-[rgba(239,120,120,0.38)] bg-[rgba(124,38,38,0.55)] text-[rgba(255,221,221,0.9)]"
                          } ${
                            isBusy
                              ? "cursor-not-allowed opacity-60"
                              : "hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-18px_rgba(8,5,2,0.85)]"
                          }`}
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
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-sm text-[rgba(229,189,119,0.85)]">
                <thead>
                  <tr className="border-b border-[rgba(229,189,119,0.18)] bg-[rgba(229,189,119,0.12)] text-[var(--color-text)]">
                    <th className="px-6 py-4 text-left font-semibold tracking-wide">
                      <div className="flex items-center gap-2">
                        👤 ชื่อผู้ใช้
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold tracking-wide">
                      <div className="flex items-center gap-2">
                        ✉️ อีเมล
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold tracking-wide">
                      <div className="flex items-center gap-2">
                        🔑 สิทธิ์
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold tracking-wide">
                      <div className="flex items-center gap-2">
                        📊 สถานะ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold tracking-wide">
                      <div className="flex items-center gap-2">
                        📅 วันที่สร้าง
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right font-semibold tracking-wide">
                      <div className="flex items-center justify-end gap-2">
                        ⚙️ จัดการ
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(229,189,119,0.12)] bg-transparent">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(229,189,119,0.12)] text-3xl text-[var(--color-text)]">
                            👤
                          </div>
                          <div className="text-sm font-medium text-[rgba(229,189,119,0.72)]">
                            {loading ? "กำลังโหลดข้อมูลผู้ใช้..." : "ไม่พบผู้ใช้ที่ตรงกับคำค้นหา"}
                          </div>
                          {!loading && search && (
                            <div className="mt-2 text-xs text-[rgba(229,189,119,0.6)]">
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
                          className={`group transition-colors duration-200 ${
                            isEven ? "bg-[rgba(27,18,12,0.82)]" : "bg-[rgba(22,15,10,0.76)]"
                          } hover:bg-[rgba(33,24,16,0.86)] ${
                            user.banned ? "ring-1 ring-[rgba(239,120,120,0.32)]" : ""
                          }`}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold shadow-[0_10px_22px_-16px_rgba(8,5,2,0.85)] ${
                                  user.role === 'admin'
                                    ? 'bg-gradient-to-br from-[rgba(124,209,184,0.55)] to-[rgba(82,168,142,0.8)] text-[rgba(8,18,14,0.9)]'
                                    : 'bg-gradient-to-br from-[rgba(229,189,119,0.6)] to-[rgba(214,167,94,0.82)] text-[rgba(29,20,13,0.95)]'
                                }`}
                              >
                                {user.role === 'admin' ? '👑' : '👤'}
                              </div>
                              <div>
                                <div className="font-semibold text-[var(--color-text)]">
                                  {user.name || "ไม่ระบุชื่อ"}
                                </div>
                                {user.name && (
                                  <div className="mt-0.5 text-xs text-[rgba(229,189,119,0.65)]">
                                    ID: {user.id.slice(0, 8)}...
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-medium text-[var(--color-text)]">{user.email}</div>
                            <div className="mt-0.5 text-xs text-[rgba(229,189,119,0.65)]">
                              {user.emailVerified ? '✅ ยืนยันแล้ว' : '⏳ รอยืนยัน'}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <select
                              className={`rounded-full border border-[rgba(229,189,119,0.28)] bg-[rgba(18,12,8,0.7)] px-3 py-2 text-xs font-semibold text-[var(--color-text)] shadow-[0_10px_18px_-16px_rgba(8,5,2,0.85)] transition-all duration-200 focus:border-[var(--color-rose)] focus:outline-none focus:ring-1 focus:ring-[rgba(229,189,119,0.25)] ${
                                isBusy ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5'
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
                                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-[0_12px_20px_-18px_rgba(8,5,2,0.88)] ${
                                  user.banned
                                    ? "border-[rgba(239,120,120,0.38)] bg-[rgba(124,38,38,0.5)] text-[rgba(255,221,221,0.92)]"
                                    : "border-[rgba(124,209,184,0.32)] bg-[rgba(48,94,77,0.5)] text-[rgba(209,248,231,0.95)]"
                                }`}
                              >
                                {user.banned ? "🔒 ถูกระงับ" : "✅ ปกติ"}
                              </span>
                            </td>
                          <td className="px-6 py-5">
                            <div className="text-xs font-medium text-[rgba(229,189,119,0.74)]">
                              {formatDate(user.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              type="button"
                              onClick={() => toggleBan(user)}
                              disabled={isBusy}
                              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold text-[var(--color-text)] shadow-[0_14px_24px_-20px_rgba(8,5,2,0.9)] transition-all duration-200 ${
                                user.banned
                                  ? "border-[rgba(124,209,184,0.35)] bg-[rgba(48,94,77,0.5)] text-[rgba(209,248,231,0.95)]"
                                  : "border-[rgba(239,120,120,0.4)] bg-[rgba(124,38,38,0.55)] text-[rgba(255,221,221,0.95)]"
                              } ${
                                isBusy
                                  ? "cursor-not-allowed opacity-60"
                                  : "hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-24px_rgba(8,5,2,0.9)] group-hover:-translate-y-0.5"
                              }`}
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
    <div className="relative overflow-hidden rounded-[1.5rem] border border-[rgba(229,189,119,0.22)] bg-[rgba(23,16,10,0.72)] p-4 text-center shadow-[0_18px_38px_-26px_rgba(9,6,3,0.9)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_28px_46px_-24px_rgba(9,6,3,0.92)]">
      {tone ? <div className={`pointer-events-none absolute inset-0 opacity-80 ${tone}`} aria-hidden /> : null}
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(229,189,119,0.6)]">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--color-text)]">{value}</p>
      </div>
    </div>
  );
}
