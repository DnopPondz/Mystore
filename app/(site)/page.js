import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Review } from "@/models/Review";
import { isNewArrival } from "@/lib/productUtils";
import AddToCartButton from "@/components/AddToCartButton";
import ReviewsShowcase from "@/components/ReviewsShowcase";

export const metadata = {
  title: "Steaming Bun Market | ซาลาเปาโฮมเมดส่งตรงถึงบ้าน",
  description:
    "เลือกซาลาเปาและขนมจีบไส้แน่นจาก Steaming Bun ผ่านหน้าร้านออนไลน์ จัดแพ็ก ส่งด่วนในลำพูน หรือจองเวลาจัดเลี้ยงล่วงหน้าได้ในไม่กี่คลิก.",
};

const trustBadges = [
  {
    title: "เวลานึ่งถัดไป",
    description: "เริ่มเตา 05:30 น. พร้อมรอบส่งแรก 07:00 น.",
  },
  {
    title: "รอบจัดส่ง",
    description: "จัดส่งฟรีในตัวเมืองเมื่อยอดถึง ฿800",
  },
  {
    title: "แพ็กเกจ",
    description: "เลือกแพ็ก 6, 12 หรือ 24 ชิ้นได้เอง",
  },
];

const shoppingPerks = [
  {
    icon: "🧺",
    title: "เลือกไส้ได้ครบในหน้าร้านเดียว",
    description:
      "รวมเมนูซาลาเปา ขนมจีบ และชุดจัดเลี้ยง พร้อมสต็อกคงเหลือและสถานะพร้อมส่งแบบเรียลไทม์",
  },
  {
    icon: "📦",
    title: "บรรจุภัณฑ์พร้อมเสิร์ฟ",
    description:
      "เลือกแพ็กเกจอบอุ่นหรือแพ็กพร้อมแจกได้ทันที ทีมงานเตรียมฉลากและอุ่นก่อนส่งให้",
  },
  {
    icon: "💬",
    title: "ผู้ช่วยส่วนตัว",
    description:
      "แชตผ่าน LINE OA เพื่อปรึกษาเมนูพิเศษ แจ้งเวลาจัดส่ง หรือขอใบเสนอราคาได้ทุกวัน",
  },
];

const timelineSteps = [
  {
    title: "เลือกไส้และจำนวน",
    description:
      "กดหยิบสินค้าลงตะกร้า หรือเลือกแบบฟอร์มสั่งทำล่วงหน้าเมื่อเป็นงานใหญ่",
  },
  {
    title: "ยืนยันรายละเอียด",
    description:
      "ระบุเวลารับ/ส่ง ช่องทางชำระเงิน และหมายเหตุพิเศษ ทีมงานคอนเฟิร์มทันที",
  },
  {
    title: "รับความอร่อย",
    description:
      "รับเองหน้าร้านหรือรอไรเดอร์ส่งถึงบ้าน พร้อมคู่มืออุ่นให้นุ่มเหมือนออกจากเตา",
  },
];

const craftHighlights = [
  {
    title: "คัดเนื้อหมูและกุ้งวันต่อวัน",
    description:
      "ใช้วัตถุดิบจากเกษตรกรในพื้นที่ ควบคุมอุณหภูมิเย็นจนถึงขั้นปั้น เพื่อรสชาตินุ่มฉ่ำ",
    icon: "🥟",
  },
  {
    title: "สูตรแป้งละมุนกว่า 8 ปี",
    description:
      "แป้งสูตรเฉพาะที่ยังนุ่มแม้แช่เย็น เพียงอุ่นไมโครเวฟ 90 วินาทีหรืออบไอน้ำ 4 นาที",
    icon: "🌾",
  },
  {
    title: "ทีมจัดเลี้ยงมืออาชีพ",
    description:
      "รองรับงานประชุม งานบุญ และของฝาก พร้อมจัดแพ็กและจัดคิวส่งตามเวลานัดหมาย",
    icon: "🎉",
  },
  {
    title: "แพ็กเกจรักษ์โลก",
    description:
      "เลือกแพ็กเกจเยื่อไผ่หรือกล่องกระดาษรีไซเคิล ลดพลาสติกได้มากกว่า 60%",
    icon: "🌿",
  },
];

