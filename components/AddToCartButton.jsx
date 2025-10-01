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

  function redirectToPreorder() {
    const target = product?._id ? `/preorder?product=${product._id}` : "/preorder";
    router.push(target);
  }

  function ensureAuthenticated() {
    const path =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/";
    const redirect = encodeURIComponent(path || "/");
    router.push(`/login?redirect=${redirect}`);
  }

  function handleAddToCart() {
    if (saleMode === "preorder") {
      redirectToPreorder();
      return;
    }

    if (status !== "authenticated") {
      ensureAuthenticated();
      return;
    }

    cart.add(
      { productId: product._id, title: product.title, price: product.price },
      quantity,
    );
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
        className="px-4 py-2 rounded-full bg-[#ffe37f] text-[#3c1a09] text-sm font-semibold shadow-lg shadow-[rgba(91,61,252,0.2)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-16px_rgba(60,26,9,0.4)]"
        onClick={handleAddToCart}
      >
        สั่ง Pre-order
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-full border border-[#f5c486] bg-white text-[#3c1a09] shadow-sm">
        <button
          type="button"
          aria-label="ลดจำนวน"
          onClick={() => adjustQuantity(-1)}
          className="h-9 w-9 text-lg leading-none text-[#3c1a09]/80 transition-colors hover:text-[#3c1a09]"
        >
          −
        </button>
        <input
          type="number"
          min="1"
          max="99"
          value={quantity}
          onChange={handleQuantityChange}
          className="h-9 w-12 border-x border-[#f5c486] bg-transparent text-center text-sm font-semibold focus:outline-none"
        />
        <button
          type="button"
          aria-label="เพิ่มจำนวน"
          onClick={() => adjustQuantity(1)}
          className="h-9 w-9 text-lg leading-none text-[#3c1a09]/80 transition-colors hover:text-[#3c1a09]"
        >
          +
        </button>
      </div>
      <button
        className="px-4 py-2 rounded-full bg-[#ffe37f] text-[#3c1a09] text-sm font-semibold shadow-lg shadow-[rgba(91,61,252,0.2)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-16px_rgba(60,26,9,0.4)]"
        onClick={handleAddToCart}
      >
        เพิ่มลงตะกร้า
      </button>
    </div>
  );
}
