"use client";
import { useCart } from "@/components/cart/CartProvider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ product }) {
  const cart = useCart();
  const { status } = useSession();
  const router = useRouter();

  const saleMode = product?.saleMode || "regular";

  function handleClick() {
    if (saleMode === "preorder") {
      const target = product?._id ? `/preorder?product=${product._id}` : "/preorder";
      router.push(target);
      return;
    }

    if (status !== "authenticated") {
      const path =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/";
      const redirect = encodeURIComponent(path || "/");
      router.push(`/login?redirect=${redirect}`);
      return;
    }

    cart.add(
      { productId: product._id, title: product.title, price: product.price },
      1,
    );
  }

  return (
    <button
      className="px-4 py-2 rounded-full bg-[var(--color-rose)] text-[var(--color-burgundy-dark)] text-sm font-semibold shadow-lg shadow-[rgba(240,200,105,0.33)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl"
      onClick={handleClick}
    >
      {saleMode === "preorder" ? "สั่ง Pre-order" : "เพิ่มลงตะกร้า"}
    </button>
  );
}
