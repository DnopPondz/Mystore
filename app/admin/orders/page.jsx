"use client";
import { useEffect, useState } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load orders failed");
      setOrders(data);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id, status) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Update failed");
      return;
    }
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
  }

  if (loading)
    return <main className="max-w-6xl mx-auto px-6 py-10">กำลังโหลด...</main>;
  if (err)
    return (
      <main className="max-w-6xl mx-auto px-6 py-10 text-red-600">{err}</main>
    );

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <a href="/api/admin/export/orders" className="px-3 py-2 rounded border">
          Export CSV
        </a>
      </div>
      <table className="w-full border">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 border">Order</th>
            <th className="p-2 border">Items</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td className="p-2 border">
                <div className="font-medium">#{o._id.slice(-8)}</div>
                <div className="text-xs text-gray-500">
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </td>
              <td className="p-2 border">
                {o.items.map((it, idx) => (
                  <div
                    key={`${o._id}-${it.productId || it.title}-${idx}`}
                    className="flex justify-between"
                  >
                    <span>
                      {it.title} × {it.qty}
                    </span>
                    <span>฿{it.price * it.qty}</span>
                  </div>
                ))}
              </td>
              <td className="p-2 border">฿{o.total}</td>
              <td className="p-2 border">
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o._id, e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  {["new", "preparing", "shipped", "done", "cancelled"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    )
                  )}
                </select>
                <button
                  className="ml-2 text-red-600 underline"
                  onClick={() => updateStatus(o._id, "cancelled")}
                >
                  cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
