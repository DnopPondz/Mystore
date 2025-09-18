"use client";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export default function QrBox({ payload, amount, title = "สแกนจ่าย PromptPay" }) {
  const canvasRef = useRef(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!payload || !canvasRef.current) return;
    (async () => {
      try {
        setErr("");
        await QRCode.toCanvas(canvasRef.current, payload, {
          width: 240,
          margin: 1,
          errorCorrectionLevel: "M",
        });
      } catch (e) {
        setErr(String(e.message || e));
      }
    })();
  }, [payload]);

  return (
    <div className="border rounded-xl p-4 bg-white">
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm text-gray-600">จำนวนเงิน: ฿{amount}</div>

      {/* QR */}
      <div className="mt-3 flex items-center justify-center">
        <canvas ref={canvasRef} />
      </div>

      {/* payload + copy */}
      <div className="mt-3">
        <div className="text-xs text-gray-500 break-all bg-gray-50 border rounded p-2">
          {payload}
        </div>
        <button
          className="mt-2 text-sm underline"
          onClick={() => navigator.clipboard.writeText(payload)}
        >
          คัดลอกโค้ด
        </button>
      </div>

      {err && <div className="text-red-600 text-sm mt-2">{err}</div>}
    </div>
  );
}
