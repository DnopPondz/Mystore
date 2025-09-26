"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext();

function normaliseItems(rawItems) {
  if (!Array.isArray(rawItems)) return [];
  return rawItems
    .map((item) => {
      const kind = item?.kind === "preorder-deposit" ? "preorder-deposit" : "product";
      const qty = Math.max(1, Number(item?.qty || 1));
      const price = Number(item?.price || 0);
      if (kind === "preorder-deposit") {
        const preorderId = String(item?.preorderId || "").trim();
        if (!preorderId) return null;
        return {
          id: `preorder:${preorderId}`,
          kind,
          preorderId,
          title: String(item?.title || "มัดจำพรีออเดอร์"),
          price,
          qty: 1,
          totalPrice: Number(item?.totalPrice || 0),
        };
      }

      const productId = String(item?.productId || "").trim();
      if (!productId) return null;
      return {
        id: `product:${productId}`,
        kind: "product",
        productId,
        title: String(item?.title || ""),
        price,
        qty,
      };
    })
    .filter(Boolean);
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null); // { code, discount, description }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bunshop:cart");
      if (raw) {
        const obj = JSON.parse(raw);
        setItems(normaliseItems(obj.items));
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
    clear: () => {
      setItems([]);
      setCoupon(null);
    },
    remove: (id) =>
      setItems((prev) => prev.filter((x) => x.id !== id && x.productId !== id)),
    add: ({ productId, title, price }, qty = 1) =>
      setItems((prev) => {
        const id = `product:${productId}`;
        const nextQty = Math.max(1, Number(qty || 1));
        const index = prev.findIndex((x) => x.id === id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = { ...next[index], qty: next[index].qty + nextQty };
          return next;
        }
        return [
          ...prev,
          {
            id,
            kind: "product",
            productId,
            title,
            price: Number(price || 0),
            qty: nextQty,
          },
        ];
      }),
    setQty: (id, qty) =>
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id || item.productId === id) {
            const nextQty = Math.max(1, Number(qty || 1));
            return { ...item, qty: item.kind === "product" ? nextQty : 1 };
          }
          return item;
        })
      ),
    addPreorderDeposit: ({ preorderId, title, price, totalPrice }) => {
      const amount = Number(price || 0);
      const id = `preorder:${preorderId}`;
      setItems([
        {
          id,
          kind: "preorder-deposit",
          preorderId,
          title: title || "มัดจำพรีออเดอร์",
          price: amount,
          qty: 1,
          totalPrice: Number(totalPrice || 0),
        },
      ]);
      setCoupon(null);
    },
  }), [items, coupon]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export function useCart() {
  return useContext(CartCtx);
}
