import AuthProvider from "@/components/AuthProvider";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import PromotionsTicker from "@/components/PromotionsTicker";

export default function SiteLayout({ children }) {
  return (
    <AuthProvider>
      <NavBar />
      <PromotionsTicker />
      <CartProvider>
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}
