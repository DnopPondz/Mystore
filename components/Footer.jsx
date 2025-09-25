import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";

const customerLinks = [
  { href: "/#menu", label: "เมนูวันนี้" },
  { href: "/#signature", label: "เมนูซิกเนเจอร์" },
  { href: "/#reviews", label: "รีวิวลูกค้า" },
  { href: "/cart", label: "ตะกร้าของฉัน" },
  { href: "/orders", label: "คำสั่งซื้อของฉัน" },
];

const serviceLinks = [
  { href: "/preorder", label: "สั่งทำพิเศษ" },
  { href: "/#delivery", label: "พื้นที่จัดส่ง" },
  { href: "/faq", label: "คำถามที่พบบ่อย" },
  { href: "/policies", label: "นโยบาย & การจัดส่ง" },
];

const socials = [
  { href: "https://www.facebook.com", label: "Facebook", icon: "📘" },
  { href: "https://www.instagram.com", label: "Instagram", icon: "📸" },
  { href: "https://line.me/R/ti/p/@baolamphun", label: "LINE", icon: "💬" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-gradient-to-br from-[var(--color-burgundy-dark)] via-[var(--color-burgundy)] to-[var(--color-burgundy-soft)] text-[var(--color-gold)]">
      <div className="relative mx-auto flex max-w-screen-xl flex-col gap-12 px-6 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr_1fr]">
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-[var(--color-rose)]">Bao Lamphun</h2>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--color-gold)]/80">
              ซาลาเปาและขนมจีบนึ่งสดทุกวันจากครัวในอำเภอเมืองลำพูน ใช้วัตถุดิบคัดพิเศษ ปั้นสดทีละลูก และพร้อมส่งความอร่อยถึงบ้านคุณตั้งแต่เช้าตรู่
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-gold)]/80">
              {socials.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/70 px-4 py-2 font-medium text-[var(--color-gold)] shadow-sm transition hover:bg-[var(--color-burgundy)]"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span aria-hidden>{icon}</span>
                  {label}
                </a>
              ))}
            </div>
            <div className="rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/60 p-6 shadow-inner shadow-black/30 backdrop-blur">
              <h3 className="text-lg font-semibold text-[var(--color-rose)]">รับข่าวสารจากครัว Bao</h3>
              <NewsletterForm className="mt-4" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-rose)]">เมนูด่วน</h3>
            <ul className="space-y-3 text-sm text-[var(--color-gold)]/80">
              {customerLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="transition hover:text-[var(--color-rose)]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-rose)]">บริการ & ข้อมูล</h3>
            <ul className="space-y-3 text-sm text-[var(--color-gold)]/80">
              {serviceLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="transition hover:text-[var(--color-rose)]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-[var(--color-rose)]/15 bg-[var(--color-burgundy)]/70 p-6 shadow-sm shadow-black/30 backdrop-blur">
            <h3 className="text-lg font-semibold text-[var(--color-rose)]">ติดต่อเรา</h3>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-gold)]/85">
              <li>
                <span className="font-medium text-[var(--color-gold)]">โทร:</span>{" "}
                <a href="tel:0612674523" className="hover:text-[var(--color-rose)]">
                  061-267-4523
                </a>
              </li>
              <li>
                <span className="font-medium text-[var(--color-gold)]">อีเมล:</span>{" "}
                <a href="mailto:hello@baolamphun.co" className="hover:text-[var(--color-rose)]">
                  hello@baolamphun.co
                </a>
              </li>
              <li>
                <span className="font-medium text-[var(--color-gold)]">LINE:</span>{" "}
                <a href="https://line.me/R/ti/p/@baolamphun" className="hover:text-[var(--color-rose)]" target="_blank" rel="noreferrer">
                  @baolamphun
                </a>
              </li>
              <li>
                <span className="font-medium text-[var(--color-gold)]">ที่หน้าร้าน:</span>
                <p className="mt-1 leading-relaxed text-[var(--color-gold)]/80">
                  55/3 ซอยรอบเมือง 7 ตำบลในเมือง อำเภอเมือง จังหวัดลำพูน 51000
                </p>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-[var(--color-rose)]/15 bg-[var(--color-burgundy)]/70 p-6 shadow-sm shadow-black/30 backdrop-blur">
            <h3 className="text-lg font-semibold text-[var(--color-rose)]">เวลาเปิดให้บริการ</h3>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-gold)]/85">
              <li>จันทร์ - เสาร์: 06:30 - 18:30 น.</li>
              <li>อาทิตย์: 07:00 - 17:00 น.</li>
              <li>จัดส่งรอบเช้า 07:00 น. และรอบบ่าย 14:00 น.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-[var(--color-rose)]/15 bg-[var(--color-burgundy)]/70 p-6 shadow-sm shadow-black/30 backdrop-blur">
            <h3 className="text-lg font-semibold text-[var(--color-rose)]">Bao Club สะสมแต้ม</h3>
            <p className="mt-4 text-sm text-[var(--color-gold)]/85">
              สมัครสมาชิกเพื่อสะสมแต้มทุกยอดซื้อ แลกรับส่วนลดและสิทธิ์จองเมนูพิเศษก่อนใคร ตรวจสอบคะแนนได้ที่หน้าคำสั่งซื้อของคุณ
            </p>
            <Link
              href="/#loyalty"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy)]/70 px-4 py-2 text-xs font-semibold text-[var(--color-rose)] shadow transition hover:bg-[var(--color-burgundy)]"
            >
              ดูสิทธิประโยชน์ Bao Club
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-[var(--color-rose)]/20 pt-6 text-xs text-[var(--color-gold)]/70 sm:flex-row">
          <p>© {year} Bao Lamphun. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/policies" className="hover:text-[var(--color-rose)]">
              นโยบายความเป็นส่วนตัว & การจัดส่ง
            </Link>
            <a
              href="https://maps.google.com/?q=Bao+Lamphun"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--color-rose)]"
            >
              เปิดดูแผนที่
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
