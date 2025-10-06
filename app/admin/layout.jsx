import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AdminPopupProvider } from "@/components/admin/AdminPopupProvider";

export const metadata = { title: "Admin | Steaming Bun Market" };

export default function AdminLayout({ children }) {
  return (
    <AdminPopupProvider>
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,160,0.16),_rgba(20,95,75,0.08)_55%,_rgba(255,135,70,0.06)_95%)] text-[#0b3b31] lg:flex">
        <AdminSidebar />

        <main className="flex-1 lg:ml-0">
          <div className="sticky top-0 z-30 border-b border-[#bff4ec] bg-[rgba(231,250,247,0.85)] backdrop-blur">
            <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#0ea5a0]">
                  Steaming Bun Market
                </p>
                <h1 className="mt-1 text-2xl font-bold text-[#0b3b31]">
                  ศูนย์จัดการร้านค้า
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-[#9be6dc] bg-white/85 px-4 py-2 text-sm font-semibold text-[#0b756c] shadow-[0_12px_28px_-20px_rgba(10,83,73,0.45)] transition hover:bg-[#e3faf6]"
                >
                  🏬 กลับหน้าร้าน
                </Link>
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0ea5a0] via-[#0c8d86] to-[#0a5f56] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_38px_-20px_rgba(10,83,73,0.55)] transition hover:from-[#0c8d86] hover:via-[#0a7c73] hover:to-[#084f47]"
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
