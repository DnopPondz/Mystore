import AuthProvider from "@/components/AuthProvider";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import BackgroundTexture from "@/components/BackgroundTexture";

export default function SiteLayout({ children }) {
  return (
    <AuthProvider>
      <BackgroundTexture variant="site" className="flex min-h-screen flex-col">
        <NavBar />
        <CartProvider>
          <main className="flex-1 min-h-[70vh]">{children}</main>
          <Footer />
        </CartProvider>
      </BackgroundTexture>
    </AuthProvider>
  );
}
