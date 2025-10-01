import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Review } from "@/models/Review";
import AddToCartButton from "@/components/AddToCartButton";
import ReviewsShowcase from "@/components/ReviewsShowcase";

export default async function HomePage() {
  let products = [];
  let featuredReviews = [];

  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      const docs = await Product.find({ active: true })
        .sort({ createdAt: -1 })
        .lean();
      products = (docs || []).map((d) => ({
        _id: String(d._id),
        title: d.title || "",
        description: d.description || "",
        price: d.price ?? 0,
        images: d.images || [],
      }));

      const reviews = await Review.find({
        published: true,
        rating: { $gte: 3.5 },
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

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

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#f0d6a1]" />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#5b3dfc]/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-24 h-72 w-72 rounded-full bg-[#f1c154]/20 blur-3xl" />

        <div className="relative max-w-screen-xl mx-auto px-6 lg:px-8 py-20 grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e6c688] bg-[#fff3d6] px-4 py-1 text-sm font-medium text-[#5b3dfc] shadow">
              นึ่งสดทุกวัน • ส่งฟรีในตัวเมืองลำพูน
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-[#3c1a09]">
              ซาลาเปาและขนมจีบร้อนๆ
            </h1>
            <p className="text-base sm:text-lg text-[#3c1a09]/80 max-w-xl">
              ซาลาเปาไส้หมูสับ หมูสับไข่เค็ม ครีม ถั่วดำ และเมนูพิเศษ
              พร้อมขนมจีบกุ้งและหมูที่นึ่งสดใหม่ให้คุณอร่อยได้ทุกมื้อ
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
              <a
                href="#menu"
                className="inline-flex items-center justify-center rounded-full bg-[#f1c154] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(247,201,72,0.4)] hover:bg-[#b6791c]"
              >
                เลือกซาลาเปาเลย
              </a>
              <a
                href="/preorder"
                className="inline-flex items-center justify-center rounded-full border border-[#5b3dfc]/20 bg-white px-6 py-3 text-sm font-semibold text-[#5b3dfc] shadow hover:bg-[#f5edff]"
              >
                สั่งเบรกเช้า & สั่งล่วงหน้า
              </a>
              {/* <a
                href="/checkout"
                className="inline-flex items-center justify-center rounded-full border border-white/0 bg-white/80 px-6 py-3 text-sm font-semibold text-[var(--color-choco)] shadow hover:bg-white"
              >
                สั่งด่วนพร้อมจัดส่ง
              </a> */}
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              {["นึ่งสดทุกวัน", "หมูคัดพิเศษ", "ส่งไวในเมือง"].map((item) => (
                <div
                  key={item}
                  className="text-center rounded-2xl border border-[#e6c688] bg-white px-4 py-3 text-sm font-medium text-[#3c1a09] shadow"
                >
                  {item}
                </div>
              ))}
            </dl>
          </div>

          <div className="relative flex justify-center">
            <div className="relative h-[320px] w-[320px] sm:h-[360px] sm:w-[360px] rounded-[48%] bg-[#fff3d6] shadow-2xl shadow-[rgba(60,26,9,0.25)] flex items-center justify-center">
              <div className="absolute -top-8 right-8 h-16 w-16 rounded-full bg-[#5b3dfc]/15 shadow-lg shadow-[#5b3dfc]/25" />
              <div className="absolute -bottom-6 left-10 h-20 w-20 rounded-full bg-[#f1c154]/25 shadow-lg shadow-[#f1c154]/35" />
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
              <span className="inline-flex items-center rounded-full border border-[#e6c688] bg-white px-4 py-2 text-sm font-medium text-[#3c1a09] shadow">
                🥟 เมนูอาจจะมีการเปลี่ยนแปลงในแต่ละวัน
              </span>
              {/* <span className="inline-flex items-center rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy)]/70 px-4 py-2 text-sm font-medium text-[var(--color-gold)] shadow">
                ☕ เซตอาหารเช้า
              </span> */}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-[#e6c688] bg-white/90 p-10 text-center text-[#3c1a09]/80 shadow-lg shadow-[rgba(60,26,9,0.2)] backdrop-blur">
                เมนูซาลาเปากำลังนึ่งอยู่ รอสักครู่นะคะ 🥟
              </div>
            ) : (
              products.map((p) => (
                <div
                  key={p._id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#e6c688] bg-white shadow-lg shadow-[rgba(60,26,9,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_40px_-24px_rgba(60,26,9,0.35)]"
                >
                  <div className="relative overflow-hidden">
                    <div className="aspect-square w-full bg-[#fff7eb] flex items-center justify-center">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-4xl">🥟</span>
                      )}
                    </div>
                    <div className="absolute top-4 left-4 rounded-full border border-[#5b3dfc]/40 bg-white px-3 py-1 text-xs font-semibold text-[#5b3dfc] shadow">
                      {p.saleMode === "preorder"
                        ? "Pre-order เท่านั้น"
                        : p.saleMode === "both"
                        ? "มีทั้งพร้อมส่ง & Pre-order"
                        : "เมนูแนะนำ"}
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
                      <span className="text-lg font-bold text-[#f6d889]">
                        ฿{p.price}
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
        <div className="absolute inset-0 bg-[#f0d6a1]" />
        <div className="absolute -top-24 left-10 h-64 w-64 rounded-full bg-[#5b3dfc]/12 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-[#ffe37f]/35 blur-3xl" />
        <div className="relative mx-auto grid max-w-screen-xl gap-10 px-6 py-10 text-[#3c1a09] md:grid-cols-3 lg:px-8">
          {["ทำสดใหม่ทุกวัน", "ทำเองทุกขั้นตอน", "เลือกวัตถุดิบคุณภาพ"].map(
            (title, idx) => (
              <div
                key={title}
                className="rounded-3xl border border-[#e6c688] bg-white p-8 shadow-lg shadow-[rgba(60,26,9,0.12)]"
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

      <ReviewsShowcase reviews={featuredReviews} />

    </main>
  );
}
