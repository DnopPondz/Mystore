import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: "Admin | Bun Shop" };

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1">
        <div className="h-14 border-b flex items-center px-6">Admin Panel</div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
