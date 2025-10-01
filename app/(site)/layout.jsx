import AuthProvider from "@/components/AuthProvider";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import PromotionsTicker from "@/components/PromotionsTicker";
import { CartProvider } from "@/components/cart/CartProvider";
import CartToast from "@/components/cart/CartToast";

export default function SiteLayout({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <NavBar />
        <PromotionsTicker />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <CartToast />
      </CartProvider>
    </AuthProvider>
  );
}
