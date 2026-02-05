"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  LOCATIONS,
  TOUR_TYPES,
  Location,
  TourType,
  normalizeLocation,
} from "@/lib/catalog";
import { Duration } from "@/lib/pricing";
import { SUPABASE_BUCKET, supabase } from "@/lib/supabase";

type CatalogTourType = TourType & { id?: string };
type CatalogLocation = Location & { id?: string };

type TourTypeForm = {
  label: string;
  description: string;
};

type LocationForm = {
  name: string;
  area: string;
  imagePath: string;
  highlights: string;
  description: string;
  tourTypeIds: string[];
  availableDurations: Duration[];
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200";

export default function AdminCatalogManager() {
  const [tourTypes, setTourTypes] = useState<CatalogTourType[]>([]);
  const [locations, setLocations] = useState<CatalogLocation[]>([]);
  const [tourForm, setTourForm] = useState<TourTypeForm>({
    label: "",
    description: "",
  });
  const [locationForm, setLocationForm] = useState<LocationForm>({
    name: "",
    area: "",
    imagePath: "",
    highlights: "",
    description: "",
    tourTypeIds: [],
    availableDurations: ["full", "half"],
  });
  const [message, setMessage] = useState("");
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    const loadCatalogs = async () => {
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

      const nextTours = tours.length
        ? tours
        : TOUR_TYPES.map((t) => ({ ...t }));
      const allTourTypeIds = nextTours.map((type) => type.id);
      const nextLocations = (locs.length ? locs : LOCATIONS).map((location) =>
        normalizeLocation(location, allTourTypeIds),
      );

      setTourTypes(nextTours);
      setLocations(nextLocations);
    };

    loadCatalogs().catch(() => {
      setTourTypes(TOUR_TYPES.map((t) => ({ ...t })));
      setLocations(
        LOCATIONS.map((location) =>
          normalizeLocation(
            location,
            TOUR_TYPES.map((type) => type.id),
          ),
        ),
      );
    });
  }, []);

  useEffect(() => {
    if (!tourTypes.length) {
      return;
    }
    setLocationForm((prev) =>
      prev.tourTypeIds.length
        ? prev
        : { ...prev, tourTypeIds: tourTypes.map((type) => type.id) },
    );
  }, [tourTypes]);

  const refreshCatalogs = async () => {
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

    const nextTours = tours.length ? tours : TOUR_TYPES.map((t) => ({ ...t }));
    const allTourTypeIds = nextTours.map((type) => type.id);
    const nextLocations = (locs.length ? locs : LOCATIONS).map((location) =>
      normalizeLocation(location, allTourTypeIds),
    );

    setTourTypes(nextTours);
    setLocations(nextLocations);
  };

  const sortedTourTypes = useMemo(
    () => [...tourTypes].sort((a, b) => a.labelEn.localeCompare(b.labelEn)),
    [tourTypes],
  );
  const sortedLocations = useMemo(() => {
    const allTourTypeIds = tourTypes.map((type) => type.id);
    return [...locations]
      .map((location) => normalizeLocation(location, allTourTypeIds))
      .sort((a, b) => a.nameEn.localeCompare(b.nameEn));
  }, [locations, tourTypes]);
  const tourTypeMap = useMemo(
    () => new Map(tourTypes.map((type) => [type.id, type])),
    [tourTypes],
  );

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

  const handleImageUpload = async (file: File) => {
    setUploadMessage("");
    if (!supabase) {
      setUploadStatus("error");
      setUploadMessage("Supabase is not configured.");
      return;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const baseName = slugify(locationForm.name || "location") || "location";
    const path = `locations/${baseName}-${Date.now()}.${ext}`;

    setUploadStatus("uploading");
    setUploadMessage("Uploading...");
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) {
      setUploadStatus("error");
      setUploadMessage(error.message);
      return;
    }

    setLocationForm((prev) => ({ ...prev, imagePath: path }));
    setUploadStatus("success");
    setUploadMessage("Upload successful. Image path updated.");
  };

  const handleAddTourType = async () => {
    setMessage("");
    if (!tourForm.label.trim()) {
      setMessage("Please provide a tour type name.");
      return;
    }

    await addDoc(collection(db, "tourTypes"), {
      labelTh: tourForm.label,
      labelEn: tourForm.label,
      descriptionTh: tourForm.description,
      descriptionEn: tourForm.description,
    });
    setTourForm({
      label: "",
      description: "",
    });
    await refreshCatalogs();
    setMessage("Tour type added.");
  };

  const handleAddLocation = async () => {
    setMessage("");
    if (!locationForm.name.trim()) {
      setMessage("Please provide a location name.");
      return;
    }

    const highlights = locationForm.highlights
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const tourTypeIds = Array.from(
      new Set(locationForm.tourTypeIds.filter(Boolean)),
    );
    const availableDurations = Array.from(
      new Set(locationForm.availableDurations),
    ) as Duration[];

    await addDoc(collection(db, "locations"), {
      nameTh: locationForm.name,
      nameEn: locationForm.name,
      areaTh: locationForm.area,
      areaEn: locationForm.area,
      imagePath: locationForm.imagePath,
      highlights,
      descriptionTh: locationForm.description,
      descriptionEn: locationForm.description,
      tourTypeIds,
      availableDurations,
    });
    setLocationForm({
      name: "",
      area: "",
      imagePath: "",
      highlights: "",
      description: "",
      tourTypeIds: tourTypes.map((type) => type.id),
      availableDurations: ["full", "half"],
    });
    await refreshCatalogs();
    setMessage("Location added.");
  };

  const handleDeleteTourType = async (id?: string) => {
    if (!id) {
      return;
    }
    if (!window.confirm("Delete this tour type?")) {
      return;
    }
    setMessage("");
    await deleteDoc(doc(db, "tourTypes", id));
    await refreshCatalogs();
    setMessage("Tour type deleted.");
  };

  const handleDeleteLocation = async (id?: string) => {
    if (!id) {
      return;
    }
    if (!window.confirm("Delete this location?")) {
      return;
    }
    setMessage("");
    await deleteDoc(doc(db, "locations", id));
    await refreshCatalogs();
    setMessage("Location deleted.");
  };

  return (
    <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
            Catalog
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            Manage tour types and locations
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Add data for the Booking form and Highlights section.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
          Images are stored in Supabase bucket: <strong>tour-images</strong>
        </div>
      </div>

      {message ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/70 p-5">
          <h3 className="text-xl font-semibold text-slate-900">
            Add tour type
          </h3>
          <div className="grid gap-3">
            <input
              className={inputClass}
              placeholder="Tour type name"
              value={tourForm.label}
              onChange={(event) =>
                setTourForm((prev) => ({
                  ...prev,
                  label: event.target.value,
                }))
              }
            />
            <textarea
              className={`${inputClass} min-h-[90px]`}
              placeholder="Description"
              value={tourForm.description}
              onChange={(event) =>
                setTourForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
            <button
              type="button"
              onClick={() => handleAddTourType().catch(console.error)}
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
            >
              Add tour type
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/70 p-5">
          <h3 className="text-xl font-semibold text-slate-900">Add location</h3>
          <div className="grid gap-3">
            <input
              className={inputClass}
              placeholder="Location name"
              value={locationForm.name}
              onChange={(event) =>
                setLocationForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
            />

            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-600"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  handleImageUpload(file).catch(console.error);
                }
              }}
            />
            {uploadMessage ? (
              <p
                className={`text-xs ${
                  uploadStatus === "error"
                    ? "text-rose-500"
                    : "text-emerald-600"
                }`}
              >
                {uploadMessage}
              </p>
            ) : null}

            <textarea
              className={`${inputClass} min-h-[90px]`}
              placeholder="Location description"
              value={locationForm.description}
              onChange={(event) =>
                setLocationForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Supported tour types
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {sortedTourTypes.map((type) => (
                  <label key={type.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
                      checked={locationForm.tourTypeIds.includes(type.id)}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setLocationForm((prev) => ({
                          ...prev,
                          tourTypeIds: checked
                            ? [...prev.tourTypeIds, type.id]
                            : prev.tourTypeIds.filter((id) => id !== type.id),
                        }));
                      }}
                    />
                    {type.labelEn}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Supported durations
              </p>
              <div className="flex flex-wrap gap-4">
                {(["full", "half"] as Duration[]).map((duration) => (
                  <label key={duration} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
                      checked={locationForm.availableDurations.includes(
                        duration,
                      )}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setLocationForm((prev) => ({
                          ...prev,
                          availableDurations: checked
                            ? [...prev.availableDurations, duration]
                            : prev.availableDurations.filter(
                                (value) => value !== duration,
                              ),
                        }));
                      }}
                    />
                    {duration === "full" ? "Full day" : "Half day"}
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                If none selected, the location will be available for all
                durations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAddLocation().catch(console.error)}
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
            >
              Add location
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">
            All tour types
          </h4>
          <div className="mt-4 space-y-3">
            {sortedTourTypes.map((type) => (
              <div
                key={`${type.id ?? type.labelEn}`}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600"
              >
                <div>
                  <p className="font-semibold text-slate-900">{type.labelEn}</p>
                  <p className="text-xs text-slate-500">{type.descriptionEn}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteTourType(type.id)}
                  disabled={!type.id}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-slate-900">
            All locations
          </h4>
          <div className="mt-4 space-y-3">
            {sortedLocations.map((location) => (
              <div
                key={`${location.id ?? location.nameEn}`}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {location.nameEn}
                  </p>
                  <p className="text-xs text-slate-500">
                    {location.areaEn} • {location.imagePath || "no-image"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Durations:{" "}
                    {(location.availableDurations.length
                      ? location.availableDurations
                      : ["full", "half"]
                    )
                      .map((value) =>
                        value === "full" ? "Full day" : "Half day",
                      )
                      .join(", ")}
                  </p>
                  <p className="text-xs text-slate-500">
                    Tour types:{" "}
                    {(location.tourTypeIds.length
                      ? location.tourTypeIds
                      : tourTypes.map((type) => type.id)
                    )
                      .map((id) => tourTypeMap.get(id)?.labelEn ?? id)
                      .join(", ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteLocation(location.id)}
                  disabled={!location.id}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
