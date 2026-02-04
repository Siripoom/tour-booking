export type TourType = {
  id: string;
  labelTh: string;
  labelEn: string;
  descriptionTh: string;
  descriptionEn: string;
};

export type Location = {
  id: string;
  nameTh: string;
  nameEn: string;
  areaTh: string;
  areaEn: string;
  imagePath: string;
  highlights: string[];
};

export const TOUR_TYPES: TourType[] = [
  {
    id: "islands",
    labelTh: "เกาะและทะเล",
    labelEn: "Islands & Sea",
    descriptionTh: "ล่องเรือ ชมอ่าว น้ำใส หาดทรายขาว",
    descriptionEn: "Boat rides, clear bays, and white sand beaches.",
  },
  {
    id: "heritage",
    labelTh: "วัฒนธรรมและเมืองเก่า",
    labelEn: "Heritage & Old Town",
    descriptionTh: "เดินชมย่านเก่า คาเฟ่ และชุมชนท้องถิ่น",
    descriptionEn: "Walkable old town, cafés, and local communities.",
  },
  {
    id: "adventure",
    labelTh: "ผจญภัยและธรรมชาติ",
    labelEn: "Adventure & Nature",
    descriptionTh: "น้ำตก เส้นทางเขา และมุมมองพาโนรามา",
    descriptionEn: "Waterfalls, forest trails, and panoramic viewpoints.",
  },
];

export const LOCATIONS: Location[] = [
  {
    id: "phuket-cove",
    nameTh: "อ่าวสวรรค์ ภูเก็ต",
    nameEn: "Paradise Cove, Phuket",
    areaTh: "ทะเลอันดามัน",
    areaEn: "Andaman Sea",
    imagePath: "phuket-cove.jpg",
    highlights: ["Snorkeling", "Hidden beach", "Sunset cruise"],
  },
  {
    id: "chiang-mai",
    nameTh: "ดอยสูง เชียงใหม่",
    nameEn: "Highland Chiang Mai",
    areaTh: "ภาคเหนือ",
    areaEn: "Northern Thailand",
    imagePath: "chiang-mai-highland.jpg",
    highlights: ["Misty mornings", "Hill tribe market", "Tea tasting"],
  },
  {
    id: "ayutthaya",
    nameTh: "อยุธยา เมืองมรดก",
    nameEn: "Ayutthaya Heritage",
    areaTh: "ภาคกลาง",
    areaEn: "Central Thailand",
    imagePath: "ayutthaya-heritage.jpg",
    highlights: ["Temple tour", "River cruise", "Local craft"],
  },
  {
    id: "krabi",
    nameTh: "กระบี่ หน้าผาและหาดลับ",
    nameEn: "Krabi Cliffs & Coves",
    areaTh: "ทะเลใต้",
    areaEn: "Southern Sea",
    imagePath: "krabi-cliffs.jpg",
    highlights: ["Kayak", "Limestone cliffs", "Beach picnic"],
  },
];

export const ADDONS = {
  guide: {
    labelTh: "ไกด์มืออาชีพ",
    labelEn: "Professional Guide",
  },
  meals: {
    labelTh: "อาหารกลางวัน",
    labelEn: "Lunch Meals",
  },
  pickup: {
    labelTh: "รับ-ส่งโรงแรม",
    labelEn: "Hotel Pickup",
  },
};
