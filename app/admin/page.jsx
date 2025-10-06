"use client";
import { useEffect, useMemo, useState } from "react";
import {
  adminAccentButton,
  adminInsetCardShell,
  adminSoftBadge,
  adminSubSurfaceShell,
  adminSurfaceShell,
} from "@/app/admin/theme";
import ProfitSummaryCard from "@/components/admin/ProfitSummaryCard";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatInteger = (value) => Number(value || 0).toLocaleString("th-TH");

const statusChips = [
  { key: "todaySales", label: "ยอดขายวันนี้", prefix: "฿" },
  { key: "todayProfit", label: "กำไรวันนี้", prefix: "฿" },
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
      <section className="rounded-[2rem] border border-red-200/80 bg-red-50 p-6 text-red-700 shadow-[0_20px_45px_-25px_rgba(10,83,73,0.35)]">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <span>{err}</span>
        </div>
      </section>
    );
  if (!data)
    return (
      <section className={`${adminSurfaceShell} p-6 text-[#0f5349]`}>
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#ff8746] border-t-transparent" />
          <span>กำลังโหลดข้อมูลร้าน...</span>
        </div>
      </section>
    );

  const { cards, topProducts: topProductsRaw = [], profitSummary = {} } = data;
  const topProducts = Array.isArray(topProductsRaw) ? topProductsRaw : [];
  const monthLabel = (() => {
    try {
      return new Intl.DateTimeFormat("th-TH", {
        month: "long",
        year: "numeric",
      }).format(new Date());
    } catch (error) {
      return "เดือนนี้";
    }
  })();

  const defaultSummary = { revenue: 0, cost: 0, profit: 0 };
  const profitTiles = [
    {
      key: "today",
      title: "รายวัน",
      subtitle: "ตั้งแต่ 00:00 น.",
      summary: profitSummary.today ?? defaultSummary,
    },
    {
      key: "week",
      title: "7 วันล่าสุด",
      subtitle: "รวมยอดตั้งแต่วันนี้ย้อนหลัง",
      summary: profitSummary.week ?? defaultSummary,
    },
    {
      key: "month",
      title: monthLabel,
      subtitle: "ยอดสะสมตั้งแต่ต้นเดือน",
      summary: profitSummary.month ?? defaultSummary,
    },
  ];

  return (
    <div className="space-y-8 text-[#0b3b31]">
      {/* Header Section */}
      <section className={`${adminSurfaceShell} p-8`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#0b3b31]">ภาพรวมร้านวันนี้</h2>
            <p className="mt-2 max-w-xl leading-relaxed text-[#145f4b]">
              ตรวจสอบยอดขาย ออเดอร์ และสต็อกสินค้าในมุมมองเดียว เพื่อวางแผนการผลิตและบริการลูกค้าได้อย่างมั่นใจ
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {statusChips.map((chip) => {
              const rawValue = cards?.[chip.key] ?? 0;
              const displayValue =
                chip.prefix === "฿" ? formatCurrency(rawValue) : formatInteger(rawValue);
              return (
                <div
                  key={chip.key}
                  className={`${adminSoftBadge} gap-2 px-4 py-2 text-sm shadow-[0_10px_18px_-12px_rgba(10,83,73,0.45)]`}
                >
                  <span className="font-medium text-[#0ea5a0]">{chip.label}</span>
                  <span className="font-semibold text-[#0b3b31]">
                    {chip.prefix}
                    {displayValue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="ยอดขายวันนี้"
            value={`฿${formatCurrency(cards.todaySales)}`}
            caption="เปรียบเทียบจากยอดรวมที่ยืนยันแล้ว"
            color="green"
            icon="💰"
          />
          <StatCard
            title="กำไรวันนี้"
            value={`฿${formatCurrency(cards.todayProfit)}`}
            caption="หลังหักต้นทุนสินค้าในวันนี้"
            color="emerald"
            icon="📈"
          />
          <StatCard
            title="ยอดเสนอราคาใหม่"
            value={`฿${formatCurrency(cards.preorderPipeline)}`}
            caption="รวมยอดใบเสนอราคาที่ออกภายในวันนี้"
            color="purple"
            icon="📝"
          />
          <StatCard
            title="ออเดอร์ใหม่"
            value={formatInteger(cards.newOrders)}
            caption="ตรวจสอบรายละเอียดก่อน 18:00 น. เพื่อจัดส่งทันวันถัดไป"
            color="blue"
            icon="📦"
          />
          <StatCard
            title="สินค้าใกล้หมด"
            value={formatInteger(cards.lowStock)}
            caption="เติมสต็อกล่วงหน้าเพื่อไม่ให้ยอดขายสะดุด"
            color="orange"
            icon="📊"
          />
        </div>
      </section>

      <section className={`${adminSubSurfaceShell} p-6`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#0b3b31]">สรุปกำไร / ขาดทุน</h3>
            <p className="text-sm text-[#145f4b]">
              วิเคราะห์รายได้และต้นทุนเพื่อวางแผนยอดขายในแต่ละช่วงเวลา
            </p>
          </div>
          <span className="rounded-full border border-[#a4ebdf] bg-white px-4 py-1 text-xs font-semibold text-[#0ea5a0]">
            อัปเดตเรียลไทม์จากคำสั่งซื้อ
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {profitTiles.map((tile) => (
            <ProfitSummaryCard
              key={tile.key}
              title={tile.title}
              subtitle={tile.subtitle}
              revenue={tile.summary.revenue}
              cost={tile.summary.cost}
              profit={tile.summary.profit}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className={`${adminSubSurfaceShell} p-6`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#0b3b31]">สินค้าที่ขายดีที่สุดประจำเดือน</h3>
                <p className="mt-1 text-[#145f4b]">ข้อมูลอัปเดตรายวัน พร้อมดาวน์โหลดไฟล์เพื่อวิเคราะห์ต่อ</p>
              </div>
              <a
                href="/api/admin/export/sales"
                className={`${adminAccentButton} px-5 py-2.5 shadow-[0_14px_24px_-18px_rgba(10,83,73,0.65)]`}
              >
                ⬇️ ดาวน์โหลด CSV
              </a>
            </div>

            <div className={`${adminInsetCardShell} mt-6 overflow-hidden shadow-[0_10px_20px_-18px_rgba(10,83,73,0.45)]`}>
              <table className="w-full text-sm">
                <thead className="border-b border-[#c9f6ef] bg-[#FFF3E0]">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-[#0b3b31]">สินค้า</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#0b3b31]">จำนวนที่ขาย</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#0b3b31]">รายได้ (฿)</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#0b3b31]">ต้นทุน (฿)</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#0b3b31]">กำไร (฿)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8E7D1]">
                  {topProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center">
                          <span className="mb-2 text-4xl">📈</span>
                          <span className="text-[#145f4b]">ยังไม่มีข้อมูลยอดขายสำหรับช่วงเวลานี้</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    topProducts.map((p, idx) => {
                      const productName = p.title || p.name || p._id || "ไม่ทราบชื่อ";
                      const rowKey = p.productId || p._id || `product-${idx}`;
                      return (
                        <tr
                          key={rowKey}
                          className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-[#FFF7EA]"} hover:bg-[#FFEFD8]`}
                        >
                          <td className="px-6 py-4 font-medium text-[#0b3b31]">{productName}</td>
                          <td className="px-6 py-4 text-right text-[#0f5349]">{formatInteger(p.qty)}</td>
                          <td className="px-6 py-4 text-right font-semibold text-[#0b3b31]">฿{formatCurrency(p.revenue)}</td>
                          <td className="px-6 py-4 text-right font-semibold text-[#0b3b31]">฿{formatCurrency(p.cost)}</td>
                          <td
                            className={`px-6 py-4 text-right font-semibold ${Number(p.profit || 0) >= 0 ? "text-[#047857]" : "text-[#B91C1C]"}`}
                          >
                            ฿{formatCurrency(p.profit)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`${adminSubSurfaceShell} p-6`}>
            <h3 className="text-xl font-bold text-[#0b3b31]">รายการงานด่วนวันนี้</h3>
            <p className="mt-1 text-[#145f4b]">จัดลำดับความสำคัญเพื่อให้ทีมในครัวและหน้าร้านทำงานสอดคล้องกัน</p>
            <ul className="mt-6 space-y-4">
              {reminders.map((item, index) => (
                <li
                  key={`${item.title}-${index}`}
                  className="rounded-[1.5rem] border border-[#c7f5ec] bg-[#e5f8f3] p-5 shadow-[0_16px_30px_-24px_rgba(10,83,73,0.5)] transition-all hover:-translate-y-0.5"
                >
                  <p className="flex items-center gap-2 font-semibold text-[#0b3b31]">
                    <span className="text-[#B8743B]">⚡</span>
                    {item.title}
                  </p>
                  <p className="mt-2 leading-relaxed text-[#0f5349]">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${adminSubSurfaceShell} p-6`}>
            <h3 className="text-lg font-bold text-[#0b3b31]">โน้ตสำหรับทีมงาน</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3 rounded-[1rem] border border-[#b7e8ff] bg-[#edf7ff] p-3 shadow-[0_12px_24px_-20px_rgba(10,83,73,0.4)]">
                <span className="text-2xl">🕒</span>
                <span className="leading-relaxed text-[#0f5349]">
                  จัดรอบอบขนมปังเพิ่มในช่วงบ่าย หากยอดขายยังคงสูงกว่าวันปกติ
                </span>
              </li>
              <li className="flex items-start gap-3 rounded-[1rem] border border-[#b7f0e2] bg-[#e4faf5] p-3 shadow-[0_12px_24px_-20px_rgba(10,83,73,0.4)]">
                <span className="text-2xl">💬</span>
                <span className="leading-relaxed text-[#0f5349]">
                  ตอบแชทลูกค้าจาก Facebook &amp; LINE ให้ครบถ้วน เพื่อไม่ให้พลาดโอกาสขาย
                </span>
              </li>
              <li className="flex items-start gap-3 rounded-[1rem] border border-[#d4e9ff] bg-[#f2f7ff] p-3 shadow-[0_12px_24px_-20px_rgba(10,83,73,0.4)]">
                <span className="text-2xl">🚚</span>
                <span className="leading-relaxed text-[#0f5349]">
                  ตรวจสอบที่อยู่จัดส่งใหม่และยืนยันรอบรับสินค้ากับบริษัทขนส่ง
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-[#c7f5ec] bg-[#e5f8f3] p-6 shadow-[0_20px_45px_-25px_rgba(10,83,73,0.4)]">
            <h3 className="text-lg font-bold text-[#0b3b31]">ลิงก์ด่วน</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  className="flex items-center gap-3 rounded-[1rem] border border-[#b6f2e7] bg-white px-4 py-3 font-semibold text-[#0ea5a0] shadow-[0_14px_28px_-24px_rgba(10,83,73,0.5)] transition hover:-translate-y-0.5 hover:bg-[#e5f8f3]"
                  href="/admin/products"
                >
                  <span className="text-xl">➕</span>
                  เพิ่มสินค้าใหม่
                </a>
              </li>
              <li>
                <a
                  className="flex items-center gap-3 rounded-[1rem] border border-[#b6f2e7] bg-white px-4 py-3 font-semibold text-[#0ea5a0] shadow-[0_14px_28px_-24px_rgba(10,83,73,0.5)] transition hover:-translate-y-0.5 hover:bg-[#e5f8f3]"
                  href="/admin/orders"
                >
                  <span className="text-xl">📦</span>
                  ติดตามคำสั่งซื้อ
                </a>
              </li>
              <li>
                <a
                  className="flex items-center gap-3 rounded-[1rem] border border-[#b6f2e7] bg-white px-4 py-3 font-semibold text-[#0ea5a0] shadow-[0_14px_28px_-24px_rgba(10,83,73,0.5)] transition hover:-translate-y-0.5 hover:bg-[#e5f8f3]"
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
      bg: "bg-[#e2faf5]",
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
      bg: "bg-[#eaf8f4]",
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
    emerald: {
      bg: "bg-[#ECFDF5]",
      border: "border-[#BBF7D0]",
      text: "text-[#047857]",
      value: "text-[#14532D]",
      accent: "bg-[#D1FAE5]",
    },
  };

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <div
      className={`relative overflow-hidden rounded-[1.5rem] border ${config.border} ${config.bg} p-6 shadow-[0_18px_35px_-28px_rgba(10,83,73,0.55)] transition-transform duration-200 hover:-translate-y-1`}
    >
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full ${config.accent}`} />
      <div className="relative">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <p className={`text-sm font-semibold ${config.text}`}>{title}</p>
        </div>
        <p className={`mb-2 text-3xl font-bold ${config.value}`}>{value}</p>
        <p className="text-xs leading-relaxed text-[#0f5349]">{caption}</p>
      </div>
    </div>
  );
}

