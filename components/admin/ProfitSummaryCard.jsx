import { adminInsetCardShell } from "@/app/admin/theme";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function ProfitSummaryCard({
  title,
  subtitle,
  revenue = 0,
  cost = 0,
  profit = 0,
}) {
  const profitLabel = profit >= 0 ? "กำไร" : "ขาดทุน";
  const profitTone = profit >= 0 ? "text-[#047857]" : "text-[#B91C1C]";
  const badgeClass =
    profit >= 0 ? "bg-[#D1FAE5] text-[#047857]" : "bg-[#FEE2E2] text-[#B91C1C]";

  return (
    <div
      className={`${adminInsetCardShell} bg-white/95 p-5 shadow-[0_16px_32px_-24px_rgba(63,42,26,0.45)]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-[#3F2A1A]">{title}</h4>
          <p className="text-xs text-[#6F4A2E]">{subtitle}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
          {profitLabel}
        </span>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between text-[#5B3A21]">
          <dt>รายได้</dt>
          <dd className="font-semibold text-[#3F2A1A]">฿{formatCurrency(revenue)}</dd>
        </div>
        <div className="flex items-center justify-between text-[#5B3A21]">
          <dt>ต้นทุนสินค้า</dt>
          <dd className="font-semibold text-[#3F2A1A]">฿{formatCurrency(cost)}</dd>
        </div>
        <div className="flex items-center justify-between text-[#5B3A21]">
          <dt>กำไรสุทธิ</dt>
          <dd className={`font-semibold ${profitTone}`}>฿{formatCurrency(profit)}</dd>
        </div>
      </dl>
    </div>
  );
}
