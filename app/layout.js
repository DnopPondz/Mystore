import "./globals.css";

export const metadata = {
  title: "Sweet Cravings Bakery",
  description: "เบเกอรี่โฮมเมด กลิ่นหอมอบอุ่น พร้อมส่งถึงบ้านคุณ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-[var(--color-cream)] text-[var(--color-choco)]">
        {children}
      </body>
    </html>
  );
}
