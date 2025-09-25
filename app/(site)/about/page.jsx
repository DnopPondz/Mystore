export const metadata = {
  title: "เกี่ยวกับเรา | Bao Lamphun",
  description:
    "จากสูตรซาลาเปาในครอบครัวสู่ร้านซาลาเปาและขนมจีบประจำเมืองลำพูน พร้อมเสิร์ฟความอร่อยนึ่งสดทุกวัน",
};

const highlights = [
  {
    title: "นึ่งสดตลอดวัน",
    description:
      "เราเตรียมซาลาเปาและขนมจีบทีละเข่ง เพื่อให้ลูกค้าได้ลิ้มรสไส้แน่นๆ กับแป้งนุ่มๆ ที่ยังอุ่นอยู่เสมอ",
    icon: "🥟",
  },
  {
    title: "ไส้หลากหลายจากสูตรครอบครัว",
    description:
      "หมูสับ หมูสับไข่เค็ม ครีม ถั่วดำ รวมถึงไส้พิเศษที่คิดค้นตามฤดูกาล ทุกสูตรผ่านการปรับจนได้รสชาติที่คนลำพูนคุ้นเคย",
    icon: "🍥",
  },
  {
    title: "บริการเป็นกันเอง",
    description:
      "เราพร้อมส่งถึงบ้านในอำเภอเมืองลำพูนและยินดีออกแบบชุดซาลาเปา-ขนมจีบสำหรับงานบุญ งานประชุม และโอกาสพิเศษ",
    icon: "🤝",
  },
];

