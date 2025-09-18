import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import AddToCartButton from "@/components/AddToCartButton";

export default async function HomePage() {
  await connectToDatabase();
  const docs = await Product.find({ active: true })
    .sort({ createdAt: -1 })
    .lean();
  const products = (docs || []).map((d) => ({
    _id: String(d._id),
    title: d.title || "",
    description: d.description || "",
    price: d.price ?? 0,
  }));

  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold">Bun Shop</h1>
        <p className="text-gray-600 mt-2">ขนมนุ่ม หอมอร่อย — สั่งได้เลย 👇</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
          {products.map((p) => (
            <div key={p._id} className="border rounded-xl p-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <h3 className="font-medium mt-4">{p.title}</h3>
              <p className="text-gray-500 text-sm">{p.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="font-semibold">฿{p.price}</span>
                <AddToCartButton product={p} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
