import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AdminPopupProvider } from "@/components/admin/AdminPopupProvider";

export const metadata = { title: "Admin | Sweet Cravings" };

export default function AdminLayout({ children }) {
  return (
    <AdminPopupProvider>
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_#FFF5E7,_#FFE9C8_55%,_#F7DDB0)] text-[#3F2A1A] lg:flex">
        <AdminSidebar />

        <main className="flex-1 lg:ml-0">
          <div className="sticky top-0 z-30 border-b border-[#F2D5AF] bg-[#FFF6EB]/90 backdrop-blur">
            <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#C08B4D]">
                  Sweet Cravings Admin
                </p>
                <h1 className="mt-1 text-2xl font-bold text-[#3F2A1A]">
                  แผงควบคุมการจัดการร้าน
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-[#E6C79C] bg-white/80 px-4 py-2 text-sm font-semibold text-[#8A5A33] shadow-[0_12px_28px_-20px_rgba(63,42,26,0.45)] transition hover:bg-[#FFF2DD]"
                >
                  🏬 กลับหน้าร้าน
                </Link>
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 rounded-full bg-[#8A5A33] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_30px_-20px_rgba(63,42,26,0.55)] transition hover:bg-[#714528]"
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
