// components/admin/AdminSidebar.jsx
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
    <aside className="w-56 shrink-0 border-r h-[calc(100vh-0px)] sticky top-0">
      <div className="h-14 flex items-center px-4 border-b font-bold">Admin</div>
      <nav className="p-2 space-y-1">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`block px-3 py-2 rounded hover:bg-gray-100 ${
              path === it.href ? "bg-gray-200 font-medium" : ""
            }`}
          >
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
