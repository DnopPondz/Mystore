"use client";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export default function QrBox({ payload, amount, title = "สแกนจ่าย PromptPay" }) {
  const canvasRef = useRef(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!payload || !canvasRef.current) return;
    (async () => {
      try {
        setErr("");
        await QRCode.toCanvas(canvasRef.current, payload, {
          width: 240,
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#4f2b1d", light: "#ffffff" },
        });
      } catch (e) {
        setErr(String(e.message || e));
      }
    })();
  }, [payload]);

  async function copyPayload() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (copyErr) {
      setErr(String(copyErr?.message || copyErr || "คัดลอกไม่สำเร็จ"));
    }
  }

  function saveQrCode() {
  try {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("ไม่พบภาพ QR");

    // แปลง canvas → dataURL (PNG)
    const dataUrl = canvas.toDataURL("image/png");

    // ตั้งชื่อไฟล์ (เช่น promptpay-123.45-2025-09-24.png)
    const ts = new Date().toISOString().slice(0,10);
    const fileName = `qr-${(amount ?? "").toString().replace(/[^\d.]/g, "") || "payment"}-${ts}.png`;

    // สร้างลิงก์ดาวน์โหลดชั่วคราว
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  } catch (e) {
    console.error(e);
    setErr(String(e?.message || "บันทึกรูปไม่สำเร็จ"));
  }
}

  return (
    <div className="rounded-3xl bg-white p-6 text-center shadow-lg shadow-[#f5a25d1a]">
      <div className="text-lg font-semibold text-[var(--color-choco)]">{title}</div>
      <div className="mt-1 text-sm text-[var(--color-choco)]/70">จำนวนเงิน: ฿{amount}</div>

      <div className="mt-4 flex items-center justify-center">
        <canvas ref={canvasRef} className="rounded-2xl border border-[#f4c689]/40 bg-white p-3" />
      </div>

      <div className="mt-4 space-y-2 text-left">
  {/* <div className="rounded-2xl border border-[#f4c689]/40 bg-[#fff6ed] p-3 text-xs text-[var(--color-choco)]/80 break-all">
    {payload}
  </div> */}

  <button
    className="w-full rounded-full bg-gradient-to-r from-[#f5a25d] to-[#f7c68b] px-4 py-2 text-sm font-semibold text-white shadow shadow-[#f5a25d33] transition hover:shadow-md"
    onClick={saveQrCode}
    type="button"
  >
    {saved ? "Saved!" : "Save QR Code"}
  </button>
</div>

      {err && <div className="mt-3 text-sm text-rose-600">{err}</div>}
    </div>
  );
}
