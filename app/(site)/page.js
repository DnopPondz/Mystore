import Link from "next/link";
import ProductShowcase from "@/components/home/ProductShowcase";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";

async function loadProducts() {
  try {
    if (!process.env.MONGODB_URI) {
      return [];
    }
    await connectToDatabase();
    const docs = await Product.find({ active: true })
      .sort({ createdAt: -1 })
      .lean();
    return (docs || []).map((doc) => ({
      _id: String(doc._id),
      title: doc.title || "",
      description: doc.description || "",
      price: doc.price ?? 0,
      images: Array.isArray(doc.images) ? doc.images : [],
      tags: Array.isArray(doc.tags) ? doc.tags : [],
      stock: doc.stock ?? null,
      slug: doc.slug || String(doc._id),
    }));
  } catch (error) {
    console.error("โหลดสินค้าไม่สำเร็จ", error);
    return [];
  }
}

const heroStats = ["นึ่งสดทุกวัน", "หมูคัดพิเศษ", "ส่งไวในเมือง"];

const reasons = [
  {
    title: "ทำสดใหม่ทุกเช้า",
    description: "ปั้นไส้และนึ่งซาลาเปาทีละรอบเพื่อให้ได้ความหอมและความนุ่มที่คงที่",
  },
  {
    title: "ส่งไวในตัวเมือง",
    description: "มีรอบจัดส่งเช้าและบ่ายในเขตอำเภอเมืองลำพูน พร้อมแจ้งเตือนสถานะ",
  },
  {
    title: "รับทำพิเศษ",
    description: "ดีไซน์ไส้และแพ็กเกจจิ้งตามงานประชุม งานบุญ หรือโอกาสสำคัญ",
  },
];

const reviews = [
  {
    name: "คุณจูน - ร้านกาแฟในเมือง",
    comment:
      "ซาลาเปาหมูสับไข่เค็มคือที่สุด ลูกค้าประจำมาซื้อทุกสัปดาห์ ชอบที่นึ่งให้ตอนเช้าร้อนๆ และแพ็กอย่างดี",
  },
  {
    name: "คุณไก่ - เจ้าภาพงานทำบุญ",
    comment:
      "สั่ง 150 ลูกสำหรับงานทำบุญ ทีมงานช่วยจัดเซตและส่งตรงเวลา ไส้ไม่หวานจัดและแป้งนุ่มมาก",
  },
  {
    name: "บริษัททัวร์ลำพูน",
    comment:
      "ใช้บริการชุดอาหารเช้าสำหรับกรุ๊ปทัวร์ นักท่องเที่ยวชอบมาก มีทั้งไส้หมูและครีมให้เลือก",
  },
];

const deliveryAreas = [
  "อำเภอเมืองลำพูน (ส่งฟรีเมื่อสั่งครบ ฿800)",
  "อำเภอแม่ทา, บ้านธิ (ค่าส่งตามระยะทาง 40-80 บาท)",
  "รับหน้าร้านได้ที่ซอยรอบเมือง 7 ทุกวัน 06:30 - 17:00 น.",
];

const howToOrder = [
  { title: "เลือกเมนู", detail: "เลือกเมนูประจำหรือพรีออเดอร์จากด้านล่าง เพิ่มลงตะกร้าได้เลย" },
  { title: "ยืนยันข้อมูล", detail: "กรอกที่อยู่และเวลาจัดส่ง หรือเลือกมารับหน้าร้าน" },
  { title: "รับความอร่อย", detail: "ทีม Bao Lamphun นึ่งสดและจัดส่งตรงเวลาพร้อมแจ้งเตือน" },
];

const gallery = [
  { title: "ซาลาเปาหมูสับไข่เค็ม", description: "ไส้หมูแน่นๆ ผสมไข่เค็มชิ้นโต นึ่งด้วยแป้งสูตรครอบครัว" },
  { title: "ขนมจีบกุ้ง", description: "กุ้งเด้งๆ คลุกหมูบดพอดีคำ เสิร์ฟพร้อมน้ำจิ้มเต้าเจี้ยวทำเอง" },
  { title: "ชุดของฝาก", description: "แพ็กเกจจิ้งผ้าพื้นเมืองสำหรับโอกาสพิเศษและของฝากนักท่องเที่ยว" },
];

const loyaltyPerks = [
  "สะสมครบ 80 แต้มเลื่อนเป็น Silver รับส่วนลด 5% ทุกบิล",
  "สมาชิก Gold ขึ้นไปส่งฟรีในเขตอำเภอเมือง",
  "รับแต้มเพิ่ม 2 เท่าในเดือนเกิด",
];

