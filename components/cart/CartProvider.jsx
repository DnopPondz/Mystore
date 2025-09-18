"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null); // { code, discount, description }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bunshop:cart");
      if (raw) {
        const obj = JSON.parse(raw);
        setItems(Array.isArray(obj.items) ? obj.items : []);
        setCoupon(obj.coupon || null);
      }
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
    count: items.reduce((n, it) => n + it.qty, 0),
    subtotal: items.reduce((n, it) => n + (it.price || 0) * it.qty, 0),
    setCoupon,
    clearCoupon: () => setCoupon(null),
    clear: () => { setItems([]); setCoupon(null); },
    remove: (productId) => setItems((prev) => prev.filter((x) => x.productId !== productId)),
    add: ({ productId, title, price }, qty = 1) =>
      setItems((prev) => {
        const i = prev.findIndex((x) => x.productId === productId);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], qty: next[i].qty + qty };
          return next;
        }
        return [...prev, { productId, title, price, qty }];
      }),
    setQty: (productId, qty) =>
      setItems((prev) => prev.map((x) => (x.productId === productId ? { ...x, qty: Math.max(1, qty) } : x))),
  }), [items, coupon]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export function useCart() {
  return useContext(CartCtx);
}
