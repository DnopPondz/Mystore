import AuthProvider from "@/components/AuthProvider";
import NavBar from "@/components/NavBar";
import { CartProvider } from "@/components/cart/CartProvider";

export default function SiteLayout({ children }) {
  return (
    <AuthProvider>
      <NavBar />
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
