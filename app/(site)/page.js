import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Review } from "@/models/Review";
import AddToCartButton from "@/components/AddToCartButton";
import ReviewsShowcase from "@/components/ReviewsShowcase";

export const metadata = {
  title: "ซาลาเปานึ่งสด ขนมจีบแน่นไส้ ส่งไวในลำพูน",
  description:
    "เลือกซาลาเปาและขนมจีบโฮมเมดจาก Steaming Bun ร้านนึ่งสดทุกวันในลำพูน พร้อมบริการจัดส่งด่วน สั่งล่วงหน้าได้ทั้งสำหรับงานประชุมและเซ็ตอาหารเช้า.",
};

const saleModeCopy = {
  preorder: "Pre-order เท่านั้น",
  both: "มีทั้งพร้อมส่ง & Pre-order",
};

const heroHighlights = [
  {
    label: "นึ่งสด",
    description: "เริ่มเตาซึ้งทุกเช้า 05:30 น.",
  },
  {
    label: "เมนู",
    description: "ซาลาเปา & ขนมจีบ 12 สูตร",
  },
  {
    label: "จัดส่ง",
    description: "ฟรีในตัวเมืองลำพูน",
  },
];

const craftHighlights = [
  {
    title: "ลงมือทำเองทุกขั้นตอน",
    description:
      "ตั้งแต่คัดหมูอนามัย ลวกกุ้งสด ไปจนถึงการนวดแป้งและนึ่งด้วยซึ้งไม้ไผ่แบบดั้งเดิม",
    icon: "👩‍🍳",
  },
  {
    title: "สูตรนุ่มเฉพาะร้าน",
    description:
      "สูตรแป้งนึ่งกว่า 8 ปี ปรับให้ละมุนและยังนุ่มแม้แช่เย็น เพียงอุ่น 3 นาที กลับมานุ่มเหมือนเพิ่งนึ่ง",
    icon: "🥢",
  },
  {
    title: "เตรียมงานเลี้ยงได้",
    description:
      "รองรับออเดอร์จัดประชุม, คอฟฟี่เบรก หรือชุดฝากลูกค้าด้วยการแพ็กจานพร้อมเสิร์ฟ",
    icon: "🎉",
  },
];

const orderSteps = [
  {
    title: "เลือกเมนู",
    description: "หยิบซาลาเปาและขนมจีบลงตะกร้าหรือกรอกฟอร์มสั่งล่วงหน้า",
  },
  {
    title: "ยืนยันรายละเอียด",
    description: "แจ้งเวลารับหรือจัดส่ง พร้อมช่องทางการชำระเงิน",
  },
  {
    title: "รับความอร่อย",
    description: "ทีมงานส่งถึงมือ หรือเตรียมรับเองที่ร้านตามเวลานัดหมาย",
  },
];

const faqItems = [
  {
    question: "ต้องสั่งล่วงหน้ากี่ชั่วโมง?",
    answer:
      "สำหรับออเดอร์เล็กสามารถสั่งก่อนรับสินค้าอย่างน้อย 2 ชั่วโมง ส่วนออเดอร์จัดเลี้ยงแนะนำแจ้งล่วงหน้า 1-2 วันเพื่อให้ทีมงานเตรียมวัตถุดิบ.",
  },
  {
    question: "มีบริการจัดส่งนอกเขตลำพูนหรือไม่?",
    answer:
      "เราจัดส่งฟรีในตัวเมืองลำพูน และสามารถจัดส่งจังหวัดใกล้เคียงผ่านขนส่งเอกชน โดยมีค่าจัดส่งตามระยะทาง.",
  },
  {
    question: "รับชำระด้วยวิธีใดบ้าง?",
    answer:
      "รองรับเงินสด โอนผ่านแอปธนาคารหลัก และมีสแกน QR พร้อมเพย์ที่หน้าร้านหรือจุดส่งสินค้า.",
  },
];

