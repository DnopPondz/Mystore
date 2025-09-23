import Link from "next/link";

export default function HookPage({ searchParams }) {
  const orderId = searchParams?.order ? String(searchParams.order) : "";

  return (
    <main className="relative min-h-[70vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ecfdf5] via-[#fff] to-[#ffe9f2]" />
      <div className="absolute -top-24 right-12 h-64 w-64 rounded-full bg-[#f6c34a]/25 blur-3xl" />
      <div className="absolute -bottom-28 left-16 h-72 w-72 rounded-full bg-[#f06583]/15 blur-3xl" />

      <div className="relative flex items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full rounded-3xl bg-white/95 p-10 text-center shadow-2xl shadow-[#f0658320]">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-4 py-2 text-xs font-semibold text-emerald-600">
              ✅ การสั่งซื้อสำเร็จ
            </span>
            <h1 className="text-3xl font-bold text-[var(--color-rose-dark)]">ขอบคุณที่สั่ง Sweet Cravings</h1>
            <p className="text-sm text-[var(--color-choco)]/70">
              เราได้รับสลิปและยืนยันการชำระเงินเรียบร้อยแล้ว ทีมงานกำลังจัดเตรียมสินค้าเพื่อจัดส่งให้คุณโดยเร็วที่สุด
            </p>
            {orderId ? (
              <p className="text-xs font-medium text-[var(--color-choco)]/60">รหัสคำสั่งซื้อของคุณ: {orderId}</p>
            ) : null}
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#f06583] to-[#f6c34a] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#f0658333] hover:shadow-xl"
          >
            กลับสู่หน้าหลัก
          </Link>
          <Link
            href="/orders"
            className="mt-4 inline-flex items-center justify-center rounded-full border border-[var(--color-rose)] px-6 py-3 text-sm font-semibold text-[var(--color-rose-dark)] hover:bg-[var(--color-rose)]/10"
          >
            ดูคำสั่งซื้อของฉัน
          </Link>
        </div>
      </div>
    </main>
  );
}
