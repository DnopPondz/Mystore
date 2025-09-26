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
        const sourceMeta = item?.meta && typeof item.meta === "object" ? item.meta : {};
        const amount = Number(item?.price || 0);
        const quantityRaw = sourceMeta.quantity ?? item?.quantity;
        const quantity = Number.isFinite(Number(quantityRaw)) ? Number(quantityRaw) : 0;
        const unitLabel = sourceMeta.unitLabel || item?.unitLabel || "";
        const itemPriceRaw = sourceMeta.itemPrice ?? item?.itemPrice;
        const itemPrice = Number.isFinite(Number(itemPriceRaw)) ? Number(itemPriceRaw) : 0;
        const totalPriceRaw =
          sourceMeta.totalPrice ?? item?.totalPrice ?? (quantity && itemPrice ? itemPrice * quantity : null);
        const totalPrice = Number.isFinite(Number(totalPriceRaw)) && Number(totalPriceRaw) > 0
          ? Number(totalPriceRaw)
          : amount;
        const depositRateRaw = sourceMeta.depositRate ?? (totalPrice > 0 ? amount / totalPrice : null);
        const depositRate = Number.isFinite(Number(depositRateRaw)) ? Number(depositRateRaw) : null;
        const meta = {
          totalPrice,
          depositAmount: amount,
          depositRate,
          unitLabel,
          quantity,
          itemPrice,
          imageUrl: sourceMeta.imageUrl || item?.imageUrl || "",
        };
        return {
          id: `preorder:${preorderId}`,
          kind,
          preorderId,
          title: String(item?.title || "มัดจำพรีออเดอร์"),
          price,
          qty: 1,
          totalPrice: meta.totalPrice,
          meta,
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
    addPreorderDeposit: ({
      preorderId,
      title,
      price,
      totalPrice,
      depositRate,
      quantity,
      unitLabel,
      itemPrice,
      imageUrl,
    }) => {
      const amount = Number(price || 0);
      const id = `preorder:${preorderId}`;
      const normalizedQuantity = Number.isFinite(Number(quantity)) && Number(quantity) > 0 ? Number(quantity) : 0;
      const normalizedItemPrice = Number.isFinite(Number(itemPrice)) ? Number(itemPrice) : 0;
      const normalizedTotal = Number.isFinite(Number(totalPrice)) && Number(totalPrice) > 0
        ? Number(totalPrice)
        : normalizedQuantity && normalizedItemPrice
        ? normalizedQuantity * normalizedItemPrice
        : amount;
      const normalizedDepositRate = Number.isFinite(Number(depositRate)) ? Number(depositRate) : (normalizedTotal > 0
        ? amount / normalizedTotal
        : null);
      const meta = {
        totalPrice: normalizedTotal,
        depositAmount: amount,
        depositRate: normalizedDepositRate,
        unitLabel: unitLabel || "",
        quantity: normalizedQuantity,
        itemPrice: normalizedItemPrice,
        imageUrl: imageUrl || "",
      };
      setItems([
        {
          id,
          kind: "preorder-deposit",
          preorderId,
          title: title || "มัดจำพรีออเดอร์",
          price: amount,
          qty: 1,
          totalPrice: meta.totalPrice,
          meta,
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