export default async function HomePage() {
  let products = [];
  let featuredReviews = [];

  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();

      const [docs, reviews] = await Promise.all([
        Product.find({ active: true }).sort({ createdAt: -1 }).lean(),
        Review.find({
          published: true,
          rating: { $gte: 3.5 },
        })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean(),
      ]);

      products = (docs || []).map((d) => ({
        _id: String(d._id),
        title: d.title || "",
        description: d.description || "",
        price: d.price ?? 0,
        images: Array.isArray(d.images) ? d.images : [],
        saleMode: d.saleMode || null,
      }));

      featuredReviews = (reviews || []).map((r) => ({
        id: String(r._id),
        name: r.userName || "ลูกค้า",
        rating: Number(r.rating || 0),
        comment: r.comment || "",
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      }));
    }
  } catch (error) {
    console.error("โหลดสินค้าไม่สำเร็จ", error);
  }

  const reviewCount = featuredReviews.length;
  const averageRating =
    reviewCount > 0
      ? Number(
          (
            featuredReviews.reduce(
              (sum, review) => sum + (review.rating || 0),
              0,
            ) / reviewCount
          ).toFixed(1),
        )
      : null;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://steamingbun.example.com";

  const structuredDataJson = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: "Steaming Bun",
      image: `${siteUrl}/images/logo.png`,
      url: siteUrl,
      telephone: "+66-61-267-4523",
      priceRange: "฿฿",
      servesCuisine: ["Chinese", "Dim Sum"],
      areaServed: "เมืองลำพูน ประเทศไทย",
      address: {
        "@type": "PostalAddress",
        streetAddress: "88/8 ถนนตลาดสด",
        addressLocality: "เมืองลำพูน",
        addressRegion: "ลำพูน",
        postalCode: "51000",
        addressCountry: "TH",
      },
      sameAs: [
        "https://www.facebook.com",
        "https://www.instagram.com",
        "https://line.me/R/ti/p/@sweetcravings",
      ],
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
          ],
          opens: "07:00",
          closes: "18:30",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Saturday", "Sunday"],
          opens: "08:00",
          closes: "19:30",
        },
      ],
      aggregateRating:
        averageRating && reviewCount
          ? {
              "@type": "AggregateRating",
              ratingValue: averageRating,
              reviewCount,
            }
          : undefined,
      hasMenu:
        products.length > 0
          ? {
              "@type": "Menu",
              hasMenuSection: [
                {
                  "@type": "MenuSection",
                  name: "ซาลาเปาและขนมจีบ",
                  hasMenuItem: products.slice(0, 12).map((product) => ({
                    "@type": "MenuItem",
                    name: product.title,
                    description: product.description,
                    offers: {
                      "@type": "Offer",
                      price: product.price,
                      priceCurrency: "THB",
                      availability:
                        product.saleMode === "preorder" ? "PreOrder" : "InStock",
                    },
                  })),
                },
              ],
            }
          : undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    },
  ]);

  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#362015]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataJson }}
      />

      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#fff3d6] via-[#ffe8b5] to-[#ffd4c5]" />
        <div className="absolute right-[12%] top-[-8%] -z-10 h-64 w-64 rounded-full bg-[#ffac7d]/60 blur-3xl" />
        <div className="absolute left-[-10%] bottom-[-20%] -z-10 h-72 w-72 rounded-full bg-[#a689ff]/40 blur-3xl" />

        <header className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-12 pt-10 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex items-center gap-3 text-[#362015]">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-lg">🥟</span>
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-[#b95700]">Steaming Bun</p>
              <p className="font-semibold">ซาลาเปานึ่งสด เมืองลำพูน</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#5b3dfc]">
            <a className="rounded-full bg-white/70 px-4 py-2 shadow" href="#menu">
              เมนูวันนี้
            </a>
            <a className="rounded-full bg-white/0 px-4 py-2 hover:bg-white/50" href="#timeline">
              ขั้นตอนสั่ง
            </a>
            <a className="rounded-full bg-white/0 px-4 py-2 hover:bg-white/50" href="#visit">
              ช่องทางติดต่อ
            </a>
            <a className="rounded-full bg-white/0 px-4 py-2 hover:bg-white/50" href="#faq">
              FAQ
            </a>
          </nav>
        </header>

        <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-5 py-2 text-xs font-medium uppercase tracking-[0.3em] text-[#b95700] shadow">
              ส่งร้อนใน 45 นาที • รับที่ร้านได้
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-black leading-tight text-[#2c1407] sm:text-5xl">
                ซาลาเปาไส้แน่น กับขนมจีบนึ่งสด สำหรับทุกมื้อสำคัญ
              </h1>
              <p className="text-base text-[#2c1407]/80 sm:text-lg">
                เราคัดหมูและกุ้งสดใหม่ทุกวัน นึ่งด้วยสูตรแป้งนุ่มเฉพาะร้าน เพื่อให้ได้ซาลาเปาและขนมจีบที่หอมละมุนพร้อมเสิร์ฟทั้งในบ้านและในงานประชุมขนาดใหญ่
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#menu"
                className="inline-flex items-center justify-center rounded-full bg-[#ff7a45] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff7a45]/40 transition hover:bg-[#e8612a]"
              >
                เลือกเมนูลงตะกร้า
              </a>
              <a
                href="/preorder"
                className="inline-flex items-center justify-center rounded-full border border-[#5b3dfc]/20 bg-white px-6 py-3 text-sm font-semibold text-[#5b3dfc] shadow transition hover:bg-[#f2ecff]"
              >
                สั่งทำล่วงหน้าสำหรับงาน
              </a>
              <a
                href="tel:0612674523"
                className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#fff1dc] px-6 py-3 text-sm font-semibold text-[#b95700] shadow transition hover:bg-[#ffe1b9]"
              >
                โทร 061-267-4523
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/80 p-5 shadow-[0_22px_45px_-28px_rgba(44,20,7,0.35)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-[#b95700]">ทุกเช้า</p>
                <p className="mt-2 text-lg font-semibold text-[#2c1407]">
                  เปิดนึ่ง 05:30 และพร้อมส่งรอบแรก 07:00 น.
                </p>
                <p className="mt-2 text-sm text-[#2c1407]/65">
                  จัดคิวตามเวลาที่ต้องการ หากต้องการจัดเลี้ยงแจ้งจำนวนและเวลาส่งได้เลย
                </p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/50 p-5 shadow-[0_22px_45px_-28px_rgba(44,20,7,0.25)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-[#5b3dfc]">ลูกค้ารีวิว</p>
                {averageRating ? (
                  <p className="mt-2 text-lg font-semibold text-[#2c1407]">
                    เฉลี่ย {averageRating}/5 จากลูกค้าจริง {reviewCount} รายการ
                  </p>
                ) : (
                  <p className="mt-2 text-lg font-semibold text-[#2c1407]">
                    พร้อมเสิร์ฟความอร่อยทุกวัน
                  </p>
                )}
                <p className="mt-2 text-sm text-[#2c1407]/65">
                  คำชมเรื่องความนุ่มและไส้แน่นคือเหตุผลที่เราดูแลการผลิตเองทุกชิ้น
                </p>
              </div>
            </div>
          </div>

          <aside className="relative">
            <div className="absolute -top-8 right-4 h-16 w-16 rounded-full bg-[#5b3dfc]/20 blur-xl" />
            <div className="absolute -bottom-10 left-0 h-24 w-24 rounded-full bg-[#ffb347]/30 blur-2xl" />
            <div className="relative flex h-full flex-col justify-between rounded-[40px] border border-white/60 bg-white/80 p-8 shadow-[0_30px_60px_-30px_rgba(44,20,7,0.45)] backdrop-blur">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#5b3dfc]">
                  ไฮไลต์วันนี้
                </p>
                <div className="space-y-3">
                  {heroHighlights.map(({ label, description }) => (
                    <div key={label} className="rounded-2xl border border-[#5b3dfc]/20 bg-[#f4efff] px-4 py-3 text-sm text-[#362015]">
                      <span className="font-semibold text-[#5b3dfc]">{label}</span>
                      <p className="text-xs text-[#362015]/70">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-10 space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b95700]">
                  วิธีสั่งด่วน
                </p>
                <ul className="space-y-2 text-sm text-[#362015]/75">
                  <li className="flex items-center justify-between rounded-2xl border border-[#ff7a45]/20 bg-[#fff1dc] px-4 py-3">
                    <span>โทร 061-267-4523</span>
                    <span aria-hidden>→</span>
                  </li>
                  <li className="flex items-center justify-between rounded-2xl border border-[#5b3dfc]/20 bg-white px-4 py-3">
                    <a
                      className="flex-1 text-left"
                      href="https://line.me/R/ti/p/@sweetcravings"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Line OA @steamingbun
                    </a>
                    <span aria-hidden>↗</span>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </section>
      </div>

      <section
        id="timeline"
        className="relative bg-[#fefaf3] px-6 py-20 lg:px-10"
        aria-labelledby="order-steps-heading"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#5b3dfc]">
              ขั้นตอนการสั่ง
            </p>
            <h2 id="order-steps-heading" className="text-3xl font-bold text-[#2c1407]">
              จากไอเดียเมนูถึงมือคุณแบบไร้กังวล
            </h2>
            <p className="text-sm text-[#2c1407]/70">
              ทีมงานช่วยยืนยันเวลาและปริมาณให้เหมาะกับจำนวนคน พร้อมอัปเดตสถานะตั้งแต่เริ่มนึ่งจนส่งถึงที่
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 hidden w-[2px] bg-gradient-to-b from-[#5b3dfc] to-[#ff7a45] sm:block" />
            <div className="space-y-6">
              {orderSteps.map(({ title, description }, index) => (
                <article
                  key={title}
                  className="relative flex flex-col gap-3 rounded-3xl border border-[#5b3dfc]/20 bg-white p-6 shadow-[0_20px_45px_-32px_rgba(44,20,7,0.35)] sm:ml-12"
                >
                  <div className="flex items-center gap-3 text-sm font-semibold text-[#5b3dfc]">
                    <span className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#5b3dfc] text-white sm:flex">
                      {index + 1}
                    </span>
                    <span className="sm:hidden">ขั้น {index + 1}</span>
                    <span className="text-base text-[#2c1407]">{title}</span>
                  </div>
                  <p className="text-sm text-[#2c1407]/70">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-white px-6 py-20 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b95700]">
              ความพิถีพิถันในทุกชิ้น
            </p>
            <h2 className="text-3xl font-bold text-[#2c1407]">
              ทุกไส้ถูกคัดสรรเพื่อรสชาติที่คงเส้นคงวา
            </h2>
            <p className="text-sm text-[#2c1407]/70">
              เราใช้สูตรเดียวกับที่ครอบครัวเสิร์ฟในงานสำคัญ ปรับรสชาติให้ถูกใจทั้งเด็กและผู้ใหญ่ พร้อมแพ็กให้สะดวกต่อการเสิร์ฟ
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {craftHighlights.map(({ icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col gap-3 rounded-3xl border border-[#ffe3c0] bg-[#fff7eb] p-6 text-sm text-[#2c1407]/80 shadow-[0_22px_45px_-32px_rgba(44,20,7,0.3)]"
              >
                <span className="text-3xl" aria-hidden>
                  {icon}
                </span>
                <h3 className="text-lg font-semibold text-[#2c1407]">{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="menu" className="relative bg-[#fef6eb] px-6 py-20 lg:px-10">
        <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-white/0 to-[#fef6eb]" />
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#5b3dfc]">
              Bao & Dim Sum
            </p>
            <h2 className="text-3xl font-bold text-[#2c1407]">เมนูประจำวัน</h2>
            <p className="text-sm text-[#2c1407]/70">
              เลือกเมนูลงตะกร้าเพื่อสั่งด่วน หรือกดสั่งทำล่วงหน้าเมื่ออยากได้จำนวนมากเป็นพิเศษ เมนูอาจหมุนเวียนทุกวัน
            </p>
            <div className="rounded-3xl border border-[#5b3dfc]/20 bg-white/70 p-6 shadow-[0_22px_45px_-28px_rgba(44,20,7,0.25)]">
              <p className="text-sm font-semibold text-[#5b3dfc]">เคล็ดลับอุ่นให้อร่อย</p>
              <p className="mt-2 text-xs text-[#2c1407]/70">
                นึ่งไอน้ำ 4 นาที หรือเข้าไมโครเวฟพร้อมถ้วยน้ำ 1 นาทีครึ่ง เพื่อให้ไส้ฉ่ำเหมือนเพิ่งนึ่ง
              </p>
            </div>
          </aside>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-dashed border-[#ff7a45]/40 bg-white/70 p-12 text-center text-[#2c1407]/70 shadow-[0_22px_45px_-28px_rgba(44,20,7,0.2)]">
                เมนูกำลังนึ่งอยู่ รอสักครู่แล้วรีเฟรชอีกครั้งนะคะ 🥟
              </div>
            ) : (
              products.map((p) => (
                <div
                  key={p._id}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#ffe3c0] bg-white text-[#2c1407] shadow-[0_22px_45px_-32px_rgba(44,20,7,0.35)] transition hover:-translate-y-1 hover:shadow-[0_38px_60px_-36px_rgba(44,20,7,0.4)]"
                >
                  <div className="relative">
                    <div className="flex aspect-square items-center justify-center bg-[#fff0d9]">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.title || "ภาพเมนูซาลาเปา"}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-5xl">🥟</span>
                      )}
                    </div>
                    <div className="absolute left-4 top-4 rounded-full border border-[#5b3dfc]/20 bg-white/80 px-3 py-1 text-xs font-semibold text-[#5b3dfc]">
                      {saleModeCopy[p.saleMode] ?? "เมนูแนะนำ"}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div>
                      <h3 className="text-lg font-semibold">{p.title}</h3>
                      <p className="mt-2 text-sm text-[#2c1407]/70 line-clamp-3">{p.description}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                      <span className="text-lg font-bold text-[#ff7a45]">
                        ฿{Number.isFinite(p.price) ? p.price.toLocaleString("th-TH") : "-"}
                      </span>
                      <AddToCartButton product={p} />
                    </div>
                    {p.saleMode === "preorder" ? (
                      <p className="text-xs text-[#2c1407]/60">
                        เมนูสั่งทำพิเศษ กรุณาแจ้งเวลารับสินค้าให้ทีมงานทราบ
                      </p>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section
        id="visit"
        className="relative bg-white px-6 py-20 lg:px-10"
        aria-labelledby="visit-heading"
      >
        <div className="mx-auto grid max-w-6xl gap-10 rounded-[48px] border border-[#ffe3c0] bg-[#fff7eb] p-10 shadow-[0_30px_60px_-34px_rgba(44,20,7,0.35)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b95700]">
              พร้อมต้อนรับทุกวัน
            </p>
            <h2 id="visit-heading" className="text-3xl font-bold text-[#2c1407]">
              รับที่หน้าร้านหรือให้เราส่งถึงที่
            </h2>
            <p className="text-sm text-[#2c1407]/70">
              ร้านอยู่ใกล้ตลาดเช้าเมืองลำพูน สามารถจอดรถรับสินค้าได้สะดวก หรือให้ไรเดอร์ของเราส่งถึงคุณภายใน 45 นาที (ขึ้นอยู่กับคิว)
            </p>
            <dl className="space-y-3 text-sm text-[#2c1407]/80">
              <div className="flex items-start gap-3">
                <dt aria-hidden>📍</dt>
                <dd>
                  88/8 ถนนตลาดสด ตำบลในเมือง อำเภอเมือง จังหวัดลำพูน 51000
                </dd>
              </div>
              <div className="flex items-start gap-3">
                <dt aria-hidden>🕒</dt>
                <dd>
                  จันทร์-ศุกร์ 07:00-18:30 น. • เสาร์-อาทิตย์ 08:00-19:30 น.
                </dd>
              </div>
              <div className="flex items-start gap-3">
                <dt aria-hidden>🚚</dt>
                <dd>
                  ส่งฟรีในเมืองลำพูน และส่งต่างจังหวัดผ่านขนส่งเอกชน คิดตามระยะทาง
                </dd>
              </div>
            </dl>
            <p className="text-xs text-[#2c1407]/60">
              *เวลาจัดส่งขึ้นอยู่กับจำนวนคิวและสภาพการจราจร
            </p>
          </div>

          <div className="space-y-4 rounded-[32px] border border-white/60 bg-white/70 p-8 shadow-[0_22px_45px_-30px_rgba(44,20,7,0.3)] backdrop-blur">
            <h3 className="text-lg font-semibold text-[#2c1407]">ช่องทางติดต่อ</h3>
            <p className="text-sm text-[#2c1407]/70">
              เลือกช่องทางที่สะดวกเพื่อปรึกษาเมนูหรือขอใบเสนอราคาได้ทุกวัน 06:00-20:00 น.
            </p>
            <div className="grid gap-3 text-sm">
              <a
                href="https://line.me/R/ti/p/@sweetcravings"
                className="flex items-center justify-between rounded-2xl border border-[#5b3dfc]/30 bg-[#f2ecff] px-4 py-3 font-medium text-[#5b3dfc] shadow transition hover:bg-[#e3dbff]"
              >
                <span>Line OA @steamingbun</span>
                <span aria-hidden>↗</span>
              </a>
              <a
                href="https://www.facebook.com"
                className="flex items-center justify-between rounded-2xl border border-[#ffe3c0] bg-white px-4 py-3 font-medium text-[#2c1407] shadow transition hover:bg-[#fff0d9]"
              >
                <span>Facebook Messenger</span>
                <span aria-hidden>↗</span>
              </a>
              <a
                href="mailto:hello@sweetcravings.co"
                className="flex items-center justify-between rounded-2xl border border-[#ff7a45]/20 bg-[#fff1dc] px-4 py-3 font-medium text-[#b95700] shadow transition hover:bg-[#ffe1b9]"
              >
                <span>hello@sweetcravings.co</span>
                <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="relative bg-[#fefaf3] px-6 py-20 lg:px-10"
        aria-labelledby="faq-heading"
      >
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#5b3dfc]">
              FAQ
            </p>
            <h2 id="faq-heading" className="text-3xl font-bold text-[#2c1407]">
              เคลียร์ทุกคำถามก่อนสั่ง
            </h2>
            <p className="text-sm text-[#2c1407]/70">
              ตอบทุกข้อสงสัยเรื่องระยะเวลานึ่ง การชำระเงิน และวิธีจัดส่ง เพื่อให้คุณจัดการออเดอร์ได้ไวขึ้น
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {faqItems.map(({ question, answer }) => (
              <details
                key={question}
                className="group rounded-3xl border border-[#ffe3c0] bg-white p-6 text-[#2c1407] shadow-[0_20px_45px_-34px_rgba(44,20,7,0.3)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold">
                  <span>{question}</span>
                  <span
                    className="text-xl text-[#ff7a45] transition group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-[#2c1407]/70">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <ReviewsShowcase reviews={featuredReviews} />
    </main>
  );
}
