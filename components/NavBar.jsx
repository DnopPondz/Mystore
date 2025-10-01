"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";


const navItems = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/preorder", label: "สั่งทำพิเศษ" },
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

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
    return (
      <Link
        key={item.href}
        href={targetHref}
        className={`flex w-full items-center justify-between gap-3 rounded-full border border-transparent px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c154]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:w-auto md:justify-center ${
          active
            ? "bg-[#f1c154] text-white shadow-lg shadow-[rgba(241,193,84,0.35)]"
            : "text-[#3c1a09]/80 hover:text-[#f6d889]"
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
    <header className="sticky top-0 z-30">
      <div className="hidden md:flex items-center justify-between bg-[#5b3dfc] px-6 py-2 text-xs font-medium text-white max-w-screen-xl mx-auto">
        <span className="tracking-wide">อบสดใหม่ทุกวัน • ส่งฟรีในเมืองเมื่อสั่งครบ ฿800</span>
        <a
          href="tel:021234567"
          className="font-semibold text-white transition-colors hover:text-[#ffe37f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe37f]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#5b3dfc]"
        >
          โทร. 061-267-4523
        </a>
      </div>

      <nav className="shadow-[0_20px_40px_-20px_rgba(91,61,252,0.25)] bg-white/95 backdrop-blur">
        <div className="border-b border-[#f1d7b8] bg-white">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-6 px-4 py-4 sm:px-6">
            <Link
              href="/"
              className="group flex items-center gap-3 rounded-full border border-[#e6c688] bg-[#fff3d6] px-3 py-1 text-[#3c1a09] transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c154]/40"
            >
              {/* <Image
               className="h-10 w-10 rounded-full bg-white/90 shadow-inner flex items-center justify-center text-xl transition-transform group-hover:scale-105">
                🥐
              </Image> */}

              <Image
                src="/images/logo.png"
                alt="logo"
                width={100}
                height={100}
                className="h-10 w-10 rounded-full border border-[#e6c688] bg-[#ffe37f] shadow-inner flex items-center justify-center text-xl transition-transform group-hover:scale-105"
              />
              <span className="text-xl sm:text-2xl font-extrabold text-[#3c1a09] tracking-tight">
               Steaming Bun
              </span>
            </Link>

            <button
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e6c688] bg-[#ffe37f] text-[#3c1a09] shadow transition hover:bg-[#ffd76b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c154]/40"
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
              <div className="flex items-center gap-2 rounded-full border border-[#e6c688] bg-[#fff3d6] px-2 py-1 shadow-inner shadow-[#e6c688]/40">
                {navItems.map((item) => link(item))}
              </div>
              {status === "loading" && (
                <span className="text-xs text-[#3c1a09]/70">กำลังโหลด...</span>
              )}

              {status === "unauthenticated" && (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-full text-sm font-medium text-[#3c1a09] bg-[#ffe37f] shadow transition hover:bg-[#ffd76b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c154]/40"
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#f1c154] shadow-lg shadow-[rgba(241,193,84,0.4)] transition hover:bg-[#b6791c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c154]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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
                      className="px-4 py-2 rounded-full border border-transparent bg-[#f1c154] text-white shadow transition hover:bg-[#b6791c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c154]/40"
                    >
                      จัดการร้าน
                    </Link>
                  )}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen((v) => !v)}
                      className="flex items-center gap-2 rounded-full border border-[#e6c688] bg-[#ffe37f] px-4 py-2 text-[#3c1a09] shadow-inner transition hover:border-[#f1c154] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c154]/40"
                      style={{ boxShadow: "inset 3px 3px 6px rgba(60,26,9,0.1), inset -3px -3px 6px rgba(255,227,127,0.45)" }}
                      aria-expanded={userMenuOpen}
                      aria-haspopup="menu"
                    >
                      <span className="max-w-[9rem] truncate text-left font-medium">
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
                        className="absolute right-0 z-40 mt-2 w-56 rounded-2xl border border-[#e6c688] bg-white p-2 text-[#3c1a09] shadow-2xl shadow-[rgba(60,26,9,0.2)]"
                      >
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-[#fff0d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c154]/30"
                          role="menuitem"
                        >
                          <span className="text-lg">👤</span>
                          โปรไฟล์ของฉัน
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-[#fff0d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c154]/30"
                          role="menuitem"
                        >
                          <span className="text-lg">🧾</span>
                          คำสั่งซื้อของฉัน
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-200 transition hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
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
          className={`md:hidden fixed inset-x-4 top-[5.5rem] z-30 origin-top rounded-3xl border border-[#e6c688] bg-[#fff3d6] p-6 text-sm text-[#3c1a09] shadow-2xl shadow-[rgba(60,26,9,0.25)] backdrop-blur transition-transform duration-200 ${
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
              <span className="text-xs text-[#3c1a09]/70">กำลังโหลด...</span>
            )}
            {status === "unauthenticated" && (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full font-medium text-[#3c1a09] bg-[#ffe37f] shadow transition hover:bg-[#ffd76b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c154]/40"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full font-semibold text-white bg-[#f1c154] shadow transition hover:bg-[#b6791c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c154]/40"
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
                    className="px-4 py-2 rounded-full font-medium text-white bg-[#f1c154] shadow transition hover:bg-[#b6791c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c154]/40"
                  >
                    จัดการร้าน
                  </Link>
                )}
                <div className="rounded-2xl border border-[#e6c688] bg-white p-4 text-sm text-[#3c1a09] shadow-inner">
                  <p className="font-semibold">{session?.user?.name || session?.user?.email}</p>
                  <p className="mt-1 text-xs text-[#3c1a09]/70">{session?.user?.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 rounded-full font-medium text-[#3c1a09] bg-[#ffe37f] shadow transition hover:bg-[#ffd76b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c154]/40"
                >
                  โปรไฟล์ของฉัน
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 rounded-full font-medium text-[#3c1a09] bg-[#ffe37f] shadow transition hover:bg-[#ffd76b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1c154]/40"
                >
                  คำสั่งซื้อของฉัน
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="px-4 py-2 rounded-full font-medium text-white bg-red-500/80 shadow transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
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
