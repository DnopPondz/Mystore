export const metadata = {
  title: "เกี่ยวกับ Steaming Bun | เรื่องราวและทีมงาน",
  description:
    "รู้จักที่มาของ Steaming Bun ซาลาเปาโฮมเมดในลำพูน วิธีการคัดวัตถุดิบ ทีมงาน และพัฒนาการจากครัวบ้านสู่หน้าร้านออนไลน์.",
};

const milestones = [
  {
    year: "2014",
    title: "เริ่มต้นจากครัวครอบครัว",
    description:
      "ทดลองสูตรแป้งกับญาติพี่น้องในอำเภอเมืองลำพูน ปรับสูตรให้เนียนนุ่มและไส้หมูแน่นถูกใจทุกวัย",
  },
  {
    year: "2017",
    title: "เปิดซุ้มหน้าตลาด",
    description:
      "ตั้งเตานึ่งหน้า ตลาดกาดกองต้า บริการซาลาเปาและขนมจีบร้อนๆ สำหรับคนทำงานยามเช้า",
  },
  {
    year: "2021",
    title: "เพิ่มทีมจัดส่ง",
    description:
      "ร่วมมือกับไรเดอร์ในชุมชนเพื่อส่งซาลาเปาถึงบ้านภายใน 45 นาที พร้อมชุดประชุมและของฝาก",
  },
  {
    year: "2024",
    title: "เปิดหน้าร้านออนไลน์",
    description:
      "พัฒนาระบบสั่งซื้อและจองเวลาจัดส่งออนไลน์ รองรับการชำระเงินและใบเสนอราคาสำหรับงานองค์กร",
  },
];

const commitments = [
  {
    icon: "🌱",
    title: "ใช้วัตถุดิบจากชุมชน",
    description: "เลือกหมูและกุ้งจากฟาร์มที่ผ่านการรับรองในภาคเหนือ พร้อมผักสดจากเกษตรกรลำพูน",
  },
  {
    icon: "🧼",
    title: "ความสะอาดตามมาตรฐาน HACCP",
    description: "เตรียมวัตถุดิบในห้องเย็นและจัดการปลอดภัยทุกขั้นตอน พร้อมตรวจวัดอุณหภูมิทุกรอบ",
  },
  {
    icon: "🤝",
    title: "บริการที่ปรึกษาการจัดเลี้ยง",
    description: "ให้คำแนะนำเรื่องจำนวนชุด ออกแบบแพ็กเกจ และจัดคิวส่งให้เหมาะกับช่วงเวลาของลูกค้า",
  },
  {
    icon: "♻️",
    title: "ลดพลาสติกด้วยบรรจุภัณฑ์รักษ์โลก",
    description: "เลือกใช้กล่องเยื่อไผ่และช้อนส้อมไม้ ลดการใช้พลาสติกแบบครั้งเดียวทิ้งกว่า 60%",
  },
];

