"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/cart", label: "ตะกร้า" },
  { href: "/orders", label: "คำสั่งซื้อ" },
];

export default function NavBar() {
  const path = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  const link = (href, label, key) => {
    const active = path === href;
    return (
      <Link
        key={key}
        href={href}
        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
          active
            ? "bg-white/80 text-[var(--color-rose)] shadow"
            : "text-[var(--color-choco)] hover:text-[var(--color-rose)]"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-[var(--color-cream)]/70">
      <div className="hidden md:flex items-center justify-between px-6 py-2 text-xs text-[var(--color-choco)]/80 max-w-screen-xl mx-auto">
        <span>อบสดใหม่ทุกวัน • ส่งฟรีในเมืองเมื่อสั่งครบ ฿800</span>
        <a href="tel:021234567" className="font-medium hover:text-[var(--color-rose)]">
          โทร. 02-123-4567
        </a>
      </div>

      <nav className="bg-gradient-to-r from-[#ffe1c9] via-[#ffe9d6] to-[#ffe1ea] shadow-md">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-white/90 shadow-inner flex items-center justify-center text-xl">
                🥐
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-[var(--color-rose-dark)] tracking-tight">
                Sweet Cravings
              </span>
            </Link>

            <button
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[var(--color-rose-dark)] shadow transition hover:bg-white"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              type="button"
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

            <div className="hidden md:flex items-center gap-3">
              {navItems.map(({ href, label }) => link(href, label, href))}
              {status === "loading" && (
                <span className="text-xs text-[var(--color-choco)]/70">กำลังโหลด...</span>
              )}

              {status === "unauthenticated" && (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-full text-sm font-medium bg-white/70 text-[var(--color-rose-dark)] shadow hover:bg-white"
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-full text-sm font-medium text-white bg-[var(--color-rose)] shadow-lg hover:bg-[var(--color-rose-dark)]"
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
                      className="px-4 py-2 rounded-full bg-green-400  text-[var(--color-rose-dark)] shadow hover:bg-green-300"
                    >
                      จัดการร้าน
                    </Link>
                  )}
                  <span className="text-[var(--color-choco)]/80">
                    {session?.user?.name || session?.user?.email}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-4 py-2 rounded-full bg-red-500 text-white shadow hover:bg-red-400"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={`md:hidden transition-all duration-200 ${
            menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden bg-white/80 backdrop-blur`}
        >
          <div className="px-6 pb-6 flex flex-col gap-3 text-sm text-[var(--color-choco)]">
            {navItems.map(({ href, label }) => link(href, label, href))}
            {status === "loading" && (
              <span className="text-xs text-[var(--color-choco)]/70">กำลังโหลด...</span>
            )}
            {status === "unauthenticated" && (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full font-medium bg-white text-[var(--color-rose-dark)] shadow"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full font-medium text-white bg-[var(--color-rose)] shadow"
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
                    className="px-4 py-2 rounded-full font-medium bg-green-400 hover:bg-green-300 text-[var(--color-rose-dark)] shadow"
                  >
                    จัดการร้าน
                  </Link>
                )}
                <span className="text-[var(--color-choco)]/70">
                  {session?.user?.name || session?.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-left  underline bg-red-500 text-white shadow hover:bg-red-400"
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