const faqItems = [
  {
    question: "ต้องสั่งล่วงหน้ากี่ชั่วโมง?",
    answer:
      "ออเดอร์พร้อมส่งใช้เวลาเตรียม 45-90 นาที ส่วนงานจัดเลี้ยงแนะนำแจ้งล่วงหน้าอย่างน้อย 1 วันเพื่อจัดคิววัตถุดิบและการแพ็ก.",
  },
  {
    question: "มีบริการจัดส่งนอกเขตลำพูนหรือไม่?",
    answer:
      "ส่งฟรีในเมืองลำพูน และส่งต่างจังหวัดผ่านขนส่งควบคุมอุณหภูมิ โดยคิดค่าจัดส่งตามระยะทางจริง.",
  },
  {
    question: "รองรับการชำระเงินแบบใด?",
    answer:
      "รองรับเงินสด โอนผ่านแอปธนาคารหลัก QR พร้อมเพย์ และมีใบเสร็จ/ใบกำกับภาษีสำหรับลูกค้านิติบุคคล.",
  },
  {
    question: "ขอรสชาติพิเศษได้ไหม?",
    answer:
      "สามารถแจ้งสูตรหรือรสชาติพิเศษล่วงหน้า ทีมเชฟจะช่วยออกแบบไส้และกำหนดเวลาทดสอบให้ก่อนวันจริง.",
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

      const now = new Date();

      products = (docs || []).map((d) => {
        const createdAt = d.createdAt ? new Date(d.createdAt) : null;

        return {
          _id: String(d._id),
          title: d.title || "",
          description: d.description || "",
          price: d.price ?? 0,
          images: Array.isArray(d.images) ? d.images : [],
          saleMode: d.saleMode || null,
          createdAt: createdAt ? createdAt.toISOString() : null,
          isNewArrival: isNewArrival({ createdAt }, { now }),
        };
      });

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
              0
            ) / reviewCount
          ).toFixed(1)
        )
      : null;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://steamingbun.example.com";

  const structuredDataJson = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: "Steaming Bun Market",
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
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
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
                        product.saleMode === "preorder"
                          ? "PreOrder"
                          : "InStock",
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

  const saleModeCopy = {
    preorder: "Pre-order เท่านั้น",
    both: "พร้อมส่ง & Pre-order",
  };

  return (
    <main className="relative overflow-hidden bg-[var(--color-cream)] text-[var(--color-rose-dark)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataJson }}
      />

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_0%_0%,rgba(14,165,160,0.35),transparent_55%),radial-gradient(circle_at_90%_10%,rgba(255,135,70,0.28),transparent_60%)]" />
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-[var(--color-burgundy)]/40 bg-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-burgundy-dark)] shadow">
                นึ่งสดทุกเช้า
              </div>
              <div className="space-y-6">
                <h1 className="text-4xl font-black leading-tight text-[var(--color-rose-dark)] sm:text-5xl">
                  ซาลาเปาโฮมเมดไส้แน่น จัดส่งตรงเวลาถึงบ้านและออฟฟิศ
                </h1>
                <p className="text-base text-[var(--color-rose-dark)]/80 sm:text-lg">
                  เลือกไส้ได้ครบจากหน้าร้านออนไลน์ กดสั่ง สแกนจ่าย
                  และรอรับจากไรเดอร์
                  หรือให้ทีมงานเตรียมชุดจัดเลี้ยงพร้อมเสิร์ฟตามเวลาที่คุณต้องการ
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="#menu"
                  className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-rose)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(12,116,108,0.32)] transition hover:bg-[var(--color-rose-dark)]"
                >
                  ดูเมนูพร้อมส่ง
                </a>
                <a
                  href="/preorder"
                  className="inline-flex items-center justify-center rounded-2xl border border-[var(--color-rose)]/20 bg-white px-6 py-3 text-sm font-semibold text-[var(--color-rose)] shadow-sm transition hover:border-[var(--color-rose)]/50 hover:bg-white/80"
                >
                  จองสั่งทำล่วงหน้า
                </a>
                <a
                  href="tel:0612674523"
                  className="inline-flex items-center justify-center rounded-2xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 px-6 py-3 text-sm font-semibold text-[var(--color-gold)] transition hover:bg-[var(--color-gold)]/20"
                >
                  โทร 061-267-4523
                </a>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {trustBadges.map(({ title, description }) => (
                  <div
                    key={title}
                    className="rounded-3xl border border-[var(--color-burgundy)]/20 bg-white/80 p-5 text-sm shadow-[0_22px_40px_-28px_rgba(20,95,75,0.35)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-burgundy-dark)]">
                      {title}
                    </p>
                    <p className="mt-2 text-[var(--color-rose-dark)]/80">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="flex flex-col gap-6 rounded-[32px] border border-[var(--color-burgundy)]/30 bg-white/85 p-8 shadow-[0_32px_60px_-32px_rgba(20,95,75,0.45)] backdrop-blur">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-rose)]">
                  เหตุผลที่ลูกค้ารักเรา
                </p>
                <h2 className="text-2xl font-bold text-[var(--color-rose-dark)]">
                  {averageRating
                    ? `คะแนนเฉลี่ย ${averageRating}/5 จาก ${reviewCount} รีวิว`
                    : "การันตีความสดจากลูกค้าประจำ"}
                </h2>
                <p className="text-sm text-[var(--color-rose-dark)]/70">
                  อัปเดตรอบนึ่ง รายการโปรโมชัน และสถานะจัดส่งผ่านหน้าเว็บหรือ
                  LINE OA ได้ทันที
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--color-rose)]/20 bg-[var(--color-rose)]/10 p-4 text-sm text-[var(--color-rose-dark)]">
                <p className="font-semibold text-[var(--color-rose)]">
                  สั่งด่วน
                </p>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center justify-between gap-3">
                    <span>โทร 061-267-4523</span>
                    <span aria-hidden>→</span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <a
                      href="https://line.me/R/ti/p/@sweetcravings"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--color-rose)] underline-offset-4 hover:underline"
                    >
                      LINE OA @steamingbun
                    </a>
                    <span aria-hidden>↗</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 p-4 text-sm text-[var(--color-rose-dark)]">
                <p className="font-semibold text-[var(--color-gold)]">
                  โปรโมชันประจำเดือน
                </p>
                <p className="mt-2 text-[var(--color-rose-dark)]/70">
                  รับส่วนลดเมื่อสั่งครบ ฿1,200 และรับฟรีขนมจีบหมู 4 ชิ้น
                  เมื่อซื้อชุดประชุม 3 แพ็กขึ้นไป
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Shopping Perks */}
      <section className="bg-white/80 py-16">
        <div className="mx-auto grid max-w-screen-xl gap-8 px-6 lg:grid-cols-3 lg:px-10">
          {shoppingPerks.map(({ icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-4 rounded-3xl border border-[var(--color-burgundy)]/20 bg-white/90 p-6 text-sm text-[var(--color-rose-dark)] shadow-[0_24px_48px_-32px_rgba(20,95,75,0.3)]"
            >
              <span className="text-3xl" aria-hidden>
                {icon}
              </span>
              <h3 className="text-lg font-semibold text-[var(--color-rose-dark)]">
                {title}
              </h3>
              <p className="text-[var(--color-rose-dark)]/70">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section
        id="timeline"
        className="relative overflow-hidden px-6 py-20 lg:px-10"
        aria-labelledby="order-steps-heading"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,160,0.25),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(255,135,70,0.2),transparent_60%)]" />
        <div className="mx-auto max-w-screen-xl">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-rose)]">
              ขั้นตอนการช้อป
            </p>
            <h2
              id="order-steps-heading"
              className="text-3xl font-bold text-[var(--color-rose-dark)]"
            >
              วางแผนจัดส่งซาลาเปาใน 3 ขั้นตอน
            </h2>
            <p className="text-sm text-[var(--color-rose-dark)]/70">
              เลือกเวลารับของ ปรับจำนวน
              และเพิ่มหมายเหตุพิเศษได้ในขั้นตอนชำระเงิน
              ทีมงานช่วยติดตามสถานะให้จนถึงมือคุณ
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {timelineSteps.map(({ title, description }, index) => (
              <article
                key={title}
                className="flex h-full flex-col gap-4 rounded-3xl border border-[var(--color-burgundy)]/25 bg-white/90 p-6 shadow-[0_24px_48px_-32px_rgba(20,95,75,0.3)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-rose)] text-lg font-semibold text-white shadow-lg shadow-[rgba(12,116,108,0.3)]">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-[var(--color-rose-dark)]">
                  {title}
                </h3>
                <p className="text-sm text-[var(--color-rose-dark)]/70">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Craft Highlights */}
      <section className="bg-white/85 px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-screen-xl">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-burgundy-dark)]">
              พิถีพิถันทุกขั้นตอน
            </p>
            <h2 className="text-3xl font-bold text-[var(--color-rose-dark)]">
              เบื้องหลังซาลาเปาที่นุ่มฉ่ำทุกลูก
            </h2>
            <p className="text-sm text-[var(--color-rose-dark)]/70">
              ทีมเชฟและไรเดอร์ของเราคุมมาตรฐานเดียวกันตั้งแต่การคัดวัตถุดิบจนถึงส่งถึงมือ
              เพื่อให้ทุกคำยังอุ่นและหอม
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {craftHighlights.map(({ icon, title, description }) => (
              <div
                key={title}
                className="flex h-full flex-col gap-4 rounded-3xl border border-[var(--color-burgundy)]/20 bg-white/90 p-6 text-sm text-[var(--color-rose-dark)] shadow-[0_24px_48px_-32px_rgba(20,95,75,0.28)]"
              >
                <span className="text-3xl" aria-hidden>
                  {icon}
                </span>
                <h3 className="text-lg font-semibold text-[var(--color-rose-dark)]">
                  {title}
                </h3>
                <p className="text-[var(--color-rose-dark)]/70">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="bg-white px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-screen-2xl space-y-8">
          <div className="text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-rose)]/70">
              เมนูพร้อมส่ง
            </p>
            <h2 className="mb-6 text-4xl font-black text-[var(--color-rose-dark)] lg:text-5xl">
              ช้อปเมนูยอดนิยม
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-[var(--color-rose)]/20 bg-[var(--color-cream)]/30 py-16 text-center">
                <span className="mb-3 block text-5xl">🥟</span>
                <p className="text-sm text-[var(--color-rose-dark)]/60">
                  เมนูกำลังนึ่งอยู่ กลับมาเช็กใหม่อีกครั้ง
                </p>
              </div>
            ) : (
              products.map((p) => (
                <div
                  key={p._id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-burgundy)]/15 bg-white shadow-sm transition hover:shadow-xl"
                >
                  <div className="relative overflow-hidden bg-[var(--color-cream)]/40">
                    <div className="flex aspect-square items-center justify-center">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.title || "ภาพเมนูซาลาเปา"}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-6xl opacity-30">🥟</span>
                      )}
                    </div>
                    {p.isNewArrival && (
                      <div className="absolute left-3 top-3 rounded-full bg-[var(--color-rose)] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                        ใหม่!
                      </div>
                    )}
                    {p.saleMode === "preorder" && (
                      <div className="absolute right-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-900">
                        Pre-order
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 text-lg font-bold text-[var(--color-rose-dark)]">
                      {p.title}
                    </h3>
                    <p className="mb-4 flex-1 text-sm text-[var(--color-rose-dark)]/60 line-clamp-2">
                      {p.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[var(--color-rose-dark)]">
                        ฿{p.price}
                      </span>
                      {saleModeCopy[p.saleMode] && (
                        <span className="rounded-full bg-[var(--color-rose)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-rose-dark)]">
                          {saleModeCopy[p.saleMode]}
                        </span>
                      )}
                    </div>
                    <div className="mt-4">
                      <AddToCartButton productId={p._id} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Reviews Showcase */}
      {featuredReviews.length > 0 && (
        <section className="bg-[var(--color-cream)]/40 px-6 py-20 lg:px-10">
          <div className="mx-auto max-w-screen-xl">
            <h2 className="mb-10 text-center text-3xl font-bold text-[var(--color-rose-dark)]">
              รีวิวจากลูกค้า
            </h2>
            <ReviewsShowcase reviews={featuredReviews} />
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="bg-white/90 px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-screen-xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-[var(--color-rose-dark)]">
            คำถามที่พบบ่อย
          </h2>
          <dl className="space-y-8">
            {faqItems.map(({ question, answer }) => (
              <div
                key={question}
                className="rounded-3xl border border-[var(--color-burgundy)]/15 bg-white/95 p-6 shadow-sm"
              >
                <dt className="text-lg font-semibold text-[var(--color-rose-dark)]">
                  {question}
                </dt>
                <dd className="mt-2 text-sm text-[var(--color-rose-dark)]/70">
                  {answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-[var(--color-cream)] px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-screen-xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-[var(--color-rose-dark)]">
            พร้อมสั่งซาลาเปาโฮมเมดแล้วหรือยัง?
          </h2>
          <p className="mb-8 text-sm text-[var(--color-rose-dark)]/80">
            เลือกเมนูที่ชอบแล้วเพิ่มลงตะกร้าได้เลย หรือแชทผ่าน LINE OA
            เพื่อสอบถามเมนูพิเศษ
          </p>
          <a
            href="#menu"
            className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-rose)] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[rgba(12,116,108,0.32)] transition hover:bg-[var(--color-rose-dark)]"
          >
            ดูเมนูทั้งหมด
          </a>
        </div>
      </section>
    </main>
  );
}
