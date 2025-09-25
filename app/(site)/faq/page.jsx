export const metadata = {
  title: "คำถามที่พบบ่อย | Bao Lamphun",
  description: "คำตอบเกี่ยวกับการสั่งซื้อ การจัดส่ง และการเก็บรักษาซาลาเปา Bao Lamphun",
};

const faqs = [
  {
    question: "ต้องสั่งล่วงหน้าเท่าไร?",
    answer:
      "ออเดอร์ปกติสามารถสั่งก่อนล่วงหน้า 1 วัน ส่วนงานพิเศษตั้งแต่ 80 ชิ้นขึ้นไปแนะนำให้แจ้งล่วงหน้าอย่างน้อย 3 วัน เพื่อให้ทีมเตรียมวัตถุดิบและรอบจัดส่งได้ครบ",
  },
  {
    question: "มีบริการจัดส่งโซนไหนบ้าง?",
    answer:
      "เราจัดส่งฟรีในเขตเทศบาลเมืองลำพูนเมื่อสั่งครบ ฿800 และคิดค่าส่งตามระยะทางสำหรับพื้นที่รอบนอก เช่น อ.แม่ทา อ.บ้านธิ หากอยู่นอกเขตสามารถรับหน้าร้านได้",
  },
  {
    question: "ซาลาเปาเก็บได้นานแค่ไหน?",
    answer:
      "ซาลาเปาและขนมจีบที่ยังไม่เปิดห่อสามารถแช่เย็นได้ 2 วัน แช่แข็งได้ 7 วัน โดยอุ่นไอน้ำ 8-10 นาทีจนร้อนทั่วก่อนรับประทาน",
  },
  {
    question: "รับชำระเงินแบบไหน?",
    answer:
      "รองรับโอนผ่าน PromptPay, บัญชีธนาคาร, เงินสดหน้าร้าน และชำระปลายทางสำหรับบริษัทที่มีใบ PO",
  },
  {
    question: "สามารถออกใบกำกับภาษีได้ไหม?",
    answer:
      "ได้ค่ะ แจ้งชื่อบริษัท ที่อยู่ และเลขประจำตัวผู้เสียภาษีพร้อมตอนสั่งซื้อ เราจะส่งใบกำกับภาษีพร้อมสินค้าหรืออีเมล PDF ให้",
  },
];

export default function FaqPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-burgundy-dark)] via-[rgba(58,16,16,0.92)] to-[var(--color-burgundy)]" aria-hidden />
      <section className="relative max-w-screen-xl mx-auto px-6 lg:px-10 pt-16 pb-20 space-y-10">
        <header className="space-y-4 text-center">
          <h1 className="text-4xl font-extrabold text-[var(--color-rose)]">คำถามที่พบบ่อย</h1>
          <p className="text-sm text-[var(--color-gold)]/80">
            รวมคำตอบเรื่องการสั่งซื้อ การจัดส่ง และการเก็บรักษาซาลาเปา Bao Lamphun
          </p>
        </header>
        <div className="grid gap-6 lg:grid-cols-2">
          {faqs.map((item) => (
            <div
              key={item.question}
              className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/70 p-6 text-[var(--color-gold)] shadow-2xl shadow-black/40 backdrop-blur"
            >
              <h2 className="text-lg font-semibold text-[var(--color-rose)]">{item.question}</h2>
              <p className="mt-3 text-sm text-[var(--color-gold)]/80 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
