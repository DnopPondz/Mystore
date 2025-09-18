"use client";
import { useEffect, useState } from "react";

export default function AdminCouponsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code:"", type:"percent", value:10, minSubtotal:0, expiresAt:"", active:true });

  async function load() {
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/coupons", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load failed");
      setItems(data);
    } catch(e){ setErr(String(e.message || e)); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function startCreate() {
    setEditing({});
    setForm({ code:"", type:"percent", value:10, minSubtotal:0, expiresAt:"", active:true });
  }
  function startEdit(c) {
    setEditing(c);
    setForm({
      code: c.code || "",
      type: c.type || "percent",
      value: Number(c.value || 0),
      minSubtotal: Number(c.minSubtotal || 0),
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0,16) : "",
      active: !!c.active,
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const payload = {
      code: form.code,
      type: form.type,
      value: Number(form.value || 0),
      minSubtotal: Number(form.minSubtotal || 0),
      expiresAt: form.expiresAt || "",
      active: Boolean(form.active),
    };
    const url = editing?._id ? `/api/coupons/${editing._id}` : "/api/coupons";
    const method = editing?._id ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { alert(data?.error || "Save failed"); return; }
    setEditing(null); await load();
  }

  async function toggleActive(c) {
    const res = await fetch(`/api/coupons/${c._id}`, {
      method: "PATCH", headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data?.error || "Update failed"); return; }
    setItems(prev => prev.map(x => x._id === c._id ? { ...x, active: !c.active } : x));
  }

  async function onDelete(c) {
    if (!confirm(`ลบคูปอง "${c.code}" ?`)) return;
    const res = await fetch(`/api/coupons/${c._id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { alert(data?.error || "Delete failed"); return; }
    await load();
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button className="px-3 py-2 rounded bg-black text-white" onClick={startCreate}>+ New Coupon</button>
      </div>

      {loading && <div className="mt-6">กำลังโหลด...</div>}
      {err && <div className="mt-6 text-red-600">{err}</div>}

      {!loading && !err && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 border-b">Code</th>
                <th className="text-left p-3 border-b">Type</th>
                <th className="text-left p-3 border-b">Value</th>
                <th className="text-left p-3 border-b">Min Subtotal</th>
                <th className="text-left p-3 border-b">Expires</th>
                <th className="text-left p-3 border-b">Active</th>
                <th className="text-right p-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c._id}>
                  <td className="p-3 border-b font-semibold">{c.code}</td>
                  <td className="p-3 border-b">{c.type}</td>
                  <td className="p-3 border-b">{c.type === "percent" ? `${c.value}%` : `฿${c.value}`}</td>
                  <td className="p-3 border-b">฿{c.minSubtotal}</td>
                  <td className="p-3 border-b">{c.expiresAt ? new Date(c.expiresAt).toLocaleString() : "-"}</td>
                  <td className="p-3 border-b">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`relative inline-flex items-center h-7 w-20 rounded-full transition-colors duration-300 ${c.active ? "bg-green-500" : "bg-gray-400"}`}
                    >
                      <span className={`absolute left-1 h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-300 ${c.active ? "translate-x-12" : "translate-x-0"}`} />
                      <span className="w-full text-center text-xs font-medium text-white select-none">
                        {c.active ? "active" : "hidden"}
                      </span>
                    </button>
                  </td>
                  <td className="p-3 border-b text-right">
                    <button className="mr-2 underline" onClick={() => startEdit(c)}>edit</button>
                    <button className="text-red-600 underline" onClick={() => onDelete(c)}>delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{editing?._id ? "Edit coupon" : "New coupon"}</h2>
              <button className="text-sm underline" onClick={()=> setEditing(null)}>close</button>
            </div>

            <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm block mb-1">Code</label>
                <input className="w-full border rounded px-3 py-2"
                  value={form.code}
                  onChange={(e)=> setForm(f => ({...f, code:e.target.value.toUpperCase()}))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm block mb-1">Type</label>
                  <select className="w-full border rounded px-3 py-2"
                    value={form.type}
                    onChange={(e)=> setForm(f => ({...f, type:e.target.value}))}
                  >
                    <option value="percent">percent (%)</option>
                    <option value="amount">amount (THB)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm block mb-1">Value</label>
                  <input type="number" className="w-full border rounded px-3 py-2"
                    value={form.value}
                    onChange={(e)=> setForm(f => ({...f, value:Number(e.target.value || 0)}))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm block mb-1">Min Subtotal (THB)</label>
                  <input type="number" className="w-full border rounded px-3 py-2"
                    value={form.minSubtotal}
                    onChange={(e)=> setForm(f => ({...f, minSubtotal:Number(e.target.value || 0)}))}
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">Expires at</label>
                  <input type="datetime-local" className="w-full border rounded px-3 py-2"
                    value={form.expiresAt}
                    onChange={(e)=> setForm(f => ({...f, expiresAt:e.target.value}))}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input id="active" type="checkbox" checked={form.active}
                  onChange={(e)=> setForm(f => ({...f, active:e.target.checked}))}/>
                <label htmlFor="active" className="text-sm">Active</label>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <button className="px-4 py-2 rounded bg-black text-white">{editing?._id ? "บันทึก" : "สร้างคูปอง"}</button>
                <button type="button" className="px-4 py-2 rounded border" onClick={()=> setEditing(null)}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
