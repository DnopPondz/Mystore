"use client";
import { useCart } from "@/components/cart/CartProvider";
export default function AddToCartButton({ product, quantity = 1, afterAdd }) {
  const cart = useCart();

  function handleClick() {
    const qty = Math.max(1, Number(quantity) || 1);
    cart.add(
      { productId: product._id, title: product.title, price: product.price },
      qty,
    );
    if (typeof afterAdd === "function") {
      afterAdd();
    }
  }

  return (
    <button
      className="px-4 py-2 rounded-full bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-rose-dark)] text-[var(--color-burgundy-dark)] text-sm font-semibold shadow-lg shadow-[rgba(240,200,105,0.33)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl"
      onClick={handleClick}
    >
      เพิ่มลงตะกร้า
    </button>
  );
}
