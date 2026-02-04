"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ADDONS, LOCATIONS, TOUR_TYPES, Location, TourType } from "@/lib/catalog";
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
  locale: "th",
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200";

export default function BookingForm() {
  const [formData, setFormData] = useState<FormState>(defaultState);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [tourTypes, setTourTypes] = useState<TourType[]>(TOUR_TYPES);
  const [locations, setLocations] = useState<Location[]>(LOCATIONS);

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
        ...(doc.data() as TourType),
      }));
      const locs = locationSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Location),
      }));

      const nextTours = tours.length ? tours : TOUR_TYPES;
      const nextLocations = locs.length ? locs : LOCATIONS;

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
      setLocations(LOCATIONS);
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setMessage("");

    if (!formData.contactName.trim()) {
      setStatus("error");
      setMessage("กรุณากรอกชื่อผู้ติดต่อ / Contact name is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      setStatus("error");
      setMessage("กรุณากรอกอีเมลให้ถูกต้อง / Invalid email address.");
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
        "ส่งข้อมูลเรียบร้อยแล้ว ทีมงานจะติดต่อกลับภายใน 24 ชม. / Submission received."
      );
      setFormData(defaultState);
    } catch (error) {
      setStatus("error");
      setMessage("ส่งข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง / Submission failed.");
      console.error(error);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)] backdrop-blur"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
              Booking / การจอง
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              จองทัวร์ของคุณ / Book Your Tour
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            พร้อมดูแลแบบพรีเมียม / Premium care
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            วันที่เดินทาง / Date
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
            เวลาเริ่ม / Time
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
            จำนวนคน / Party size
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
          <label className="text-sm font-medium text-slate-700">
            ภาษาเอกสาร / Preferred language
            <select
              className={inputClass}
              value={formData.locale}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  locale: event.target.value as "th" | "en",
                }))
              }
            >
              <option value="th">ไทย</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-700">
            ระยะเวลา / Duration
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
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white/70 text-slate-600 hover:border-emerald-200"
                }`}
              >
                <p className="text-sm font-semibold">
                  {value === "full" ? "เต็มวัน" : "ครึ่งวัน"} /{" "}
                  {value === "full" ? "Full day" : "Half day"}
                </p>
                <p className="text-xs text-slate-500">
                  {formatTHB(BASE_PRICE[value])} / คน
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            ประเภททัวร์ / Tour type
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
                  {type.labelTh} / {type.labelEn}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            สถานที่ / Location
            <select
              className={inputClass}
              value={formData.locationId}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  locationId: event.target.value,
                }))
              }
            >
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.nameTh} / {location.nameEn}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-700">
            บริการเสริม / Add-ons
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
                  className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
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
                    {addon.labelTh}
                  </p>
                  <p className="text-xs text-slate-500">{addon.labelEn}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            ชื่อผู้ติดต่อ / Contact name
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
            อีเมล / Email
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
          ข้อความเพิ่มเติม / Notes
          <textarea
            className={`${inputClass} min-h-[110px]`}
            value={formData.notes}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, notes: event.target.value }))
            }
            placeholder="แจ้งเวลารับ-ส่ง หรือความต้องการพิเศษอื่นๆ"
          />
        </label>

        {message ? (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
              status === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Total / รวม
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {formatTHB(breakdown.total)}
            </p>
          </div>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {status === "submitting"
              ? "กำลังส่ง... / Sending"
              : "ส่งข้อมูลการจอง / Submit booking"}
          </button>
        </div>
      </form>

      <PriceSummary breakdown={breakdown} />
    </div>
  );
}
