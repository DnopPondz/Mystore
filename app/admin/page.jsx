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
      } catch (e) {
        setErr(String(e.message || e));
      }
    })();
  }, []);

  if (err) return <div className="p-6 text-rose-600">{err}</div>;
  if (!data) return <div className="p-6 text-[var(--color-choco)]/70">กำลังโหลด...</div>;

  const { cards, topProducts } = data;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-rose-dark)]">ภาพรวมร้าน Sweet Cravings</h1>
        <p className="mt-2 text-sm text-[var(--color-choco)]/70">
          ตรวจสอบยอดขาย ออเดอร์ และสินค้ายอดนิยมแบบเรียลไทม์ เพื่อวางแผนการผลิตได้อย่างแม่นยำ
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card title="ยอดขายวันนี้" value={`฿${cards.todaySales}`} accent="from-[#f6c34a] to-[#f78da7]" />
        <Card title="ออเดอร์ใหม่" value={cards.newOrders} accent="from-[#f06583] to-[#f6c34a]" />
        <Card title="สต็อกต่ำ" value={cards.lowStock} accent="from-[#7cd1b8] to-[#f6c34a]" />
      </div>

      <div className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-[#f0658320]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-choco)]">สินค้า Top ของเดือน</h2>
            <p className="text-sm text-[var(--color-choco)]/60">ข้อมูลนี้อัปเดตรายวัน พร้อม export เพื่อนำไปวิเคราะห์ต่อ</p>
          </div>
          <a
            href="/api/admin/export/sales"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-rose)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#f0658333] hover:bg-[var(--color-rose-dark)]"
          >
            ดาวน์โหลด CSV
          </a>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#f7b267]/40">
          <table className="w-full text-sm">
            <thead className="bg-[#fff1dd] text-[var(--color-choco)]/80">
              <tr>
                <th className="p-3 text-left font-medium">สินค้า</th>
                <th className="p-3 text-right font-medium">จำนวน</th>
                <th className="p-3 text-right font-medium">รายได้</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p._id} className="odd:bg-white even:bg-[#fff7f0] text-[var(--color-choco)]/80">
                  <td className="p-3">{p._id}</td>
                  <td className="p-3 text-right">{p.qty}</td>
                  <td className="p-3 text-right">฿{p.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, accent }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg shadow-[#f065831a]">
      <div className={`absolute -top-12 -right-6 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-30`} />
      <div className="relative">
        <div className="text-sm font-medium text-[var(--color-choco)]/70">{title}</div>
        <div className="mt-4 text-3xl font-semibold text-[var(--color-rose-dark)]">{value}</div>
      </div>
    </div>
  );
}
