"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminAccentButton,
  adminFilterPill,
  adminInsetCardShell,
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

const MONTH_LABELS = Array.from({ length: 12 }, (_, index) =>
  new Date(2000, index, 1).toLocaleString("th-TH", { month: "long" }),
);

export default function SalesHistoryPage() {
  const now = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState({
    month: now.getMonth(),
    year: now.getFullYear(),
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  const years = useMemo(() => {
    const current = now.getFullYear();
    return Array.from({ length: 6 }, (_, index) => current - index);
  }, [now]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          month: String(selectedMonth.month + 1),
          year: String(selectedMonth.year),
        });
        const res = await fetch(`/api/admin/sales-history?${params.toString()}`, {
          cache: "no-store",
        });
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload?.error || "ไม่สามารถโหลดข้อมูลยอดขายได้");
        }
        if (!ignore) {
          setData(payload);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (!ignore) {
          setError(String(err.message || err));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [selectedMonth.month, selectedMonth.year, refreshKey]);

  const buddhistYear = selectedMonth.year + 543;
  const monthName = MONTH_LABELS[selectedMonth.month] || "เดือนนี้";
  const rangeStart = data?.range?.start ? new Date(data.range.start) : null;
  const rangeEnd = data?.range?.end ? new Date(data.range.end) : null;

  const weekStart = useMemo(() => {
    if (!rangeEnd) return null;
    const end = new Date(rangeEnd);
    end.setHours(0, 0, 0, 0);
    const startCandidate = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
    if (rangeStart && startCandidate < rangeStart) {
      return new Date(rangeStart);
    }
    return startCandidate;
  }, [rangeEnd, rangeStart]);

  const thaiDate = (date) => {
    if (!date) return "-";
    try {
      return new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch (error) {
      return date.toLocaleDateString("th-TH");
    }
  };

  const thaiShortDate = (date) => {
    if (!date) return "-";
    try {
      return new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch (error) {
      return date.toLocaleDateString("th-TH");
    }
  };

  const handleMonthChange = (event) => {
    setSelectedMonth((prev) => ({ ...prev, month: Number(event.target.value) }));
  };

  const handleYearChange = (event) => {
    setSelectedMonth((prev) => ({ ...prev, year: Number(event.target.value) }));
  };

  const handleRefresh = () => setRefreshKey((value) => value + 1);

  const dailySummary = data?.daily ?? { revenue: 0, cost: 0, profit: 0 };
  const weeklySummary = data?.sevenDay ?? { revenue: 0, cost: 0, profit: 0 };
  const monthlySummary = data?.totals ?? { revenue: 0, cost: 0, profit: 0 };

  const timeline = Array.isArray(data?.timeline) ? data.timeline : [];
  const topProducts = Array.isArray(data?.topProducts) ? data.topProducts : [];
  const orderStats = data?.orders ?? { count: 0, averageValue: 0 };

  return (
    <div className="space-y-8 text-[#0b3b31]">
      <section className={`${adminSurfaceShell} p-8`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#0b3b31]">ยอดขายย้อนหลัง</h2>
            <p className="mt-2 max-w-2xl leading-relaxed text-[#145f4b]">
              เลือกดูข้อมูลยอดขายตามเดือนเพื่อเปรียบเทียบรายได้ ต้นทุน และกำไรของร้านย้อนหลัง
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-full border border-[#9be6dc] bg-white/85 px-4 py-2 text-sm font-medium text-[#0ea5a0] shadow-[inset_0_1px_4px_rgba(10,83,73,0.08)]">
              <span>เดือน</span>
              <select
                className="bg-transparent text-[#0b3b31] focus:outline-none"
                value={selectedMonth.month}
                onChange={handleMonthChange}
                aria-label="เลือกเดือน"
              >
                {MONTH_LABELS.map((label, index) => (
                  <option key={label} value={index} className="text-[#0b3b31]">
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-full border border-[#9be6dc] bg-white/85 px-4 py-2 text-sm font-medium text-[#0ea5a0] shadow-[inset_0_1px_4px_rgba(10,83,73,0.08)]">
              <span>ปี</span>
              <select
                className="bg-transparent text-[#0b3b31] focus:outline-none"
                value={selectedMonth.year}
                onChange={handleYearChange}
                aria-label="เลือกปี"
              >
                {years.map((year) => (
                  <option key={year} value={year} className="text-[#0b3b31]">
                    {year + 543}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={handleRefresh}
              className={`${adminAccentButton} px-5 py-2`}
              disabled={loading}
            >
              {loading ? "กำลังโหลด..." : "🔄 รีเฟรช"}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#145f4b]">
          <span className={adminFilterPill}>
            ช่วงเวลา: {monthName} {buddhistYear}
          </span>
          {rangeStart && rangeEnd && (
            <span className={adminFilterPill}>
              {thaiShortDate(rangeStart)} - {thaiShortDate(rangeEnd)}
            </span>
          )}
          <span className={adminFilterPill}>คำสั่งซื้อทั้งหมด: {formatInteger(orderStats.count)}</span>
          <span className={adminFilterPill}>
            ค่าเฉลี่ยต่อออเดอร์: ฿{formatCurrency(orderStats.averageValue)}
          </span>
          {lastUpdated && (
            <span className={adminFilterPill}>
              อัปเดตล่าสุด: {thaiShortDate(lastUpdated)}
            </span>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-[1.5rem] border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>

      <section className={`${adminSubSurfaceShell} p-6`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#0b3b31]">สรุปกำไร / ขาดทุน</h3>
            <p className="text-sm text-[#145f4b]">
              เปรียบเทียบรายได้และต้นทุนของช่วงเวลาที่เลือก เพื่อให้วางแผนการผลิตได้แม่นยำ
            </p>
          </div>
          {loading && (
            <span className="rounded-full border border-[#a4ebdf] bg-white px-4 py-1 text-xs font-semibold text-[#0ea5a0]">
              กำลังโหลดข้อมูล...
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <ProfitSummaryCard
            title="รายวัน"
            subtitle={`ข้อมูลวันที่ ${thaiDate(rangeEnd)}`}
            revenue={dailySummary.revenue}
            cost={dailySummary.cost}
            profit={dailySummary.profit}
          />
          <ProfitSummaryCard
            title="7 วันล่าสุด"
            subtitle={weekStart ? `${thaiShortDate(weekStart)} - ${thaiShortDate(rangeEnd)}` : "-"}
            revenue={weeklySummary.revenue}
            cost={weeklySummary.cost}
            profit={weeklySummary.profit}
          />
          <ProfitSummaryCard
            title={`${monthName} ${buddhistYear}`}
            subtitle="ยอดสะสมทั้งเดือน"
            revenue={monthlySummary.revenue}
            cost={monthlySummary.cost}
            profit={monthlySummary.profit}
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className={`${adminSubSurfaceShell} p-6`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0b3b31]">ยอดขายรายวัน</h3>
                <p className="text-sm text-[#145f4b]">รวมรายได้และกำไรของแต่ละวันในช่วงเวลาที่เลือก</p>
              </div>
            </div>

            <div className={`${adminInsetCardShell} mt-5 overflow-hidden`}>
              <table className="min-w-full text-sm">
                <thead className="border-b border-[#c9f6ef] bg-[#FFF3E0]">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-[#0b3b31]">วันที่</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#0b3b31]">รายได้ (฿)</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#0b3b31]">ต้นทุน (฿)</th>
                    <th className="px-6 py-4 text-right font-semibold text-[#0b3b31]">กำไร (฿)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8E7D1]">
                  {timeline.length === 0 ? (
                    <tr>
                      <td className="px-6 py-6 text-center text-[#145f4b]" colSpan={4}>
                        ยังไม่มีข้อมูลยอดขายสำหรับช่วงเวลานี้
                      </td>
                    </tr>
                  ) : (
                    timeline.map((day) => {
                      const dayDate = new Date(day.date);
                      return (
                        <tr key={day.date} className="bg-white odd:bg-[#FFF7EA]">
                          <td className="px-6 py-4 font-medium text-[#0b3b31]">
                            {thaiShortDate(dayDate)}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-[#0b3b31]">
                            ฿{formatCurrency(day.revenue)}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-[#0b3b31]">
                            ฿{formatCurrency(day.cost)}
                          </td>
                          <td
                            className={`px-6 py-4 text-right font-semibold ${
                              Number(day.profit || 0) >= 0 ? "text-[#047857]" : "text-[#B91C1C]"
                            }`}
                          >
                            ฿{formatCurrency(day.profit)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={`${adminSubSurfaceShell} p-6`}>
          <h3 className="text-lg font-bold text-[#0b3b31]">สินค้าขายดี</h3>
          <p className="mt-1 text-sm text-[#145f4b]">
            อันดับสินค้าที่ทำรายได้สูงสุดในเดือนที่เลือก
          </p>

          <div className="mt-5 space-y-4">
            {topProducts.length === 0 ? (
              <div className="rounded-[1.5rem] border border-[#c9f6ef] bg-white/90 px-4 py-5 text-center text-sm text-[#145f4b]">
                ยังไม่มีข้อมูลสินค้าในช่วงเวลานี้
              </div>
            ) : (
              topProducts.map((product, index) => (
                <div
                  key={product.productId || product._id || index}
                  className="rounded-[1.5rem] border border-[#c9f6ef] bg-white/90 px-4 py-4 shadow-[0_12px_24px_-24px_rgba(10,83,73,0.45)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0b3b31]">
                        {index + 1}. {product.title || "ไม่ทราบชื่อสินค้า"}
                      </p>
                      <p className="text-xs text-[#145f4b]">ขาย {formatInteger(product.qty)} ชิ้น</p>
                    </div>
                    <span className="text-xs font-semibold text-[#047857]">
                      ฿{formatCurrency(product.profit)}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#145f4b]">
                    <div className="rounded-xl bg-[#FFF7EA] px-3 py-2">
                      <dt className="font-semibold text-[#0ea5a0]">รายได้</dt>
                      <dd className="font-semibold text-[#0b3b31]">
                        ฿{formatCurrency(product.revenue)}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-[#f2f7ff] px-3 py-2">
                      <dt className="font-semibold text-[#0ea5a0]">ต้นทุน</dt>
                      <dd className="font-semibold text-[#0b3b31]">
                        ฿{formatCurrency(product.cost)}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
