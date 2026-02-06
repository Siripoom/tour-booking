import { Duration } from "@/lib/pricing";

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
  descriptionTh: string;
  descriptionEn: string;
  tourTypeIds: string[];
  availableDurations: Duration[];
  pricePerPerson?: Partial<Record<Duration, number>>;
};

export const TOUR_TYPES: TourType[] = [
  {
    id: "islands",
    labelTh: "Islands & Sea",
    labelEn: "Islands & Sea",
    descriptionTh: "Boat rides, clear bays, and white sand beaches.",
    descriptionEn: "Boat rides, clear bays, and white sand beaches.",
  },
  {
    id: "heritage",
    labelTh: "Heritage & Old Town",
    labelEn: "Heritage & Old Town",
    descriptionTh: "Walkable old town, cafés, and local communities.",
    descriptionEn: "Walkable old town, cafés, and local communities.",
  },
  {
    id: "adventure",
    labelTh: "Adventure & Nature",
    labelEn: "Adventure & Nature",
    descriptionTh: "Waterfalls, forest trails, and panoramic viewpoints.",
    descriptionEn: "Waterfalls, forest trails, and panoramic viewpoints.",
  },
];

export const LOCATIONS: Location[] = [
  {
    id: "phuket-cove",
    nameTh: "Paradise Cove, Phuket",
    nameEn: "Paradise Cove, Phuket",
    areaTh: "Andaman Sea",
    areaEn: "Andaman Sea",
    imagePath: "phuket-cove.jpg",
    highlights: ["Snorkeling", "Hidden beach", "Sunset cruise"],
    descriptionTh: "A private cove with clear water, perfect for a relaxed getaway.",
    descriptionEn: "A private cove with clear water, perfect for a relaxed getaway.",
    tourTypeIds: ["islands", "adventure"],
    availableDurations: ["full", "half"],
  },
  {
    id: "chiang-mai",
    nameTh: "Highland Chiang Mai",
    nameEn: "Highland Chiang Mai",
    areaTh: "Northern Thailand",
    areaEn: "Northern Thailand",
    imagePath: "chiang-mai-highland.jpg",
    highlights: ["Misty mornings", "Hill tribe market", "Tea tasting"],
    descriptionTh: "Nature-focused escape with misty mornings and hill tribe culture.",
    descriptionEn: "Nature-focused escape with misty mornings and hill tribe culture.",
    tourTypeIds: ["adventure", "heritage"],
    availableDurations: ["full"],
  },
  {
    id: "ayutthaya",
    nameTh: "Ayutthaya Heritage",
    nameEn: "Ayutthaya Heritage",
    areaTh: "Central Thailand",
    areaEn: "Central Thailand",
    imagePath: "ayutthaya-heritage.jpg",
    highlights: ["Temple tour", "River cruise", "Local craft"],
    descriptionTh: "Historic city tour with temples, riverside views, and local crafts.",
    descriptionEn: "Historic city tour with temples, riverside views, and local crafts.",
    tourTypeIds: ["heritage"],
    availableDurations: ["full", "half"],
  },
  {
    id: "krabi",
    nameTh: "Krabi Cliffs & Coves",
    nameEn: "Krabi Cliffs & Coves",
    areaTh: "Southern Sea",
    areaEn: "Southern Sea",
    imagePath: "krabi-cliffs.jpg",
    highlights: ["Kayak", "Limestone cliffs", "Beach picnic"],
    descriptionTh: "Boat trip through limestone cliffs with secluded beach stops.",
    descriptionEn: "Boat trip through limestone cliffs with secluded beach stops.",
    tourTypeIds: ["islands", "adventure"],
    availableDurations: ["full"],
  },
];

export const ADDONS = {
  guide: {
    labelTh: "Professional guide",
    labelEn: "Professional Guide",
  },
  meals: {
    labelTh: "Lunch meals",
    labelEn: "Lunch Meals",
  },
  pickup: {
    labelTh: "Hotel pickup",
    labelEn: "Hotel Pickup",
  },
};

export const DEFAULT_DURATIONS: Duration[] = ["full", "half"];

type LocationLike = Partial<Location> &
  Pick<Location, "id" | "nameTh" | "nameEn" | "areaTh" | "areaEn" | "imagePath">;

function sanitizePrice(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  const rounded = Math.round(value);
  if (rounded < 0) {
    return null;
  }
  return rounded;
}

export function normalizeLocation(
  location: LocationLike,
  allTourTypeIds: string[] = []
): Location {
  const tourTypeIds =
    location.tourTypeIds && location.tourTypeIds.length
      ? location.tourTypeIds
      : allTourTypeIds;
  const availableDurations =
    location.availableDurations && location.availableDurations.length
      ? location.availableDurations
      : DEFAULT_DURATIONS;
  const rawPrices = location.pricePerPerson ?? {};
  const full = sanitizePrice(rawPrices.full);
  const half = sanitizePrice(rawPrices.half);
  const pricePerPerson: Partial<Record<Duration, number>> = {};
  if (full !== null) {
    pricePerPerson.full = full;
  }
  if (half !== null) {
    pricePerPerson.half = half;
  }

  return {
    id: location.id,
    nameTh: location.nameTh ?? "",
    nameEn: location.nameEn ?? "",
    areaTh: location.areaTh ?? "",
    areaEn: location.areaEn ?? "",
    imagePath: location.imagePath ?? "",
    highlights: location.highlights ?? [],
    descriptionTh: location.descriptionTh ?? "",
    descriptionEn: location.descriptionEn ?? "",
    tourTypeIds: tourTypeIds.filter(Boolean),
    availableDurations: availableDurations.filter(Boolean) as Duration[],
    pricePerPerson,
  };
}
