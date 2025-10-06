"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/components/cart/CartProvider";


const navItems = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/about", label: "เรื่องราวร้าน" },
  { href: "/preorder", label: "สั่งทำพิเศษ" },
  {
    href: "/cart",
    label: "ตะกร้าช้อปปิ้ง",
    requiresAuth: true,
    iconAlt: "ตะกร้าสินค้า",
  },
];

export default function NavBar() {
  const path = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const cart = useCart();
  const cartCount = cart?.count ?? 0;

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [path]);

  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClickOutside(event) {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

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
    const isCartLink = item.href === "/cart";
    const showBadge = isCartLink && cartCount > 0;
    const badgeCount = cartCount > 99 ? "99+" : cartCount;
    return (
      <Link
        key={item.href}
        href={targetHref}
        className={`relative flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-burgundy)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:w-auto md:justify-center ${
          active
            ? "bg-[var(--color-rose)] text-white shadow-lg shadow-[rgba(12,116,108,0.28)]"
            : "text-[var(--color-rose-dark)]/80 hover:text-[var(--color-rose)]"
        } ${showBadge ? "pr-7" : ""}`}
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
        {showBadge ? (
          <span className="pointer-events-none absolute -top-1.5 -right-2 inline-flex h-5 min-w-[1.35rem] items-center justify-center rounded-full bg-[var(--color-gold)] px-1.5 text-[0.65rem] font-bold text-white shadow-lg shadow-[rgba(255,135,70,0.45)]">
            {badgeCount}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="hidden md:block bg-[var(--color-rose)]/95 text-white">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-6 px-6 py-2 text-xs tracking-wide">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-sm">🚚</span>
            <span>ส่งฟรีในเมืองลำพูนเมื่อสั่งครบ ฿800 และอัปเดตคิวอบสดทุกวัน</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://line.me/R/ti/p/@sweetcravings"
              className="hidden rounded-full bg-white/10 px-3 py-1 font-medium text-white transition hover:bg-white/20 lg:inline-flex"
              target="_blank"
              rel="noreferrer"
            >
              LINE Official
            </a>
            <a
              href="tel:0612674523"
              className="font-semibold text-white transition hover:text-[#fef2e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-rose)]"
            >
              โทร 061-267-4523
            </a>
          </div>
        </div>
      </div>

      <nav className="border-b border-[var(--color-burgundy)]/15 bg-white/90 shadow-[0_18px_32px_-22px_rgba(14,165,160,0.45)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:gap-8">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-3xl border border-[var(--color-burgundy)]/40 bg-white/70 px-3 py-2 text-[var(--color-rose-dark)] shadow-[0_10px_24px_-18px_rgba(14,165,160,0.6)] transition hover:border-[var(--color-burgundy)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-burgundy)]/40"
          >
            <Image
              src="/images/logo.png"
              alt="Steaming Bun Logo"
              width={96}
              height={96}
              className="h-10 w-10 rounded-2xl border border-[var(--color-burgundy)]/40 bg-[var(--color-cream-soft)] object-cover p-1 shadow-inner transition-transform group-hover:scale-110"
            />
            <span className="flex flex-col leading-tight">
              <span className="text-base font-semibold uppercase tracking-[0.35em] text-[var(--color-burgundy-dark)]">
                Steaming Bun
              </span>
              <span className="text-lg font-bold text-[var(--color-rose-dark)] sm:text-xl">
                ตลาดซาลาเปาออนไลน์
              </span>
            </span>
          </Link>

          <button
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-burgundy)]/40 bg-white text-[var(--color-rose-dark)] shadow-lg transition hover:bg-[var(--color-cream-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-burgundy)]/40 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="เปิดเมนูนำทาง"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M6 18 18 6" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>

          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex items-center gap-1 rounded-3xl border border-[var(--color-burgundy)]/30 bg-white/80 px-1 py-1 shadow-inner">
              {navItems.map((item) => link(item))}
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {status === "loading" && (
              <span className="text-xs text-[var(--color-rose-dark)]/70">กำลังโหลด...</span>
            )}

            {status === "unauthenticated" && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-2xl border border-[var(--color-burgundy)]/30 px-4 py-2 text-sm font-medium text-[var(--color-rose-dark)] transition hover:border-[var(--color-burgundy)]/70 hover:text-[var(--color-rose)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-burgundy)]/40"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="rounded-2xl bg-[var(--color-gold)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(255,135,70,0.45)] transition hover:bg-[#ff7125] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}

            {status === "authenticated" && (
              <div className="flex items-center gap-3 text-sm text-[var(--color-rose-dark)]">
                {session?.user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="rounded-2xl bg-[var(--color-rose)] px-4 py-2 font-medium text-white shadow-md shadow-[rgba(12,116,108,0.35)] transition hover:bg-[var(--color-rose-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]/40"
                  >
                    จัดการร้าน
                  </Link>
                )}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-2xl border border-[var(--color-burgundy)]/40 bg-white px-4 py-2 text-left text-sm font-medium text-[var(--color-rose-dark)] shadow-sm transition hover:border-[var(--color-burgundy)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-burgundy)]/40"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                  >
                    <span className="max-w-[9rem] truncate">
                      {session?.user?.name || session?.user?.email}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : "rotate-0"}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 z-40 mt-2 w-60 rounded-3xl border border-[var(--color-burgundy)]/40 bg-white/95 p-3 text-sm text-[var(--color-rose-dark)] shadow-2xl shadow-[rgba(20,95,75,0.22)]"
                    >
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-3 py-2 transition hover:bg-[var(--color-cream-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-burgundy)]/30"
                        role="menuitem"
                      >
                        <span className="text-lg">👤</span>
                        โปรไฟล์ของฉัน
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-3 py-2 transition hover:bg-[var(--color-cream-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-burgundy)]/30"
                        role="menuitem"
                      >
                        <span className="text-lg">🧾</span>
                        ติดตามคำสั่งซื้อ
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-red-500 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/30"
                        role="menuitem"
                      >
                        <span className="text-lg">🚪</span>
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {menuOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <div
          id="mobile-menu"
          className={`md:hidden fixed inset-x-4 top-[5.75rem] z-40 origin-top rounded-3xl border border-[var(--color-burgundy)]/30 bg-white/95 p-6 text-sm text-[var(--color-rose-dark)] shadow-[0_30px_60px_-28px_rgba(20,95,75,0.45)] transition-transform duration-200 ${
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
              <span className="text-xs text-[var(--color-rose-dark)]/60">กำลังโหลด...</span>
            )}
            {status === "unauthenticated" && (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="rounded-2xl border border-[var(--color-burgundy)]/30 px-4 py-2 font-medium text-[var(--color-rose-dark)] transition hover:border-[var(--color-burgundy)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-burgundy)]/30"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="rounded-2xl bg-[var(--color-gold)] px-4 py-2 font-semibold text-white shadow-md transition hover:bg-[#ff7125] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]/40"
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
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl bg-[var(--color-rose)] px-4 py-2 font-medium text-white shadow transition hover:bg-[var(--color-rose-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]/40"
                  >
                    จัดการร้าน
                  </Link>
                )}
                <div className="rounded-2xl border border-[var(--color-burgundy)]/30 bg-white/90 p-4 shadow-inner">
                  <p className="font-semibold">{session?.user?.name || session?.user?.email}</p>
                  <p className="mt-1 text-xs text-[var(--color-rose-dark)]/70">{session?.user?.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl border border-[var(--color-burgundy)]/30 px-4 py-2 font-medium text-[var(--color-rose-dark)] transition hover:border-[var(--color-burgundy)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-burgundy)]/30"
                >
                  โปรไฟล์ของฉัน
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl border border-[var(--color-burgundy)]/30 px-4 py-2 font-medium text-[var(--color-rose-dark)] transition hover:border-[var(--color-burgundy)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-burgundy)]/30"
                >
                  ติดตามคำสั่งซื้อ
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="rounded-2xl bg-red-500/90 px-4 py-2 font-medium text-white shadow transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
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
