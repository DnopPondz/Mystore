"use client";
import { useCart } from "@/components/cart/CartProvider";

export default function AddToCartButton({ product }) {
  const cart = useCart();
  return (
    <button
      className="px-4 py-2 rounded-full bg-gradient-to-r from-[#f06583] to-[#f78da7] text-white text-sm font-semibold shadow-lg shadow-[#f0658333] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl"
      onClick={() =>
        cart.add(
          { productId: product._id, title: product.title, price: product.price },
          1,
        )
      }
    >
      เพิ่มลงตะกร้า
    </button>
  );
}
