"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";


const navItems = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/preorder", label: "สั่งทำพิเศษ" },
   { href: "/orders", label: "คำสั่งซื้อ" },
  {
    href: "/cart",
    label: "ตะกร้า",
    requiresAuth: true,
    // icon: "/images/paper-bag.svg",
    iconAlt: "ตะกร้าสินค้า",
  },
 
];

export default function NavBar() {
  const path = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const link = (item) => {
    const targetHref =
      item.requiresAuth && status !== "authenticated"
        ? `/login?callbackUrl=${encodeURIComponent(item.href)}`
        : item.href;
    const active = path === item.href && (!item.requiresAuth || status === "authenticated");
    return (
      <Link
        key={item.href}
        href={targetHref}
        className={`flex w-full items-center justify-between gap-3 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:w-auto md:justify-center ${
          active
            ? "bg-white/80 text-[var(--color-rose)] shadow"
            : "text-[var(--color-choco)] hover:text-[var(--color-rose)]"
        }`}
        onClick={() => setMenuOpen(false)}
      >
        {item.icon ? (
          <>
            <Image
              src={item.icon}
              alt={item.iconAlt || item.label}
              width={24}
              height={24}
              className="h-6 w-6 flex-shrink-0"
              priority={item.href === "/cart"}
            />
            <span className="text-sm font-medium md:hidden">{item.label}</span>
            <span className="sr-only md:not-sr-only md:inline">{item.label}</span>
          </>
        ) : (
          item.label
        )}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-cream)]/80 backdrop-blur">
      <div className="hidden md:flex items-center justify-between border-b border-white/50 px-6 py-2 text-xs text-[var(--color-choco)]/80 max-w-screen-xl mx-auto">
        <span className="tracking-wide">อบสดใหม่ทุกวัน • ส่งฟรีในเมืองเมื่อสั่งครบ ฿800</span>
        <a
          href="tel:021234567"
          className="font-medium transition-colors hover:text-[var(--color-rose)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          โทร. 061-267-4523
        </a>
      </div>

      <nav className="bg-gradient-to-r from-[#fff5e6] via-[#fde7b8] to-[#f6c08c] shadow-md">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-6 py-4">
            <Link
              href="/"
              className="group flex items-center gap-3 rounded-full bg-white/70 px-3 py-1 transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]/30"
            >
              {/* <Image
               className="h-10 w-10 rounded-full bg-white/90 shadow-inner flex items-center justify-center text-xl transition-transform group-hover:scale-105">
                🥐
              </Image> */}

              <Image src="/images/logo.png" alt="logo" width={100} height={100} className="h-10 w-10 rounded-full bg-white/90 shadow-inner flex items-center justify-center text-xl transition-transform group-hover:scale-105" />
              <span className="text-xl sm:text-2xl font-extrabold text-[var(--color-rose-dark)] tracking-tight">
               Steaming Bun
              </span>
            </Link>

            <button
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-[var(--color-rose-dark)] shadow transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]/40"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                {menuOpen ? (
                  <path
                    fillRule="evenodd"
                    d="M6.225 4.811a.75.75 0 011.06 0L12 9.525l4.715-4.714a.75.75 0 111.06 1.06L13.06 10.585l4.715 4.714a.75.75 0 11-1.06 1.061L12 11.646l-4.715 4.714a.75.75 0 11-1.06-1.06L10.94 10.585 6.225 5.87a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M3.75 5.25A.75.75 0 014.5 4.5h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6A.75.75 0 014.5 10.5h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
            </button>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-white/70 px-2 py-1 shadow-inner">
              {navItems.map((item) => link(item))}
              </div>
              {status === "loading" && (
                <span className="text-xs text-[var(--color-choco)]/70">กำลังโหลด...</span>
              )}

              {status === "unauthenticated" && (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-full text-sm font-medium bg-white/80 text-[var(--color-rose-dark)] shadow transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]/40"
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-full text-sm font-medium text-white bg-[var(--color-rose)] shadow-lg transition hover:bg-[var(--color-rose-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    สมัครสมาชิก
                  </Link>
                </div>
              )}

              {status === "authenticated" && (
                <div className="flex items-center gap-3 text-sm">
                  {session?.user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="px-4 py-2 rounded-full bg-white/80 text-[var(--color-rose-dark)] shadow transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]/40"
                    >
                      จัดการร้าน
                    </Link>
                  )}
                  <span className="px-5 py-2 rounded-full bg-[#f8e9d8] text-[var(--color-choco)]/80 font-medium shadow-inner"
      style={{ boxShadow: "inset 3px 3px 6px rgba(0,0,0,0.2), inset -3px -3px 6px rgba(255,255,255,0.7)" }}>
  {session?.user?.name || session?.user?.email}
</span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-4 py-2 rounded-full font-medium text-white bg-red-400 shadow transition hover:bg-[var(--color-rose-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {menuOpen && (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm md:hidden"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <div
          id="mobile-menu"
          className={`md:hidden fixed inset-x-4 top-[5.5rem] z-30 origin-top rounded-3xl bg-white/90 p-6 text-sm text-[var(--color-choco)] shadow-2xl backdrop-blur transition-transform duration-200 ${
            menuOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <div key={item.href} className="flex">
                {link(item)}
              </div>
            ))}
            {status === "loading" && (
              <span className="text-xs text-[var(--color-choco)]/70">กำลังโหลด...</span>
            )}
            {status === "unauthenticated" && (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full font-medium bg-white text-[var(--color-rose-dark)] shadow transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]/30"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full font-medium text-white bg-[var(--color-rose)] shadow transition hover:bg-[var(--color-rose-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]/40"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
            {status === "authenticated" && (
              <div className="flex flex-col gap-3">
                {session?.user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 rounded-full font-medium bg-white text-[var(--color-rose-dark)] shadow transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]/30"
                  >
                    จัดการร้าน
                  </Link>
                )}
                <span className="px-5 py-2 rounded-full bg-[#f8e9d8] text-[var(--color-choco)]/80 font-medium shadow-inner"
      style={{ boxShadow: "inset 3px 3px 6px rgba(0,0,0,0.2), inset -3px -3px 6px rgba(255,255,255,0.7)" }}>
  {session?.user?.name || session?.user?.email}
</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-2 rounded-full font-medium text-white bg-red-400 shadow transition hover:bg-[var(--color-rose-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
                >
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
