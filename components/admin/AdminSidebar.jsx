"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "แดชบอร์ด", icon: "📊" },
  { href: "/admin/sales", label: "ยอดขายย้อนหลัง", icon: "💹" },
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
                ? "border border-[#9be6dc] bg-white text-[#0b3b31] shadow-[0_18px_36px_-22px_rgba(10,83,73,0.45)]"
                : "text-[#0b756c]/80 hover:bg-[#e3faf6] hover:text-[#0b3b31]"
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
        className="fixed left-4 top-4 z-40 inline-flex items-center gap-2 rounded-full border border-[#9be6dc] bg-white/90 px-4 py-2 text-sm font-semibold text-[#0b756c] shadow-[0_18px_34px_-24px_rgba(10,83,73,0.45)] backdrop-blur transition hover:bg-[#e3faf6] lg:hidden"
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
        className={`fixed inset-y-0 left-0 z-50 w-72 origin-left transform border-r border-[#bff4ec] bg-[rgba(226,249,245,0.95)] text-[#0b3b31] shadow-[12px_0_44px_-22px_rgba(10,83,73,0.35)] transition-transform duration-300 ease-in-out backdrop-blur lg:static lg:block lg:h-auto lg:w-72 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 text-lg font-semibold tracking-wide text-[#0ea5a0]">
          <span className="flex items-center gap-2">
            <span className="text-2xl">🥟</span>
            Steaming Bun Market
          </span>
          <button
            type="button"
            className="rounded-full border border-[#9be6dc] px-2 py-1 text-xs text-[#0b756c] transition hover:bg-white lg:hidden"
            onClick={() => setOpen(false)}
          >
            ปิด
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-2xl border border-[#bff4ec] bg-white/85 p-4 text-xs text-[#145f4b] shadow-[inset_0_1px_4px_rgba(10,83,73,0.08)]">
            <p className="font-semibold text-[#0ea5a0]">สวัสดีผู้ดูแลร้าน!</p>
            <p className="mt-1 leading-relaxed">
              ตรวจสอบสต็อก จัดการคำสั่งซื้อ และเปิดโปรโมชันใหม่ๆ ได้จากแผงควบคุมเดียว
            </p>
          </div>
        </div>

        <nav className="space-y-2 px-4 pb-8">{nav}</nav>

        <div className="mt-auto space-y-3 px-6 pb-10 text-xs text-[#145f4b]">
          <div className="rounded-2xl border border-[#bff4ec] bg-white/85 p-3 shadow-[inset_0_1px_4px_rgba(10,83,73,0.08)]">
            <p className="font-semibold text-[#0ea5a0]">เคล็ดลับวันนี้</p>
            <p className="mt-1 leading-relaxed">
              ใช้แคมเปญส่งฟรีร่วมกับ LINE OA เพื่อดึงลูกค้าเก่ากลับมาซื้อซ้ำ
            </p>
          </div>
          <a
            href="/"
            className="inline-flex w-full items-center justify-center rounded-full border border-[#9be6dc] bg-white/85 px-4 py-2 font-semibold text-[#0b756c] shadow-[0_14px_28px_-22px_rgba(10,83,73,0.45)] transition hover:bg-[#e3faf6]"
          >
            ↩︎ กลับหน้าร้าน
          </a>
        </div>
      </aside>
    </>
  );
}
