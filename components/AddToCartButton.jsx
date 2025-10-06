"use client";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ product }) {
  const cart = useCart();
  const { status } = useSession();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const saleMode = product?.saleMode || "regular";
  const isAuthenticated = status === "authenticated";

  function redirectToPreorder() {
    const target = product?._id ? `/preorder?product=${product._id}` : "/preorder";
    router.push(target);
  }

  function handleAddToCart() {
    if (saleMode === "preorder") {
      redirectToPreorder();
      return;
    }

    if (!product?._id) {
      console.warn("Product is missing an identifier; cannot add to cart.");
      return;
    }

    if (!cart) {
      console.warn("Cart context is unavailable; unable to add product to cart.");
      return;
    }

    cart.add(
      { productId: product._id, title: product.title, price: product.price },
      quantity,
    );
    setQuantity(1);

    if (!isAuthenticated) {
      const target =
        typeof window !== "undefined"
          ? `/login?redirect=${encodeURIComponent(
              `${window.location.pathname}${window.location.search}` || "/",
            )}`
          : "/login";
      router.prefetch(target);
    }
  }

  function adjustQuantity(delta) {
    setQuantity((prev) => {
      const next = Number(prev) + delta;
      if (!Number.isFinite(next) || next < 1) return 1;
      if (next > 99) return 99;
      return Math.floor(next);
    });
  }

  function handleQuantityChange(event) {
    const rawValue = Number(event.target.value);
    if (!Number.isFinite(rawValue) || rawValue <= 0) {
      setQuantity(1);
      return;
    }
    if (rawValue > 99) {
      setQuantity(99);
      return;
    }
    setQuantity(Math.floor(rawValue));
  }

  if (saleMode === "preorder") {
    return (
      <button
        type="button"
        className="rounded-2xl bg-[var(--color-rose)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(12,116,108,0.32)] transition hover:-translate-y-0.5 hover:bg-[var(--color-rose-dark)]"
        onClick={handleAddToCart}
      >
        สั่ง Pre-order
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div className="flex flex-shrink-0 items-center rounded-full border border-[var(--color-burgundy)] bg-white text-[var(--color-rose-dark)] shadow-[inset_0_1px_3px_rgba(12,116,108,0.12)]">
        <button
          type="button"
          aria-label="ลดจำนวน"
          onClick={() => adjustQuantity(-1)}
          className="h-9 w-9 text-lg leading-none text-[var(--color-rose-dark)]/80 transition-colors hover:text-[var(--color-rose-dark)]"
        >
          −
        </button>
        <input
          type="number"
          min="1"
          max="99"
          value={quantity}
          onChange={handleQuantityChange}
          className="h-9 w-12 border-x border-[var(--color-burgundy)] bg-transparent text-center text-sm font-semibold focus:outline-none appearance-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label="เพิ่มจำนวน"
          onClick={() => adjustQuantity(1)}
          className="h-9 w-9 text-lg leading-none text-[var(--color-rose-dark)]/80 transition-colors hover:text-[var(--color-rose-dark)]"
        >
          +
        </button>
      </div>
      <button
        type="button"
        className="w-full flex-1 rounded-2xl bg-[var(--color-gold)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(255,135,70,0.32)] transition hover:-translate-y-0.5 hover:bg-[#ff7125] sm:w-auto sm:flex-none"
        onClick={handleAddToCart}
      >
        เพิ่มลงตะกร้า
      </button>
    </div>
  );
}
