export const metadata = {
  title: "เกี่ยวกับเรา | Sweet Cravings",
  description:
    "เรื่องราวจากครัวเล็กๆ ที่อบขนมหอมกรุ่นทุกวัน เพื่อส่งต่อช่วงเวลาพิเศษให้คนที่คุณรัก",
};

const highlights = [
  {
    title: "อบสดใหม่ทุกวัน",
    description:
      "เราเริ่มต้นทุกเช้าด้วยการคัดสรรวัตถุดิบจากฟาร์มท้องถิ่นและอบขนมแบบคราฟต์ทีละชิ้นเพื่อคงความหอมกรุ่นและรสสัมผัสที่ลงตัว",
    icon: "🔥",
  },
  {
    title: "ทีมเชฟมากประสบการณ์",
    description:
      "เชฟและทีมขนมอบของเรามีประสบการณ์ในโรงแรมและคาเฟ่ชั้นนำทั่วเอเชีย ผสมผสานเทคนิคสมัยใหม่กับสูตรโฮมเมด",
    icon: "👩‍🍳",
  },
  {
    title: "ใส่ใจชุมชน",
    description:
      "เราเลือกใช้ผลผลิตตามฤดูกาล สนับสนุนเกษตรกรท้องถิ่น และลดการใช้พลาสติกแบบครั้งเดียวทิ้งในทุกขั้นตอน",
    icon: "🌱",
  },
];

