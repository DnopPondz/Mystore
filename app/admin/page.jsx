"use client";
import { useEffect, useMemo, useState } from "react";

const statusChips = [
  { key: "todaySales", label: "ยอดขายวันนี้", prefix: "฿" },
  { key: "preorderPipeline", label: "ใบเสนอราคาวันนี้", prefix: "฿" },
  { key: "newOrders", label: "ออเดอร์ใหม่", prefix: "" },
  { key: "lowStock", label: "สินค้าใกล้หมด", prefix: "" },
];

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

  const lowStock = data?.cards?.lowStock ?? 0;

  const reminders = useMemo(() => {
    const list = [];
    if (lowStock > 0) {
      list.push({
        title: "เติมสต็อกสินค้ายอดนิยม",
        detail: `มี ${lowStock} รายการที่กำลังจะหมด เลือกเติมสต็อกก่อนเวลาเปิดร้านพรุ่งนี้`,
      });
    }
    list.push({
      title: "ตรวจสอบสลิปเงินเข้า",
      detail: "ยืนยันการชำระเงินจากหน้า 'คำสั่งซื้อ' เพื่อให้ลูกค้าได้รับการจัดส่งเร็วที่สุด",
    });
    list.push({
      title: "วางแผนโปรโมชั่น",
      detail: "สร้างคูปองส่วนลดใหม่เพื่อกระตุ้นยอดขายช่วงสุดสัปดาห์",
    });
    return list;
  }, [lowStock]);

  if (err)
    return (
      <section className="rounded-[2rem] border border-red-200/60 bg-red-50/80 p-6 text-red-700 shadow-lg shadow-[rgba(139,69,19,0.15)]">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <span>{err}</span>
        </div>
      </section>
    );
  if (!data)
    return (
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 text-[#8B4513]/70 shadow-lg shadow-[rgba(139,69,19,0.15)] backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#D2691E] border-t-transparent"></div>
          <span>กำลังโหลดข้อมูลร้าน...</span>
        </div>
      </section>
    );

  const { cards, topProducts } = data;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-[rgba(139,69,19,0.2)] backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#8B4513]">
              ภาพรวมร้านวันนี้
            </h2>
            <p className="mt-2 max-w-xl text-[#8B4513]/70 leading-relaxed">
              ตรวจสอบยอดขาย ออเดอร์ และสต็อกสินค้าในมุมมองเดียว เพื่อวางแผนการผลิตและบริการลูกค้าได้อย่างมั่นใจ
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {statusChips.map((chip) => (
              <div
                key={chip.key}
                className="inline-flex items-center gap-2 rounded-full bg-[#F5DEB3]/30 border border-[#D2691E]/30 px-4 py-2 shadow-sm"
              >
                <span className="text-sm font-medium text-[#D2691E]">{chip.label}</span>
                <span className="text-sm font-semibold text-[#8B4513]">
                  {chip.prefix}
                  {cards[chip.key]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="ยอดขายวันนี้"
            value={`฿${cards.todaySales}`}
            caption="เปรียบเทียบจากยอดรวมที่ยืนยันแล้ว"
            color="green"
            icon="💰"
          />
          <StatCard
            title="ยอดเสนอราคาใหม่"
            value={`฿${cards.preorderPipeline}`}
            caption="รวมยอดใบเสนอราคาที่ออกภายในวันนี้"
            color="purple"
            icon="📝"
          />
          <StatCard
            title="ออเดอร์ใหม่"
            value={cards.newOrders}
            caption="ตรวจสอบรายละเอียดก่อน 18:00 น. เพื่อจัดส่งทันวันถัดไป"
            color="blue"
            icon="📦"
          />
          <StatCard
            title="สินค้าใกล้หมด"
            value={cards.lowStock}
            caption="เติมสต็อกล่วงหน้าเพื่อไม่ให้ยอดขายสะดุด"
            color="orange"
            icon="📊"
          />
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Products Table */}
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-[rgba(139,69,19,0.15)] backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#8B4513]">
                  สินค้าที่ขายดีที่สุดประจำเดือน
                </h3>
                <p className="text-[#8B4513]/70 mt-1">
                  ข้อมูลอัปเดตรายวัน พร้อมดาวน์โหลดไฟล์เพื่อวิเคราะห์ต่อ
                </p>
              </div>
              <a
                href="/api/admin/export/sales"
                className="inline-flex items-center gap-2 rounded-full bg-[#D2691E] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[rgba(139,69,19,0.25)] transition hover:bg-[#8B4513]"
              >
                ⬇️ ดาวน์โหลด CSV
              </a>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/50 shadow-inner">
              <table className="w-full text-sm">
                <thead className="bg-[#F5DEB3]/50 border-b border-white/60">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-[#8B4513]">สินค้า</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#8B4513]">จำนวนที่ขาย</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#8B4513]">รายได้ (฿)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {topProducts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-4xl mb-2">📈</span>
                          <span className="text-[#8B4513]/60">ยังไม่มีข้อมูลยอดขายสำหรับช่วงเวลานี้</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    topProducts.map((p, idx) => (
                      <tr key={p._id} className="hover:bg-white/70 transition-colors">
                        <td className="px-6 py-4 font-medium text-[#8B4513]">{p._id}</td>
                        <td className="px-6 py-4 text-right text-[#8B4513]/80">{p.qty}</td>
                        <td className="px-6 py-4 text-right font-semibold text-[#8B4513]">{p.revenue}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tasks List */}
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-[rgba(139,69,19,0.15)] backdrop-blur">
            <h3 className="text-xl font-bold text-[#8B4513]">รายการงานด่วนวันนี้</h3>
            <p className="mt-1 text-[#8B4513]/70">
              จัดลำดับความสำคัญเพื่อให้ทีมในครัวและหน้าร้านทำงานสอดคล้องกัน
            </p>
            <ul className="mt-6 space-y-4">
              {reminders.map((item, index) => (
                <li key={`${item.title}-${index}`} className="rounded-[1.5rem] border border-[#D2691E]/20 bg-[#F5DEB3]/20 p-5 shadow-sm transition-all hover:shadow-md">
                  <p className="font-semibold text-[#8B4513] flex items-center gap-2">
                    <span className="text-[#D2691E]">⚡</span>
                    {item.title}
                  </p>
                  <p className="mt-2 text-[#8B4513]/80 leading-relaxed">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Team Notes */}
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-[rgba(139,69,19,0.15)] backdrop-blur">
            <h3 className="text-lg font-bold text-[#8B4513]">โน้ตสำหรับทีมงาน</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3 p-3 rounded-[1rem] bg-[#E6F3FF]/60 border border-[#87CEEB]/30 shadow-sm">
                <span className="text-2xl">🕒</span>
                <span className="text-[#8B4513]/80 leading-relaxed">จัดรอบอบขนมปังเพิ่มในช่วงบ่าย หากยอดขายยังคงสูงกว่าวันปกติ</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-[1rem] bg-[#F0F8E6]/60 border border-[#98FB98]/30 shadow-sm">
                <span className="text-2xl">💬</span>
                <span className="text-[#8B4513]/80 leading-relaxed">ตอบแชทลูกค้าจาก Facebook &amp; LINE ให้ครบถ้วน เพื่อไม่ให้พลาดโอกาสขาย</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-[1rem] bg-[#F5F0FF]/60 border border-[#DDA0DD]/30 shadow-sm">
                <span className="text-2xl">🚚</span>
                <span className="text-[#8B4513]/80 leading-relaxed">ตรวจสอบที่อยู่จัดส่งใหม่และยืนยันรอบรับสินค้ากับบริษัทขนส่ง</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="rounded-[2rem] border border-[#D2691E]/30 bg-[#F5DEB3]/20 p-6 shadow-xl shadow-[rgba(139,69,19,0.15)] backdrop-blur">
            <h3 className="text-lg font-bold text-[#8B4513]">ลิงก์ด่วน</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a className="flex items-center gap-3 rounded-[1rem] bg-white/80 border border-white/60 px-4 py-3 font-semibold text-[#D2691E] shadow-sm transition hover:shadow-md hover:scale-105 hover:bg-white" href="/admin/products">
                  <span className="text-xl">➕</span>
                  เพิ่มสินค้าใหม่
                </a>
              </li>
              <li>
                <a className="flex items-center gap-3 rounded-[1rem] bg-white/80 border border-white/60 px-4 py-3 font-semibold text-[#D2691E] shadow-sm transition hover:shadow-md hover:scale-105 hover:bg-white" href="/admin/orders">
                  <span className="text-xl">📦</span>
                  ติดตามคำสั่งซื้อ
                </a>
              </li>
              <li>
                <a className="flex items-center gap-3 rounded-[1rem] bg-white/80 border border-white/60 px-4 py-3 font-semibold text-[#D2691E] shadow-sm transition hover:shadow-md hover:scale-105 hover:bg-white" href="/admin/coupons">
                  <span className="text-xl">🎉</span>
                  สร้างคูปองโปรโมชัน
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, caption, color, icon }) {
  const colorConfig = {
    green: {
      bg: "bg-[#F0F8E6]/60",
      border: "border-[#98FB98]/40",
      text: "text-[#228B22]",
      value: "text-[#8B4513]",
      accent: "bg-[#98FB98]/20"
    },
    blue: {
      bg: "bg-[#E6F3FF]/60",
      border: "border-[#87CEEB]/40",
      text: "text-[#4682B4]",
      value: "text-[#8B4513]",
      accent: "bg-[#87CEEB]/20"
    },
    orange: {
      bg: "bg-[#FFF8E1]/60",
      border: "border-[#FFB74D]/40",
      text: "text-[#FF8C00]",
      value: "text-[#8B4513]",
      accent: "bg-[#FFB74D]/20"
    },
    purple: {
      bg: "bg-[#F3E8FF]/60",
      border: "border-[#C792FF]/40",
      text: "text-[#7E57C2]",
      value: "text-[#8B4513]",
      accent: "bg-[#C792FF]/20"
    }
  };

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <div className={`relative overflow-hidden rounded-[1.5rem] border ${config.border} ${config.bg} p-6 shadow-lg shadow-[rgba(139,69,19,0.1)] hover:shadow-xl transition-all hover:scale-105 backdrop-blur`}>
      <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full ${config.accent}`} />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{icon}</span>
          <p className={`text-sm font-semibold ${config.text}`}>{title}</p>
        </div>
        <p className={`text-3xl font-bold ${config.value} mb-2`}>{value}</p>
        <p className="text-xs text-[#8B4513]/70 leading-relaxed">{caption}</p>
      </div>
    </div>
  );
}