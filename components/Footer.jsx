import Link from "next/link";

const customerLinks = [
  { href: "/", label: "หน้าร้านออนไลน์" },
  { href: "/cart", label: "ตะกร้าช้อปปิ้ง" },
  { href: "/orders", label: "ติดตามคำสั่งซื้อ" },
];

const serviceLinks = [
  { href: "/about", label: "รู้จัก Steaming Bun" },
  { href: "/preorder", label: "จองทำล่วงหน้า" },
  { href: "/#faq", label: "ถาม-ตอบ" },
  { href: "mailto:hello@sweetcravings.co", label: "อีเมลฝ่ายบริการ" },
];

const socials = [
  { href: "https://www.facebook.com", label: "Facebook" },
  { href: "https://www.instagram.com", label: "Instagram" },
  { href: "https://line.me/R/ti/p/@sweetcravings", label: "LINE" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-[var(--color-rose-dark)] text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(14,165,160,0.35),transparent_55%),radial-gradient(circle_at_90%_5%,rgba(255,135,70,0.28),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-screen-xl flex-col gap-12 px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold uppercase tracking-[0.3em] text-teal-100">
                Steaming Bun Market
              </h2>
              <p className="text-base font-semibold text-white">
                ซาลาเปาและขนมจีบโฮมเมด ส่งตรงจากลำพูนถึงบ้านคุณ
              </p>
              <p className="max-w-xl text-sm text-white/75">
                เรานึ่งสดทุกเช้า จัดคิวส่งตามเวลาที่ลูกค้าต้องการ และคัดวัตถุดิบที่ยั่งยืนจากชุมชนเพื่อรสชาติที่ดีและสังคมที่ดีไปพร้อมกัน
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
                {socials.map(({ href, label }) => (
                  <a
                    key={label}
                    href={href}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-medium transition hover:bg-white/20"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span aria-hidden>✨</span>
                    {label}
                  </a>
                ))}
              </div>
            </div>

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <h3 className="text-lg font-semibold text-white">เมนูลัด</h3>
                <ul className="mt-4 space-y-3 text-sm text-white/75">
                  {customerLinks.map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="transition hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">บริการลูกค้า</h3>
                <ul className="mt-4 space-y-3 text-sm text-white/75">
                  {serviceLinks.map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="transition hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <h3 className="text-lg font-semibold text-white">บริการช่วยเหลือด่วน</h3>
              <ul className="space-y-3 text-sm text-white/80">
                <li className="flex items-start gap-3">
                  <span aria-hidden>☎️</span>
                  <a href="tel:0612674523" className="hover:text-white">
                    061-267-4523 (06:00-20:00 น.)
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span aria-hidden>📧</span>
                  <a href="mailto:hello@sweetcravings.co" className="hover:text-white">
                    hello@sweetcravings.co
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span aria-hidden>📍</span>
                  <span>
                    71/1 ตำบลริมปิง อำเภอเมือง จังหวัดลำพูน 51000
                  </span>
                </li>
              </ul>
              <div className="rounded-2xl border border-white/20 bg-white/5 p-4 text-sm text-white/80">
                <p className="font-semibold text-white">เวลาเปิดเตานึ่ง</p>
                <p className="mt-2">จันทร์-ศุกร์ 07:00-18:30 น.</p>
                <p>เสาร์-อาทิตย์ 08:00-19:30 น.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/10 p-6 text-sm text-white/80 backdrop-blur md:grid-cols-[1.3fr_1fr]">
            <div>
              <h3 className="text-base font-semibold text-white">สมัครรับข่าวจากเตานึ่ง</h3>
              <p className="mt-2 text-sm text-white/70">
                รับแจ้งเมนูใหม่ โปรโมชั่น และรอบนึ่งพิเศษก่อนใคร สัปดาห์ละไม่เกิน 1 ฉบับ
              </p>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter" className="sr-only">
                อีเมลของคุณ
              </label>
              <input
                id="newsletter"
                type="email"
                placeholder="name@email.com"
                className="w-full rounded-2xl border border-white/20 bg-white/80 px-4 py-2 text-sm text-[var(--color-rose-dark)] placeholder:text-[var(--color-rose-dark)]/50 focus:border-white focus:outline-none"
              />
              <button
                type="button"
                className="rounded-2xl bg-[var(--color-gold)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(255,135,70,0.35)] transition hover:bg-[#ff7125]"
              >
                ติดตาม
              </button>
            </form>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 border-t border-white/15 pt-6 text-xs text-white/70 sm:flex-row">
            <p>© {year} Steaming Bun Market. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://maps.google.com/?q=Steaming+Bun+Lamphun"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                เปิดดูแผนที่ร้าน
              </a>
              <a href="mailto:hello@sweetcravings.co" className="hover:text-white">
                ติดต่อฝ่ายบริการลูกค้า
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
