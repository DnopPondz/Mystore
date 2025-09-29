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
      className="px-4 py-2 rounded-full bg-[#ffe37f] text-[#3c1a09] text-sm font-semibold shadow-lg shadow-[rgba(91,61,252,0.2)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-16px_rgba(60,26,9,0.4)]"
      onClick={handleClick}
    >
      {saleMode === "preorder" ? "สั่ง Pre-order" : "เพิ่มลงตะกร้า"}
    </button>
  );
}
