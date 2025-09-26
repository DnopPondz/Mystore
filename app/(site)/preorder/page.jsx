"use client";

import { useCart } from "@/components/cart/CartProvider";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const breakInitialState = {
  name: "",
  phone: "",
  email: "",
  preferredContact: "phone",
  eventDate: "",
  eventTime: "",
  servings: "",
  budget: "",
  flavourIdeas: "",
  notes: "",
};

const menuInitialState = {
  name: "",
  phone: "",
  email: "",
  preferredContact: "phone",
  eventDate: "",
  eventTime: "",
  notes: "",
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function PreOrderPage() {
  const cart = useCart();
  const router = useRouter();

  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");
  const [menuForm, setMenuForm] = useState(menuInitialState);
  const [menuQuantity, setMenuQuantity] = useState(1);
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [menuSubmitting, setMenuSubmitting] = useState(false);
  const [menuStatus, setMenuStatus] = useState(null);

  const [breakForm, setBreakForm] = useState(breakInitialState);
  const [breakSubmitting, setBreakSubmitting] = useState(false);
  const [breakStatus, setBreakStatus] = useState(null);

  useEffect(() => {
    let alive = true;
    async function loadMenu() {
      setMenuLoading(true);
      setMenuError("");
      try {
        const res = await fetch("/api/preorder-menu", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("ไม่สามารถโหลดรายการพรีออเดอร์ได้");
        }
        const data = await res.json();
        if (!alive) return;
        setMenuItems(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedMenuId(String(data[0]._id));
        }
      } catch (error) {
        if (!alive) return;
        setMenuError(error?.message || "เกิดข้อผิดพลาดในการโหลดเมนู");
      } finally {
        if (alive) setMenuLoading(false);
      }
    }

    loadMenu();
    return () => {
      alive = false;
    };
  }, []);

  const selectedMenu = useMemo(
    () => menuItems.find((item) => String(item._id) === String(selectedMenuId)) || null,
    [menuItems, selectedMenuId]
  );

  const depositRate = selectedMenu?.depositRate && Number.isFinite(selectedMenu.depositRate)
    ? Math.min(1, Math.max(0, selectedMenu.depositRate))
    : 0.5;
  const menuTotal = selectedMenu ? Number(selectedMenu.price || 0) * Math.max(1, menuQuantity) : 0;
  const menuDeposit = Math.round(menuTotal * depositRate * 100) / 100;

  function updateMenuField(field) {
    return (event) => {
      const value = event?.target?.value ?? "";
      setMenuForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  function updateBreakField(field) {
    return (event) => {
      const value = event?.target?.value ?? "";
      setBreakForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  async function handleSubmitMenu(event) {
    event.preventDefault();
    setMenuStatus(null);

    if (!selectedMenu) {
      setMenuStatus({ type: "error", message: "กรุณาเลือกเมนูพรีออเดอร์" });
      return;
    }

    if (!menuForm.name.trim() || !menuForm.phone.trim()) {
      setMenuStatus({ type: "error", message: "กรุณากรอกชื่อและเบอร์ติดต่อ" });
      return;
    }

    if (!menuQuantity || Number(menuQuantity) <= 0) {
      setMenuStatus({ type: "error", message: "จำนวนต้องมากกว่า 0" });
      return;
    }

    setMenuSubmitting(true);

    try {
      const response = await fetch("/api/preorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType: "menu",
          menuItemId: selectedMenuId,
          quantity: menuQuantity,
          ...menuForm,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "ไม่สามารถสร้างคำขอพรีออเดอร์ได้");
      }

      cart.addPreorderDeposit({
        preorderId: data.preorderId,
        title: `มัดจำ ${selectedMenu.title}`,
        price: data.depositAmount,
        totalPrice: data.totalPrice,
      });
      setMenuStatus({ type: "success", message: "สร้างคำขอมัดจำแล้ว กำลังพาไปหน้าชำระเงิน" });
      router.push("/checkout");
    } catch (error) {
      setMenuStatus({ type: "error", message: error?.message || "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง" });
    } finally {
      setMenuSubmitting(false);
    }
  }

  async function handleSubmitBreak(event) {
    event.preventDefault();
    setBreakStatus(null);

    if (!breakForm.name.trim() || !breakForm.phone.trim() || !breakForm.flavourIdeas.trim()) {
      setBreakStatus({ type: "error", message: "กรุณากรอกชื่อ เบอร์ติดต่อ และรายละเอียดชุดขนมเบรก" });
      return;
    }

    setBreakSubmitting(true);

    try {
      const response = await fetch("/api/preorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType: "break",
          ...breakForm,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "ไม่สามารถส่งคำขอได้");
      }

      setBreakForm(breakInitialState);
      setBreakStatus({ type: "success", message: "รับคำขอเรียบร้อย ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง" });
    } catch (error) {
      setBreakStatus({ type: "error", message: error?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่" });
    } finally {
      setBreakSubmitting(false);
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--color-burgundy-dark)] via-[rgba(58,16,16,0.9)] to-[var(--color-burgundy)]"
        aria-hidden
      />

      <section className="relative max-w-screen-xl mx-auto px-6 lg:px-10 pt-16 pb-10 space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy)]/70 px-4 py-1 text-sm font-semibold text-[var(--color-rose)] shadow-lg shadow-black/40">
              พรีออเดอร์ & ขนมเบรก
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-choco)] leading-tight">
              เลือกขนม ชำระมัดจำ และให้ทีมงานดูแลต่อให้ครบ
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-choco)]/80">
              สำหรับขนมที่เปิดพรีออเดอร์ คุณสามารถเลือกเมนู คำนวณราคา และชำระมัดจำ 50% ได้ทันทีผ่านระบบเช็คเอาต์ของเรา ส่วนชุดขนมเบรกสามารถกรอกรายละเอียดเพื่อให้ทีมงานติดต่อกลับพร้อมใบเสนอราคาอย่างละเอียด
            </p>
            <div className="grid gap-4 sm:grid-cols-2 text-sm text-[var(--color-choco)]/70">
              <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-5 shadow-2xl shadow-black/40 backdrop-blur">
                <p className="font-semibold text-[var(--color-choco)]">ขั้นตอนการพรีออเดอร์</p>
                <ul className="mt-3 space-y-2 list-disc list-inside">
                  <li>เลือกเมนูและจำนวนชุดที่ต้องการ</li>
                  <li>กรอกข้อมูลติดต่อและวันที่จัดงาน</li>
                  <li>ชำระมัดจำ 50% ผ่านหน้า Checkout</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-5 shadow-2xl shadow-black/40 backdrop-blur">
                <p className="font-semibold text-[var(--color-choco)]">บริการขนมเบรก</p>
                <ul className="mt-3 space-y-2 list-disc list-inside">
                  <li>แจ้งจำนวนผู้ร่วมงานและงบประมาณ</li>
                  <li>ทีมงานเสนอเมนูและใบเสนอราคา</li>
                  <li>ยืนยันรายละเอียดก่อนวันงานอย่างน้อย 3 วัน</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="rounded-[46%] border border-[var(--color-rose)]/30 bg-gradient-to-br from-[var(--color-burgundy-dark)] via-[rgba(58,16,16,0.85)] to-[var(--color-burgundy)] p-10 text-center shadow-2xl shadow-black/45">
              <p className="text-sm font-semibold tracking-[0.3em] uppercase text-[var(--color-rose)]">Made to Order</p>
              <p className="mt-3 text-3xl font-black text-[var(--color-choco)]">จองขนมโปรดล่วงหน้า</p>
              <p className="mt-4 text-sm text-[var(--color-choco)]/70">
                ปักหมุดเมนูที่ต้องการ ชำระมัดจำ แล้วปล่อยให้เชฟออกแบบรายละเอียดให้เข้ากับงานของคุณ
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative max-w-screen-xl mx-auto px-6 lg:px-10 pb-20 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-10">
          <form
            onSubmit={handleSubmitMenu}
            className="space-y-6 rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-6 shadow-2xl shadow-black/30 backdrop-blur"
          >
            <div>
              <h2 className="text-2xl font-semibold text-[var(--color-choco)]">เลือกเมนูพรีออเดอร์ & ชำระมัดจำ</h2>
              <p className="mt-2 text-sm text-[var(--color-choco)]/70">
                เลือกขนมที่เปิดรอบพรีออเดอร์ เลือกจำนวน แล้วระบบจะคำนวณยอดมัดจำอัตโนมัติ (ชำระ 50% ของยอดรวม)
              </p>
            </div>

            {menuStatus ? (
              <div
                className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                  menuStatus.type === "success"
                    ? "border border-[var(--color-rose)]/35 bg-[rgba(240,200,105,0.12)] text-[var(--color-gold)]"
                    : "border border-[var(--color-rose)]/40 bg-[rgba(120,32,32,0.55)] text-[var(--color-rose)]"
                }`}
              >
                {menuStatus.message}
              </div>
            ) : null}

            {menuError ? (
              <div className="rounded-2xl border border-[var(--color-rose)]/40 bg-[rgba(120,32,32,0.55)] px-4 py-3 text-sm text-[var(--color-rose)]">
                {menuError}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              {menuLoading && menuItems.length === 0 ? (
                <div className="md:col-span-2 rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy-dark)]/60 px-5 py-6 text-center text-sm text-[var(--color-choco)]/70">
                  กำลังโหลดเมนูพรีออเดอร์...
                </div>
              ) : menuItems.length === 0 ? (
                <div className="md:col-span-2 rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy-dark)]/60 px-5 py-6 text-center text-sm text-[var(--color-choco)]/70">
                  ขณะนี้ยังไม่มีเมนูเปิดพรีออเดอร์ กรุณาติดตามช่องทางโซเชียลของเรา
                </div>
              ) : (
                menuItems.map((item) => {
                  const active = String(item._id) === String(selectedMenuId);
                  return (
                    <button
                      type="button"
                      key={item._id}
                      onClick={() => setSelectedMenuId(String(item._id))}
                      className={`flex flex-col items-start gap-2 rounded-3xl border px-5 py-5 text-left shadow-lg transition ${
                        active
                          ? "border-[var(--color-rose)] bg-[rgba(240,200,105,0.12)] text-[var(--color-gold)]"
                          : "border-[var(--color-rose)]/25 bg-[var(--color-burgundy-dark)]/60 text-[var(--color-text)]/80 hover:border-[var(--color-rose)]/40"
                      }`}
                    >
                      <span className="text-sm font-semibold uppercase tracking-wide text-[var(--color-rose)]/80">
                        {item.unitLabel || "ชุด"}
                      </span>
                      <span className="text-lg font-semibold text-[var(--color-text)]">{item.title}</span>
                      {item.description ? (
                        <span className="text-xs text-[var(--color-text)]/70">{item.description}</span>
                      ) : null}
                      <div className="text-sm font-medium text-[var(--color-gold)]">
                        ฿{formatCurrency(item.price)} / {item.unitLabel || "ชุด"}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {selectedMenu ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                  จำนวนชุดที่ต้องการ
                  <input
                    type="number"
                    min={1}
                    value={menuQuantity}
                    onChange={(event) =>
                      setMenuQuantity(Math.max(1, parseInt(event.target.value || "1", 10)))
                    }
                    className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                  />
                </label>
                <div className="rounded-3xl border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/50 px-5 py-4 text-sm text-[var(--color-gold)]">
                  <div className="flex justify-between">
                    <span>ยอดรวม</span>
                    <span>฿{formatCurrency(menuTotal)}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-[var(--color-text)]/75">
                    <span>มัดจำ {Math.round(depositRate * 100)}%</span>
                    <span>฿{formatCurrency(menuDeposit)}</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                ชื่อ-นามสกุล*
                <input
                  type="text"
                  value={menuForm.name}
                  onChange={updateMenuField("name")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                  placeholder="ชื่อผู้ติดต่อ"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                เบอร์ติดต่อ*
                <input
                  type="tel"
                  value={menuForm.phone}
                  onChange={updateMenuField("phone")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                  placeholder="0X-XXX-XXXX"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                อีเมล
                <input
                  type="email"
                  value={menuForm.email}
                  onChange={updateMenuField("email")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                  placeholder="name@example.com"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                ช่องทางที่สะดวกให้ติดต่อกลับ
                <select
                  value={menuForm.preferredContact}
                  onChange={updateMenuField("preferredContact")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                >
                  <option value="phone">โทรศัพท์</option>
                  <option value="line">LINE</option>
                  <option value="email">อีเมล</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                วันที่จัดงาน
                <input
                  type="date"
                  value={menuForm.eventDate}
                  onChange={updateMenuField("eventDate")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                เวลาจัดงาน (โดยประมาณ)
                <input
                  type="time"
                  value={menuForm.eventTime}
                  onChange={updateMenuField("eventTime")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
              ข้อความเพิ่มเติมถึงเชฟ
              <textarea
                value={menuForm.notes}
                onChange={updateMenuField("notes")}
                className="min-h-[100px] rounded-3xl border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                placeholder="แจ้งธีม สี หรือตัวอย่างงานที่ต้องการ"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-[var(--color-text)]/60">
                ระบบจะเพิ่มมัดจำลงในตะกร้าและพาไปหน้าชำระเงินโดยอัตโนมัติ
              </div>
              <button
                type="submit"
                disabled={menuSubmitting || !selectedMenu}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-rose-dark)] px-6 py-3 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-[rgba(0,0,0,0.35)] transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {menuSubmitting ? "กำลังสร้างคำขอ..." : "ชำระมัดจำ 50%"}
              </button>
            </div>
          </form>

          <form
            onSubmit={handleSubmitBreak}
            className="space-y-6 rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/60 p-6 shadow-2xl shadow-black/30 backdrop-blur"
          >
            <div>
              <h2 className="text-2xl font-semibold text-[var(--color-choco)]">แจ้งรายละเอียดชุดขนมเบรก</h2>
              <p className="mt-2 text-sm text-[var(--color-choco)]/70">
                แจ้งจำนวนผู้ร่วมงาน งบประมาณ และสไตล์ขนมที่ต้องการ ทีมงานจะติดต่อกลับพร้อมตัวเลือกเมนูและใบเสนอราคา
              </p>
            </div>

            {breakStatus ? (
              <div
                className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                  breakStatus.type === "success"
                    ? "border border-[var(--color-rose)]/35 bg-[rgba(240,200,105,0.12)] text-[var(--color-gold)]"
                    : "border border-[var(--color-rose)]/40 bg-[rgba(120,32,32,0.55)] text-[var(--color-rose)]"
                }`}
              >
                {breakStatus.message}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                ชื่อ-นามสกุล*
                <input
                  type="text"
                  value={breakForm.name}
                  onChange={updateBreakField("name")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                  placeholder="ชื่อผู้ติดต่อ"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                เบอร์ติดต่อ*
                <input
                  type="tel"
                  value={breakForm.phone}
                  onChange={updateBreakField("phone")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                  placeholder="0X-XXX-XXXX"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                อีเมล
                <input
                  type="email"
                  value={breakForm.email}
                  onChange={updateBreakField("email")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                  placeholder="name@example.com"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                ช่องทางติดต่อกลับ
                <select
                  value={breakForm.preferredContact}
                  onChange={updateBreakField("preferredContact")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                >
                  <option value="phone">โทรศัพท์</option>
                  <option value="line">LINE</option>
                  <option value="email">อีเมล</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                วันที่จัดงาน
                <input
                  type="date"
                  value={breakForm.eventDate}
                  onChange={updateBreakField("eventDate")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                เวลาจัดงาน (โดยประมาณ)
                <input
                  type="time"
                  value={breakForm.eventTime}
                  onChange={updateBreakField("eventTime")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                จำนวนชุด/ผู้ร่วมงาน (ประมาณ)
                <input
                  type="number"
                  min={1}
                  value={breakForm.servings}
                  onChange={updateBreakField("servings")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                  placeholder="เช่น 40"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                งบประมาณ (บาท)
                <input
                  type="number"
                  min={0}
                  value={breakForm.budget}
                  onChange={updateBreakField("budget")}
                  className="rounded-full border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                  placeholder="เช่น 3200"
                />
              </label>
              <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy-dark)]/60 px-5 py-4 text-xs text-[var(--color-text)]/60">
                หากยังไม่ทราบงบประมาณ สามารถเว้นว่างไว้แล้วแจ้งรายละเอียดอื่นแทนได้ ทีมงานจะประเมินราคาให้เบื้องต้น
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
              รายละเอียดชุดขนมที่ต้องการ*
              <textarea
                value={breakForm.flavourIdeas}
                onChange={updateBreakField("flavourIdeas")}
                className="min-h-[100px] rounded-3xl border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                placeholder="แจ้งประเภทขนม รสชาติ หรือธีมที่ต้องการ"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
              ข้อมูลเพิ่มเติม
              <textarea
                value={breakForm.notes}
                onChange={updateBreakField("notes")}
                className="min-h-[80px] rounded-3xl border border-[var(--color-rose)]/35 bg-[var(--color-burgundy-dark)]/60 px-4 py-3 text-[var(--color-text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                placeholder="แจ้งสถานที่จัดส่ง เวลาวันงาน หรือข้อมูลอื่น ๆ"
              />
            </label>

            <button
              type="submit"
              disabled={breakSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-rose-dark)] px-6 py-3 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-[rgba(0,0,0,0.35)] transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {breakSubmitting ? "กำลังส่งคำขอ..." : "ส่งคำขอชุดขนมเบรก"}
            </button>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/70 p-6 text-[var(--color-text)] shadow-xl shadow-black/40 backdrop-blur">
            <h3 className="text-lg font-semibold text-[var(--color-gold)]">ช่องทางติดต่อด่วน</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <span className="font-medium text-[var(--color-gold)]">โทรศัพท์:</span> 02-123-4567 (09:00 - 18:00)
              </li>
              <li>
                <span className="font-medium text-[var(--color-gold)]">LINE Official:</span> @sweetings
              </li>
              <li>
                <span className="font-medium text-[var(--color-gold)]">อีเมล:</span> hello@sweetings.co
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy-dark)]/70 p-6 text-[var(--color-text)] shadow-xl shadow-black/40 backdrop-blur">
            <h3 className="text-lg font-semibold text-[var(--color-gold)]">คำแนะนำการเตรียมงาน</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-text)]/70">
              <li>แจ้งธีมหรือ Mood Board เพื่อให้เชฟออกแบบโทนสี</li>
              <li>หากต้องจัดส่งนอกพื้นที่กรุงเทพฯ กรุณาแจ้งล่วงหน้าอย่างน้อย 7 วัน</li>
              <li>ออเดอร์จำนวนมากสามารถนัดชิมตัวอย่างก่อนยืนยันได้</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
