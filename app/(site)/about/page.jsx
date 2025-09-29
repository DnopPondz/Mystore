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
    <div className="relative overflow-hidden bg-[#fff7eb] text-[#3c1a09]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-10 h-72 w-72 rounded-full bg-[#5b3dfc]/15 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-[#f7931e]/15 blur-3xl" />
        <div className="absolute top-1/3 left-1/3 h-40 w-40 rounded-full border-4 border-dashed border-[#5b3dfc]/30" />
      </div>

      <section className="relative mx-auto max-w-screen-xl px-6 pb-20 pt-16 lg:px-10">
        <div className="grid items-start gap-12 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#5b3dfc]/30 bg-[#fff3d6] px-4 py-1 text-sm font-semibold text-[#5b3dfc] shadow">
              Bao Lamphun Story
            </span>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              จากครัวครอบครัวสู่ร้านซาลาเปาคู่เมืองลำพูน
            </h1>
            <p className="text-base text-[#3c1a09]/80 sm:text-lg">
              Bao Lamphun เกิดจากความตั้งใจอยากให้คนลำพูนได้อร่อยกับซาลาเปาและขนมจีบไส้แน่นในทุกวันสำคัญ เรานึ่งสดใหม่ทีละรอบด้วยวัตถุดิบที่คัดเอง เพื่อให้ได้รสสัมผัสที่นุ่มและกลิ่นหอมเหมือนทานที่บ้าน
            </p>
            <p className="text-sm text-[#3c1a09]/70">
              ร้านของเราตั้งอยู่ที่อำเภอเมือง จังหวัดลำพูน 51000 พร้อมต้อนรับและจัดส่งความอร่อยถึงหน้าบ้านคุณ
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-[#f5c486] bg-white/90 p-6 shadow-xl shadow-[rgba(60,26,9,0.15)] backdrop-blur">
                <h2 className="text-xl font-semibold">ปรัชญาของเรา</h2>
                <p className="mt-3 text-sm text-[#3c1a09]/70">
                  นึ่งด้วยหัวใจ เลือกเนื้อหมูและกุ้งสดใหม่ และรักษามาตรฐานความสะอาดในทุกขั้นตอน
                </p>
              </div>
              <div className="rounded-3xl border border-[#f5c486] bg-white/90 p-6 shadow-xl shadow-[rgba(60,26,9,0.15)] backdrop-blur">
                <h2 className="text-xl font-semibold">บริการของเรา</h2>
                <ul className="mt-3 space-y-2 list-inside list-disc text-sm text-[#3c1a09]/70">
                  <li>ซาลาเปาและขนมจีบประจำวัน พร้อมไส้ตามฤดูกาล</li>
                  <li>ชุดของฝากและเซตประชุมในอำเภอเมืองลำพูน</li>
                  <li>รับทำไส้พิเศษสำหรับงานบุญและโอกาสสำคัญ</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="relative w-full max-w-sm rounded-[48%] border border-[#f5c486] bg-white p-10 text-center shadow-2xl shadow-[rgba(60,26,9,0.2)]">
              <div className="absolute -top-6 right-0 h-20 w-20 rounded-full bg-[#5b3dfc]/20 blur-2xl" />
              <div className="absolute -bottom-8 left-6 h-24 w-24 rounded-full bg-[#f7931e]/20 blur-2xl" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5b3dfc]">Since 2014</p>
              <p className="mt-3 text-3xl font-black">นึ่งทุกเข่งด้วยความตั้งใจ</p>
              <p className="mt-4 text-sm text-[#3c1a09]/70">
                “ซาลาเปาหนึ่งลูกต้องทำให้ทั้งครอบครัวอบอุ่นใจ” — พี่มีน ผู้ก่อตั้ง Bao Lamphun
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#fff3d6]/70">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <h2 className="text-3xl font-bold">สิ่งที่เราภูมิใจ</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-4 rounded-3xl border border-[#f5c486] bg-white/95 p-8 shadow-xl shadow-[rgba(60,26,9,0.12)] backdrop-blur"
              >
                <span className="text-3xl">{item.icon}</span>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-[#3c1a09]/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
        <div className="rounded-3xl border border-[#f5c486] bg-white/90 p-10 shadow-xl shadow-[rgba(60,26,9,0.12)] backdrop-blur">
          <h2 className="text-3xl font-bold">เส้นทางของเรา</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {milestones.map((item) => (
              <div key={item.year} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-[#5b3dfc] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#5b3dfc]/40">
                    {item.year}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#3c1a09]/70">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#fef3e5]">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center lg:px-10">
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold">มารู้จักทีมของเรา</h2>
            <p className="text-sm text-[#3c1a09]/80">
              ทีมเล็กๆ ของ Bao Lamphun ประกอบด้วยเชฟซาลาเปา มือปั้นขนมจีบ และทีมจัดส่งที่รู้ทุกซอกซอยในอำเภอเมืองลำพูน เป้าหมายเดียวกันคือดูแลทุกออเดอร์ให้ถึงมือลูกค้าอย่างอบอุ่น
            </p>
            <ul className="space-y-3 list-inside list-disc text-sm text-[#3c1a09]/70">
              <li>พี่มีน — ผู้ก่อตั้งและเชฟซาลาเปา ดูแลสูตรไส้หมูและหมูไข่เค็ม</li>
              <li>ปาล์ม — มือปั้นขนมจีบกุ้งและหมู คุมคุณภาพทุกลูก</li>
              <li>ทีมบริการลูกค้า — แนะนำชุดของฝากและช่วยวางแผนงานบุญ</li>
            </ul>
          </div>
          <div className="flex-1">
            <div className="rounded-3xl border border-[#f5c486] bg-white/90 p-8 shadow-xl shadow-[rgba(60,26,9,0.12)] backdrop-blur">
              <h3 className="text-xl font-semibold">อยากร่วมงานกับเรา?</h3>
              <p className="mt-3 text-sm text-[#3c1a09]/70">
                เรากำลังมองหาพาร์ตเนอร์ด้านวัตถุดิบ เครื่องนึ่ง และทีมจัดส่งในลำพูนที่อยากเติบโตไปด้วยกัน ติดต่อเราได้ที่
                <a href="mailto:hello@baolamphun.co" className="font-medium text-[#5b3dfc]">
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
