"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/coupons", label: "Coupons" },
];

export default function AdminSidebar() {
  const path = usePathname();
  return (
    <aside className="w-64 shrink-0 bg-gradient-to-b from-[#f06583] to-[#f78da7] text-white shadow-2xl">
      <div className="h-16 flex items-center px-6 text-lg font-semibold tracking-wide">
        🍰 Admin Suite
      </div>
      <nav className="px-4 pb-6 space-y-2">
        {items.map((it) => {
          const active = path === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active ? "bg-white text-[var(--color-rose)] shadow-lg" : "hover:bg-white/15"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
