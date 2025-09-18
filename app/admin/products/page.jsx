"use client";
import { useEffect, useMemo, useState } from "react";
import slugify from "slugify";

function toSlug(s) {
  return slugify(String(s || ""), { lower: true, strict: true, trim: true });
}

export default function AdminProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title:"", price:0, stock:0, description:"", image:"", slug:"", active:true, tags:"" });
  const isEdit = useMemo(() => Boolean(editing?._id), [editing]);

  async function load() {
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load failed");
      setItems(data);
    } catch(e){ setErr(String(e.message || e)); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function startCreate() {
    setEditing({});
    setForm({ title:"", price:0, stock:0, description:"", image:"", slug:"", active:true, tags:"" });
  }
  function startEdit(p) {
    setEditing(p);
    setForm({
      title: p.title || "",
      price: Number(p.price || 0),
      stock: Number(p.stock || 0),
      description: p.description || "",
      image: Array.isArray(p.images) && p.images[0] ? p.images[0] : "",
      slug: p.slug || toSlug(p.title || ""),
      active: !!p.active,
      tags: Array.isArray(p.tags) ? p.tags.join(",") : "",
    });
  }

  async function onUpload(file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method:"POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Upload failed");
    setForm(prev => ({ ...prev, image: data.url }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const payload = {
      title: form.title,
      slug: form.slug || toSlug(form.title),
      description: form.description,
      images: form.image ? [form.image] : [],
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      active: Boolean(form.active),
      tags: String(form.tags || "").split(",").map(s=>s.trim()).filter(Boolean),
    };
    const url = isEdit ? `/api/products/${editing._id}` : "/api/products";
    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { alert(data?.error || "Save failed"); return; }
    setEditing(null); await load();
  }

  async function onDelete(p) {
    if (!confirm(`ลบสินค้า "${p.title}" ?`)) return;
    const res = await fetch(`/api/products/${p._id}`, { method:"DELETE" });
    const data = await res.json();
    if (!res.ok) { alert(data?.error || "Delete failed"); return; }
    await load();
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <button className="px-3 py-2 rounded bg-black text-white" onClick={startCreate}>+ New Product</button>
      </div>

      {loading && <div className="mt-6">กำลังโหลด...</div>}
      {err && <div className="mt-6 text-red-600">{err}</div>}

      {!loading && !err && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 border-b">รูป</th>
                <th className="text-left p-3 border-b">ชื่อ</th>
                <th className="text-left p-3 border-b">ราคา</th>
                <th className="text-left p-3 border-b">สต็อก</th>
                <th className="text-left p-3 border-b">สถานะ</th>
                <th className="text-right p-3 border-b">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id} className="align-top">
                  <td className="p-3 border-b">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                      {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : null}
                    </div>
                  </td>
                  <td className="p-3 border-b">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-gray-500">{p.slug}</div>
                  </td>
                  <td className="p-3 border-b">฿{p.price}</td>
                  <td className="p-3 border-b">{p.stock}</td>

                  {/* Toggle อยู่ในปุ่ม พร้อมข้อความ */}
                  <td className="p-3 border-b">
                    <button
                      onClick={async () => {
                        const newValue = !p.active;
                        const res = await fetch(`/api/products/${p._id}`, {
                          method: "PATCH",
                          headers: { "Content-Type":"application/json" },
                          body: JSON.stringify({ active: newValue }),
                        });
                        const data = await res.json();
                        if (!res.ok) { alert(data?.error || "Update failed"); return; }
                        setItems(prev => prev.map(x => x._id === p._id ? { ...x, active: newValue } : x));
                      }}
                      className={`relative inline-flex items-center h-8 w-24 rounded-full transition-colors duration-300 ${
                        p.active ? "bg-green-500" : "bg-gray-400"
                      }`}
                      title={p.active ? "click to hide" : "click to show"}
                    >
                      <span
                        className={`absolute left-1 h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-300 ${
                          p.active ? "translate-x-16" : "translate-x-0"
                        }`}
                      />
                      <span className="w-full text-center text-xs font-medium text-white select-none">
                        {p.active ? "active" : "hidden"}
                      </span>
                    </button>
                  </td>

                  <td className="p-3 border-b text-right">
                    <button className="mr-2 underline" onClick={() => startEdit(p)}>edit</button>
                    <button className="text-red-600 underline" onClick={() => onDelete(p)}>delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer / Form */}
      {editing !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{isEdit ? "Edit product" : "New product"}</h2>
              <button className="text-sm underline" onClick={() => setEditing(null)}>close</button>
            </div>

            <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm block mb-1">ชื่อสินค้า</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={form.title}
                    onChange={(e)=> setForm(f => ({...f, title:e.target.value, slug: toSlug(e.target.value)}))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">Slug</label>
                  <input className="w-full border rounded px-3 py-2"
                    value={form.slug}
                    onChange={(e)=> setForm(f => ({...f, slug:e.target.value}))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm block mb-1">ราคา</label>
                    <input type="number" className="w-full border rounded px-3 py-2"
                      value={form.price} min={0}
                      onChange={(e)=> setForm(f => ({...f, price:Number(e.target.value || 0)}))}
                    />
                  </div>
                  <div>
                    <label className="text-sm block mb-1">สต็อก</label>
                    <input type="number" className="w-full border rounded px-3 py-2"
                      value={form.stock} min={0}
                      onChange={(e)=> setForm(f => ({...f, stock:Number(e.target.value || 0)}))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm block mb-1">แท็ก (คั่นด้วย ,)</label>
                  <input className="w-full border rounded px-3 py-2"
                    value={form.tags}
                    onChange={(e)=> setForm(f => ({...f, tags:e.target.value}))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input id="active" type="checkbox" checked={form.active}
                    onChange={(e)=> setForm(f => ({...f, active:e.target.checked}))}/>
                  <label htmlFor="active" className="text-sm">แสดงสินค้า</label>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm block mb-1">คำอธิบาย</label>
                  <textarea className="w-full border rounded px-3 py-2 h-28"
                    value={form.description}
                    onChange={(e)=> setForm(f => ({...f, description:e.target.value}))}
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">รูปสินค้า</label>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden">
                      {form.image ? <img src={form.image} className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="flex-1">
                      <input type="file" accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try { await onUpload(file); }
                          catch (err) { alert(String(err.message || err)); }
                        }}
                      />
                      <input className="mt-2 w-full border rounded px-3 py-2"
                        placeholder="หรือวาง URL รูป"
                        value={form.image}
                        onChange={(e)=> setForm(f => ({...f, image:e.target.value}))}
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button className="px-4 py-2 rounded bg-black text-white">
                    {isEdit ? "บันทึก" : "สร้างสินค้า"}
                  </button>
                  <button type="button" className="px-4 py-2 rounded border" onClick={() => setEditing(null)}>
                    ยกเลิก
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
