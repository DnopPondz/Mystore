"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/my/orders/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Load order failed");
        setOrder(data);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <main className="max-w-3xl mx-auto px-6 py-10">กำลังโหลด...</main>;
  if (err) return <main className="max-w-3xl mx-auto px-6 py-10 text-red-600">{err}</main>;
  if (!order) return null;

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order #{order._id.slice(-8)}</h1>
        <Link href="/orders" className="underline">กลับรายการทั้งหมด</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-xl p-4">
          <div className="font-semibold mb-2">รายการสินค้า</div>
          <div className="space-y-2">
            {order.items.map((it, idx) => (
              <div key={`${order._id}-${it.productId || it.title}-${idx}`} className="flex justify-between">
                <span>{it.title} × {it.qty}</span>
                <span>฿{it.price * it.qty}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="font-semibold mb-2">สรุปยอด</div>
          <div className="flex justify-between"><span>รวม</span><span>฿{order.subtotal}</span></div>
          {order.discount ? (
            <div className="flex justify-between text-green-700">
              <span>ส่วนลด</span><span>-฿{order.discount}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-semibold mt-2">
            <span>สุทธิ</span><span>฿{order.total}</span>
          </div>
          <div className="text-sm text-gray-600 mt-3">
            สถานะคำสั่งซื้อ: <span className="font-medium">{order.status}</span><br/>
            การชำระเงิน: <span className="font-medium">{order.payment?.method} / {order.payment?.status}</span><br/>
            เวลา: {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
    </main>
  );
}
