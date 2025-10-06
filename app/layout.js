import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://steamingbun.example.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Steaming Bun Market | ซาลาเปาไส้แน่นส่งตรงถึงบ้าน",
    template: "%s | Steaming Bun Market",
  },
  description:
    "ช้อปซาลาเปาและขนมจีบโฮมเมดจาก Steaming Bun ผ่านหน้าร้านออนไลน์ เลือกแพ็กเกจ จองเวลาจัดส่ง และเช็กรีวิวลูกค้าจริงได้ในที่เดียว.",
  keywords: [
    "ซาลาเปา",
    "ขนมจีบ",
    "เดลิเวอรี",
    "ร้านขายของออนไลน์",
    "ของกินลำพูน",
    "อาหารพร้อมทาน",
    "สั่งซาลาเปา",
    "steaming bun",
  ],
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: siteUrl,
    title: "Steaming Bun Market | ซาลาเปาไส้แน่นส่งตรงถึงบ้าน",
    description:
      "ช้อปเมนูซาลาเปา ขนมจีบ และชุดจัดเลี้ยงจากร้านโฮมเมดประจำลำพูน พร้อมตารางนึ่งและบริการจัดส่งตรงเวลา.",
    siteName: "Steaming Bun Market",
  },
  twitter: {
    card: "summary_large_image",
    title: "Steaming Bun Market | ซาลาเปาไส้แน่นส่งตรงถึงบ้าน",
    description:
      "อัปเดตเมนูอบสด โปรโมชั่น และรีวิวลูกค้าจริงจากร้าน Steaming Bun ในหน้าเดียว.",
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
          href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=Kanit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen text-[var(--color-text)] antialiased">
        {children}
      </body>
    </html>
  );
}
