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

  const SalesTrendChart = ({ timeline }) => {
    if (!timeline.length) {
      return (
        <div className="flex h-48 items-center justify-center rounded-3xl border border-[#F3E0C7] bg-white/90 px-4 text-sm text-[#6F4A2E]">
          ยังไม่มีข้อมูลยอดขายสำหรับช่วงเวลานี้
        </div>
      );
    }

    const revenueValues = timeline.map((day) => Number(day.revenue || 0));
    const profitValues = timeline.map((day) => Number(day.profit || 0));
    const maxValue = Math.max(...revenueValues, ...profitValues, 1);

    const viewWidth = 100;
    const viewHeight = 60;
    const paddingX = 8;
    const paddingY = 8;
    const usableWidth = viewWidth - paddingX * 2;
    const usableHeight = viewHeight - paddingY * 2;

    const getPoints = (values) => {
      if (timeline.length === 1) {
        const y = viewHeight - paddingY - (values[0] / maxValue) * usableHeight;
        const x = viewWidth / 2;
        return `${x},${y}`;
      }

      return values
        .map((value, index) => {
          const x = paddingX + (usableWidth / (timeline.length - 1)) * index;
          const y = viewHeight - paddingY - (value / maxValue) * usableHeight;
          return `${x},${y}`;
        })
        .join(" ");
    };

    const revenuePoints = getPoints(revenueValues);
    const profitPoints = getPoints(profitValues);
    const labels = timeline.map((day) => thaiShortDate(new Date(day.date)));
    const ySteps = 4;

    const formatChartCurrency = (value) =>
      Number(value || 0).toLocaleString("th-TH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#F97316]" />
            <span className="text-xs font-semibold text-[#6F4A2E]">รายได้</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#059669]" />
            <span className="text-xs font-semibold text-[#6F4A2E]">กำไร</span>
          </div>
        </div>

        <div className="relative">
          <svg
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
            role="img"
            aria-label="กราฟแสดงรายได้และกำไรตามวัน"
            className="h-56 w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(249, 115, 22, 0.28)" />
                <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
              </linearGradient>
              <linearGradient id="profitGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(5, 150, 105, 0.32)" />
                <stop offset="100%" stopColor="rgba(5, 150, 105, 0)" />
              </linearGradient>
            </defs>

            {[...Array(ySteps + 1)].map((_, index) => {
              const y = paddingY + (usableHeight / ySteps) * index;
              const value = maxValue - (maxValue / ySteps) * index;
              return (
                <g key={index}>
                  <line
                    x1={paddingX}
                    x2={viewWidth - paddingX}
                    y1={y}
                    y2={y}
                    stroke="#F3E0C7"
                    strokeWidth={index === 0 ? 1.5 : 1}
                    strokeDasharray={index === 0 ? "" : "3 4"}
                  />
                  {index !== ySteps && (
                    <text
                      x={paddingX - 2}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="3"
                      fill="#8A5A33"
                    >
                      ฿{formatChartCurrency(value)}
                    </text>
                  )}
                </g>
              );
            })}

            <polyline
              points={revenuePoints}
              fill="url(#revenueGradient)"
              stroke="none"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={profitPoints}
              fill="url(#profitGradient)"
              stroke="none"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={revenuePoints}
              fill="none"
              stroke="#F97316"
              strokeWidth="1.8"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={profitPoints}
              fill="none"
              stroke="#059669"
              strokeWidth="1.8"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />

            {timeline.map((day, index) => {
              const revenue = revenueValues[index];
              const profit = profitValues[index];
              const x =
                timeline.length === 1
                  ? viewWidth / 2
                  : paddingX + (usableWidth / (timeline.length - 1)) * index;
              const revenueY =
                viewHeight - paddingY - (revenue / maxValue) * usableHeight;
              const profitY =
                viewHeight - paddingY - (profit / maxValue) * usableHeight;
              return (
                <g key={day.date}>
                  <circle cx={x} cy={revenueY} r="1.4" fill="#F97316" />
                  <circle cx={x} cy={profitY} r="1.4" fill="#059669" />
                </g>
              );
            })}
          </svg>

          <div
            className="mt-2 grid"
            style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}
          >
            {labels.map((label, index) => (
              <div key={index} className="text-center text-[10px] font-semibold text-[#8A5A33]">
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 text-[#3F2A1A]">
      <section className={`${adminSurfaceShell} p-8`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#3F2A1A]">ยอดขายย้อนหลัง</h2>
            <p className="mt-2 max-w-2xl leading-relaxed text-[#6F4A2E]">
              เลือกดูข้อมูลยอดขายตามเดือนเพื่อเปรียบเทียบรายได้ ต้นทุน และกำไรของร้านย้อนหลัง
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-full border border-[#E6C79C] bg-white/85 px-4 py-2 text-sm font-medium text-[#8A5A33] shadow-[inset_0_1px_4px_rgba(63,42,26,0.08)]">
              <span>เดือน</span>
              <select
                className="bg-transparent text-[#3F2A1A] focus:outline-none"
                value={selectedMonth.month}
                onChange={handleMonthChange}
                aria-label="เลือกเดือน"
              >
                {MONTH_LABELS.map((label, index) => (
                  <option key={label} value={index} className="text-[#3F2A1A]">
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-full border border-[#E6C79C] bg-white/85 px-4 py-2 text-sm font-medium text-[#8A5A33] shadow-[inset_0_1px_4px_rgba(63,42,26,0.08)]">
              <span>ปี</span>
              <select
                className="bg-transparent text-[#3F2A1A] focus:outline-none"
                value={selectedMonth.year}
                onChange={handleYearChange}
                aria-label="เลือกปี"
              >
                {years.map((year) => (
                  <option key={year} value={year} className="text-[#3F2A1A]">
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

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#6F4A2E]">
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
            <h3 className="text-xl font-bold text-[#3F2A1A]">สรุปกำไร / ขาดทุน</h3>
            <p className="text-sm text-[#6F4A2E]">
              เปรียบเทียบรายได้และต้นทุนของช่วงเวลาที่เลือก เพื่อให้วางแผนการผลิตได้แม่นยำ
            </p>
          </div>
          {loading && (
            <span className="rounded-full border border-[#E2C39A] bg-white px-4 py-1 text-xs font-semibold text-[#8A5A33]">
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
                <h3 className="text-lg font-bold text-[#3F2A1A]">ยอดขายรายวัน</h3>
                <p className="text-sm text-[#6F4A2E]">รวมรายได้และกำไรของแต่ละวันในช่วงเวลาที่เลือก</p>
              </div>
            </div>

            <div className={`${adminInsetCardShell} mt-5 space-y-6 overflow-hidden p-6`}>
              <SalesTrendChart timeline={timeline} />

              <div className="rounded-3xl border border-[#F3E0C7]" role="region" aria-live="polite">
                <table className="min-w-full overflow-hidden rounded-3xl text-sm">
                  <thead className="border-b border-[#F3E0C7] bg-[#FFF3E0]">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-[#3F2A1A]">วันที่</th>
                      <th className="px-6 py-4 text-right font-semibold text-[#3F2A1A]">รายได้ (฿)</th>
                      <th className="px-6 py-4 text-right font-semibold text-[#3F2A1A]">ต้นทุน (฿)</th>
                      <th className="px-6 py-4 text-right font-semibold text-[#3F2A1A]">กำไร (฿)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8E7D1]">
                    {timeline.length === 0 ? (
                      <tr>
                        <td className="px-6 py-6 text-center text-[#6F4A2E]" colSpan={4}>
                          ยังไม่มีข้อมูลยอดขายสำหรับช่วงเวลานี้
                        </td>
                      </tr>
                    ) : (
                      timeline.map((day) => {
                        const dayDate = new Date(day.date);
                        return (
                          <tr key={day.date} className="bg-white odd:bg-[#FFF7EA]">
                            <td className="px-6 py-4 font-medium text-[#3F2A1A]">
                              {thaiShortDate(dayDate)}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-[#3F2A1A]">
                              ฿{formatCurrency(day.revenue)}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-[#3F2A1A]">
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
        </div>

        <div className={`${adminSubSurfaceShell} p-6`}>
          <h3 className="text-lg font-bold text-[#3F2A1A]">สินค้าขายดี</h3>
          <p className="mt-1 text-sm text-[#6F4A2E]">
            อันดับสินค้าที่ทำรายได้สูงสุดในเดือนที่เลือก
          </p>

          <div className="mt-5 space-y-4">
            {topProducts.length === 0 ? (
              <div className="rounded-[1.5rem] border border-[#F3E0C7] bg-white/90 px-4 py-5 text-center text-sm text-[#6F4A2E]">
                ยังไม่มีข้อมูลสินค้าในช่วงเวลานี้
              </div>
            ) : (
              topProducts.map((product, index) => (
                <div
                  key={product.productId || product._id || index}
                  className="rounded-[1.5rem] border border-[#F3E0C7] bg-white/90 px-4 py-4 shadow-[0_12px_24px_-24px_rgba(63,42,26,0.45)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#3F2A1A]">
                        {index + 1}. {product.title || "ไม่ทราบชื่อสินค้า"}
                      </p>
                      <p className="text-xs text-[#6F4A2E]">ขาย {formatInteger(product.qty)} ชิ้น</p>
                    </div>
                    <span className="text-xs font-semibold text-[#047857]">
                      ฿{formatCurrency(product.profit)}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#6F4A2E]">
                    <div className="rounded-xl bg-[#FFF7EA] px-3 py-2">
                      <dt className="font-semibold text-[#8A5A33]">รายได้</dt>
                      <dd className="font-semibold text-[#3F2A1A]">
                        ฿{formatCurrency(product.revenue)}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-[#F6F1FF] px-3 py-2">
                      <dt className="font-semibold text-[#8A5A33]">ต้นทุน</dt>
                      <dd className="font-semibold text-[#3F2A1A]">
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
