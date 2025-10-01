"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { calculateCartPromotions } from "@/lib/promotionUtils";

const CartCtx = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null); // { code, discount, description }
  const [promotionList, setPromotionList] = useState([]);
  const [promotionError, setPromotionError] = useState("");
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bunshop:cart");
      if (!raw) return;

      const obj = JSON.parse(raw);
      const normalizedItems = Array.isArray(obj.items)
        ? obj.items.map((it) => sanitizeItem(it)).filter(Boolean)
        : [];

      setItems(normalizedItems);
      setCoupon(obj.coupon || null);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("bunshop:cart", JSON.stringify({ items, coupon }));
    } catch {}
  }, [items, coupon]);

  useEffect(() => {
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const refreshPromotions = useCallback(async () => {
    if (!aliveRef.current) return;
    setPromotionLoading(true);
    setPromotionError("");
    try {
      const res = await fetch("/api/promotions/active", { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "โหลดโปรโมชันไม่สำเร็จ");
      }
      const data = await res.json();
      if (!aliveRef.current) return;
      setPromotionList(Array.isArray(data) ? data : []);
    } catch (error) {
      if (!aliveRef.current) return;
      setPromotionError(String(error?.message || error) || "โหลดโปรโมชันไม่สำเร็จ");
    } finally {
      if (aliveRef.current) setPromotionLoading(false);
    }
  }, []);

  const clearLastAdded = useCallback(() => setLastAddedItem(null), []);

  useEffect(() => {
    refreshPromotions().catch(() => {});
    const interval = setInterval(() => {
      refreshPromotions().catch(() => {});
    }, 5 * 60 * 1000);
    return () => {
      clearInterval(interval);
    };
  }, [refreshPromotions]);

  const promotionSummary = useMemo(() => {
    const result = calculateCartPromotions(items, promotionList);
    return {
      ...result,
      active: promotionList,
      loading: promotionLoading,
      error: promotionError,
    };
  }, [items, promotionList, promotionError, promotionLoading]);

  const couponDiscount = Math.max(0, Number(coupon?.discount || 0));
  const promotionDiscount = Math.max(0, Number(promotionSummary.discount || 0));
  const subtotal = items.reduce((n, it) => n + getPrice(it) * getQty(it), 0);
  const totalDiscount = Math.min(subtotal, couponDiscount + promotionDiscount);
  const total = Math.max(0, subtotal - totalDiscount);

  const api = useMemo(
    () => ({
      items,
      coupon,
      promotions: { ...promotionSummary, refresh: refreshPromotions },
      count: items.reduce((n, it) => n + getQty(it), 0),
      subtotal,
      setCoupon,
      clearCoupon: () => setCoupon(null),
      clear: () => {
        setItems([]);
        setCoupon(null);
        setLastAddedItem(null);
      },
      remove: (productId) => setItems((prev) => prev.filter((x) => x.productId !== productId)),
      add: ({ productId, title, price }, qty = 1) =>
        setItems((prev) => {
          const normalizedQty = normalizeQty(qty);
          const normalizedPrice = normalizePrice(price);

          const i = prev.findIndex((x) => x.productId === productId);
          if (i >= 0) {
            const next = [...prev];
            const current = next[i];
            const merged = {
              ...current,
              title: current?.title || title || "",
              price: normalizePrice(current?.price),
              qty: normalizeQty(current?.qty) + normalizedQty,
            };
            const sanitized = sanitizeItem({ ...merged, productId });
            if (!sanitized) return prev;
            next[i] = sanitized;
            setLastAddedItem({
              productId: sanitized.productId,
              title: sanitized.title,
              qtyAdded: normalizedQty,
              totalQty: sanitized.qty,
            });
            return next;
          }
          const sanitized = sanitizeItem({
            productId,
            title,
            price: normalizedPrice,
            qty: normalizedQty,
          });
          if (!sanitized) return prev;
          setLastAddedItem({
            productId: sanitized.productId,
            title: sanitized.title,
            qtyAdded: sanitized.qty,
            totalQty: sanitized.qty,
          });
          return [...prev, sanitized];
        }),
      setQty: (productId, qty) =>
        setItems((prev) =>
          prev.map((x) => (x.productId === productId ? sanitizeItem({ ...x, qty: normalizeQty(qty) }) : x)),
        ),
      couponDiscount,
      promotionDiscount,
      totalDiscount,
      total,
      lastAddedItem,
      clearLastAdded,
    }),
    [
      items,
      coupon,
      promotionSummary,
      refreshPromotions,
      subtotal,
      couponDiscount,
      promotionDiscount,
      totalDiscount,
      total,
      lastAddedItem,
      clearLastAdded,
    ],
  );

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export function useCart() {
  return useContext(CartCtx);
}

function normalizeQty(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return 1;
  return Math.floor(num);
}

function normalizePrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return num;
}

function getQty(item) {
  const num = Number(item?.qty);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.floor(num);
}

function getPrice(item) {
  const num = Number(item?.price);
  if (!Number.isFinite(num) || num < 0) return 0;
  return num;
}

function sanitizeItem(item) {
  if (!item || typeof item !== "object") return null;
  const productId = item.productId || item._id;
  if (!productId) return null;

  return {
    productId,
    title: item.title || "",
    price: normalizePrice(item.price),
    qty: normalizeQty(item.qty),
  };
}
