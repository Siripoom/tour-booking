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
import {
  BASE_PRICE,
  calculatePrice,
  Duration,
  formatTHB,
  PriceBreakdown,
} from "@/lib/pricing";
import PriceSummary from "@/components/PriceSummary";
import { getPublicImageUrl } from "@/lib/supabase";

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

type BaseSource = "location" | "fallback";

type LocationCardProps = {
  location: Location;
  duration: Duration;
  isSelected: boolean;
  basePerPerson: number;
  usesFallback: boolean;
  onSelect: () => void;
};

const STEPS = [
  "Trip details",
  "Location",
  "Add-ons",
  "Contact & Review",
] as const;

const LAST_STEP_INDEX = STEPS.length - 1;

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

function getLocationBasePrice(location: Location | undefined, duration: Duration) {
  const price = location?.pricePerPerson?.[duration];
  if (typeof price === "number" && Number.isFinite(price) && price >= 0) {
    return {
      basePerPerson: Math.round(price),
      baseSource: "location" as BaseSource,
    };
  }

  return {
    basePerPerson: BASE_PRICE[duration],
    baseSource: "fallback" as BaseSource,
  };
}

function LocationCard({
  location,
  duration,
  isSelected,
  basePerPerson,
  usesFallback,
  onSelect,
}: LocationCardProps) {
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
      <div className="space-y-2 p-4">
        <p className="text-sm font-semibold text-slate-900">{location.nameEn}</p>
        <p className="text-xs text-slate-500">{location.descriptionEn}</p>
        <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-xs">
          <p className="font-semibold text-cyan-700">
            {duration === "full" ? "Full day" : "Half day"}: {formatTHB(basePerPerson)} / person
          </p>
          {usesFallback ? (
            <p className="mt-1 text-[11px] text-cyan-600">Using default rate</p>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export default function BookingForm() {
  const [formData, setFormData] = useState<FormState>(defaultState);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<Partial<Record<number, string>>>({});
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

  const currentLocationId =
    filteredLocations.find((location) => location.id === formData.locationId)?.id ??
    filteredLocations[0]?.id ??
    "";

  const selectedTourType = useMemo(
    () => tourTypes.find((type) => type.id === formData.tourType),
    [tourTypes, formData.tourType]
  );

  const selectedLocation = useMemo(
    () =>
      normalizedLocations.find(
        (location) => location.id === currentLocationId
      ),
    [normalizedLocations, currentLocationId]
  );

  const selectedLocationBase = useMemo(
    () => getLocationBasePrice(selectedLocation, formData.duration),
    [selectedLocation, formData.duration]
  );

  const breakdown: PriceBreakdown = useMemo(
    () =>
      calculatePrice({
        duration: formData.duration,
        basePerPerson: selectedLocationBase.basePerPerson,
        partySize: formData.partySize,
        addons: formData.addons,
      }),
    [
      formData.duration,
      formData.partySize,
      formData.addons,
      selectedLocationBase.basePerPerson,
    ]
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
      const nextTourTypeIds = nextTours.map((type) => type.id).filter(Boolean);
      const nextLocations = (locs.length ? locs : LOCATIONS).map((location) =>
        normalizeLocation(location, nextTourTypeIds)
      );

      setTourTypes(nextTours);
      setLocations(nextLocations);

      setFormData((prev) => {
        const nextTourType = nextTours.find((item) => item.id === prev.tourType)
          ? prev.tourType
          : nextTours[0]?.id ?? "";
        const nextFilteredLocations = nextLocations.filter(
          (location) =>
            location.tourTypeIds.includes(nextTourType) &&
            location.availableDurations.includes(prev.duration)
        );
        const nextLocationId = nextFilteredLocations.find(
          (item) => item.id === prev.locationId
        )
          ? prev.locationId
          : nextFilteredLocations[0]?.id ?? "";

        return {
          ...prev,
          tourType: nextTourType,
          locationId: nextLocationId,
        };
      });
    };

    fetchCatalogs().catch(() => {
      const fallbackTours = TOUR_TYPES;
      const fallbackLocations = LOCATIONS.map((location) =>
        normalizeLocation(location, TOUR_TYPES.map((type) => type.id))
      );

      setTourTypes(fallbackTours);
      setLocations(fallbackLocations);

      setFormData((prev) => {
        const nextTourType = fallbackTours.find((item) => item.id === prev.tourType)
          ? prev.tourType
          : fallbackTours[0]?.id ?? "";
        const nextFilteredLocations = fallbackLocations.filter(
          (location) =>
            location.tourTypeIds.includes(nextTourType) &&
            location.availableDurations.includes(prev.duration)
        );
        const nextLocationId = nextFilteredLocations.find(
          (item) => item.id === prev.locationId
        )
          ? prev.locationId
          : nextFilteredLocations[0]?.id ?? "";

        return {
          ...prev,
          tourType: nextTourType,
          locationId: nextLocationId,
        };
      });
    });
  }, []);

  const clearStepError = (step: number) => {
    setStepErrors((prev) => {
      if (!(step in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[step];
      return next;
    });
  };

  const validateStep = (step: number) => {
    if (step === 0) {
      if (!formData.date) {
        return "Date is required.";
      }
      if (!formData.time) {
        return "Time is required.";
      }
      if (
        !Number.isFinite(formData.partySize) ||
        formData.partySize < 1 ||
        formData.partySize > 20
      ) {
        return "Party size must be between 1 and 20.";
      }
      if (!formData.tourType) {
        return "Tour type is required.";
      }
      return "";
    }

    if (step === 1) {
      if (!filteredLocations.length) {
        return "No locations match this tour type and duration yet.";
      }
      if (!currentLocationId) {
        return "Please select a location.";
      }
      return "";
    }

    if (step === 3) {
      if (!formData.contactName.trim()) {
        return "Contact name is required.";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        return "Invalid email address.";
      }
      return "";
    }

    return "";
  };

  const handleTourTypeChange = (tourType: string) => {
    clearStepError(0);
    clearStepError(1);
    setFormData((prev) => {
      const nextFilteredLocations = normalizedLocations.filter(
        (location) =>
          location.tourTypeIds.includes(tourType) &&
          location.availableDurations.includes(prev.duration)
      );
      const nextLocationId = nextFilteredLocations.find(
        (location) => location.id === prev.locationId
      )
        ? prev.locationId
        : nextFilteredLocations[0]?.id ?? "";

      return {
        ...prev,
        tourType,
        locationId: nextLocationId,
      };
    });
  };

  const handleDurationChange = (duration: Duration) => {
    clearStepError(0);
    clearStepError(1);
    setFormData((prev) => {
      const nextFilteredLocations = normalizedLocations.filter(
        (location) =>
          location.tourTypeIds.includes(prev.tourType) &&
          location.availableDurations.includes(duration)
      );
      const nextLocationId = nextFilteredLocations.find(
        (location) => location.id === prev.locationId
      )
        ? prev.locationId
        : nextFilteredLocations[0]?.id ?? "";

      return {
        ...prev,
        duration,
        locationId: nextLocationId,
      };
    });
  };

  const goNextStep = () => {
    const error = validateStep(currentStep);
    if (error) {
      setStepErrors((prev) => ({ ...prev, [currentStep]: error }));
      setStatus("error");
      setMessage(error);
      return;
    }

    clearStepError(currentStep);
    setStatus("idle");
    setMessage("");
    setCurrentStep((prev) => Math.min(LAST_STEP_INDEX, prev + 1));
  };

  const goBackStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    setStatus("idle");
    setMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (currentStep < LAST_STEP_INDEX) {
      goNextStep();
      return;
    }

    setStatus("idle");
    setMessage("");

    for (const step of [0, 1, 3]) {
      const error = validateStep(step);
      if (error) {
        setStepErrors((prev) => ({ ...prev, [step]: error }));
        setCurrentStep(step);
        setStatus("error");
        setMessage(error);
        return;
      }
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
        locationId: currentLocationId,
        addons: formData.addons,
        price: {
          base: breakdown.base,
          addons: breakdown.addons,
          total: breakdown.total,
          basePerPerson: selectedLocationBase.basePerPerson,
          baseSource: selectedLocationBase.baseSource,
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
      setStepErrors({});
      setCurrentStep(0);
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

        <div className="mt-6 grid gap-2 sm:grid-cols-4">
          {STEPS.map((label, index) => {
            const isActive = index === currentStep;
            const isDone = index < currentStep;
            return (
              <div
                key={label}
                className={`rounded-2xl border px-3 py-2 text-xs ${
                  isActive
                    ? "border-cyan-400 bg-cyan-50 text-cyan-700"
                    : isDone
                    ? "border-cyan-200 bg-cyan-50/60 text-cyan-600"
                    : "border-slate-200 bg-white/70 text-slate-500"
                }`}
              >
                <p className="font-semibold">Step {index + 1}</p>
                <p className="mt-1">{label}</p>
              </div>
            );
          })}
        </div>

        {currentStep === 0 ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Date
                <input
                  type="date"
                  className={inputClass}
                  value={formData.date}
                  onChange={(event) => {
                    clearStepError(0);
                    setFormData((prev) => ({ ...prev, date: event.target.value }));
                  }}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Time
                <input
                  type="time"
                  className={inputClass}
                  value={formData.time}
                  onChange={(event) => {
                    clearStepError(0);
                    setFormData((prev) => ({ ...prev, time: event.target.value }));
                  }}
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
                  onChange={(event) => {
                    clearStepError(0);
                    const parsed = Number(event.target.value);
                    const partySize = Number.isFinite(parsed)
                      ? Math.min(20, Math.max(1, Math.round(parsed)))
                      : 1;
                    setFormData((prev) => ({
                      ...prev,
                      partySize,
                    }));
                  }}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Tour type
                <select
                  className={inputClass}
                  value={formData.tourType}
                  onChange={(event) =>
                    handleTourTypeChange(event.target.value)
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

            <div>
              <p className="text-sm font-medium text-slate-700">Duration</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {(["full", "half"] as Duration[]).map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => handleDurationChange(value)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      formData.duration === value
                        ? "border-cyan-400 bg-cyan-50 text-cyan-700"
                        : "border-slate-200 bg-white/70 text-slate-600 hover:border-cyan-200"
                    }`}
                  >
                    <p className="text-sm font-semibold">
                      {value === "full" ? "Full day" : "Half day"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {selectedTourType ? (
              <div className="grid gap-3 rounded-3xl border border-cyan-100/80 bg-white/80 p-4 text-sm text-slate-600 shadow-[0_12px_30px_-24px_rgba(6,182,212,0.45)]">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-500">
                  Tour type details
                </p>
                <p className="text-slate-900">{selectedTourType.descriptionEn}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {currentStep === 1 ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm font-medium text-slate-700">Location</p>
            {filteredLocations.length === 0 ? (
              <p className="text-xs text-rose-500">
                No locations match this tour type and duration yet.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredLocations.map((location) => {
                  const pricing = getLocationBasePrice(location, formData.duration);
                  return (
                    <LocationCard
                      key={location.id}
                      location={location}
                      duration={formData.duration}
                      isSelected={currentLocationId === location.id}
                      basePerPerson={pricing.basePerPerson}
                      usesFallback={pricing.baseSource === "fallback"}
                      onSelect={() => {
                        clearStepError(1);
                        setFormData((prev) => ({
                          ...prev,
                          locationId: location.id,
                        }));
                      }}
                    />
                  );
                })}
              </div>
            )}

            {selectedLocation ? (
              <div className="grid gap-3 rounded-3xl border border-cyan-100/80 bg-white/80 p-4 text-sm text-slate-600 shadow-[0_12px_30px_-24px_rgba(6,182,212,0.45)]">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-500">
                    Location details
                  </p>
                  <p className="mt-1 text-slate-900">
                    {selectedLocation.descriptionEn}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-500">
                    Selected rate
                  </p>
                  <p className="mt-1 text-slate-900">
                    {formatTHB(selectedLocationBase.basePerPerson)} / person
                    {selectedLocationBase.baseSource === "fallback"
                      ? " (default)"
                      : ""}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="mt-6">
            <p className="text-sm font-medium text-slate-700">Add-ons</p>
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
                    <p className="font-medium text-slate-800">{addon.labelEn}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Contact name
                <input
                  type="text"
                  className={inputClass}
                  value={formData.contactName}
                  onChange={(event) => {
                    clearStepError(3);
                    setFormData((prev) => ({
                      ...prev,
                      contactName: event.target.value,
                    }));
                  }}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  className={inputClass}
                  value={formData.contactEmail}
                  onChange={(event) => {
                    clearStepError(3);
                    setFormData((prev) => ({
                      ...prev,
                      contactEmail: event.target.value,
                    }));
                  }}
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
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

            <div className="rounded-3xl border border-cyan-100/80 bg-white/80 p-4 text-sm text-slate-600 shadow-[0_12px_30px_-24px_rgba(6,182,212,0.45)]">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-500">
                Review
              </p>
              <p className="mt-2 text-slate-900">
                {formData.date || "-"} {formData.time ? `• ${formData.time}` : ""}
              </p>
              <p className="mt-1 text-slate-700">
                {selectedTourType?.labelEn ?? "-"} • {selectedLocation?.nameEn ?? "-"}
              </p>
              <p className="mt-1 text-slate-700">
                {formData.duration === "full" ? "Full day" : "Half day"} • {formData.partySize} people
              </p>
            </div>
          </div>
        ) : null}

        {stepErrors[currentStep] ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {stepErrors[currentStep]}
          </div>
        ) : null}

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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goBackStep}
              disabled={currentStep === 0 || status === "submitting"}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Back
            </button>
            {currentStep < LAST_STEP_INDEX ? (
              <button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(14,165,233,0.8)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_45px_-18px_rgba(16,185,129,0.85)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(14,165,233,0.8)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_45px_-18px_rgba(16,185,129,0.85)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "submitting" ? "Sending..." : "Submit booking"}
              </button>
            )}
          </div>
        </div>
      </form>

      <PriceSummary breakdown={breakdown} />
    </div>
  );
}
