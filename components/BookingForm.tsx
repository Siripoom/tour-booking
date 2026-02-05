"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ADDONS,
  LOCATIONS,
  TOUR_TYPES,
  Location,
  TourType,
  normalizeLocation,
} from "@/lib/catalog";
import { getPublicImageUrl } from "@/lib/supabase";

type LocationCardProps = {
  location: Location;
  isSelected: boolean;
  onSelect: () => void;
};

function LocationCard({ location, isSelected, onSelect }: LocationCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = useMemo(
    () => getPublicImageUrl(location.imagePath),
    [location.imagePath]
  );
  const showFallback = !imageUrl || imageError;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group overflow-hidden rounded-2xl border text-left transition ${
        isSelected
          ? "border-cyan-400 bg-cyan-50/70 shadow-[0_18px_40px_-24px_rgba(6,182,212,0.6)]"
          : "border-slate-200 bg-white/80 hover:border-cyan-200 hover:shadow-[0_16px_35px_-25px_rgba(251,113,133,0.35)]"
      }`}
    >
      <div className="relative h-36 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_65%)]">
        {!showFallback ? (
          <img
            src={imageUrl}
            alt={location.nameEn}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : null}
        {showFallback ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-xs uppercase tracking-[0.3em] text-slate-300">
            No image
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent opacity-80" />
      </div>
      <div className="space-y-1 p-4">
        <p className="text-sm font-semibold text-slate-900">
          {location.nameEn}
        </p>
        <p className="text-xs text-slate-500">{location.descriptionEn}</p>
      </div>
    </button>
  );
}
import {
  BASE_PRICE,
  calculatePrice,
  Duration,
  formatTHB,
  PriceBreakdown,
} from "@/lib/pricing";
import PriceSummary from "@/components/PriceSummary";

type FormState = {
  date: string;
  time: string;
  partySize: number;
  duration: Duration;
  tourType: string;
  locationId: string;
  addons: {
    guide: boolean;
    meals: boolean;
    pickup: boolean;
  };
  contactName: string;
  contactEmail: string;
  notes: string;
  locale: "th" | "en";
};

const defaultState: FormState = {
  date: "",
  time: "",
  partySize: 2,
  duration: "full",
  tourType: TOUR_TYPES[0]?.id ?? "",
  locationId: LOCATIONS[0]?.id ?? "",
  addons: {
    guide: false,
    meals: false,
    pickup: false,
  },
  contactName: "",
  contactEmail: "",
  notes: "",
  locale: "en",
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200";

export default function BookingForm() {
  const [formData, setFormData] = useState<FormState>(defaultState);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [tourTypes, setTourTypes] = useState<TourType[]>(TOUR_TYPES);
  const [locations, setLocations] = useState<Location[]>(LOCATIONS);

  const allTourTypeIds = useMemo(
    () => tourTypes.map((type) => type.id).filter(Boolean),
    [tourTypes]
  );
  const normalizedLocations = useMemo(
    () =>
      locations.map((location) =>
        normalizeLocation(location, allTourTypeIds)
      ),
    [locations, allTourTypeIds]
  );

  const filteredLocations = useMemo(
    () =>
      normalizedLocations.filter(
        (location) =>
          location.tourTypeIds.includes(formData.tourType) &&
          location.availableDurations.includes(formData.duration)
      ),
    [normalizedLocations, formData.tourType, formData.duration]
  );

  useEffect(() => {
    if (
      !filteredLocations.find(
        (location) => location.id === formData.locationId
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        locationId: filteredLocations[0]?.id ?? "",
      }));
    }
  }, [filteredLocations, formData.locationId]);

  const selectedTourType = useMemo(
    () => tourTypes.find((type) => type.id === formData.tourType),
    [tourTypes, formData.tourType]
  );
  const selectedLocation = useMemo(
    () =>
      normalizedLocations.find(
        (location) => location.id === formData.locationId
      ),
    [normalizedLocations, formData.locationId]
  );

  const breakdown: PriceBreakdown = useMemo(
    () =>
      calculatePrice({
        duration: formData.duration,
        partySize: formData.partySize,
        addons: formData.addons,
      }),
    [formData.duration, formData.partySize, formData.addons]
  );

  useEffect(() => {
    const fetchCatalogs = async () => {
      const [tourSnap, locationSnap] = await Promise.all([
        getDocs(collection(db, "tourTypes")),
        getDocs(collection(db, "locations")),
      ]);

      const tours = tourSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<TourType, "id">),
      }));
      const locs = locationSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Location, "id">),
      }));

      const nextTours = tours.length ? tours : TOUR_TYPES;
      const allTourTypeIds = nextTours.map((type) => type.id).filter(Boolean);
      const nextLocations = (locs.length ? locs : LOCATIONS).map((location) =>
        normalizeLocation(location, allTourTypeIds)
      );

      setTourTypes(nextTours);
      setLocations(nextLocations);

      setFormData((prev) => ({
        ...prev,
        tourType: nextTours.find((item) => item.id === prev.tourType)
          ? prev.tourType
          : nextTours[0]?.id ?? "",
        locationId: nextLocations.find((item) => item.id === prev.locationId)
          ? prev.locationId
          : nextLocations[0]?.id ?? "",
      }));
    };

    fetchCatalogs().catch(() => {
      setTourTypes(TOUR_TYPES);
      setLocations(
        LOCATIONS.map((location) =>
          normalizeLocation(location, TOUR_TYPES.map((type) => type.id))
        )
      );
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setMessage("");

    if (!formData.contactName.trim()) {
      setStatus("error");
      setMessage("Contact name is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      setStatus("error");
      setMessage("Invalid email address.");
      return;
    }

    try {
      setStatus("submitting");
      await addDoc(collection(db, "bookings"), {
        createdAt: serverTimestamp(),
        date: formData.date,
        time: formData.time,
        partySize: formData.partySize,
        duration: formData.duration,
        tourType: formData.tourType,
        locationId: formData.locationId,
        addons: formData.addons,
        price: {
          base: breakdown.base,
          addons: breakdown.addons,
          total: breakdown.total,
        },
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        notes: formData.notes,
        locale: formData.locale,
      });

      setStatus("success");
      setMessage(
        "Submission received. Our team will contact you within 24 hours."
      );
      setFormData(defaultState);
    } catch (error) {
      setStatus("error");
      setMessage("Submission failed. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        onSubmit={handleSubmit}
        className="glass-card rounded-3xl border border-white/80 bg-white/80 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.4)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-600">
              Booking
            </p>
            <h2 className="text-display mt-2 text-3xl font-semibold text-slate-900">
              Book Your Tour
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-700">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Premium care
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Date
            <input
              type="date"
              className={inputClass}
              value={formData.date}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, date: event.target.value }))
              }
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Time
            <input
              type="time"
              className={inputClass}
              value={formData.time}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, time: event.target.value }))
              }
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Party size
            <input
              type="number"
              min={1}
              max={20}
              className={inputClass}
              value={formData.partySize}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  partySize: Number(event.target.value),
                }))
              }
              required
            />
          </label>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-700">
            Duration
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {(["full", "half"] as Duration[]).map((value) => (
              <button
                type="button"
                key={value}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, duration: value }))
                }
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  formData.duration === value
                    ? "border-cyan-400 bg-cyan-50 text-cyan-700"
                    : "border-slate-200 bg-white/70 text-slate-600 hover:border-cyan-200"
                }`}
              >
                <p className="text-sm font-semibold">
                  {value === "full" ? "Full day" : "Half day"}
                </p>
                <p className="text-xs text-slate-500">
                  {formatTHB(BASE_PRICE[value])} / person
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Tour type
            <select
              className={inputClass}
              value={formData.tourType}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  tourType: event.target.value,
                }))
              }
            >
              {tourTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.labelEn}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-700">Location</p>
          {filteredLocations.length === 0 ? (
            <p className="mt-2 text-xs text-rose-500">
              No locations match this tour type and duration yet.
            </p>
          ) : (
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {filteredLocations.map((location) => {
                const isSelected = formData.locationId === location.id;
                return (
                  <LocationCard
                    key={location.id}
                    location={location}
                    isSelected={isSelected}
                    onSelect={() =>
                      setFormData((prev) => ({
                        ...prev,
                        locationId: location.id,
                      }))
                    }
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-3 rounded-3xl border border-cyan-100/80 bg-white/80 p-4 text-sm text-slate-600 shadow-[0_12px_30px_-24px_rgba(6,182,212,0.45)]">
          {selectedTourType ? (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-500">
                Tour type details
              </p>
              <p className="mt-1 text-slate-900">
                {selectedTourType.descriptionEn}
              </p>
            </div>
          ) : null}
          {selectedLocation ? (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-500">
                Location details
              </p>
              <p className="mt-1 text-slate-900">
                {selectedLocation.descriptionEn}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-700">
            Add-ons
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {(
              [
                ["guide", ADDONS.guide],
                ["meals", ADDONS.meals],
                ["pickup", ADDONS.pickup],
              ] as const
            ).map(([key, addon]) => (
              <label
                key={key}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-400"
                  checked={formData.addons[key]}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      addons: { ...prev.addons, [key]: event.target.checked },
                    }))
                  }
                />
                <div>
                  <p className="font-medium text-slate-800">
                    {addon.labelEn}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Contact name
            <input
              type="text"
              className={inputClass}
              value={formData.contactName}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  contactName: event.target.value,
                }))
              }
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              className={inputClass}
              value={formData.contactEmail}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  contactEmail: event.target.value,
                }))
              }
              required
            />
          </label>
        </div>

        <label className="mt-6 block text-sm font-medium text-slate-700">
          Notes
          <textarea
            className={`${inputClass} min-h-[110px]`}
            value={formData.notes}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, notes: event.target.value }))
            }
            placeholder="Pickup time or special requests"
          />
        </label>

        {message ? (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
              status === "success"
                ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Total
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {formatTHB(breakdown.total)}
            </p>
          </div>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(14,165,233,0.8)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_45px_-18px_rgba(16,185,129,0.85)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "submitting"
              ? "Sending..."
              : "Submit booking"}
          </button>
        </div>
      </form>

      <PriceSummary breakdown={breakdown} />
    </div>
  );
}
