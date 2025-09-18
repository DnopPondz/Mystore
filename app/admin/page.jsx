"use client";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        const d = await res.json();
        if (!res.ok) throw new Error(d?.error || "Load stats failed");
        setData(d);
      } catch (e) { setErr(String(e.message || e)); }
    })();
  }, []);

  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!data) return <div className="p-6">กำลังโหลด...</div>;

  const { cards, topProducts } = data;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-sm text-gray-600 mb-6">สวัสดีแอดมิน ✨</p>

      <div className="grid md:grid-cols-3 gap-4">
        <Card title="ยอดขายวันนี้" value={`฿${cards.todaySales}`} />
        <Card title="ออเดอร์ใหม่" value={cards.newOrders} />
        <Card title="สต็อกต่ำ" value={cards.lowStock} />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Top products</h2>
          <a href="/api/admin/export/sales" className="px-3 py-1.5 rounded border">Export CSV</a>
        </div>
        <table className="w-full mt-3 border">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border">สินค้า</th>
              <th className="p-2 border">จำนวน</th>
              <th className="p-2 border">รายได้</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p) => (
              <tr key={p._id}>
                <td className="p-2 border">{p._id}</td>
                <td className="p-2 border">{p.qty}</td>
                <td className="p-2 border">฿{p.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="border rounded-xl p-4">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}
