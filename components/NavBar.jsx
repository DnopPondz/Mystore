"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function NavBar() {
  const path = usePathname();
  const { data: session, status } = useSession(); // session?.user?.role

  const link = (href, label) => (
    <Link
      href={href}
      className={`hover:underline ${path === href ? "font-semibold" : ""}`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="border-b">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold">Bun Shop</Link>

        <div className="flex items-center gap-4">
          {link("/cart", "Cart")}

          {/* รอโหลด session */}
          {status === "loading" && <span className="text-gray-500 text-sm">loading…</span>}

          {/* ถ้ายังไม่ล็อกอิน */}
          {status === "unauthenticated" && (
            <>
              {link("/login", "Login")}
              {link("/register", "Register")}
            </>
          )}

          {/* ถ้าล็อกอินแล้ว */}
          {status === "authenticated" && (
            <>
              {/* โชว์ปุ่ม Admin เฉพาะ role=admin */}
              {session?.user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded bg-gray-900 text-white"
                >
                  Admin
                </Link>
              )}

              {/* โปรไฟล์/ออกจากระบบ (ตัวอย่างง่าย) */}
              <span className="text-sm text-gray-700">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm underline"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
