const now = () => new Date();

export const sampleProducts = [
  {
    _id: "demo-bao-1",
    title: "ซาลาเปาหมูสับไข่เค็ม",
    description:
      "หมูสับปรุงรสแน่นๆ ใส่ไข่เค็มเต็มใบ นึ่งด้วยแป้งสูตรนุ่มหอมละมุน รสชาติกลมกล่อมกำลังดี",
    price: 35,
    costPrice: 18,
    images: ["/images/pao.jpg"],
    saleMode: "both",
    active: true,
  },
  {
    _id: "demo-bao-2",
    title: "ซาลาเปาหมูแดงฮ่องกง",
    description:
      "ซอสหมูแดงสไตล์กวางตุ้ง หวานเค็มกำลังดี ราดด้วยน้ำซอสเข้มข้น เสิร์ฟพร้อมแป้งนุ่มฟู",
    price: 32,
    costPrice: 17,
    images: ["/images/pao.jpg"],
    saleMode: "both",
    active: true,
  },
  {
    _id: "demo-bao-3",
    title: "ซาลาเปาครีมไข่เค็มลาวา",
    description:
      "คัสตาร์ดไข่แดงเค็มเข้มข้น หวานมันละมุน ไหลเยิ้มเมื่อกัดคำแรก เหมาะกับการทานคู่ชา",
    price: 38,
    costPrice: 20,
    images: ["/images/pao.jpg"],
    saleMode: "preorder",
    active: true,
  },
  {
    _id: "demo-bao-4",
    title: "ขนมจีบหมูและกุ้ง",
    description:
      "หมูสับผสมกุ้งเนื้อแน่น เพิ่มความหวานธรรมชาติ ห่อด้วยแป้งบาง นึ่งสดใหม่ทุกวัน",
    price: 45,
    costPrice: 26,
    images: ["/images/pao.jpg"],
    saleMode: "both",
    active: true,
  },
  {
    _id: "demo-bao-5",
    title: "ซาลาเปาถั่วดำสูตรโบราณ",
    description:
      "ไส้ถั่วดำกวนหอมหวาน เคี่ยวกับน้ำตาลมะพร้าวจนหอมกรุ่น เหมาะสำหรับคนไม่ทานเนื้อสัตว์",
    price: 30,
    costPrice: 15,
    images: ["/images/pao.jpg"],
    saleMode: "both",
    active: true,
  },
  {
    _id: "demo-bao-6",
    title: "ชุดซาลาเปาพรีเมียม 6 ชิ้น",
    description:
      "รวม 6 รสชาติขายดี จัดในกล่องของขวัญ พร้อมการ์ดอวยพร เข้ากับทุกโอกาสพิเศษ",
    price: 210,
    costPrice: 110,
    images: ["/images/pao.jpg"],
    saleMode: "both",
    active: true,
  },
];

export const sampleReviews = [
  {
    _id: "demo-review-1",
    userName: "คุณเอิร์ธ",
    rating: 4.8,
    comment: "แป้งนุ่มมาก ไส้หมูสับรสชาติเข้มข้น กินกับซอสพริกเข้ากันสุดๆ",
    createdAt: new Date(now().getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    _id: "demo-review-2",
    userName: "คุณเมย์",
    rating: 5,
    comment: "บริการดี แพ็กเกจจิ้งสวยงาม เหมาะซื้อไปฝากเพื่อนร่วมงานมากๆ",
    createdAt: new Date(now().getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    _id: "demo-review-3",
    userName: "คุณเจ",
    rating: 4.5,
    comment: "ซาลาเปาครีมไข่เค็มคือที่สุด ไส้ลาวาหอมมัน กินอุ่นๆ ฟินมาก",
    createdAt: new Date(now().getTime() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    _id: "demo-review-4",
    userName: "คุณวิว",
    rating: 4.9,
    comment: "สั่งไปงานเลี้ยง ลูกค้าชมกันทุกคน ขนมจีบกุ้งเนื้อเด้ง แนะนำเลยค่ะ",
    createdAt: new Date(now().getTime() - 1000 * 60 * 60 * 24 * 21).toISOString(),
  },
];

export const samplePromotions = [
  {
    _id: "demo-promo-1",
    title: "ซื้อ 3 แถม 1",
    description: "เมื่อซื้อซาลาเปารสเดียวกันครบ 3 ชิ้น รับฟรีอีก 1 ชิ้น",
    type: "buy_x_get_y",
    buyQuantity: 3,
    getQuantity: 1,
    active: true,
    startAt: new Date(now().getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    endAt: new Date(now().getTime() + 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    _id: "demo-promo-2",
    title: "สะสมตรา 8 ดวง แลกฟรี",
    description: "เก็บสแตมป์ทุกการสั่งซื้อ 200 บาท แลกรับซาลาเปาไส้พรีเมียมฟรี 2 ชิ้น",
    type: "stamp_card",
    stampGoal: 8,
    stampReward: "ซาลาเปาไส้พรีเมียม 2 ชิ้น",
    active: true,
    startAt: new Date(now().getTime() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    endAt: null,
  },
  {
    _id: "demo-promo-3",
    title: "ลด 10% สำหรับชุดของขวัญ",
    description: "ใส่โค้ด GIFT10 เมื่อสั่งชุดของขวัญ 3 กล่องขึ้นไป",
    type: "custom",
    active: false,
    startAt: new Date(now().getTime() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    endAt: new Date(now().getTime() + 1000 * 60 * 60 * 24 * 40).toISOString(),
  },
];

export function getSampleProducts({ limit, activeOnly = true } = {}) {
  let list = sampleProducts;
  if (activeOnly) {
    list = list.filter((product) => product.active !== false);
  }
  if (typeof limit === "number") {
    list = list.slice(0, Math.max(0, limit));
  }
  return list.map((product) => ({
    ...product,
  }));
}

export function getSampleProductById(id) {
  return sampleProducts.find((product) => String(product._id) === String(id));
}

export function getSampleReviews({ minRating = 0, limit } = {}) {
  let list = sampleReviews.filter((review) => Number(review.rating || 0) >= minRating);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (typeof limit === "number") {
    list = list.slice(0, Math.max(0, limit));
  }
  return list.map((review) => ({ ...review, id: review._id }));
}

export function getActiveSamplePromotions(referenceDate = now()) {
  const date = referenceDate instanceof Date ? referenceDate : now();
  return samplePromotions
    .filter((promotion) => promotion && promotion.active !== false)
    .filter((promotion) => {
      const start = promotion.startAt ? new Date(promotion.startAt) : null;
      const end = promotion.endAt ? new Date(promotion.endAt) : null;
      if (start && start.getTime() > date.getTime()) return false;
      if (end && end.getTime() < date.getTime()) return false;
      return true;
    })
    .map((promotion) => ({ ...promotion }));
}
