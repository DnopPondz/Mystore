"use client";
import { useEffect, useMemo, useState } from "react";

const statusChips = [
  { key: "todaySales", label: "ยอดขายวันนี้", prefix: "฿" },
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

  if (err)
    return (
      <section className="rounded-3xl border border-rose-200/60 bg-rose-50/80 p-6 text-rose-700 shadow-sm">
        {err}
      </section>
    );
  if (!data)
    return (
      <section className="rounded-3xl border border-white/60 bg-white/70 p-6 text-[var(--color-choco)]/70 shadow-sm">
        กำลังโหลดข้อมูลร้าน...
      </section>
    );

  const { cards, topProducts } = data;

  const reminders = useMemo(() => {
    const list = [];
    if (cards.lowStock > 0) {
      list.push({
        title: "เติมสต็อกสินค้ายอดนิยม",
        detail: `มี ${cards.lowStock} รายการที่กำลังจะหมด เลือกเติมสต็อกก่อนเวลาเปิดร้านพรุ่งนี้`,
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
  }, [cards.lowStock]);

  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-[#f0658320] backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-[var(--color-rose-dark)]">
              ภาพรวมร้านวันนี้
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--color-choco)]/70">
              ตรวจสอบยอดขาย ออเดอร์ และสต็อกสินค้าในมุมมองเดียว เพื่อวางแผนการผลิตและบริการลูกค้าได้อย่างมั่นใจ
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-choco)]/60">
            {statusChips.map((chip) => (
              <div
                key={chip.key}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-rose)]/10 px-4 py-2"
              >
                <span className="text-[var(--color-rose)]">{chip.label}</span>
                <span className="text-[var(--color-choco)]">
                  {chip.prefix}
                  {cards[chip.key]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <StatCard
            title="ยอดขายวันนี้"
            value={`฿${cards.todaySales}`}
            caption="เปรียบเทียบจากยอดรวมที่ยืนยันแล้ว"
            accent="from-[#f6c34a]/80 via-[#f78da7]/40 to-transparent"
          />
          <StatCard
            title="ออเดอร์ใหม่"
            value={cards.newOrders}
            caption="ตรวจสอบรายละเอียดก่อน 18:00 น. เพื่อจัดส่งทันวันถัดไป"
            accent="from-[#f06583]/60 via-[#f6c34a]/40 to-transparent"
          />
          <StatCard
            title="สินค้าใกล้หมด"
            value={cards.lowStock}
            caption="เติมสต็อกล่วงหน้าเพื่อไม่ให้ยอดขายสะดุด"
            accent="from-[#7cd1b8]/60 via-[#f6c34a]/40 to-transparent"
          />
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-[#f7b267]/40 bg-[#fff7f0]/80 p-6 shadow-lg shadow-[#f0658318]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[var(--color-choco)]">
                  สินค้าที่ขายดีที่สุดประจำเดือน
                </h3>
                <p className="text-sm text-[var(--color-choco)]/60">
                  ข้อมูลอัปเดตรายวัน พร้อมดาวน์โหลดไฟล์เพื่อวิเคราะห์ต่อ
                </p>
              </div>
              <a
                href="/api/admin/export/sales"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-rose)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#f0658333] transition hover:bg-[var(--color-rose-dark)]"
              >
                ⬇️ ดาวน์โหลด CSV
              </a>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/60 bg-white/70">
              <table className="w-full text-sm text-[var(--color-choco)]/80">
                <thead className="bg-[#fff1dd] text-[var(--color-choco)]/80">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">สินค้า</th>
                    <th className="px-4 py-3 text-right font-medium">จำนวนที่ขาย</th>
                    <th className="px-4 py-3 text-right font-medium">รายได้ (฿)</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-sm text-[var(--color-choco)]/60">
                        ยังไม่มีข้อมูลยอดขายสำหรับช่วงเวลานี้
                      </td>
                    </tr>
                  ) : (
                    topProducts.map((p, idx) => (
                      <tr key={p._id} className={idx % 2 === 0 ? "bg-white" : "bg-[#fff7f0]"}>
                        <td className="px-4 py-3 font-medium">{p._id}</td>
                        <td className="px-4 py-3 text-right">{p.qty}</td>
                        <td className="px-4 py-3 text-right">{p.revenue}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-[#f0658318]">
            <h3 className="text-xl font-semibold text-[var(--color-choco)]">รายการงานด่วนวันนี้</h3>
            <p className="mt-1 text-sm text-[var(--color-choco)]/60">
              จัดลำดับความสำคัญเพื่อให้ทีมในครัวและหน้าร้านทำงานสอดคล้องกัน
            </p>
            <ul className="mt-5 space-y-4">
              {reminders.map((item, index) => (
                <li key={`${item.title}-${index}`} className="rounded-2xl border border-[var(--color-rose)]/20 bg-[var(--color-rose)]/5 p-4">
                  <p className="font-semibold text-[var(--color-choco)]">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-choco)]/65">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-[#f0658318]">
            <h3 className="text-lg font-semibold text-[var(--color-choco)]">โน้ตสำหรับทีมงาน</h3>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-choco)]/70">
              <li className="flex items-start gap-3">
                <span className="mt-1 text-lg">🕒</span>
                <span>จัดรอบอบขนมปังเพิ่มในช่วงบ่าย หากยอดขายยังคงสูงกว่าวันปกติ</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-lg">💬</span>
                <span>ตอบแชทลูกค้าจาก Facebook &amp; LINE ให้ครบถ้วน เพื่อไม่ให้พลาดโอกาสขาย</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-lg">🚚</span>
                <span>ตรวจสอบที่อยู่จัดส่งใหม่และยืนยันรอบรับสินค้ากับบริษัทขนส่ง</span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-[var(--color-rose)]/30 bg-[var(--color-rose)]/10 p-6 text-sm text-[var(--color-choco)]">
            <h3 className="text-lg font-semibold text-[var(--color-rose-dark)]">ลิงก์ด่วน</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a className="inline-flex items-center gap-2 rounded-full border border-transparent bg-white/70 px-4 py-2 font-semibold text-[var(--color-rose)] transition hover:border-[var(--color-rose)]/40 hover:bg-white" href="/admin/products">
                  ➕ เพิ่มสินค้าใหม่
                </a>
              </li>
              <li>
                <a className="inline-flex items-center gap-2 rounded-full border border-transparent bg-white/70 px-4 py-2 font-semibold text-[var(--color-rose)] transition hover:border-[var(--color-rose)]/40 hover:bg-white" href="/admin/orders">
                  📦 ติดตามคำสั่งซื้อ
                </a>
              </li>
              <li>
                <a className="inline-flex items-center gap-2 rounded-full border border-transparent bg-white/70 px-4 py-2 font-semibold text-[var(--color-rose)] transition hover:border-[var(--color-rose)]/40 hover:bg-white" href="/admin/coupons">
                  🎉 สร้างคูปองโปรโมชัน
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, caption, accent }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-6 shadow-lg shadow-[#f0658314]">
      <div className={`pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full bg-gradient-to-br ${accent}`} />
      <div className="relative">
        <p className="text-sm font-medium text-[var(--color-choco)]/70">{title}</p>
        <p className="mt-4 text-3xl font-semibold text-[var(--color-rose-dark)]">{value}</p>
        <p className="mt-2 text-xs leading-relaxed text-[var(--color-choco)]/60">{caption}</p>
      </div>
    </div>
  );
}
