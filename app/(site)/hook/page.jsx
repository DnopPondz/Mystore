import Link from "next/link";

export default function HookPage({ searchParams }) {
  const orderId = searchParams?.order ? String(searchParams.order) : "";

  return (
    <main className="relative min-h-[70vh] overflow-hidden bg-[var(--color-cream)]">
      <div className="absolute inset-0 bg-[var(--color-cream)]" />
      <div className="absolute -top-24 right-12 h-64 w-64 rounded-full bg-[var(--color-rose)]/18 blur-3xl" />
      <div className="absolute -bottom-28 left-16 h-72 w-72 rounded-full bg-[var(--color-gold)]/22 blur-3xl" />

      <div className="relative flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-lg rounded-3xl border border-[var(--color-burgundy)] bg-white/90 p-10 text-center shadow-2xl shadow-[rgba(12,116,108,0.24)] backdrop-blur">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-burgundy)] bg-[var(--color-cream-soft)] px-4 py-2 text-xs font-semibold text-[var(--color-rose)] shadow">
              ✅ รับคำสั่งซื้อแล้ว
            </span>
            <h1 className="text-3xl font-bold text-[var(--color-rose-dark)]">ขอบคุณที่สั่ง Steaming Bun</h1>
            <p className="text-sm text-[var(--color-rose-dark)]/75">
              เราได้รับสลิปและรายละเอียดการชำระเงินแล้ว ทีมงานจะตรวจสอบและยืนยันสถานะให้โดยเร็วที่สุด
            </p>
            {orderId ? (
              <p className="text-xs font-medium text-[var(--color-rose)]/80">รหัสคำสั่งซื้อของคุณ: {orderId}</p>
            ) : null}
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(255,135,70,0.38)] transition hover:bg-[#ff7125]"
          >
            กลับสู่หน้าหลัก
          </Link>
          <Link
            href="/orders"
            className="mt-4 inline-flex items-center justify-center rounded-full border border-[var(--color-rose)]/30 bg-white px-6 py-3 text-sm font-semibold text-[var(--color-rose)] transition hover:bg-[var(--color-rose)]/10"
          >
            ดูคำสั่งซื้อของฉัน
          </Link>
        </div>
      </div>
    </main>
  );
}
