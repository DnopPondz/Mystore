"use client";
import { useCart } from "@/components/cart/CartProvider";

export default function AddToCartButton({ product }) {
  const cart = useCart();
  return (
    <button
      className="px-3 py-2 rounded-lg bg-black text-white"
      onClick={() => cart.add({ productId: product._id, title: product.title, price: product.price }, 1)}
    >
      Add to cart
    </button>
  );
}
