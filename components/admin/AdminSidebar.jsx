"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "แดชบอร์ด", icon: "📊" },
  { href: "/admin/products", label: "จัดการสินค้า", icon: "🧁" },
  { href: "/admin/orders", label: "คำสั่งซื้อ", icon: "🧾" },
  { href: "/admin/preorders", label: "Pre-order", icon: "📅" },
  { href: "/admin/reviews", label: "รีวิวลูกค้า", icon: "⭐" },
  { href: "/admin/users", label: "ผู้ใช้งาน", icon: "👥" },
  { href: "/admin/promotions", label: "โปรโมชัน", icon: "🎁" },
  { href: "/admin/coupons", label: "คูปอง", icon: "🎟️" },
];

export default function AdminSidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // ปิดเมนูเมื่อเปลี่ยนเส้นทาง เพื่อไม่ให้เมนูค้างอยู่บนมือถือ
  useEffect(() => {
    setOpen(false);
  }, [path]);

  const nav = useMemo(
    () =>
      items.map((it) => {
        const active =
          it.href === "/admin"
            ? path === it.href
            : path === it.href || path?.startsWith(`${it.href}/`);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition ${
              active
                ? "border border-[var(--color-rose)]/40 bg-[var(--color-burgundy-dark)]/80 text-[var(--color-rose)] shadow-lg shadow-black/30"
                : "text-[var(--color-gold)]/80 hover:bg-[var(--color-burgundy)]/60 hover:text-[var(--color-gold)]"
            }`}
          >
            <span className="text-base transition-transform group-hover:scale-110">{it.icon}</span>
            {it.label}
          </Link>
        );
      }),
    [path]
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-40 inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy)]/80 px-4 py-2 text-sm font-semibold text-[var(--color-rose)] shadow-lg shadow-black/30 backdrop-blur transition hover:bg-[var(--color-burgundy)] lg:hidden"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="admin-sidebar"
      >
        ☰ เมนูจัดการร้าน
      </button>

      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 origin-left transform bg-gradient-to-b from-[var(--color-burgundy)] via-[var(--color-burgundy-dark)] to-[#090101] text-[var(--color-gold)] shadow-[12px_0_40px_-16px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-in-out lg:static lg:block lg:h-auto lg:w-72 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 text-lg font-semibold tracking-wide">
          <span className="flex items-center gap-2">
            <span className="text-2xl">🍰</span>
            Sweet Cravings
          </span>
          <button
            type="button"
            className="rounded-full border border-[var(--color-rose)]/30 px-2 py-1 text-xs text-[var(--color-gold)]/80 transition hover:border-[var(--color-rose)] hover:text-[var(--color-rose)] lg:hidden"
            onClick={() => setOpen(false)}
          >
            ปิด
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-2xl border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/70 p-4 text-xs text-[var(--color-gold)]/80 shadow-inner">
            <p className="font-semibold text-[var(--color-rose)]">สวัสดีผู้ดูแลร้าน!</p>
            <p className="mt-1 leading-relaxed">
              จัดการสินค้า ติดตามคำสั่งซื้อ และปรับโปรโมชั่นได้จากศูนย์ควบคุมนี้
            </p>
          </div>
        </div>

        <nav className="space-y-2 px-4 pb-8">{nav}</nav>

        <div className="mt-auto space-y-3 px-6 pb-10 text-xs text-[var(--color-gold)]/70">
          <div className="rounded-2xl border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/70 p-3 shadow-inner">
            <p className="font-semibold text-[var(--color-rose)]">เคล็ดลับวันนี้</p>
            <p className="mt-1 leading-relaxed">
              ใช้ส่วนลดช่วงเทศกาลเพื่อดึงลูกค้าใหม่ๆ และกระตุ้นยอดซื้อซ้ำ
            </p>
          </div>
          <a
            href="/"
            className="inline-flex w-full items-center justify-center rounded-full border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/70 px-4 py-2 font-semibold text-[var(--color-rose)] transition hover:bg-[var(--color-burgundy)]"
          >
            ↩︎ กลับหน้าร้าน
          </a>
        </div>
      </aside>
    </>
  );
}
