import Link from "next/link";

export default function HookPage({ searchParams }) {
  const orderId = searchParams?.order ? String(searchParams.order) : "";

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-16 bg-gray-50">
      <div className="max-w-lg w-full bg-white border rounded-3xl shadow-sm p-8 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-green-700">คำสั่งซื้อเสร็จสมบูรณ์</h1>
          <p className="text-gray-600">
            เราได้รับข้อมูลการชำระเงินและสลิปเรียบร้อยแล้ว ทีมงานจะตรวจสอบและติดต่อกลับหากมีข้อมูลเพิ่มเติม
          </p>
          {orderId ? (
            <p className="text-sm text-gray-500">รหัสคำสั่งซื้อของคุณ: {orderId}</p>
          ) : null}
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-black text-white hover:bg-gray-800 transition"
        >
          กลับสู่หน้าหลัก
        </Link>
      </div>
    </main>
  );
}
