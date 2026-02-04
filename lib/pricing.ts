export type Addons = {
  guide: boolean;
  meals: boolean;
  pickup: boolean;
};

export type Duration = "full" | "half";

export type PricingInput = {
  duration: Duration;
  partySize: number;
  addons: Addons;
};

export type PriceLine = {
  labelTh: string;
  labelEn: string;
  amount: number;
};

export type PriceBreakdown = {
  base: number;
  addons: number;
  total: number;
  lines: PriceLine[];
};

export const BASE_PRICE = {
  full: 2500,
  half: 1500,
};

export const ADDON_PRICES = {
  guide: 600,
  meals: 300,
  pickup: 800,
};

export function calculatePrice(input: PricingInput): PriceBreakdown {
  const partySize = Math.max(1, input.partySize || 1);
  const basePerPerson = BASE_PRICE[input.duration];
  const base = basePerPerson * partySize;
  const guide = input.addons.guide ? ADDON_PRICES.guide * partySize : 0;
  const meals = input.addons.meals ? ADDON_PRICES.meals * partySize : 0;
  const pickup = input.addons.pickup ? ADDON_PRICES.pickup : 0;
  const addonsTotal = guide + meals + pickup;

  return {
    base,
    addons: addonsTotal,
    total: base + addonsTotal,
    lines: [
      {
        labelTh: `ค่าทัวร์ ${input.duration === "full" ? "เต็มวัน" : "ครึ่งวัน"} x ${partySize} คน`,
        labelEn: `${input.duration === "full" ? "Full day" : "Half day"} base x ${partySize} pax`,
        amount: base,
      },
      {
        labelTh: "ไกด์มืออาชีพ",
        labelEn: "Professional guide",
        amount: guide,
      },
      {
        labelTh: "อาหารกลางวัน",
        labelEn: "Lunch meals",
        amount: meals,
      },
      {
        labelTh: "รับ-ส่งโรงแรม (ต่อกรุ๊ป)",
        labelEn: "Hotel pickup (per group)",
        amount: pickup,
      },
    ],
  };
}

export function formatTHB(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
}
