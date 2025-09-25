"use client";

import { useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";

export default function ProductPurchaseActions({ product }) {
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdded = () => {
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 text-sm text-[var(--color-text)]/70">
        จำนวน
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
          className="h-11 w-24 rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/60 px-4 text-center text-sm text-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
        />
      </label>
      <AddToCartButton product={product} quantity={qty} afterAdd={handleAdded} />
      <p className="text-xs text-[var(--color-text)]/60">
        *เพิ่มสินค้าได้ทันทีโดยไม่ต้องเข้าสู่ระบบ ระบบจะบันทึกไว้ในอุปกรณ์ของคุณ
      </p>
      {justAdded && (
        <p className="text-xs font-medium text-[var(--color-gold)]/80">เพิ่มลงตะกร้าเรียบร้อยแล้ว!</p>
      )}
    </div>
  );
}
