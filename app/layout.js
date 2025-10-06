import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://steamingbun.example.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Steaming Bun | ซาลาเปาร้อน นึ่งสดทุกวัน",
    template: "%s | Steaming Bun",
  },
  description:
    "Steaming Bun ร้านซาลาเปาและขนมจีบโฮมเมดในลำพูน นึ่งสดใหม่ทุกวัน พร้อมบริการส่งถึงมือคุณ และรับสั่งทำล่วงหน้าเพื่อจัดเลี้ยงหรือเซ็ตอาหารเช้า.",
  keywords: [
    "ซาลาเปา",
    "ขนมจีบ",
    "อาหารเช้า",
    "นึ่งสด",
    "ร้านอาหารลำพูน",
    "สั่งทำล่วงหน้า",
    "dim sum",
    "bao",
  ],
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: siteUrl,
    title: "Steaming Bun | ซาลาเปาร้อน นึ่งสดทุกวัน",
    description:
      "ลิ้มลองซาลาเปาโฮมเมดไส้แน่น พร้อมขนมจีบสูตรลับ นึ่งสดใหม่ทุกวันและส่งไวในเมืองลำพูน.",
    siteName: "Steaming Bun",
  },
  twitter: {
    card: "summary_large_image",
    title: "Steaming Bun | ซาลาเปาร้อน นึ่งสดทุกวัน",
    description:
      "ซาลาเปาและขนมจีบทำสดทุกวัน ส่งไวในเมืองลำพูน พร้อมรับออร์เดอร์สั่งทำพิเศษ.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Itim&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen text-[var(--color-text)] antialiased">
        {children}
      </body>
    </html>
  );
}
