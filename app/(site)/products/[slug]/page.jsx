import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import ProductPurchaseActions from "@/components/ProductPurchaseActions";

function serializeProduct(doc) {
  if (!doc) return null;
  const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    _id: String(plain._id),
    title: plain.title || "",
    description: plain.description || "",
    price: Number(plain.price || 0),
    images: Array.isArray(plain.images) ? plain.images : [],
    tags: Array.isArray(plain.tags) ? plain.tags : [],
    stock: typeof plain.stock === "number" ? plain.stock : null,
    slug: plain.slug || String(plain._id),
  };
}

async function loadProduct(slugParam) {
  await connectToDatabase();
  const slug = decodeURIComponent(slugParam);
  let product = await Product.findOne({ slug }).lean();
  if (!product) {
    product = await Product.findById(slug).lean();
  }
  return serializeProduct(product);
}

async function loadRelated(product) {
  await connectToDatabase();
  const tags = product.tags?.length ? product.tags : [];
  const query = tags.length ? { tags: { $in: tags }, _id: { $ne: product._id } } : { _id: { $ne: product._id } };
  const docs = await Product.find(query).limit(4).lean();
  return docs.map(serializeProduct).filter(Boolean);
}

export async function generateMetadata({ params }) {
  const product = await loadProduct(params.slug);
  if (!product) {
    return { title: "ไม่พบสินค้า | Bao Lamphun" };
  }
  return {
    title: `${product.title} | Bao Lamphun`,
    description: product.description || "ซาลาเปาและขนมจีบจาก Bao Lamphun",
  };
}

export default async function ProductDetailPage({ params }) {
  const product = await loadProduct(params.slug);
  if (!product) {
    notFound();
  }
  const related = await loadRelated(product);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-burgundy-dark)] via-[rgba(58,16,16,0.92)] to-[var(--color-burgundy)]" aria-hidden />
      <div className="relative max-w-screen-xl mx-auto px-6 lg:px-10 pt-16 pb-20 space-y-14">
        <nav className="text-xs text-[var(--color-gold)]/70">
          <Link href="/" className="hover:text-[var(--color-rose)]">
            หน้าหลัก
          </Link>
          <span className="mx-2">/</span>
          <Link href="/#menu" className="hover:text-[var(--color-rose)]">
            เมนูวันนี้
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--color-rose)]">{product.title}</span>
        </nav>

        <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr] items-start">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[2.5rem] border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/70 shadow-2xl shadow-black/45">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full object-cover"
                />
              ) : (
                <div className="flex h-80 items-center justify-center text-6xl">🥟</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex flex-wrap gap-3">
                {product.images.slice(1).map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt={product.title}
                    className="h-20 w-20 rounded-2xl border border-[var(--color-rose)]/20 object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/75 p-8 text-[var(--color-text)] shadow-2xl shadow-black/45 backdrop-blur">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-[var(--color-rose)]">{product.title}</h1>
              <p className="text-sm text-[var(--color-text)]/70 leading-relaxed">{product.description}</p>
            </div>
            <div className="flex items-center gap-4 text-[var(--color-gold)]">
              <span className="text-2xl font-extrabold">฿{product.price}</span>
              {typeof product.stock === "number" && product.stock <= 0 ? (
                <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-100">
                  ต้องพรีออเดอร์
                </span>
              ) : typeof product.stock === "number" && product.stock <= 10 ? (
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-100">
                  เหลือ {product.stock} เข่งสุดท้าย
                </span>
              ) : (
                <span className="rounded-full bg-[var(--color-rose)]/15 px-3 py-1 text-xs font-semibold text-[var(--color-rose)]">
                  พร้อมเสิร์ฟทุกวัน
                </span>
              )}
            </div>
            {product.tags?.length ? (
              <div className="flex flex-wrap gap-2 text-xs text-[var(--color-gold)]/70">
                {product.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[var(--color-rose)]/20 px-3 py-1">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
            <ProductPurchaseActions product={product} />
            <div className="rounded-2xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy-dark)]/50 p-4 text-xs text-[var(--color-text)]/70">
              สมาชิก Bao Club จะได้รับแต้มทุกการสั่งซื้อ 1 แต้มต่อยอดซื้อ 50 บาท ใช้แลกรับส่วนลดสูงสุด 12%
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[var(--color-rose)]">เมนูที่น่าลองด้วยกัน</h2>
              <Link href="/#menu" className="text-xs font-semibold text-[var(--color-rose)] underline">
                ดูเมนูทั้งหมด
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item._id}
                  href={`/products/${item.slug || item._id}`}
                  className="group block rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/60 p-5 text-[var(--color-text)] shadow-lg shadow-black/30 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="aspect-square overflow-hidden rounded-2xl bg-[var(--color-burgundy-dark)]/40">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">🥟</div>
                    )}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[var(--color-rose)]">{item.title}</p>
                  <p className="text-xs text-[var(--color-text)]/60">฿{item.price}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
