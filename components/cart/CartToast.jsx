"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "./CartProvider";

export default function CartToast() {
  const cart = useCart();
  const lastAddedItem = cart?.lastAddedItem;
  const clearLastAdded = cart?.clearLastAdded ?? (() => {});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!lastAddedItem) return;

    setIsVisible(true);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2400);

    const clearTimer = setTimeout(() => {
      clearLastAdded();
    }, 2800);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, [lastAddedItem, clearLastAdded]);

  const qtySummary = useMemo(() => {
    if (!lastAddedItem) return "";
    const totalQty = Number(lastAddedItem.totalQty || 0);
    const addedQty = Number(lastAddedItem.qtyAdded || 0);

    if (totalQty > 0 && addedQty > 0 && totalQty !== addedQty) {
      return `ในตะกร้าทั้งหมด ${totalQty} ชิ้น`;
    }

    if (totalQty > 0) {
      return `ในตะกร้า ${totalQty} ชิ้น`;
    }

    return "";
  }, [lastAddedItem]);

  if (!lastAddedItem) return null;

  const productLabel = lastAddedItem.title ? `“${lastAddedItem.title}”` : "สินค้า";
  const addedQty = Number(lastAddedItem.qtyAdded || 0) || 1;

  return (
    <div
      className={`pointer-events-none fixed bottom-6 right-6 z-50 transition-all duration-300 sm:right-8 sm:bottom-8 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto max-w-xs rounded-2xl border border-[#f5c486] bg-white/95 px-5 py-4 text-sm text-[#3c1a09] shadow-xl shadow-[rgba(60,26,9,0.2)]"
      >
        <p className="font-semibold">เพิ่มสินค้าในตะกร้าแล้ว</p>
        <p className="mt-1 text-sm font-medium">
          {productLabel} × {addedQty}
        </p>
        {qtySummary ? (
          <p className="mt-1 text-xs text-[#3c1a09]/70">{qtySummary}</p>
        ) : null}
      </div>
    </div>
  );
}
