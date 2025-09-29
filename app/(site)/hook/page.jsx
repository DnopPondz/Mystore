import Link from "next/link";

export default function HookPage({ searchParams }) {
  const orderId = searchParams?.order ? String(searchParams.order) : "";

  return (
    <main className="relative min-h-[70vh] overflow-hidden bg-[#fff7eb]">
      <div className="absolute inset-0 bg-[#fff7eb]" />
      <div className="absolute -top-24 right-12 h-64 w-64 rounded-full bg-[#5b3dfc]/18 blur-3xl" />
      <div className="absolute -bottom-28 left-16 h-72 w-72 rounded-full bg-[#f7931e]/22 blur-3xl" />

      <div className="relative flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-lg rounded-3xl border border-[#f5c486] bg-white/90 p-10 text-center shadow-2xl shadow-[rgba(60,26,9,0.18)] backdrop-blur">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c486] bg-[#fff3d6] px-4 py-2 text-xs font-semibold text-[#5b3dfc] shadow">
              ✅ รับคำสั่งซื้อแล้ว
            </span>
            <h1 className="text-3xl font-bold text-[#3c1a09]">ขอบคุณที่สั่ง Sweet Cravings</h1>
            <p className="text-sm text-[#3c1a09]/75">
              เราได้รับสลิปและรายละเอียดการชำระเงินแล้ว ทีมงานจะตรวจสอบและยืนยันสถานะให้โดยเร็วที่สุด
            </p>
            {orderId ? (
              <p className="text-xs font-medium text-[#5b3dfc]/80">รหัสคำสั่งซื้อของคุณ: {orderId}</p>
            ) : null}
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#f7931e] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(247,147,30,0.4)] transition hover:bg-[#df7f0f]"
          >
            กลับสู่หน้าหลัก
          </Link>
          <Link
            href="/orders"
            className="mt-4 inline-flex items-center justify-center rounded-full border border-[#5b3dfc]/30 bg-white px-6 py-3 text-sm font-semibold text-[#5b3dfc] transition hover:bg-[#f5edff]"
          >
            ดูคำสั่งซื้อของฉัน
          </Link>
        </div>
      </div>
    </main>
  );
}
