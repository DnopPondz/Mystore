import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: "Admin | Sweet Cravings" };

export default function AdminLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_20%_20%,#ffe6f2,transparent_55%),radial-gradient(circle_at_80%_0%,#fff1dd,transparent_45%),radial-gradient(circle_at_100%_80%,#ffe9fb,transparent_35%)] text-[var(--color-choco)] lg:flex">
      <AdminSidebar />

      <main className="flex-1 lg:ml-0">
        <div className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-md">
          <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-10">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--color-choco)]/60">
                Sweet Cravings Admin
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-[var(--color-rose-dark)]">
                แผงควบคุมการจัดการร้าน
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/30 bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--color-rose)] transition hover:border-[var(--color-rose)] hover:bg-white"
              >
                🏬 กลับหน้าร้าน
              </Link>
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-rose)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#f0658333] transition hover:bg-[var(--color-rose-dark)]"
              >
                🛒 ดูร้านแบบลูกค้า
              </Link>
            </div>
          </div>
        </div>

        <div className="px-5 pb-20 pt-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
