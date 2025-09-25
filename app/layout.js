import "./globals.css";

export const metadata = {
  title: "Bao Lamphun | ซาลาเปาและขนมจีบโฮมเมด",
  description: "ซาลาเปาและขนมจีบนึ่งสดทุกวันจากครัวในเมืองลำพูน พร้อมบริการจัดส่งและสั่งทำพิเศษ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className="min-h-screen text-[var(--color-text)] antialiased">
        {children}
      </body>
    </html>
  );
}