const milestones = [
  {
    year: "2018",
    title: "เริ่มต้นจากครัวหลังบ้าน",
    description:
      "Sweet Cravings ถือกำเนิดจากการอบครัวซองต์แจกเพื่อนบ้านในเช้าวันอาทิตย์ ก่อนจะมีคนสั่งจองล่วงหน้าบนโซเชียลมีเดีย",
  },
  {
    year: "2020",
    title: "เปิดหน้าร้านแรก",
    description:
      "เราเปิดคาเฟ่เล็กๆ ย่านเมืองเก่า พร้อมครัวเปิดที่ลูกค้าสามารถเห็นกระบวนการอบขนมสดใหม่ทุกขั้นตอน",
  },
  {
    year: "2022",
    title: "ขยายบริการเดลิเวอรี",
    description:
      "ร่วมมือกับไรเดอร์ในชุมชนเพื่อส่งขนมอบภายใน 2 ชั่วโมง และเพิ่มบริการเซตของขวัญตามเทศกาล",
  },
  {
    year: "2024",
    title: "ก้าวสู่ดิจิทัลเต็มรูปแบบ",
    description:
      "ยกระดับประสบการณ์สั่งขนมออนไลน์ด้วยเว็บไซต์ใหม่ รองรับการชำระเงินพร้อมเพย์และสั่งทำพิเศษ",
  },
];

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#ffe9d6] via-[#fff7f0] to-white" aria-hidden />

      <section className="relative max-w-screen-xl mx-auto px-6 lg:px-10 pt-16 pb-20 space-y-12">
        <div className="grid gap-12 lg:grid-cols-[3fr_2fr] items-start">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-sm font-semibold text-[var(--color-rose-dark)] shadow">
              Sweet Cravings Story
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-[var(--color-choco)]">
              จากเตาอบเล็กๆ สู่แบรนด์ขนมที่คนเมืองหลงรัก
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-choco)]/80">
              ทุกเมนูของเราเริ่มจากความตั้งใจจะสร้างช่วงเวลาพิเศษให้คนที่คุณรัก ไม่ว่าจะเป็นครัวซองต์อบใหม่ เค้กโฮมเมด หรือเมนูตามฤดูกาลที่ออกแบบร่วมกับลูกค้า เราเชื่อว่าความสุขเริ่มต้นได้จากของหวานดีๆ ชิ้นหนึ่ง
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/90 p-6 shadow-lg shadow-[#f0658320]">
                <h2 className="text-xl font-semibold text-[var(--color-choco)]">ปรัชญาของเรา</h2>
                <p className="mt-3 text-sm text-[var(--color-choco)]/70">
                  อบด้วยหัวใจ เลือกวัตถุดิบที่ดีที่สุด และสร้างสรรค์ประสบการณ์ที่เป็นมิตรกับทุกคนในชุมชน
                </p>
              </div>
              <div className="rounded-3xl bg-white/90 p-6 shadow-lg shadow-[#f0658320]">
                <h2 className="text-xl font-semibold text-[var(--color-choco)]">บริการของเรา</h2>
                <ul className="mt-3 space-y-2 text-sm text-[var(--color-choco)]/70 list-disc list-inside">
                  <li>ขนมอบประจำวันและเมนูตามเทศกาล</li>
                  <li>เซตของขวัญองค์กรและงานอีเวนต์</li>
                  <li>บริการจัดเลี้ยงและรับทำขนมพิเศษ</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="relative w-full max-w-sm rounded-[48%] bg-gradient-to-br from-white via-[#ffe9f2] to-[#ffe1c9] p-10 shadow-2xl shadow-[#f0658325]">
              <div className="absolute -top-6 right-0 h-20 w-20 rounded-full bg-[#fbd8a4]/70 blur-2xl" />
              <div className="absolute -bottom-8 left-6 h-24 w-24 rounded-full bg-[#f8acc5]/70 blur-2xl" />
              <div className="space-y-4 text-center">
                <p className="text-sm font-semibold tracking-[0.2em] text-[var(--color-rose)] uppercase">
                  Since 2018
                </p>
                <p className="text-3xl font-black text-[var(--color-choco)]">อบทุกวันด้วยความรัก</p>
                <p className="text-sm text-[var(--color-choco)]/70">
                  “เราอยากให้ทุกคำที่คุณกัดเต็มไปด้วยรอยยิ้มและความทรงจำดีๆ เสมอ” — เชฟมิว ผู้ก่อตั้ง Sweet Cravings
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-white/80">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-16">
          <h2 className="text-3xl font-bold text-[var(--color-choco)]">สิ่งที่เราภูมิใจ</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl bg-white p-8 shadow-md shadow-[#f0658315] flex flex-col gap-4"
              >
                <span className="text-3xl">{item.icon}</span>
                <h3 className="text-xl font-semibold text-[var(--color-choco)]">{item.title}</h3>
                <p className="text-sm text-[var(--color-choco)]/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative max-w-screen-xl mx-auto px-6 lg:px-10 py-16">
        <div className="rounded-3xl bg-white/90 p-10 shadow-xl shadow-[#f0658315]">
          <h2 className="text-3xl font-bold text-[var(--color-choco)]">เส้นทางของเรา</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {milestones.map((item) => (
              <div key={item.year} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-gradient-to-br from-[#f06583] to-[#f6c34a] px-4 py-2 text-sm font-semibold text-white shadow">
                    {item.year}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[var(--color-choco)]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[var(--color-choco)]/70">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-gradient-to-r from-[#ffe1ea] via-[#ffe9d6] to-[#ffe1c9]">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-16 flex flex-col gap-10 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold text-[var(--color-choco)]">มารู้จักทีมของเรา</h2>
            <p className="text-sm text-[var(--color-choco)]/80">
              ทีมเล็กๆ ที่ประกอบด้วยเชฟ นักชิม นักออกแบบ และบาริสต้า ทุกคนมีเป้าหมายเดียวกันคือสร้างรอยยิ้มผ่านขนมชิ้นพิเศษ
            </p>
            <ul className="space-y-3 text-sm text-[var(--color-choco)]/70 list-disc list-inside">
              <li>เชฟมิว — ผู้ก่อตั้งและเชฟขนมอบ ดูแลสูตรเฉพาะของร้าน</li>
              <li>เชฟพีท — ที่ปรึกษาเมนูสุขภาพและวีแกน</li>
              <li>ทีมบริการลูกค้า — พร้อมช่วยออกแบบขนมสำหรับทุกโอกาส</li>
            </ul>
          </div>
          <div className="flex-1">
            <div className="rounded-3xl bg-white/90 p-8 shadow-lg shadow-[#f0658320]">
              <h3 className="text-xl font-semibold text-[var(--color-choco)]">อยากร่วมงานกับเรา?</h3>
              <p className="mt-3 text-sm text-[var(--color-choco)]/70">
                เรากำลังมองหาพาร์ตเนอร์ด้านวัตถุดิบ บาริสต้า และทีมจัดเลี้ยงที่รักในการสร้างสรรค์ประสบการณ์ขนมหวาน ติดต่อเราได้ที่
                <a href="mailto:hello@sweetcravings.co" className="font-medium text-[var(--color-rose-dark)]">
                  {" "}hello@sweetcravings.co
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