const team = [
  {
    name: "พี่มีน",
    role: "เชฟและผู้ก่อตั้ง",
    bio: "ดูแลสูตรไส้หมู หมูไข่เค็ม และคุมคุณภาพการนึ่งทุกเช้า",
  },
  {
    name: "ปาล์ม",
    role: "หัวหน้าทีมปั้นขนมจีบ",
    bio: "จัดคิวเตรียมวัตถุดิบและตรวจน้ำหนักขนมจีบให้ได้มาตรฐานทุกเข่ง",
  },
  {
    name: "ทีมบริการลูกค้า",
    role: "ที่ปรึกษาเมนู",
    bio: "คอยตอบคำถามเรื่องแพ็กเกจ จัดเวลาส่ง และเตรียมใบเสนอราคาสำหรับลูกค้าองค์กร",
  },
];

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-[var(--color-cream)] text-[var(--color-rose-dark)]">
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(14,165,160,0.35),transparent_60%),radial-gradient(circle_at_90%_20%,rgba(255,135,70,0.25),transparent_60%)]" />
        <div className="mx-auto grid max-w-screen-xl gap-12 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-burgundy)]/30 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-burgundy-dark)]">
              Our Story
            </span>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              จากครัวบ้านสู่ตลาดซาลาเปาออนไลน์ประจำลำพูน
            </h1>
            <p className="text-base text-[var(--color-rose-dark)]/75 sm:text-lg">
              Steaming Bun เกิดจากความตั้งใจของครอบครัวที่อยากแบ่งปันซาลาเปาโฮมเมดให้คนลำพูนได้ทานทุกวันสำคัญ วันนี้เราพัฒนาระบบออนไลน์ให้คุณเลือกแพ็ก จองเวลาส่ง และติดตามสถานะได้ในที่เดียว
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-3xl border border-[var(--color-burgundy)]/25 bg-white/85 p-6 shadow-[0_22px_46px_-28px_rgba(20,95,75,0.3)]">
                <h2 className="text-lg font-semibold text-[var(--color-rose-dark)]">พันธกิจของเรา</h2>
                <p className="mt-2 text-sm text-[var(--color-rose-dark)]/70">
                  เสิร์ฟซาลาเปานึ่งสดที่ดีต่อร่างกายและชุมชน พร้อมบริการที่จริงใจและตรงเวลา
                </p>
              </div>
              <div className="rounded-3xl border border-[var(--color-burgundy)]/25 bg-white/85 p-6 shadow-[0_22px_46px_-28px_rgba(20,95,75,0.3)]">
                <h2 className="text-lg font-semibold text-[var(--color-rose-dark)]">บริการของเรา</h2>
                <ul className="mt-3 space-y-2 list-inside list-disc text-sm text-[var(--color-rose-dark)]/70">
                  <li>เมนูพร้อมส่งและ Pre-order สำหรับงานพิเศษ</li>
                  <li>ชุดของฝากและเซ็ตประชุมพร้อมแพ็กเกจ</li>
                  <li>ทีมที่ปรึกษาในการจัดเลี้ยงแบบครบวงจร</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-6 right-0 h-24 w-24 rounded-full bg-[var(--color-rose)]/20 blur-3xl" />
            <div className="absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-[var(--color-gold)]/30 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between rounded-[40px] border border-[var(--color-burgundy)]/30 bg-white/85 p-10 text-sm text-[var(--color-rose-dark)] shadow-[0_32px_60px_-32px_rgba(20,95,75,0.35)]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-rose)]">
                  สิ่งที่เรายึดมั่น
                </p>
                <p className="mt-4 text-2xl font-bold">
                  นึ่งสดทุกวัน คุมคุณภาพทุกเข่ง และสื่อสารตรงไปตรงมา
                </p>
              </div>
              <div className="space-y-2 text-xs text-[var(--color-rose-dark)]/70">
                <p>• ระบบจัดการคิวจัดส่งแบบเรียลไทม์</p>
                <p>• ห้องครัวควบคุมอุณหภูมิและบันทึก HACCP</p>
                <p>• รายงานการจัดส่งและการใช้วัสดุที่เป็นมิตรต่อสิ่งแวดล้อม</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/85 px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-screen-xl">
          <h2 className="text-3xl font-bold text-[var(--color-rose-dark)]">ความตั้งใจของเรา</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {commitments.map(({ icon, title, description }) => (
              <div
                key={title}
                className="flex h-full flex-col gap-4 rounded-3xl border border-[var(--color-burgundy)]/25 bg-white/90 p-6 text-sm text-[var(--color-rose-dark)] shadow-[0_22px_48px_-28px_rgba(20,95,75,0.28)]"
              >
                <span className="text-3xl" aria-hidden>
                  {icon}
                </span>
                <h3 className="text-lg font-semibold text-[var(--color-rose-dark)]">{title}</h3>
                <p className="text-[var(--color-rose-dark)]/70">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-16 lg:px-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_85%,rgba(14,165,160,0.25),transparent_55%),radial-gradient(circle_at_90%_10%,rgba(255,135,70,0.25),transparent_60%)]" />
        <div className="mx-auto max-w-screen-xl rounded-3xl border border-[var(--color-burgundy)]/20 bg-white/90 p-10 shadow-[0_28px_52px_-32px_rgba(20,95,75,0.32)]">
          <h2 className="text-3xl font-bold text-[var(--color-rose-dark)]">เส้นทางการเติบโต</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {milestones.map(({ year, title, description }) => (
              <div key={year} className="flex gap-5 rounded-3xl border border-[var(--color-burgundy)]/20 bg-white/85 p-6 shadow-sm">
                <div>
                  <span className="inline-flex rounded-2xl bg-[var(--color-rose)] px-3 py-1 text-sm font-semibold text-white shadow">
                    {year}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-rose-dark)]">{title}</h3>
                  <p className="mt-2 text-sm text-[var(--color-rose-dark)]/70">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/80 px-6 py-16 lg:px-10">
        <div className="mx-auto grid max-w-screen-xl gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-[var(--color-rose-dark)]">ทีมงานที่อยู่หลังเตานึ่ง</h2>
            <p className="text-sm text-[var(--color-rose-dark)]/70">
              ทีมเล็กๆ ที่ทำงานร่วมกันทุกเช้าตั้งแต่ 05:00 น. เพื่อให้ทุกคำที่คุณชิมยังคงมาตรฐานเดียวกัน
            </p>
            <ul className="space-y-3 text-sm text-[var(--color-rose-dark)]/70">
              <li>• ใช้ระบบบันทึกการผลิตเพื่อควบคุมคุณภาพ</li>
              <li>• ทีมไรเดอร์ผ่านการอบรมเรื่องการรักษาอุณหภูมิอาหาร</li>
              <li>• มีตารางซ้อมสูตรใหม่และทดสอบแพ็กเกจทุกไตรมาส</li>
            </ul>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map(({ name, role, bio }) => (
              <div
                key={name}
                className="rounded-3xl border border-[var(--color-burgundy)]/20 bg-white/90 p-6 text-sm text-[var(--color-rose-dark)] shadow-[0_20px_44px_-30px_rgba(20,95,75,0.28)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-cream-soft)] text-2xl">
                  🥟
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--color-rose-dark)]">{name}</h3>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-rose)]">{role}</p>
                <p className="mt-3 text-sm text-[var(--color-rose-dark)]/70">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
