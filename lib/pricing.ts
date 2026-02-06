export type Addons = {
  guide: boolean;
  meals: boolean;
  pickup: boolean;
};

export type Duration = "full" | "half";

export type PricingInput = {
  duration: Duration;
  basePerPerson: number;
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
  const basePerPerson = Math.max(0, Math.round(input.basePerPerson || 0));
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
        labelTh: `${
          input.duration === "full" ? "Full day" : "Half day"
        } location rate x ${partySize} pax`,
        labelEn: `${input.duration === "full" ? "Full day" : "Half day"} location rate x ${partySize} pax`,
        amount: base,
      },
      {
        labelTh: "Professional guide",
        labelEn: "Professional guide",
        amount: guide,
      },
      {
        labelTh: "Lunch meals",
        labelEn: "Lunch meals",
        amount: meals,
      },
      {
        labelTh: "Hotel pickup (per group)",
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
