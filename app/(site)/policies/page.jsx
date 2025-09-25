export const metadata = {
  title: "นโยบาย & การจัดส่ง | Bao Lamphun",
  description: "นโยบายการจัดส่ง การยกเลิก และการคืนเงินของ Bao Lamphun",
};

const policies = [
  {
    title: "การจัดส่ง",
    items: [
      "จัดส่งฟรีเมื่อสั่งครบ ฿800 ภายในเขตเทศบาลเมืองลำพูน",
      "พื้นที่รอบนอกคิดค่าส่งตามระยะทาง เริ่มต้น 40-80 บาท",
      "รอบจัดส่งหลัก: 07:00 น. และ 14:00 น. สามารถนัดเวลาพิเศษได้ตามตกลง",
    ],
  },
  {
    title: "การรับสินค้า",
    items: [
      "ลูกค้าสามารถมารับที่หน้าร้านได้ตั้งแต่ 06:30 - 17:00 น.",
      "ตรวจสอบสินค้าให้ครบถ้วนก่อนออกจากร้าน หากมีปัญหาแจ้งทีมงานทันที",
    ],
  },
  {
    title: "การยกเลิก / เปลี่ยนแปลง",
    items: [
      "ออเดอร์ปกติสามารถเลื่อนหรือยกเลิกได้ล่วงหน้า 12 ชั่วโมง",
      "ออเดอร์มากกว่า 100 ชิ้น ยกเลิกได้ไม่เกิน 24 ชั่วโมงก่อนจัดส่ง",
      "หากชำระเงินแล้วและยกเลิกตามกำหนด จะคืนเงินเต็มจำนวนภายใน 3 วันทำการ",
    ],
  },
  {
    title: "การเก็บรักษา",
    items: [
      "รับประทานทันทีจะอร่อยที่สุด หากต้องเก็บควรแช่เย็นไม่เกิน 2 วัน",
      "อุ่นซาลาเปาและขนมจีบด้วยไอน้ำ 8-10 นาที หรือไมโครเวฟพร้อมถ้วยน้ำ",
    ],
  },
  {
    title: "การชำระเงิน",
    items: [
      "รองรับ PromptPay, โอนบัญชี, เงินสด และออกใบเสร็จ/ใบกำกับภาษี",
      "บริษัทหรือหน่วยงานสามารถชำระปลายทางพร้อมเอกสาร PO ตามตกลง",
    ],
  },
];

export default function PoliciesPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-burgundy-dark)] via-[rgba(58,16,16,0.92)] to-[var(--color-burgundy)]" aria-hidden />
      <section className="relative max-w-screen-xl mx-auto px-6 lg:px-10 pt-16 pb-20 space-y-12">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-extrabold text-[var(--color-rose)]">นโยบาย & การจัดส่ง</h1>
          <p className="text-sm text-[var(--color-gold)]/80">
            ข้อมูลสำคัญเกี่ยวกับการจัดส่ง การยกเลิก และการชำระเงิน เพื่อให้การสั่ง Bao Lamphun เป็นเรื่องง่าย
          </p>
        </header>
        <div className="space-y-6">
          {policies.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-[var(--color-rose)]/25 bg-[var(--color-burgundy)]/70 p-6 text-[var(--color-gold)] shadow-2xl shadow-black/35 backdrop-blur"
            >
              <h2 className="text-lg font-semibold text-[var(--color-rose)]">{section.title}</h2>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-gold)]/80 list-disc list-inside">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
