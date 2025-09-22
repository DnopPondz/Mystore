import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: "Admin | Sweet Cravings" };

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#fff2e5] via-[#fff7f0] to-[#ffe6f2] text-[var(--color-choco)]">
      <AdminSidebar />
      <main className="flex-1 backdrop-blur-sm">
        <div className="h-16 border-b border-white/60 bg-white/70 px-8 flex items-center text-lg font-semibold text-[var(--color-rose-dark)] shadow-sm">
          แผงควบคุมร้านค้า
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
