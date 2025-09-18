import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import AddToCartButton from "@/components/AddToCartButton";

export default async function HomePage() {
  let products = [];

  try {
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
  } catch (error) {
    console.error("โหลดสินค้าไม่สำเร็จ", error);
  }

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ffe0c7] via-[#ffe9d6] to-[#ffe0ec]" />
        <div className="absolute -top-20 -right-10 h-72 w-72 rounded-full bg-[#fbd8a4]/60 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[#f5a3c2]/40 blur-3xl" />

        <div className="relative max-w-screen-xl mx-auto px-6 lg:px-8 py-20 grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-sm font-medium text-[var(--color-rose-dark)] shadow">
              70% OFF เมนูเช้า • ส่งฟรีทั่วเมือง
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-[var(--color-rose-dark)]">
              ความสุขจากเตาอบ สู่โต๊ะอาหารของคุณ
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-choco)]/80 max-w-xl">
              ขนมปังหอมกรุ่น ครัวซองต์กรอบนอกนุ่มใน และเค้กสุดละมุน พร้อมเสิร์ฟทุกเช้าเพื่อเติมเต็มช่วงเวลาพิเศษให้ครอบครัวของคุณ
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#menu"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-rose)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#f0658333] hover:bg-[var(--color-rose-dark)]"
              >
                เลือกขนมเลย
              </a>
              <a
                href="/checkout"
                className="inline-flex items-center justify-center rounded-full border border-white/60 bg-white/70 px-6 py-3 text-sm font-semibold text-[var(--color-rose-dark)] shadow hover:bg-white"
              >
                สั่งด่วนภายในวันเดียว
              </a>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              {["อบสดใหม่", "วัตถุดิบพรีเมียม", "ส่งไวในเมือง"].map((item) => (
                <div key={item} className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium text-[var(--color-choco)] shadow">
                  {item}
                </div>
              ))}
            </dl>
          </div>

          <div className="relative flex justify-center">
            <div className="relative h-[320px] w-[320px] sm:h-[360px] sm:w-[360px] rounded-[48%] bg-gradient-to-br from-white/80 via-white to-[#ffe9f2] shadow-2xl shadow-[#f0658322] flex items-center justify-center">
              <div className="absolute -top-8 right-8 h-16 w-16 rounded-full bg-[#fcd9b6] shadow-lg shadow-[#fcd9b6]/50" />
              <div className="absolute -bottom-6 left-10 h-20 w-20 rounded-full bg-[#f8acc5] shadow-lg shadow-[#f8acc5]/50" />
              <div className="absolute top-10 left-6 h-12 w-12 rounded-full border-4 border-dashed border-white/70" />
              <div className="text-center px-10">
                <p className="text-lg font-semibold text-[var(--color-rose-dark)]">เมนูใหม่!</p>
                <p className="mt-1 text-2xl font-black text-[var(--color-choco)]">Strawberry Brioche</p>
                <p className="mt-4 text-sm text-[var(--color-choco)]/70">
                  เนยสดคุณภาพสูง ผสานสตรอว์เบอร์รี่ออร์แกนิก เพิ่มความหวานอมเปรี้ยวอย่างลงตัว
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="max-w-screen-xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-rose)]">Our Menu</p>
            <h2 className="mt-2 text-3xl font-bold text-[var(--color-choco)]">ขนมอบที่ทุกคนหลงรัก</h2>
            <p className="mt-2 text-[var(--color-choco)]/70 max-w-2xl">
              คัดสรรวัตถุดิบธรรมชาติจากฟาร์มท้องถิ่น ผสมผสานความพิถีพิถันในการอบจนได้ขนมสดใหม่ หวานกำลังดี พร้อมส่งถึงคุณทุกเช้า
            </p>
          </div>
          <div className="flex gap-3">
            <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-[var(--color-choco)] shadow">
              🍓 พายผลไม้ตามฤดูกาล
            </span>
            <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-[var(--color-choco)] shadow">
              ☕ เซตอาหารเช้า
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 ? (
            <div className="col-span-full rounded-3xl bg-white/90 p-10 text-center text-[var(--color-choco)]/70 shadow-lg shadow-[#f0658320]">
              เมนูใหม่กำลังอบอยู่ รอสักครู่นะคะ 🍞
            </div>
          ) : (
            products.map((p) => (
              <div
                key={p._id}
                className="group relative flex h-full flex-col rounded-3xl bg-white/90 shadow-lg shadow-[#f0658320] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative overflow-hidden rounded-t-3xl">
                  <div className="aspect-square w-full bg-gradient-to-br from-[#ffe5d0] via-[#fff] to-[#ffe6f5] flex items-center justify-center">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-4xl">🍩</span>
                    )}
                  </div>
                  <div className="absolute top-4 left-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--color-rose-dark)] shadow">
                    เมนูแนะนำ
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--color-choco)]">{p.title}</h3>
                    <p className="mt-1 text-sm text-[var(--color-choco)]/70 line-clamp-3">{p.description}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-[var(--color-rose-dark)]">฿{p.price}</span>
                    <AddToCartButton product={p} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bg-white/70">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8 py-16 grid gap-10 md:grid-cols-3">
          {["Chef มืออาชีพ", "ส่งเร็วใน 2 ชม.", "มีเมนูสุขภาพ"].map((title, idx) => (
            <div key={title} className="rounded-3xl bg-white p-8 shadow-md shadow-[#f0658315]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f06583] to-[#f6c34a] text-white text-xl shadow">
                {idx === 0 ? "👩‍🍳" : idx === 1 ? "🚚" : "💚"}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[var(--color-choco)]">{title}</h3>
              <p className="mt-3 text-sm text-[var(--color-choco)]/70">
                {idx === 0
                  ? "ทีมเชฟมากประสบการณ์ที่อบขนมทุกชิ้นอย่างพิถีพิถัน เพื่อรสชาติและคุณภาพที่ดีที่สุด"
                  : idx === 1
                  ? "บริการจัดส่งด่วนภายใน 2 ชั่วโมงในเขตเมือง เพื่อให้คุณได้รับขนมในสภาพสมบูรณ์"
                  : "ตัวเลือกเมนูไร้น้ำตาลและวัตถุดิบออร์แกนิกสำหรับคนรักสุขภาพ"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
