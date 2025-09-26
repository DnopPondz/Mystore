"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminPopup } from "@/components/admin/AdminPopupProvider";

const statusOptions = ["new", "contacted", "quoted", "confirmed", "closed"];
const statusLabels = {
  new: "คำขอใหม่",
  contacted: "ติดต่อแล้ว",
  quoted: "ส่งใบเสนอราคา",
  confirmed: "ยืนยันออเดอร์",
  closed: "ปิดงาน",
};

const depositLabels = {
  pending: "รอตรวจสอบ",
  paid: "ชำระแล้ว",
  waived: "ยกเว้น",
};

function formatCurrency(n) {
  return Number(n || 0).toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function AdminPreordersPage() {
  const popup = useAdminPopup();
  const [loading, setLoading] = useState(true);
  const [preorders, setPreorders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState("");
  const [menuError, setMenuError] = useState("");
  const [menuForm, setMenuForm] = useState({
    title: "",
    description: "",
    price: "",
    unitLabel: "ชุด",
    depositRate: "0.5",
    imageUrl: "",
  });
  const [creatingMenu, setCreatingMenu] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [draftFinalPrice, setDraftFinalPrice] = useState({});

  useEffect(() => {
    refreshAll();
  }, []);

  async function refreshAll() {
    setLoading(true);
    setError("");
    try {
      const [preorderRes, menuRes] = await Promise.all([
        fetch("/api/preorders", { cache: "no-store" }),
        fetch("/api/preorder-menu?all=1", { cache: "no-store" }),
      ]);

      if (!preorderRes.ok) {
        throw new Error("โหลดข้อมูลพรีออเดอร์ไม่สำเร็จ");
      }
      if (!menuRes.ok) {
        throw new Error("โหลดเมนูพรีออเดอร์ไม่สำเร็จ");
      }

      const preorderData = await preorderRes.json();
      const menuData = await menuRes.json();

      setPreorders(Array.isArray(preorderData) ? preorderData : []);
      setMenuItems(Array.isArray(menuData) ? menuData : []);
      setDraftFinalPrice({});
    } catch (err) {
      setError(err?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }

  function updateMenuForm(field) {
    return (event) => {
      setMenuForm((prev) => ({ ...prev, [field]: event?.target?.value ?? "" }));
    };
  }

  async function handleCreateMenu(event) {
    event.preventDefault();
    setMenuError("");

    if (!menuForm.title.trim() || !menuForm.price) {
      setMenuError("กรุณากรอกชื่อเมนูและราคา");
      return;
    }

    setCreatingMenu(true);
    try {
      const response = await fetch("/api/preorder-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: menuForm.title,
          description: menuForm.description,
          price: Number(menuForm.price),
          unitLabel: menuForm.unitLabel || "ชุด",
          depositRate: Number(menuForm.depositRate || 0.5),
          imageUrl: menuForm.imageUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "ไม่สามารถสร้างเมนูได้");
      }

      setMenuForm({ title: "", description: "", price: "", unitLabel: "ชุด", depositRate: "0.5", imageUrl: "" });
      refreshAll();
      void popup.alert("เพิ่มเมนูพรีออเดอร์แล้ว", { title: "บันทึกสำเร็จ", tone: "success" });
    } catch (err) {
      setMenuError(err?.message || "เกิดข้อผิดพลาด");
    } finally {
      setCreatingMenu(false);
    }
  }

  async function handleUpdateMenu(id, payload, successMessage = "บันทึกแล้ว") {
    try {
      const response = await fetch(`/api/preorder-menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || "อัปเดตเมนูไม่สำเร็จ");
      setMenuItems((prev) => prev.map((item) => (String(item._id) === String(id) ? data.item : item)));
      void popup.alert(successMessage, { title: "บันทึกสำเร็จ", tone: "success" });
    } catch (err) {
      void popup.alert(err?.message || "อัปเดตเมนูไม่สำเร็จ", { title: "เกิดข้อผิดพลาด", tone: "error" });
    }
  }

  async function handleUpdatePreorder(id, payload, message = "บันทึกแล้ว") {
    try {
      const response = await fetch(`/api/preorders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "อัปเดตไม่สำเร็จ");
      setPreorders((prev) => prev.map((item) => (String(item._id) === String(id) ? data : item)));
      void popup.alert(message, { title: "บันทึกสำเร็จ", tone: "success" });
    } catch (err) {
      void popup.alert(err?.message || "อัปเดตไม่สำเร็จ", { title: "เกิดข้อผิดพลาด", tone: "error" });
    }
  }

  const filteredPreorders = useMemo(() => {
    return preorders.filter((item) => {
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (filterType === "menu" && item.orderType !== "menu") return false;
      if (filterType === "break" && item.orderType !== "break") return false;
      return true;
    });
  }, [preorders, filterStatus, filterType]);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-gold)]">จัดการพรีออเดอร์ & ขนมเบรก</h1>
          <p className="text-sm text-[var(--color-text)]/70">
            ตรวจสอบคำขอ ชำระมัดจำ และจัดการเมนูที่เปิดให้สั่งล่วงหน้า
          </p>
        </div>
        <button
          onClick={refreshAll}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-2 text-sm font-medium text-[var(--color-gold)]"
        >
          ↻ รีเฟรชข้อมูล
        </button>
      </header>

      {error ? (
        <div className="rounded-3xl border border-[var(--color-rose)]/40 bg-[rgba(120,32,32,0.55)] px-4 py-3 text-sm text-[var(--color-rose)]">
          {error}
        </div>
      ) : null}

      <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-6 shadow-xl shadow-black/30 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-gold)]">เมนูที่เปิดพรีออเดอร์</h2>
                <p className="text-xs text-[var(--color-text)]/60">เพิ่ม ปรับราคา หรือปิดการขายเมนูที่เปิดให้สั่งมัดจำ</p>
              </div>
            </div>

            <form onSubmit={handleCreateMenu} className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-text)]/70 md:col-span-1">
                ชื่อเมนู*
                <input
                  value={menuForm.title}
                  onChange={updateMenuForm("title")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-text)]/70">
                ราคา (บาท)*
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={menuForm.price}
                  onChange={updateMenuForm("price")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-text)]/70">
                หน่วย (เช่น ชุด, ปอนด์)
                <input
                  value={menuForm.unitLabel}
                  onChange={updateMenuForm("unitLabel")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-text)]/70">
                อัตรามัดจำ (0-1)
                <input
                  type="number"
                  min={0}
                  max={1}
                  step="0.05"
                  value={menuForm.depositRate}
                  onChange={updateMenuForm("depositRate")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-text)]/70">
                ลิงก์รูปภาพเมนู
                <input
                  value={menuForm.imageUrl}
                  onChange={updateMenuForm("imageUrl")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                  placeholder="เช่น https://..."
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-text)]/70 md:col-span-2">
                รายละเอียดเพิ่มเติม
                <textarea
                  value={menuForm.description}
                  onChange={updateMenuForm("description")}
                  className="min-h-[70px] rounded-2xl border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                  placeholder="ระบุรสชาติหรือจุดเด่นของเมนู"
                />
              </label>
              <div className="md:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {menuError ? <span className="text-xs text-[var(--color-rose)]">{menuError}</span> : <span />}
                <button
                  type="submit"
                  disabled={creatingMenu}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-rose-dark)] px-5 py-2 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-[rgba(0,0,0,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingMenu ? "กำลังบันทึก..." : "เพิ่มเมนูใหม่"}
                </button>
              </div>
            </form>

            <div className="mt-6 space-y-3">
              {menuItems.length === 0 ? (
                <div className="rounded-2xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy-dark)]/60 px-4 py-4 text-sm text-[var(--color-text)]/70">
                  ยังไม่มีเมนูเปิดพรีออเดอร์
                </div>
              ) : (
                menuItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col gap-3 rounded-2xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy-dark)]/60 px-4 py-4 text-sm text-[var(--color-text)] shadow-lg shadow-black/25 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex flex-1 items-start gap-3">
                      {item.imageUrl ? (
                        <div className="h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : null}
                      <div>
                        <div className="text-base font-semibold text-[var(--color-gold)]">
                          {item.title} {item.active ? "" : <span className="ml-2 text-xs font-normal text-[var(--color-rose)]/80">(ปิดชั่วคราว)</span>}
                        </div>
                        <div className="text-xs text-[var(--color-text)]/60">
                          {item.unitLabel || "ชุด"} • ราคา ฿{formatCurrency(item.price)} • มัดจำ {Math.round((item.depositRate || 0.5) * 100)}%
                        </div>
                        {item.description ? (
                          <div className="mt-1 text-xs text-[var(--color-text)]/60">{item.description}</div>
                        ) : null}
                        {item.imageUrl ? (
                          <div className="mt-1 text-[10px] text-[var(--color-text)]/50 break-words">{item.imageUrl}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleUpdateMenu(item._id, { active: !item.active }, item.active ? "ปิดเมนูชั่วคราวแล้ว" : "เปิดเมนูแล้ว")}
                        className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy)]/50 px-3 py-2 text-xs font-medium text-[var(--color-gold)]"
                      >
                        {item.active ? "ปิดการขาย" : "เปิดการขาย"}
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateMenu(
                            item._id,
                            { price: Number(prompt("ราคาต่อชุดใหม่", item.price) || item.price) },
                            "อัปเดตราคาแล้ว"
                          )
                        }
                        className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy)]/50 px-3 py-2 text-xs font-medium text-[var(--color-gold)]"
                      >
                        ปรับราคา
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateMenu(
                            item._id,
                            { depositRate: Number(prompt("อัตรามัดจำใหม่ (0-1)", item.depositRate ?? 0.5) || item.depositRate) },
                            "อัปเดตอัตรามัดจำแล้ว"
                          )
                        }
                        className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy)]/50 px-3 py-2 text-xs font-medium text-[var(--color-gold)]"
                      >
                        ปรับอัตรามัดจำ
                      </button>
                      <button
                        onClick={() => {
                          const nextUrl = prompt("ลิงก์รูปภาพใหม่", item.imageUrl || "");
                          if (nextUrl === null) return;
                          handleUpdateMenu(item._id, { imageUrl: nextUrl }, nextUrl ? "อัปเดตรูปภาพแล้ว" : "ลบรูปภาพแล้ว");
                        }}
                        className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy)]/50 px-3 py-2 text-xs font-medium text-[var(--color-gold)]"
                      >
                        {item.imageUrl ? "เปลี่ยนรูป" : "เพิ่มรูป"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-6 text-[var(--color-text)] shadow-xl shadow-black/30 backdrop-blur">
            <h2 className="text-lg font-semibold text-[var(--color-gold)]">สรุปสถานะ</h2>
            <div className="mt-4 space-y-2 text-sm text-[var(--color-text)]/70">
              <div className="flex justify-between">
                <span>คำขอทั้งหมด</span>
                <span>{preorders.length} รายการ</span>
              </div>
              <div className="flex justify-between">
                <span>มัดจำที่รอตรวจสอบ</span>
                <span>{preorders.filter((it) => it.orderType === "menu" && it.depositStatus === "pending").length}</span>
              </div>
              <div className="flex justify-between">
                <span>คำขอชุดขนมเบรก</span>
                <span>{preorders.filter((it) => it.orderType === "break").length}</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-6 shadow-xl shadow-black/30 backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-gold)]">คำขอทั้งหมด</h2>
            <p className="text-xs text-[var(--color-text)]/60">
              เปลี่ยนสถานะ ติดตามการชำระมัดจำ และบันทึกราคาจริงหลังปิดงาน
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
              className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
            >
              <option value="all">ทั้งหมด</option>
              <option value="menu">เฉพาะพรีออเดอร์</option>
              <option value="break">เฉพาะขนมเบรก</option>
            </select>
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
            >
              <option value="all">สถานะทั้งหมด</option>
              {statusOptions.map((value) => (
                <option key={value} value={value}>
                  {statusLabels[value]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy-dark)]/60 px-4 py-4 text-sm text-[var(--color-text)]/70">
            กำลังโหลดข้อมูล...
          </div>
        ) : filteredPreorders.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy-dark)]/60 px-4 py-4 text-sm text-[var(--color-text)]/70">
            ไม่พบคำขอตามตัวกรองที่เลือก
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {filteredPreorders.map((item) => {
              const isMenu = item.orderType === "menu";
              const finalPriceDraft = draftFinalPrice[item._id] ?? item.finalPrice ?? "";
              return (
                <div
                  key={item._id}
                  className="rounded-2xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy-dark)]/60 p-5 text-sm text-[var(--color-text)] shadow-lg shadow-black/25"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-base font-semibold text-[var(--color-gold)]">
                        {item.name} • {item.phone}
                      </div>
                      <div className="text-xs text-[var(--color-text)]/60">
                        {item.email ? `${item.email} • ` : ""}
                        {item.preferredContact ? `ติดต่อกลับทาง ${item.preferredContact}` : ""}
                      </div>
                      <div className="mt-2 text-xs text-[var(--color-text)]/70">
                        ประเภท: {isMenu ? "พรีออเดอร์ที่มีมัดจำ" : "ชุดขนมเบรก"}
                      </div>
                      {isMenu ? (
                        <div className="mt-2 rounded-2xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/50 px-4 py-3 text-xs text-[var(--color-text)]/80">
                          <div>เมนู: {item.menuSnapshot?.title || "-"}</div>
                          <div>จำนวน: {item.quantity} {item.menuSnapshot?.unitLabel || "ชุด"}</div>
                          <div>ยอดรวม: ฿{formatCurrency(item.totalPrice)}</div>
                          <div>
                            มัดจำ: ฿{formatCurrency(item.depositAmount)} • สถานะ {depositLabels[item.depositStatus] || item.depositStatus}
                          </div>
                        </div>
                      ) : null}
                      <div className="mt-2 text-xs text-[var(--color-text)]/70 whitespace-pre-wrap">
                        {item.flavourIdeas || "-"}
                      </div>
                      {item.notes ? (
                        <div className="mt-1 text-xs text-[var(--color-text)]/50 whitespace-pre-wrap">หมายเหตุ: {item.notes}</div>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2 text-xs">
                      <label className="flex flex-col gap-1">
                        สถานะงาน
                        <select
                          value={item.status}
                          onChange={(event) => handleUpdatePreorder(item._id, { status: event.target.value })}
                          className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy)]/60 px-4 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                        >
                          {statusOptions.map((value) => (
                            <option key={value} value={value}>
                              {statusLabels[value]}
                            </option>
                          ))}
                        </select>
                      </label>
                      {isMenu ? (
                        <label className="flex flex-col gap-1">
                          สถานะมัดจำ
                          <select
                            value={item.depositStatus || "pending"}
                            onChange={(event) =>
                              handleUpdatePreorder(item._id, { depositStatus: event.target.value }, "อัปเดตสถานะมัดจำแล้ว")
                            }
                            className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy)]/60 px-4 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                          >
                            <option value="pending">รอตรวจสอบ</option>
                            <option value="paid">ชำระแล้ว</option>
                            <option value="waived">ยกเว้น</option>
                          </select>
                        </label>
                      ) : null}
                      <label className="flex flex-col gap-1">
                        ราคาหลังเจรจา (บาท)
                        <input
                          type="number"
                          min={0}
                          value={finalPriceDraft}
                          onChange={(event) =>
                            setDraftFinalPrice((prev) => ({ ...prev, [item._id]: event.target.value }))
                          }
                          onBlur={(event) =>
                            handleUpdatePreorder(
                              item._id,
                              { finalPrice: Number(event.target.value || 0) },
                              "บันทึกราคาสุทธิแล้ว"
                            )
                          }
                          className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy)]/60 px-4 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
