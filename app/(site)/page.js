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
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-burgundy-dark)] via-[var(--color-burgundy)] to-[#5d1f1f]" />
        <div className="absolute -top-20 -right-10 h-72 w-72 rounded-full bg-[var(--color-rose)]/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[var(--color-rose-dark)]/20 blur-3xl" />

        <div className="relative max-w-screen-xl mx-auto px-6 lg:px-8 py-20 grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy)]/70 px-4 py-1 text-sm font-medium text-[var(--color-gold)] shadow">
              นึ่งสดทุกวัน • ส่งฟรีในตัวเมืองลำพูน
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-[var(--color-rose)]">
              ซาลาเปาและขนมจีบร้อนๆ
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-text)]/80 max-w-xl">
              ซาลาเปาไส้หมูสับ หมูสับไข่เค็ม ครีม ถั่วดำ และเมนูพิเศษ
              พร้อมขนมจีบกุ้งและหมูที่นึ่งสดใหม่ให้คุณอร่อยได้ทุกมื้อ
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
              <a
                href="#menu"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-rose)] px-6 py-3 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-[rgba(0,0,0,0.35)] hover:bg-[var(--color-rose-dark)]"
              >
                เลือกซาลาเปาเลย
              </a>
              <a
                href="/preorder"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/70 px-6 py-3 text-sm font-semibold text-[var(--color-rose)] shadow hover:bg-[var(--color-burgundy)]"
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
                  className="text-center rounded-2xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/70 px-4 py-3 text-sm font-medium text-[var(--color-gold)] shadow"
                >
                  {item}
                </div>
              ))}
            </dl>
          </div>

          <div className="relative flex justify-center">
            <div className="relative h-[320px] w-[320px] sm:h-[360px] sm:w-[360px] rounded-[48%] bg-gradient-to-br from-[var(--color-burgundy)] via-[#3c1212] to-[var(--color-burgundy-dark)] shadow-2xl shadow-black/50 flex items-center justify-center">
              <div className="absolute -top-8 right-8 h-16 w-16 rounded-full bg-[var(--color-rose)]/30 shadow-lg shadow-[var(--color-rose)]/40" />
              <div className="absolute -bottom-6 left-10 h-20 w-20 rounded-full bg-[var(--color-rose-dark)]/30 shadow-lg shadow-[var(--color-rose-dark)]/40" />
              <div className="absolute top-10 left-6 h-12 w-12 rounded-full border-4 border-dashed border-[var(--color-rose)]/50" />
              <div className="text-center px-10">
                <p className="text-lg font-semibold text-[var(--color-rose)]">
                  เมนูขายดี!
                </p>
                <p className="mt-1 text-2xl font-black text-[var(--color-text)]">
                  ซาลาเปาหมูสับไข่เค็ม
                </p>
                <p className="mt-4 text-sm text-[var(--color-text)]/70">
                  หมูสับแน่นๆ พร้อมไข่เค็มเต็มคำ นึ่งด้วยแป้งสูตรนุ่มพิเศษหอมละมุน
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>



      <section id="menu" className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(240,200,105,0.12),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(58,16,16,0.7),transparent_60%),linear-gradient(135deg,rgba(20,2,2,0.9),rgba(76,25,18,0.85))]" />
        <div className="relative mx-auto flex max-w-screen-xl flex-col gap-12 px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-rose)]/90">
                Bao & Dim Sum
              </p>
              <h2 className="mt-2 text-3xl font-bold text-[var(--color-rose)]">
                เมนูซาลาเปา & ขนมจีบวันนี้
              </h2>
              {/* <p className="mt-2 text-[var(--color-text)]/70 max-w-2xl">คำอธิบายเพิ่มเติม</p> */}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <span className="inline-flex items-center rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy)]/70 px-4 py-2 text-sm font-medium text-[var(--color-gold)] shadow">
                🥟 เมนูอาจจะมีการเปลี่ยนแปลงในแต่ละวัน
              </span>
              {/* <span className="inline-flex items-center rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy)]/70 px-4 py-2 text-sm font-medium text-[var(--color-gold)] shadow">
                ☕ เซตอาหารเช้า
              </span> */}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/80 p-10 text-center text-[var(--color-text)]/80 shadow-lg shadow-black/40 backdrop-blur">
                เมนูซาลาเปากำลังนึ่งอยู่ รอสักครู่นะคะ 🥟
              </div>
            ) : (
              products.map((p) => (
                <div
                  key={p._id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/75 shadow-lg shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative overflow-hidden">
                    <div className="aspect-square w-full bg-[radial-gradient(circle_at_30%_30%,rgba(240,200,105,0.25),rgba(58,16,16,0.65))] flex items-center justify-center">
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
                    <div className="absolute top-4 left-4 rounded-full border border-[var(--color-rose)]/40 bg-[var(--color-burgundy)]/80 px-3 py-1 text-xs font-semibold text-[var(--color-rose)] shadow">
                      เมนูแนะนำ
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--color-rose)]">
                        {p.title}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--color-text)]/70 line-clamp-3">
                        {p.description}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="text-lg font-bold text-[var(--color-gold)]">
                        ฿{p.price}
                      </span>
                      <AddToCartButton product={p} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(240,200,105,0.1),transparent_55%),radial-gradient(circle_at_85%_15%,rgba(193,138,29,0.2),transparent_60%),linear-gradient(160deg,rgba(20,2,2,0.95),rgba(58,16,16,0.85))]" />
        <div className="relative mx-auto grid max-w-screen-xl gap-10 px-6 py-10 text-[var(--color-text)] md:grid-cols-3 lg:px-8">
          {["ทำสดใหม่ทุกวัน", "ทำเองทุกขั้นตอน", "เลือกวัตถุดิบคุณภาพ"].map(
            (title, idx) => (
              <div
                key={title}
                className="rounded-3xl border border-[var(--color-rose)]/15 bg-[var(--color-burgundy)]/75 p-8 shadow-lg shadow-black/30 backdrop-blur"
              >
                {/* <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-rose)] to-[var(--color-gold)] text-white text-xl shadow">
                  {idx === 0 ? "👩‍🍳" : idx === 1 ? "👐" : "🌾"}
                </div> */}
                <h3 className="text-xl font-semibold text-[var(--color-rose)]">
                  {title}
                </h3>
                <p className="mt-3 text-sm text-[var(--color-text)]/75">
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