const milestones = [
  {
    year: "2014",
    title: "สูตรซาลาเปาในบ้าน",
    description:
      "ครอบครัวเริ่มนึ่งซาลาเปาแจกญาติพี่น้องในอำเภอเมืองลำพูน ปรับสูตรแป้งให้นุ่มและไส้หมูแน่นถูกใจทุกวัย",
  },
  {
    year: "2017",
    title: "เปิดร้านหน้าตลาด",
    description:
      "ตั้งซุ้ม Bao Lamphun ใกล้ตลาดกาดกองต้า เสิร์ฟซาลาเปาและขนมจีบไส้หมูและกุ้งร้อนๆ ให้คนทำงานตอนเช้า",
  },
  {
    year: "2021",
    title: "เพิ่มบริการเดลิเวอรี",
    description:
      "ร่วมมือกับไรเดอร์ในชุมชน ส่งซาลาเปาและขนมจีบภายในเขตอำเภอเมือง พร้อมเซตประชุมและของฝาก",
  },
  {
    year: "2024",
    title: "ก้าวสู่ดิจิทัล",
    description:
      "เปิดระบบสั่งจองออนไลน์ รองรับการแจ้งไส้พิเศษและจัดส่งถึงบ้านในรหัสไปรษณีย์ 51000 ได้สะดวกกว่าเดิม",
  },
];

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#fff0e1] via-[#fff8ef] to-white" aria-hidden />

      <section className="relative max-w-screen-xl mx-auto px-6 lg:px-10 pt-16 pb-20 space-y-12">
        <div className="grid gap-12 lg:grid-cols-[3fr_2fr] items-start">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-sm font-semibold text-[var(--color-rose-dark)] shadow">
              Bao Lamphun Story
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-[var(--color-choco)]">
              จากครัวครอบครัวสู่ร้านซาลาเปาคู่เมืองลำพูน
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-choco)]/80">
              Bao Lamphun เกิดจากความตั้งใจอยากให้คนลำพูนได้อร่อยกับซาลาเปาและขนมจีบไส้แน่นในทุกวันสำคัญ เรานึ่งสดใหม่ทีละรอบด้วยวัตถุดิบที่คัดเอง เพื่อให้ได้รสสัมผัสที่นุ่มและกลิ่นหอมเหมือนทานที่บ้าน
            </p>
            <p className="text-sm text-[var(--color-choco)]/70">
              ร้านของเราตั้งอยู่ที่อำเภอเมือง จังหวัดลำพูน 51000 พร้อมต้อนรับและจัดส่งความอร่อยถึงหน้าบ้านคุณ
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/90 p-6 shadow-lg shadow-[rgba(240,200,105,0.2)]">
                <h2 className="text-xl font-semibold text-[var(--color-choco)]">ปรัชญาของเรา</h2>
                <p className="mt-3 text-sm text-[var(--color-choco)]/70">
                  นึ่งด้วยหัวใจ เลือกเนื้อหมูและกุ้งสดใหม่ และรักษามาตรฐานความสะอาดในทุกขั้นตอน
                </p>
              </div>
              <div className="rounded-3xl bg-white/90 p-6 shadow-lg shadow-[rgba(240,200,105,0.2)]">
                <h2 className="text-xl font-semibold text-[var(--color-choco)]">บริการของเรา</h2>
                <ul className="mt-3 space-y-2 text-sm text-[var(--color-choco)]/70 list-disc list-inside">
                  <li>ซาลาเปาและขนมจีบประจำวัน พร้อมไส้ตามฤดูกาล</li>
                  <li>ชุดของฝากและเซตประชุมในอำเภอเมืองลำพูน</li>
                  <li>รับทำไส้พิเศษสำหรับงานบุญและโอกาสสำคัญ</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="relative w-full max-w-sm rounded-[48%] bg-gradient-to-br from-white via-[#fff4e6] to-[#ffe8d2] p-10 shadow-2xl shadow-[rgba(240,200,105,0.25)]">
              <div className="absolute -top-6 right-0 h-20 w-20 rounded-full bg-[#fbd8a4]/70 blur-2xl" />
              <div className="absolute -bottom-8 left-6 h-24 w-24 rounded-full bg-[#f5be9a]/70 blur-2xl" />
              <div className="space-y-4 text-center">
                <p className="text-sm font-semibold tracking-[0.2em] text-[var(--color-rose)] uppercase">
                  Since 2014
                </p>
                <p className="text-3xl font-black text-[var(--color-choco)]">นึ่งทุกเข่งด้วยความตั้งใจ</p>
                <p className="text-sm text-[var(--color-choco)]/70">
                  “ซาลาเปาหนึ่งลูกต้องทำให้ทั้งครอบครัวอบอุ่นใจ” — พี่มีน ผู้ก่อตั้ง Bao Lamphun
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
                className="rounded-3xl bg-white p-8 shadow-md shadow-[rgba(240,200,105,0.08)] flex flex-col gap-4"
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
        <div className="rounded-3xl bg-white/90 p-10 shadow-xl shadow-[rgba(240,200,105,0.08)]">
          <h2 className="text-3xl font-bold text-[var(--color-choco)]">เส้นทางของเรา</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {milestones.map((item) => (
              <div key={item.year} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-gradient-to-br from-[var(--color-rose)] to-[var(--color-gold)] px-4 py-2 text-sm font-semibold text-white shadow">
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

      <section className="relative bg-gradient-to-r from-[#fff0e1] via-[#fde7b8] to-[#fbd8a4]">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-16 flex flex-col gap-10 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold text-[var(--color-choco)]">มารู้จักทีมของเรา</h2>
            <p className="text-sm text-[var(--color-choco)]/80">
              ทีมเล็กๆ ของ Bao Lamphun ประกอบด้วยเชฟซาลาเปา มือปั้นขนมจีบ และทีมจัดส่งที่รู้ทุกซอกซอยในอำเภอเมืองลำพูน เป้าหมายเดียวกันคือดูแลทุกออเดอร์ให้ถึงมือลูกค้าอย่างอบอุ่น
            </p>
            <ul className="space-y-3 text-sm text-[var(--color-choco)]/70 list-disc list-inside">
              <li>พี่มีน — ผู้ก่อตั้งและเชฟซาลาเปา ดูแลสูตรไส้หมูและหมูไข่เค็ม</li>
              <li>ปาล์ม — มือปั้นขนมจีบกุ้งและหมู คุมคุณภาพทุกลูก</li>
              <li>ทีมบริการลูกค้า — แนะนำชุดของฝากและช่วยวางแผนงานบุญ</li>
            </ul>
          </div>
          <div className="flex-1">
            <div className="rounded-3xl bg-white/90 p-8 shadow-lg shadow-[rgba(240,200,105,0.2)]">
              <h3 className="text-xl font-semibold text-[var(--color-choco)]">อยากร่วมงานกับเรา?</h3>
              <p className="mt-3 text-sm text-[var(--color-choco)]/70">
                เรากำลังมองหาพาร์ตเนอร์ด้านวัตถุดิบ เครื่องนึ่ง และทีมจัดส่งในลำพูนที่อยากเติบโตไปด้วยกัน ติดต่อเราได้ที่
                <a href="mailto:hello@baolamphun.co" className="font-medium text-[var(--color-rose-dark)]">
                  {" "}hello@baolamphun.co
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
