"use client";

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LOCATIONS, TOUR_TYPES, Location, TourType } from "@/lib/catalog";

type CatalogTourType = TourType & { id?: string };
type CatalogLocation = Location & { id?: string };

type TourTypeForm = {
  labelTh: string;
  labelEn: string;
  descriptionTh: string;
  descriptionEn: string;
};

type LocationForm = {
  nameTh: string;
  nameEn: string;
  areaTh: string;
  areaEn: string;
  imagePath: string;
  highlights: string;
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200";

export default function AdminCatalogManager() {
  const [tourTypes, setTourTypes] = useState<CatalogTourType[]>([]);
  const [locations, setLocations] = useState<CatalogLocation[]>([]);
  const [tourForm, setTourForm] = useState<TourTypeForm>({
    labelTh: "",
    labelEn: "",
    descriptionTh: "",
    descriptionEn: "",
  });
  const [locationForm, setLocationForm] = useState<LocationForm>({
    nameTh: "",
    nameEn: "",
    areaTh: "",
    areaEn: "",
    imagePath: "",
    highlights: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadCatalogs = async () => {
      const [tourSnap, locationSnap] = await Promise.all([
        getDocs(collection(db, "tourTypes")),
        getDocs(collection(db, "locations")),
      ]);

      const tours = tourSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as TourType),
      }));
      const locs = locationSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Location),
      }));

      setTourTypes(tours.length ? tours : TOUR_TYPES.map((t) => ({ ...t })));
      setLocations(locs.length ? locs : LOCATIONS.map((l) => ({ ...l })));
    };

    loadCatalogs().catch(() => {
      setTourTypes(TOUR_TYPES.map((t) => ({ ...t })));
      setLocations(LOCATIONS.map((l) => ({ ...l })));
    });
  }, []);

  const refreshCatalogs = async () => {
    const [tourSnap, locationSnap] = await Promise.all([
      getDocs(collection(db, "tourTypes")),
      getDocs(collection(db, "locations")),
    ]);

    const tours = tourSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as TourType),
    }));
    const locs = locationSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Location),
    }));

    setTourTypes(tours.length ? tours : TOUR_TYPES.map((t) => ({ ...t })));
    setLocations(locs.length ? locs : LOCATIONS.map((l) => ({ ...l })));
  };

  const sortedTourTypes = useMemo(
    () => [...tourTypes].sort((a, b) => a.labelTh.localeCompare(b.labelTh)),
    [tourTypes]
  );
  const sortedLocations = useMemo(
    () => [...locations].sort((a, b) => a.nameTh.localeCompare(b.nameTh)),
    [locations]
  );

  const handleAddTourType = async () => {
    setMessage("");
    if (!tourForm.labelTh.trim() || !tourForm.labelEn.trim()) {
      setMessage("กรุณากรอกชื่อประเภททัวร์ (TH/EN)");
      return;
    }

    await addDoc(collection(db, "tourTypes"), {
      labelTh: tourForm.labelTh,
      labelEn: tourForm.labelEn,
      descriptionTh: tourForm.descriptionTh,
      descriptionEn: tourForm.descriptionEn,
    });
    setTourForm({
      labelTh: "",
      labelEn: "",
      descriptionTh: "",
      descriptionEn: "",
    });
    await refreshCatalogs();
    setMessage("เพิ่มประเภททัวร์เรียบร้อยแล้ว");
  };

  const handleAddLocation = async () => {
    setMessage("");
    if (!locationForm.nameTh.trim() || !locationForm.nameEn.trim()) {
      setMessage("กรุณากรอกชื่อสถานที่ (TH/EN)");
      return;
    }

    const highlights = locationForm.highlights
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    await addDoc(collection(db, "locations"), {
      nameTh: locationForm.nameTh,
      nameEn: locationForm.nameEn,
      areaTh: locationForm.areaTh,
      areaEn: locationForm.areaEn,
      imagePath: locationForm.imagePath,
      highlights,
    });
    setLocationForm({
      nameTh: "",
      nameEn: "",
      areaTh: "",
      areaEn: "",
      imagePath: "",
      highlights: "",
    });
    await refreshCatalogs();
    setMessage("เพิ่มสถานที่เรียบร้อยแล้ว");
  };

  return (
    <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
            Catalog / ข้อมูลทัวร์
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            เพิ่มประเภททัวร์และสถานที่
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            ใส่ข้อมูลเพื่อแสดงในหน้า Booking และ Highlights
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
          ใช้ภาพจาก Supabase bucket: <strong>tour-images</strong>
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
            เพิ่มประเภททัวร์
          </h3>
          <div className="grid gap-3">
            <input
              className={inputClass}
              placeholder="ชื่อไทย / Label TH"
              value={tourForm.labelTh}
              onChange={(event) =>
                setTourForm((prev) => ({
                  ...prev,
                  labelTh: event.target.value,
                }))
              }
            />
            <input
              className={inputClass}
              placeholder="ชื่ออังกฤษ / Label EN"
              value={tourForm.labelEn}
              onChange={(event) =>
                setTourForm((prev) => ({
                  ...prev,
                  labelEn: event.target.value,
                }))
              }
            />
            <textarea
              className={`${inputClass} min-h-[90px]`}
              placeholder="คำอธิบายไทย"
              value={tourForm.descriptionTh}
              onChange={(event) =>
                setTourForm((prev) => ({
                  ...prev,
                  descriptionTh: event.target.value,
                }))
              }
            />
            <textarea
              className={`${inputClass} min-h-[90px]`}
              placeholder="Description EN"
              value={tourForm.descriptionEn}
              onChange={(event) =>
                setTourForm((prev) => ({
                  ...prev,
                  descriptionEn: event.target.value,
                }))
              }
            />
            <button
              type="button"
              onClick={() => handleAddTourType().catch(console.error)}
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
            >
              เพิ่มประเภททัวร์
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/70 p-5">
          <h3 className="text-xl font-semibold text-slate-900">
            เพิ่มสถานที่ท่องเที่ยว
          </h3>
          <div className="grid gap-3">
            <input
              className={inputClass}
              placeholder="ชื่อไทย / Name TH"
              value={locationForm.nameTh}
              onChange={(event) =>
                setLocationForm((prev) => ({
                  ...prev,
                  nameTh: event.target.value,
                }))
              }
            />
            <input
              className={inputClass}
              placeholder="ชื่ออังกฤษ / Name EN"
              value={locationForm.nameEn}
              onChange={(event) =>
                setLocationForm((prev) => ({
                  ...prev,
                  nameEn: event.target.value,
                }))
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={inputClass}
                placeholder="โซน/ภูมิภาค TH"
                value={locationForm.areaTh}
                onChange={(event) =>
                  setLocationForm((prev) => ({
                    ...prev,
                    areaTh: event.target.value,
                  }))
                }
              />
              <input
                className={inputClass}
                placeholder="Region EN"
                value={locationForm.areaEn}
                onChange={(event) =>
                  setLocationForm((prev) => ({
                    ...prev,
                    areaEn: event.target.value,
                  }))
                }
              />
            </div>
            <input
              className={inputClass}
              placeholder="ไฟล์ภาพใน bucket เช่น phuket.jpg"
              value={locationForm.imagePath}
              onChange={(event) =>
                setLocationForm((prev) => ({
                  ...prev,
                  imagePath: event.target.value,
                }))
              }
            />
            <input
              className={inputClass}
              placeholder="Highlights (คั่นด้วย comma)"
              value={locationForm.highlights}
              onChange={(event) =>
                setLocationForm((prev) => ({
                  ...prev,
                  highlights: event.target.value,
                }))
              }
            />
            <button
              type="button"
              onClick={() => handleAddLocation().catch(console.error)}
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
            >
              เพิ่มสถานที่
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">
            ประเภททัวร์ทั้งหมด
          </h4>
          <div className="mt-4 space-y-3">
            {sortedTourTypes.map((type) => (
              <div
                key={`${type.id ?? type.labelEn}`}
                className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600"
              >
                <p className="font-semibold text-slate-900">
                  {type.labelTh} / {type.labelEn}
                </p>
                <p className="text-xs text-slate-500">
                  {type.descriptionTh || type.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-slate-900">
            สถานที่ทั้งหมด
          </h4>
          <div className="mt-4 space-y-3">
            {sortedLocations.map((location) => (
              <div
                key={`${location.id ?? location.nameEn}`}
                className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600"
              >
                <p className="font-semibold text-slate-900">
                  {location.nameTh} / {location.nameEn}
                </p>
                <p className="text-xs text-slate-500">
                  {location.areaTh || location.areaEn} •{" "}
                  {location.imagePath || "no-image"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
