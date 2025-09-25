import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AdminPopupProvider } from "@/components/admin/AdminPopupProvider";

export const metadata = { title: "Admin | Sweet Cravings" };

export default function AdminLayout({ children }) {
  return (
    <AdminPopupProvider>
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_15%_20%,#4f1818,transparent_55%),radial-gradient(circle_at_80%_0%,#2b0c0c,transparent_50%),radial-gradient(circle_at_100%_80%,#180404,transparent_45%)] text-[var(--color-gold)] lg:flex">
        <AdminSidebar />

        <main className="flex-1 lg:ml-0">
          <div className="sticky top-0 z-30 border-b border-[var(--color-rose)]/15 bg-[var(--color-burgundy)]/80 backdrop-blur-md">
            <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-10">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--color-gold)]/60">
                  Sweet Cravings Admin
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-[var(--color-rose)]">
                  แผงควบคุมการจัดการร้าน
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/70 px-4 py-2 text-sm font-semibold text-[var(--color-rose)] transition hover:bg-[var(--color-burgundy)]"
                >
                  🏬 กลับหน้าร้าน
                </Link>
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-rose)] px-4 py-2 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-black/40 transition hover:bg-[var(--color-rose-dark)]"
                >
                  🛒 ดูร้านแบบลูกค้า
                </Link>
              </div>
            </div>
          </div>

          <div className="px-5 pb-20 pt-8 lg:px-10">{children}</div>
        </main>
      </div>
    </AdminPopupProvider>
  );
}
