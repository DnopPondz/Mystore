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
  "นึ่งสดใหม่ทุกเช้า",
  "หมูอนามัยคัดพิเศษ",
  "จัดส่งฟรีในเขตเมือง",
];

const orderSteps = [
  {
    title: "เลือกเมนู",
    description: "หยิบซาลาเปาและขนมจีบที่ชอบลงตะกร้าหรือกรอกฟอร์มสั่งทำล่วงหน้า.",
    icon: "🥟",
  },
  {
    title: "ยืนยันการสั่ง",
    description: "ระบุเวลารับหรือส่ง พร้อมรายละเอียดสถานที่และวิธีชำระเงินที่สะดวก.",
    icon: "📝",
  },
  {
    title: "รับความอร่อย",
    description: "ทีมงานนึ่งสดตามเวลานัด ส่งตรงถึงคุณพร้อมคำแนะนำการอุ่นให้อร่อยเหมือนใหม่.",
    icon: "🚚",
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
                      availability: product.saleMode === "preorder" ? "PreOrder" : "InStock",
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
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataJson }}
      />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#fef3e5]" />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#5b3dfc]/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-24 h-72 w-72 rounded-full bg-[#f7931e]/20 blur-3xl" />

        <div className="relative max-w-screen-xl mx-auto px-6 lg:px-8 py-20 grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c486] bg-[#fff3d6] px-4 py-1 text-sm font-medium text-[#5b3dfc] shadow">
              นึ่งสดทุกวัน • ส่งฟรีในตัวเมืองลำพูน
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-[#3c1a09]">
              Steaming Bun ซาลาเปาร้อนๆ นึ่งสดในลำพูน
            </h1>
            <p className="text-base sm:text-lg text-[#3c1a09]/80 max-w-xl">
              เลือกซาลาเปาไส้หมูสับ หมูสับไข่เค็ม ครีม ถั่วดำ และเมนูพิเศษ
              พร้อมขนมจีบกุ้งและหมูที่นึ่งสดใหม่ทุกเข่ง ส่งถึงมือคุณพร้อมคำแนะนำการอุ่นให้กลับมานุ่มเหมือนเพิ่งออกจากซึ้ง
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
              <a
                href="#menu"
                className="inline-flex items-center justify-center rounded-full bg-[#f7931e] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(247,147,30,0.4)] hover:bg-[#df7f0f]"
              >
                เลือกซาลาเปาเลย
              </a>
              <a
                href="/preorder"
                className="inline-flex items-center justify-center rounded-full border border-[#5b3dfc]/20 bg-white px-6 py-3 text-sm font-semibold text-[#5b3dfc] shadow hover:bg-[#f5edff]"
              >
                สั่งเบรกเช้า & สั่งล่วงหน้า
              </a>
              <a
                href="tel:0612674523"
                className="inline-flex items-center justify-center rounded-full border border-transparent bg-white/80 px-6 py-3 text-sm font-semibold text-[#3c1a09] shadow hover:bg-white"
              >
                โทร. 061-267-4523
              </a>
              {/* <a
                href="/checkout"
                className="inline-flex items-center justify-center rounded-full border border-white/0 bg-white/80 px-6 py-3 text-sm font-semibold text-[var(--color-choco)] shadow hover:bg-white"
              >
                สั่งด่วนพร้อมจัดส่ง
              </a> */}
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              {heroHighlights.map((item) => (
                <div
                  key={item}
                  className="text-center rounded-2xl border border-[#f5c486] bg-white px-4 py-3 text-sm font-medium text-[#3c1a09] shadow"
                >
                  {item}
                </div>
              ))}
            </dl>
            {averageRating ? (
              <div className="flex items-center gap-3 rounded-2xl border border-[#5b3dfc]/20 bg-white/70 px-4 py-3 text-sm text-[#3c1a09]/80 shadow">
                <span className="text-xl" aria-hidden>
                  ⭐
                </span>
                <p>
                  ลูกค้าให้คะแนนเฉลี่ย <span className="font-semibold text-[#3c1a09]">{averageRating}</span>/5 จากรีวิวจริง {reviewCount} รายการ
                </p>
              </div>
            ) : null}
          </div>

          <div className="relative flex justify-center">
            <div className="relative h-[320px] w-[320px] sm:h-[360px] sm:w-[360px] rounded-[48%] bg-[#fff3d6] shadow-2xl shadow-[rgba(60,26,9,0.25)] flex items-center justify-center">
              <div className="absolute -top-8 right-8 h-16 w-16 rounded-full bg-[#5b3dfc]/15 shadow-lg shadow-[#5b3dfc]/25" />
              <div className="absolute -bottom-6 left-10 h-20 w-20 rounded-full bg-[#f7931e]/25 shadow-lg shadow-[#f7931e]/35" />
              <div className="absolute top-10 left-6 h-12 w-12 rounded-full border-4 border-dashed border-[#5b3dfc]/40" />
              <div className="text-center px-10">
                <p className="text-lg font-semibold text-[#5b3dfc]">
                  เมนูขายดี!
                </p>
                <p className="mt-1 text-2xl font-black text-[#3c1a09]">
                  ซาลาเปาหมูสับไข่เค็ม
                </p>
                <p className="mt-4 text-sm text-[#3c1a09]/70">
                  หมูสับแน่นๆ พร้อมไข่เค็มเต็มคำ นึ่งด้วยแป้งสูตรนุ่มพิเศษหอมละมุน
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative bg-white py-16"
        aria-labelledby="order-steps-heading"
      >
        <div className="mx-auto flex max-w-screen-xl flex-col gap-12 px-6 text-[#3c1a09] lg:px-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5b3dfc]">
              วิธีสั่งความอร่อย
            </p>
            <h2 id="order-steps-heading" className="text-3xl font-bold">
              ขั้นตอนง่ายๆ ในการรับซาลาเปาร้อนๆ
            </h2>
            <p className="text-sm sm:text-base text-[#3c1a09]/75">
              ไม่ว่าจะรับที่ร้านหรือให้จัดส่ง ทีมงานช่วยดูแลตั้งแต่การเลือกเมนูจนถึงการเสิร์ฟถึงมือ
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {orderSteps.map(({ title, description, icon }) => (
              <article
                key={title}
                className="flex flex-col gap-3 rounded-3xl border border-[#f5c486] bg-[#fff7eb] p-6 shadow-[0_18px_36px_-24px_rgba(60,26,9,0.3)]"
              >
                <span className="text-3xl" aria-hidden>
                  {icon}
                </span>
                <h3 className="text-lg font-semibold text-[#3c1a09]">{title}</h3>
                <p className="text-sm text-[#3c1a09]/75">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="menu" className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-[#fff7eb]" />
        <div className="absolute -top-20 right-10 h-64 w-64 rounded-full bg-[#ffe37f]/40 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-[#5b3dfc]/15 blur-3xl" />

        <div className="relative mx-auto flex max-w-screen-xl flex-col gap-12 px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5b3dfc]">
                Bao & Dim Sum
              </p>
              <h2 className="mt-2 text-3xl font-bold text-[#3c1a09]">
                เมนูซาลาเปา & ขนมจีบวันนี้
              </h2>
              {/* <p className="mt-2 text-[var(--color-text)]/70 max-w-2xl">คำอธิบายเพิ่มเติม</p> */}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <span className="inline-flex items-center rounded-full border border-[#f5c486] bg-white px-4 py-2 text-sm font-medium text-[#3c1a09] shadow">
                🥟 เมนูอาจจะมีการเปลี่ยนแปลงในแต่ละวัน
              </span>
              {/* <span className="inline-flex items-center rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy)]/70 px-4 py-2 text-sm font-medium text-[var(--color-gold)] shadow">
                ☕ เซตอาหารเช้า
              </span> */}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-[#f5c486] bg-white/90 p-10 text-center text-[#3c1a09]/80 shadow-lg shadow-[rgba(60,26,9,0.2)] backdrop-blur">
                เมนูซาลาเปากำลังนึ่งอยู่ รอสักครู่นะคะ 🥟
              </div>
            ) : (
              products.map((p) => (
                <div
                  key={p._id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#f5c486] bg-white shadow-lg shadow-[rgba(60,26,9,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_40px_-24px_rgba(60,26,9,0.35)]"
                >
                  <div className="relative overflow-hidden">
                    <div className="aspect-square w-full bg-[#fff7eb] flex items-center justify-center">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.title || "ภาพเมนูซาลาเปา"}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-4xl">🥟</span>
                      )}
                    </div>
                    <div className="absolute top-4 left-4 rounded-full border border-[#5b3dfc]/40 bg-white px-3 py-1 text-xs font-semibold text-[#5b3dfc] shadow">
                      {saleModeCopy[p.saleMode] ?? "เมนูแนะนำ"}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <div>
                      <h3 className="text-xl font-semibold text-[#3c1a09]">
                        {p.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#3c1a09]/70 line-clamp-3">
                        {p.description}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="text-lg font-bold text-[#f7931e]">
                        ฿{Number.isFinite(p.price) ? p.price.toLocaleString("th-TH") : "-"}
                      </span>
                      <AddToCartButton product={p} />
                    </div>
                    {p.saleMode === "preorder" ? (
                      <p className="text-xs text-[var(--color-text)]/60">
                        สินค้าจัดทำตามสั่ง กรุณากรอกแบบฟอร์มเพื่อให้แอดมินติดต่อกลับ
                      </p>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-[#fef3e5]" />
        <div className="absolute -top-24 left-10 h-64 w-64 rounded-full bg-[#5b3dfc]/12 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-[#ffe37f]/35 blur-3xl" />
        <div className="relative mx-auto grid max-w-screen-xl gap-10 px-6 py-10 text-[#3c1a09] md:grid-cols-3 lg:px-8">
          {["ทำสดใหม่ทุกวัน", "ทำเองทุกขั้นตอน", "เลือกวัตถุดิบคุณภาพ"].map(
            (title, idx) => (
              <div
                key={title}
                className="rounded-3xl border border-[#f5c486] bg-white p-8 shadow-lg shadow-[rgba(60,26,9,0.12)]"
              >
                {/* <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-rose)] text-white text-xl shadow">
                  {idx === 0 ? "👩‍🍳" : idx === 1 ? "👐" : "🌾"}
                </div> */}
                <h3 className="text-xl font-semibold text-[#3c1a09]">
                  {title}
                </h3>
                <p className="mt-3 text-sm text-[#3c1a09]/75">
                  {idx === 0
                    ? "ขนมทุกชิ้นสดใหม่จากเตา ดูแลเองทุกวันเพื่อให้ได้รสชาติที่ดีที่สุด"
                    : idx === 1
                    ? "ลงมือทำเองทุกขั้นตอน ตั้งแต่การเตรียมแป้งจนถึงการจัดส่ง"
                    : "ใช้วัตถุดิบที่คัดสรรอย่างดี เพื่อให้ได้คุณภาพและรสชาติที่มั่นใจ"}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      <section
        id="visit"
        className="relative bg-white py-16"
        aria-labelledby="visit-heading"
      >
        <div className="mx-auto grid max-w-screen-xl gap-10 px-6 text-[#3c1a09] lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5b3dfc]">
              มาหาเราได้ทุกวัน
            </p>
            <h2 id="visit-heading" className="text-3xl font-bold">
              แวะรับหน้าร้านหรือสั่งให้ไปส่งถึงที่
            </h2>
            <p className="text-sm sm:text-base text-[#3c1a09]/75">
              ร้านตั้งอยู่บริเวณตลาดเช้าเมืองลำพูน พร้อมบริการจัดส่งในเมืองภายใน 45 นาที*
              และมีออปชันส่งต่างจังหวัดผ่านขนส่งเอกชน
            </p>
            <ul className="space-y-3 text-sm text-[#3c1a09]/80">
              <li className="flex items-start gap-3">
                <span aria-hidden>📍</span>
                <address className="not-italic leading-relaxed">
                  88/8 ถนนตลาดสด ตำบลในเมือง อำเภอเมือง จังหวัดลำพูน 51000
                </address>
              </li>
              <li className="flex items-start gap-3">
                <span aria-hidden>🕒</span>
                <div>
                  เปิดทุกวัน จันทร์-ศุกร์ 07:00-18:30 น. • เสาร์-อาทิตย์ 08:00-19:30 น.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span aria-hidden>📞</span>
                <div>
                  โทร 061-267-4523 หรือแอดไลน์ @steamingbun เพื่อเช็กคิวจัดส่ง
                </div>
              </li>
            </ul>
            <p className="text-xs text-[#3c1a09]/60">*เวลาจัดส่งขึ้นอยู่กับจำนวนคิวและสภาพการจราจร</p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#f5c486] bg-[#fff7eb] p-6 shadow-[0_18px_36px_-24px_rgba(60,26,9,0.35)]">
            <h3 className="text-lg font-semibold text-[#3c1a09]">ช่องทางการติดต่อ</h3>
            <p className="mt-2 text-sm text-[#3c1a09]/75">
              เลือกช่องทางที่สะดวกเพื่อปรึกษาเมนูหรือขอใบเสนอราคาได้เลย
            </p>
            <div className="mt-4 grid gap-3 text-sm">
              <a
                href="https://line.me/R/ti/p/@sweetcravings"
                className="flex items-center justify-between rounded-2xl border border-[#5b3dfc]/20 bg-white px-4 py-3 font-medium text-[#5b3dfc] shadow transition hover:bg-[#f5edff]"
              >
                <span>Line OA</span>
                <span aria-hidden>↗</span>
              </a>
              <a
                href="https://www.facebook.com"
                className="flex items-center justify-between rounded-2xl border border-[#f5c486] bg-[#fff3d6] px-4 py-3 font-medium text-[#3c1a09] shadow transition hover:bg-[#ffe8b5]"
              >
                <span>Facebook Messenger</span>
                <span aria-hidden>↗</span>
              </a>
              <a
                href="mailto:hello@sweetcravings.co"
                className="flex items-center justify-between rounded-2xl border border-[#f5c486]/70 bg-white px-4 py-3 font-medium text-[#3c1a09] shadow transition hover:bg-[#fff7eb]"
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
        className="relative overflow-hidden bg-[#fff7eb] py-16"
        aria-labelledby="faq-heading"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#fff7eb] via-[#fff3d6] to-[#ffe8b5] opacity-60" />
        <div className="relative mx-auto max-w-screen-xl space-y-10 px-6 text-[#3c1a09] lg:px-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5b3dfc]">
              คำถามที่พบบ่อย
            </p>
            <h2 id="faq-heading" className="text-3xl font-bold">
              เตรียมพร้อมก่อนสั่งซาลาเปาโฮมเมดของเรา
            </h2>
            <p className="text-sm sm:text-base text-[#3c1a09]/75">
              รวมคำตอบเรื่องเวลานึ่ง การจัดส่ง และวิธีชำระเงินเพื่อช่วยให้คุณวางแผนได้ง่ายขึ้น
            </p>
          </div>
          <div className="grid gap-4">
            {faqItems.map(({ question, answer }) => (
              <details
                key={question}
                className="group rounded-3xl border border-[#f5c486] bg-white/80 p-5 shadow-[0_18px_36px_-24px_rgba(60,26,9,0.25)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-[#3c1a09]">
                  <span>{question}</span>
                  <span
                    className="text-xl text-[#f7931e] transition group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#3c1a09]/75">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <ReviewsShowcase reviews={featuredReviews} />

    </main>
  );
}
