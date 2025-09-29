"use client";
import { useEffect, useMemo, useState } from "react";

const statusChips = [
  { key: "todaySales", label: "ยอดขายวันนี้", prefix: "฿" },
  { key: "preorderPipeline", label: "ใบเสนอราคาวันนี้", prefix: "฿" },
  { key: "newOrders", label: "ออเดอร์ใหม่", prefix: "" },
  { key: "lowStock", label: "สินค้าใกล้หมด", prefix: "" },
];

const surfaceClass =
  "rounded-[2rem] border border-[#F2D5AF] bg-[#FFF9F3] p-8 shadow-[0_20px_45px_-25px_rgba(63,42,26,0.45)]";
const subSurfaceClass =
  "rounded-[2rem] border border-[#F2D5AF] bg-[#FFFBF7] p-6 shadow-[0_20px_45px_-25px_rgba(63,42,26,0.4)]";

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
      <section className="rounded-[2rem] border border-red-200/80 bg-red-50 p-6 text-red-700 shadow-[0_20px_45px_-25px_rgba(63,42,26,0.35)]">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <span>{err}</span>
        </div>
      </section>
    );
  if (!data)
    return (
      <section className="rounded-[2rem] border border-[#F2D5AF] bg-[#FFF9F3] p-6 text-[#5B3A21] shadow-[0_20px_45px_-25px_rgba(63,42,26,0.4)]">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#D2691E] border-t-transparent" />
          <span>กำลังโหลดข้อมูลร้าน...</span>
        </div>
      </section>
    );

  const { cards, topProducts } = data;

  return (
    <div className="space-y-8 text-[#3F2A1A]">
      {/* Header Section */}
      <section className={surfaceClass}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#3F2A1A]">ภาพรวมร้านวันนี้</h2>
            <p className="mt-2 max-w-xl leading-relaxed text-[#6F4A2E]">
              ตรวจสอบยอดขาย ออเดอร์ และสต็อกสินค้าในมุมมองเดียว เพื่อวางแผนการผลิตและบริการลูกค้าได้อย่างมั่นใจ
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {statusChips.map((chip) => (
              <div
                key={chip.key}
                className="inline-flex items-center gap-2 rounded-full border border-[#E6C79C] bg-white/80 px-4 py-2 text-sm shadow-[0_10px_18px_-12px_rgba(63,42,26,0.45)]"
              >
                <span className="font-medium text-[#8A5A33]">{chip.label}</span>
                <span className="font-semibold text-[#3F2A1A]">
                  {chip.prefix}
                  {cards[chip.key]}
                </span>
              </div>
            ))}
          </div>
        </div>

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
        <div className="space-y-6 lg:col-span-2">
          <div className={subSurfaceClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#3F2A1A]">สินค้าที่ขายดีที่สุดประจำเดือน</h3>
                <p className="mt-1 text-[#6F4A2E]">ข้อมูลอัปเดตรายวัน พร้อมดาวน์โหลดไฟล์เพื่อวิเคราะห์ต่อ</p>
              </div>
              <a
                href="/api/admin/export/sales"
                className="inline-flex items-center gap-2 rounded-full bg-[#8A5A33] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_24px_-18px_rgba(63,42,26,0.65)] transition hover:bg-[#714528]"
              >
                ⬇️ ดาวน์โหลด CSV
              </a>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#F3E0C7] bg-white shadow-[0_10px_20px_-18px_rgba(63,42,26,0.45)]">
              <table className="w-full text-sm">
                <thead className="border-b border-[#F3E0C7] bg-[#FFF3E0]">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-[#3F2A1A]">สินค้า</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#3F2A1A]">จำนวนที่ขาย</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#3F2A1A]">รายได้ (฿)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8E7D1]">
                  {topProducts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center">
                          <span className="mb-2 text-4xl">📈</span>
                          <span className="text-[#6F4A2E]">ยังไม่มีข้อมูลยอดขายสำหรับช่วงเวลานี้</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    topProducts.map((p, idx) => (
                      <tr
                        key={p._id}
                        className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-[#FFF7EA]"} hover:bg-[#FFEFD8]`}
                      >
                        <td className="px-6 py-4 font-medium text-[#3F2A1A]">{p._id}</td>
                        <td className="px-6 py-4 text-right text-[#5B3A21]">{p.qty}</td>
                        <td className="px-6 py-4 text-right font-semibold text-[#3F2A1A]">{p.revenue}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={subSurfaceClass}>
            <h3 className="text-xl font-bold text-[#3F2A1A]">รายการงานด่วนวันนี้</h3>
            <p className="mt-1 text-[#6F4A2E]">จัดลำดับความสำคัญเพื่อให้ทีมในครัวและหน้าร้านทำงานสอดคล้องกัน</p>
            <ul className="mt-6 space-y-4">
              {reminders.map((item, index) => (
                <li
                  key={`${item.title}-${index}`}
                  className="rounded-[1.5rem] border border-[#F0CFA3] bg-[#FFF2DD] p-5 shadow-[0_16px_30px_-24px_rgba(63,42,26,0.5)] transition-all hover:-translate-y-0.5"
                >
                  <p className="flex items-center gap-2 font-semibold text-[#3F2A1A]">
                    <span className="text-[#B8743B]">⚡</span>
                    {item.title}
                  </p>
                  <p className="mt-2 leading-relaxed text-[#5B3A21]">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className={subSurfaceClass}>
            <h3 className="text-lg font-bold text-[#3F2A1A]">โน้ตสำหรับทีมงาน</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3 rounded-[1rem] border border-[#C7E3FF] bg-[#F0F7FF] p-3 shadow-[0_12px_24px_-20px_rgba(63,42,26,0.4)]">
                <span className="text-2xl">🕒</span>
                <span className="leading-relaxed text-[#5B3A21]">
                  จัดรอบอบขนมปังเพิ่มในช่วงบ่าย หากยอดขายยังคงสูงกว่าวันปกติ
                </span>
              </li>
              <li className="flex items-start gap-3 rounded-[1rem] border border-[#BDE5C1] bg-[#EEF9F0] p-3 shadow-[0_12px_24px_-20px_rgba(63,42,26,0.4)]">
                <span className="text-2xl">💬</span>
                <span className="leading-relaxed text-[#5B3A21]">
                  ตอบแชทลูกค้าจาก Facebook &amp; LINE ให้ครบถ้วน เพื่อไม่ให้พลาดโอกาสขาย
                </span>
              </li>
              <li className="flex items-start gap-3 rounded-[1rem] border border-[#DCC8F0] bg-[#F6F1FF] p-3 shadow-[0_12px_24px_-20px_rgba(63,42,26,0.4)]">
                <span className="text-2xl">🚚</span>
                <span className="leading-relaxed text-[#5B3A21]">
                  ตรวจสอบที่อยู่จัดส่งใหม่และยืนยันรอบรับสินค้ากับบริษัทขนส่ง
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-[#F0CFA3] bg-[#FFF2DD] p-6 shadow-[0_20px_45px_-25px_rgba(63,42,26,0.4)]">
            <h3 className="text-lg font-bold text-[#3F2A1A]">ลิงก์ด่วน</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  className="flex items-center gap-3 rounded-[1rem] border border-[#E7C7A0] bg-white px-4 py-3 font-semibold text-[#8A5A33] shadow-[0_14px_28px_-24px_rgba(63,42,26,0.5)] transition hover:-translate-y-0.5 hover:bg-[#FFF2DD]"
                  href="/admin/products"
                >
                  <span className="text-xl">➕</span>
                  เพิ่มสินค้าใหม่
                </a>
              </li>
              <li>
                <a
                  className="flex items-center gap-3 rounded-[1rem] border border-[#E7C7A0] bg-white px-4 py-3 font-semibold text-[#8A5A33] shadow-[0_14px_28px_-24px_rgba(63,42,26,0.5)] transition hover:-translate-y-0.5 hover:bg-[#FFF2DD]"
                  href="/admin/orders"
                >
                  <span className="text-xl">📦</span>
                  ติดตามคำสั่งซื้อ
                </a>
              </li>
              <li>
                <a
                  className="flex items-center gap-3 rounded-[1rem] border border-[#E7C7A0] bg-white px-4 py-3 font-semibold text-[#8A5A33] shadow-[0_14px_28px_-24px_rgba(63,42,26,0.5)] transition hover:-translate-y-0.5 hover:bg-[#FFF2DD]"
                  href="/admin/coupons"
                >
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
      bg: "bg-[#F0F9ED]",
      border: "border-[#C3E7C4]",
      text: "text-[#2F7A3D]",
      value: "text-[#2F2A1F]",
      accent: "bg-[#D8F2DA]",
    },
    blue: {
      bg: "bg-[#F1F6FE]",
      border: "border-[#C8DBF5]",
      text: "text-[#2B6AA3]",
      value: "text-[#2F2A1F]",
      accent: "bg-[#DCE6FA]",
    },
    orange: {
      bg: "bg-[#FFF4E5]",
      border: "border-[#F5D4A6]",
      text: "text-[#C46A1C]",
      value: "text-[#2F2A1F]",
      accent: "bg-[#FCE5C7]",
    },
    purple: {
      bg: "bg-[#F8F2FF]",
      border: "border-[#DCC7F0]",
      text: "text-[#7A4CB7]",
      value: "text-[#2F2A1F]",
      accent: "bg-[#E8DBFB]",
    },
  };

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <div
      className={`relative overflow-hidden rounded-[1.5rem] border ${config.border} ${config.bg} p-6 shadow-[0_18px_35px_-28px_rgba(63,42,26,0.55)] transition-transform duration-200 hover:-translate-y-1`}
    >
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full ${config.accent}`} />
      <div className="relative">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <p className={`text-sm font-semibold ${config.text}`}>{title}</p>
        </div>
        <p className={`mb-2 text-3xl font-bold ${config.value}`}>{value}</p>
        <p className="text-xs leading-relaxed text-[#5B3A21]">{caption}</p>
      </div>
    </div>
  );
}

