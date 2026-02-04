"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LOCATIONS, TOUR_TYPES, Location, TourType } from "@/lib/catalog";
import { formatTHB } from "@/lib/pricing";

type BookingRow = {
  id: string;
  createdAt?: Date | null;
  date: string;
  time: string;
  partySize: number;
  duration: string;
  tourType: string;
  locationId: string;
  addons: {
    guide: boolean;
    meals: boolean;
    pickup: boolean;
  };
  price: {
    total: number;
  };
  contactName: string;
  contactEmail: string;
  notes?: string;
  locale: string;
};

export default function BookingsTable() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [queryText, setQueryText] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [tourTypes, setTourTypes] = useState<TourType[]>(TOUR_TYPES);
  const [locations, setLocations] = useState<Location[]>(LOCATIONS);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const ref = collection(db, "bookings");
        const snapshot = await getDocs(query(ref, orderBy("createdAt", "desc")));
        const rows = snapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt as Timestamp | undefined;
          return {
            id: doc.id,
            createdAt: createdAt?.toDate?.() ?? null,
            date: data.date ?? "",
            time: data.time ?? "",
            partySize: data.partySize ?? 0,
            duration: data.duration ?? "",
            tourType: data.tourType ?? "",
            locationId: data.locationId ?? "",
            addons: data.addons ?? {
              guide: false,
              meals: false,
              pickup: false,
            },
            price: data.price ?? { total: 0 },
            contactName: data.contactName ?? "",
            contactEmail: data.contactEmail ?? "",
            notes: data.notes ?? "",
            locale: data.locale ?? "th",
          } as BookingRow;
        });
        setBookings(rows);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

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

      if (tours.length) {
        setTourTypes(tours);
      }
      if (locs.length) {
        setLocations(locs);
      }
    };

    fetchCatalogs().catch(() => {
      setTourTypes(TOUR_TYPES);
      setLocations(LOCATIONS);
    });
  }, []);

  const typeMap = useMemo(
    () => new Map(tourTypes.map((type) => [type.id, type])),
    [tourTypes]
  );
  const locationMap = useMemo(
    () => new Map(locations.map((location) => [location.id, location])),
    [locations]
  );

  const filtered = bookings.filter((booking) => {
    const matchesText = queryText
      ? `${booking.contactName} ${booking.contactEmail}`
          .toLowerCase()
          .includes(queryText.toLowerCase())
      : true;
    const matchesDate = filterDate ? booking.date === filterDate : true;
    return matchesText && matchesDate;
  });

  return (
    <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
            Bookings / รายการจอง
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            รายการจองล่าสุด / Recent bookings
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
            className="w-56 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
            placeholder="ค้นหาชื่อ/อีเมล"
          />
          <input
            type="date"
            value={filterDate}
            onChange={(event) => setFilterDate(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        {loading ? (
          <p className="text-sm text-slate-500">กำลังโหลดข้อมูล...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500">
            ยังไม่มีรายการจองที่ตรงกับเงื่อนไข
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="py-3">วันเวลา</th>
                <th className="py-3">ผู้ติดต่อ</th>
                <th className="py-3">ทัวร์</th>
                <th className="py-3">บริการเสริม</th>
                <th className="py-3 text-right">ยอดรวม</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {filtered.map((booking) => {
                const tourType = typeMap.get(booking.tourType);
                const location = locationMap.get(booking.locationId);
                return (
                  <tr
                    key={booking.id}
                    className="border-t border-slate-200/70"
                  >
                    <td className="py-4">
                      <p className="font-medium text-slate-900">
                        {booking.date} • {booking.time}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.duration === "full"
                          ? "เต็มวัน"
                          : "ครึ่งวัน"}{" "}
                        • {booking.partySize} คน
                      </p>
                    </td>
                    <td className="py-4">
                      <p className="font-medium text-slate-900">
                        {booking.contactName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.contactEmail}
                      </p>
                    </td>
                    <td className="py-4">
                      <p className="font-medium text-slate-900">
                        {tourType?.labelTh ?? booking.tourType}
                      </p>
                      <p className="text-xs text-slate-500">
                        {location?.nameTh ?? booking.locationId}
                      </p>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2">
                        {booking.addons.guide ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-600">
                            ไกด์
                          </span>
                        ) : null}
                        {booking.addons.meals ? (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-600">
                            อาหาร
                          </span>
                        ) : null}
                        {booking.addons.pickup ? (
                          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-600">
                            รับ-ส่ง
                          </span>
                        ) : null}
                        {!booking.addons.guide &&
                        !booking.addons.meals &&
                        !booking.addons.pickup ? (
                          <span className="text-xs text-slate-400">-</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-4 text-right font-semibold text-slate-900">
                      {formatTHB(booking.price?.total ?? 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
