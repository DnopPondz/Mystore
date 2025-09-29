"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null); // { code, discount, description }

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

  const api = useMemo(() => ({
    items,
    coupon,
    count: items.reduce((n, it) => n + getQty(it), 0),
    subtotal: items.reduce((n, it) => n + getPrice(it) * getQty(it), 0),
    setCoupon,
    clearCoupon: () => setCoupon(null),
    clear: () => { setItems([]); setCoupon(null); },
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
          next[i] = sanitizeItem({ ...merged, productId });
          return next;
        }
        return [...prev, sanitizeItem({ productId, title, price: normalizedPrice, qty: normalizedQty })];
      }),
    setQty: (productId, qty) =>
      setItems((prev) =>
        prev.map((x) => (x.productId === productId ? sanitizeItem({ ...x, qty: normalizeQty(qty) }) : x)),
      ),
  }), [items, coupon]);

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
