import "./globals.css";

export const metadata = {
  title: "Sweet Cravings Bakery",
  description: "เบเกอรี่โฮมเมด กลิ่นหอมอบอุ่น พร้อมส่งถึงบ้านคุณ",
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
