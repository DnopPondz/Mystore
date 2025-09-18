"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/my/orders", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Load orders failed");
        setOrders(data);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <main className="max-w-4xl mx-auto px-6 py-10">กำลังโหลด...</main>;
  if (err) return <main className="max-w-4xl mx-auto px-6 py-10 text-red-600">{err}</main>;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">คำสั่งซื้อของฉัน</h1>

      {orders.length === 0 ? (
        <div className="border rounded-xl p-6 text-gray-600">
          ยังไม่มีคำสั่งซื้อ — <Link href="/" className="underline">เลือกสินค้า</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              href={`/orders/${o._id}`}
              key={o._id}
              className="block border rounded-xl p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Order #{o._id.slice(-8)}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">฿{o.total}</div>
                  <div className="text-xs text-gray-500">{o.status}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-2 line-clamp-1">
                {o.items.map((it, idx) => (
                  <span key={`${o._id}-${it.productId || it.title}-${idx}`}>
                    {it.title} × {it.qty}{idx < o.items.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
