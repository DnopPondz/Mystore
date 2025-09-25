import Link from "next/link";

const customerLinks = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/cart", label: "ตะกร้าของฉัน" },
  { href: "/orders", label: "คำสั่งซื้อของฉัน" },
  // { href: "/login", label: "เข้าสู่ระบบ" },
];

const serviceLinks = [
  { href: "/#signature", label: "เมนูซิกเนเจอร์" },
  { href: "/#story", label: "เรื่องราวของร้าน" },
  { href: "/#faq", label: "คำถามที่พบบ่อย" },
  { href: "mailto:hello@sweetcravings.co", label: "ติดต่อทีมงาน" },
];

const socials = [
  { href: "https://www.facebook.com", label: "Facebook" },
  { href: "https://www.instagram.com", label: "Instagram" },
  { href: "https://line.me/R/ti/p/@sweetcravings", label: "LINE" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-gradient-to-br from-[var(--color-burgundy-dark)] via-[var(--color-burgundy)] to-[var(--color-burgundy-soft)] text-[var(--color-gold)]">
      <div className="relative">
        {/* <div className="absolute -top-6 left-6 hidden rotate-6 text-5xl opacity-40 md:block">
          🥐
        </div>
        <div className="absolute -top-8 right-10 hidden -rotate-6 text-4xl opacity-30 md:block">
          🧁
        </div> */}
        <div className="relative mx-auto flex max-w-screen-xl flex-col gap-12 px-6 py-14">
          <div className="grid gap-10 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-extrabold text-[var(--color-rose)]">
                Sweet Cravings Bakery
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--color-gold)]/80">
                อบขนมสดใหม่ทุกเช้า ส่งต่อความอบอุ่นแบบโฮมเมดถึงมือคุณ ทั้งครัวซองต์
                ชีสเค้ก บราวนี่ และเครื่องดื่มซิกเนเจอร์ที่เข้ากับทุกช่วงเวลา
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[var(--color-gold)]/80">
                {socials.map(({ href, label }) => (
                  <a
                    key={label}
                    href={href}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/70 px-4 py-2 font-medium text-[var(--color-gold)] shadow-sm transition hover:bg-[var(--color-burgundy)]"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span aria-hidden>🍰</span>
                    {label}
                  </a>
                ))}
              </div>
            </div>

            <div className="grid gap-10 sm:grid-cols-2 lg:col-span-2">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-rose)]">เมนูด่วน</h3>
                <ul className="mt-4 space-y-3 text-sm text-[var(--color-gold)]/80">
                  {customerLinks.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="transition hover:text-[var(--color-rose)]"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[var(--color-rose)]">บริการ & ข้อมูล</h3>
                <ul className="mt-4 space-y-3 text-sm text-[var(--color-gold)]/80">
                  {serviceLinks.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="transition hover:text-[var(--color-rose)]"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-[var(--color-rose)]/15 bg-[var(--color-burgundy)]/70 p-6 shadow-sm shadow-black/30 backdrop-blur">
              <h3 className="text-lg font-semibold text-[var(--color-rose)]">ติดต่อเรา</h3>
              <ul className="mt-4 space-y-3 text-sm text-[var(--color-gold)]/85">
                <li>
                  <span className="font-medium text-[var(--color-gold)]">โทร:</span>{" "}
                  <a href="tel:021234567" className="hover:text-[var(--color-rose)]">
                    02-123-4567
                  </a>
                </li>
                <li>
                  <span className="font-medium text-[var(--color-gold)]">อีเมล:</span>{" "}
                  <a href="mailto:hello@sweetcravings.co" className="hover:text-[var(--color-rose)]">
                    hello@sweetcravings.co
                  </a>
                </li>
                <li>
                  <span className="font-medium text-[var(--color-gold)]">ที่อยู่หน้าร้าน:</span>
                  <p className="mt-1 leading-relaxed text-[var(--color-gold)]/80">
                    88/8 ซอยหวานหอม แขวงขนมหวาน เขตวัฒนา กรุงเทพฯ 10110
                  </p>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-[var(--color-rose)]/15 bg-[var(--color-burgundy)]/70 p-6 shadow-sm shadow-black/30 backdrop-blur">
              <h3 className="text-lg font-semibold text-[var(--color-rose)]">เวลาเปิดให้บริการ</h3>
              <ul className="mt-4 space-y-3 text-sm text-[var(--color-gold)]/85">
                <li>จันทร์ - ศุกร์: 07:30 - 18:30 น.</li>
                <li>เสาร์ - อาทิตย์: 08:00 - 19:30 น.</li>
                <li>บริการจัดส่งในเขตกรุงเทพฯ และปริมณฑล</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-[var(--color-rose)]/15 bg-[var(--color-burgundy)]/70 p-6 shadow-sm shadow-black/30 backdrop-blur">
              <h3 className="text-lg font-semibold text-[var(--color-rose)]">รับข่าวสารสุดพิเศษ</h3>
              <p className="mt-4 text-sm text-[var(--color-gold)]/85">
                ลงทะเบียนเพื่อรับโปรโมชั่นเมนูใหม่ สูตรลับจากเชฟ และเวิร์กช็อปอบขนมก่อนใคร
              </p>
              <form className="mt-5 flex flex-col gap-3 sm:flex-row">
                <label htmlFor="newsletter" className="sr-only">
                  อีเมลของคุณ
                </label>
                <input
                  id="newsletter"
                  type="email"
                  placeholder="your@email.com"
                  className="w-full rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy)]/60 px-4 py-2 text-sm text-[var(--color-gold)] shadow-inner focus:border-[var(--color-rose)] focus:outline-none"
                />
                <button
                  type="button"
                  className="rounded-full bg-[var(--color-rose)] px-5 py-2 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-black/40 transition hover:bg-[var(--color-rose-dark)]"
                >
                  ติดตาม
                </button>
              </form>
              <p className="mt-3 text-xs text-[var(--color-gold)]/60">
                *เราจะส่งอีเมลไม่เกินสัปดาห์ละ 1 ครั้ง และคุณสามารถยกเลิกได้ทุกเมื่อ
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 border-t border-[var(--color-rose)]/20 pt-6 text-xs text-[var(--color-gold)]/70 sm:flex-row">
            <p>© {year} Sweet Cravings Bakery. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              {/* <Link href="/privacy" className="hover:text-[var(--color-rose-dark)]">
                นโยบายความเป็นส่วนตัว
              </Link>
              <Link href="/terms" className="hover:text-[var(--color-rose-dark)]">
                ข้อกำหนดการใช้งาน
              </Link> */}
              <a
                href="https://maps.google.com/?q=Sweet+Cravings+Bakery"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--color-rose)]"
              >
                เปิดดูแผนที่
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