export default async function HomePage() {
  const products = await loadProducts();
  const signatureItems = products.filter((p) => p.tags?.includes("best-seller")).slice(0, 3);

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
              Bao Lamphun ซาลาเปาและขนมจีบร้อนๆ
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-text)]/80 max-w-xl">
              ซาลาเปาไส้หมูสับ หมูไข่เค็ม ครีม ถั่วดำ พร้อมขนมจีบกุ้งหมู และเมนูพิเศษตามฤดูกาล นึ่งสดทุกเช้าจากครัวในเมืองลำพูน
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
              <a
                href="/#loyalty"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy-dark)]/60 px-6 py-3 text-sm font-semibold text-[var(--color-gold)] hover:bg-[var(--color-burgundy)]"
              >
                ดูสิทธิ์ Bao Club
              </a>
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              {heroStats.map((item) => (
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
                <p className="text-lg font-semibold text-[var(--color-rose)]">เมนูขายดี!</p>
                <p className="mt-1 text-2xl font-black text-[var(--color-text)]">ซาลาเปาหมูสับไข่เค็ม</p>
                <p className="mt-4 text-sm text-[var(--color-text)]/70">
                  หมูสับแน่นๆ พร้อมไข่เค็มเต็มคำ นึ่งด้วยแป้งสูตรนุ่มพิเศษหอมละมุน
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="signature" className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(240,200,105,0.1),transparent_55%),radial-gradient(circle_at_85%_15%,rgba(193,138,29,0.2),transparent_60%),linear-gradient(160deg,rgba(20,2,2,0.95),rgba(58,16,16,0.85))]" />
        <div className="relative mx-auto max-w-screen-xl px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-rose)]/90">Signature Bao</p>
              <h2 className="mt-2 text-3xl font-bold text-[var(--color-rose)]">ซาลาเปาที่ทุกคนชื่นชอบ</h2>
            </div>
            <Link href="/preorder" className="text-xs font-semibold text-[var(--color-rose)] underline">
              ดูแพ็กเกจสั่งทำพิเศษ
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {signatureItems.length > 0
              ? signatureItems.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/70 p-6 text-[var(--color-text)] shadow-lg shadow-black/35 backdrop-blur"
                  >
                    <h3 className="text-lg font-semibold text-[var(--color-rose)]">{item.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-text)]/70 line-clamp-3">{item.description}</p>
                    <p className="mt-4 text-sm font-semibold text-[var(--color-gold)]">฿{item.price}</p>
                    <Link href={`/products/${item.slug}`} className="mt-3 inline-flex items-center text-xs font-semibold text-[var(--color-rose)] underline">
                      ดูรายละเอียด
                    </Link>
                  </div>
                ))
              : reasons.map((reason) => (
                  <div
                    key={reason.title}
                    className="rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/70 p-6 text-[var(--color-text)] shadow-lg shadow-black/35 backdrop-blur"
                  >
                    <h3 className="text-lg font-semibold text-[var(--color-rose)]">{reason.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-text)]/70">{reason.description}</p>
                  </div>
                ))}
          </div>
        </div>
      </section>

      <ProductShowcase products={products} />

      <section id="story" className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(240,200,105,0.1),transparent_55%),radial-gradient(circle_at_85%_15%,rgba(193,138,29,0.2),transparent_60%),linear-gradient(160deg,rgba(20,2,2,0.95),rgba(58,16,16,0.85))]" />
        <div className="relative mx-auto grid max-w-screen-xl gap-10 px-6 py-10 text-[var(--color-text)] md:grid-cols-3 lg:px-8">
          {reasons.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-[var(--color-rose)]/15 bg-[var(--color-burgundy)]/75 p-8 shadow-lg shadow-black/30 backdrop-blur"
            >
              <h3 className="text-xl font-semibold text-[var(--color-rose)]">{item.title}</h3>
              <p className="mt-3 text-sm text-[var(--color-text)]/75">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="reviews" className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(240,200,105,0.1),transparent_60%),linear-gradient(140deg,rgba(20,2,2,0.95),rgba(58,16,16,0.85))]" />
        <div className="relative mx-auto max-w-screen-xl px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-rose)]/90">Voices from Lamphun</p>
              <h2 className="text-3xl font-bold text-[var(--color-rose)]">รีวิวจากลูกค้าประจำ</h2>
            </div>
            <Link href="/faq" className="text-xs font-semibold text-[var(--color-rose)] underline">
              ดูคำถามที่พบบ่อย
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <div
                key={review.name}
                className="rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/70 p-6 text-[var(--color-text)] shadow-lg shadow-black/35 backdrop-blur"
              >
                <p className="text-sm text-[var(--color-text)]/75">“{review.comment}”</p>
                <p className="mt-4 text-xs font-semibold text-[var(--color-gold)]">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="delivery" className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(240,200,105,0.12),transparent_60%),linear-gradient(120deg,rgba(20,2,2,0.95),rgba(58,16,16,0.8))]" />
        <div className="relative mx-auto max-w-screen-xl px-6 lg:px-8 grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-[var(--color-rose)]">พื้นที่ให้บริการ & การจัดส่ง</h2>
            <p className="text-sm text-[var(--color-text)]/70">
              เราใช้ไรเดอร์ในท้องถิ่นเพื่อให้ซาลาเปาและขนมจีบถึงมือคุณอย่างรวดเร็ว พร้อมแจ้งสถานะผ่าน LINE Official
            </p>
            <ul className="space-y-2 text-sm text-[var(--color-text)]/80 list-disc list-inside">
              {deliveryAreas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/70 p-6 text-[var(--color-text)] shadow-2xl shadow-black/40 backdrop-blur">
            <h3 className="text-lg font-semibold text-[var(--color-rose)]">ขั้นตอนการสั่ง</h3>
            <ol className="mt-4 space-y-3 text-sm text-[var(--color-text)]/75 list-decimal list-inside">
              {howToOrder.map((step) => (
                <li key={step.title}>
                  <p className="font-semibold text-[var(--color-gold)]">{step.title}</p>
                  <p>{step.detail}</p>
                </li>
              ))}
            </ol>
            <Link
              href="/preorder"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy)]/60 px-4 py-2 text-xs font-semibold text-[var(--color-rose)] transition hover:bg-[var(--color-burgundy)]"
            >
              สั่งทำพิเศษสำหรับงานของคุณ
            </Link>
          </div>
        </div>
      </section>

      <section id="loyalty" className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(240,200,105,0.18),transparent_60%),linear-gradient(160deg,rgba(58,16,16,0.9),rgba(20,2,2,0.95))]" />
        <div className="relative mx-auto max-w-screen-xl px-6 lg:px-8 grid gap-8 md:grid-cols-[1.2fr_1fr] items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-[var(--color-rose)]">Bao Club สะสมแต้ม</h2>
            <p className="text-sm text-[var(--color-text)]/75">
              สมัครสมาชิกและเข้าสู่ระบบก่อนชำระเงินเพื่อสะสมแต้มทุกยอดซื้อ รับส่วนลดและสิทธิ์จองเมนูพิเศษก่อนใคร
            </p>
            <ul className="space-y-2 text-sm text-[var(--color-text)]/80 list-disc list-inside">
              {loyaltyPerks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-rose)] px-5 py-2 text-xs font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-black/35 hover:bg-[var(--color-rose-dark)]"
              >
                สมัครสมาชิกฟรี
              </Link>
              <Link
                href="/orders"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy)]/70 px-5 py-2 text-xs font-semibold text-[var(--color-rose)] hover:bg-[var(--color-burgundy)]"
              >
                ตรวจสอบแต้ม
              </Link>
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/70 p-8 text-[var(--color-text)] shadow-2xl shadow-black/40 backdrop-blur">
            <h3 className="text-lg font-semibold text-[var(--color-rose)]">Tier & สิทธิประโยชน์</h3>
            <ul className="mt-4 space-y-3 text-xs text-[var(--color-text)]/70">
              <li><span className="font-semibold text-[var(--color-gold)]">Starter:</span> สมัครแล้วเริ่มสะสมได้ทันที รับข่าวสารเมนูใหม่</li>
              <li><span className="font-semibold text-[var(--color-gold)]">Silver:</span> สะสมครบ 80 แต้ม ลด 5% ทุกบิล</li>
              <li><span className="font-semibold text-[var(--color-gold)]">Gold:</span> สะสมครบ 180 แต้ม จัดส่งฟรีและสิทธิ์จองเมนูพิเศษ</li>
              <li><span className="font-semibold text-[var(--color-gold)]">Platinum:</span> สะสมครบ 320 แต้ม รับส่วนลด 12% และที่ปรึกษางานจัดเลี้ยง</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="faq" className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(240,200,105,0.12),transparent_60%),linear-gradient(200deg,rgba(20,2,2,0.95),rgba(58,16,16,0.85))]" />
        <div className="relative mx-auto max-w-screen-xl px-6 lg:px-8 grid gap-10 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-[var(--color-rose)]">คำถามที่พบบ่อย</h2>
            <p className="text-sm text-[var(--color-text)]/70">
              การจัดส่ง การยกเลิก หรือการเก็บรักษาเมนูของเรา รวมอยู่ในศูนย์ช่วยเหลือแล้ว
            </p>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-rose)]/30 bg-[var(--color-burgundy)]/60 px-4 py-2 text-xs font-semibold text-[var(--color-rose)] hover:bg-[var(--color-burgundy)]"
            >
              เปิดดู FAQ
            </Link>
          </div>
          <div className="grid gap-4">
            {gallery.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/70 p-5 text-[var(--color-text)] shadow-lg shadow-black/30 backdrop-blur"
              >
                <h3 className="text-lg font-semibold text-[var(--color-rose)]">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-text)]/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
