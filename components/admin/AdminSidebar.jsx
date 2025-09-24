"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "แดชบอร์ด", icon: "📊" },
  { href: "/admin/products", label: "จัดการสินค้า", icon: "🧁" },
  { href: "/admin/orders", label: "คำสั่งซื้อ", icon: "🧾" },
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
                ? "bg-white text-[var(--color-rose-dark)] shadow-lg shadow-[#f5a25d33]"
                : "text-white/80 hover:bg-white/15 hover:text-white"
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
        className="fixed left-4 top-4 z-40 inline-flex items-center gap-2 rounded-full border border-white/40 bg-[var(--color-rose)]/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#f5a25d33] backdrop-blur transition hover:bg-[var(--color-rose)] lg:hidden"
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
        className={`fixed inset-y-0 left-0 z-50 w-72 origin-left transform bg-gradient-to-b from-[#f5a25d] via-[#f7c68b] to-[#f3d36b] text-white shadow-[12px_0_40px_-16px_#f5a25d90] transition-transform duration-300 ease-in-out lg:static lg:block lg:h-auto lg:w-72 lg:translate-x-0 ${
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
            className="rounded-full border border-white/30 px-2 py-1 text-xs text-white/80 transition hover:border-white hover:text-white lg:hidden"
            onClick={() => setOpen(false)}
          >
            ปิด
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-2xl bg-white/15 p-4 text-xs text-white/80 shadow-inner">
            <p className="font-semibold text-white">สวัสดีผู้ดูแลร้าน!</p>
            <p className="mt-1 leading-relaxed">
              จัดการสินค้า ติดตามคำสั่งซื้อ และปรับโปรโมชั่นได้จากศูนย์ควบคุมนี้
            </p>
          </div>
        </div>

        <nav className="space-y-2 px-4 pb-8">{nav}</nav>

        <div className="mt-auto space-y-3 px-6 pb-10 text-xs text-white/70">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-3 shadow-inner">
            <p className="font-semibold text-white">เคล็ดลับวันนี้</p>
            <p className="mt-1 leading-relaxed">
              ใช้ส่วนลดช่วงเทศกาลเพื่อดึงลูกค้าใหม่ๆ และกระตุ้นยอดซื้อซ้ำ
            </p>
          </div>
          <a
            href="/"
            className="inline-flex w-full items-center justify-center rounded-full bg-white/20 px-4 py-2 font-semibold text-white transition hover:bg-white/30"
          >
            ↩︎ กลับหน้าร้าน
          </a>
        </div>
      </aside>
    </>
  );
}
