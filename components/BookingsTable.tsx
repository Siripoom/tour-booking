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
import {
  LOCATIONS,
  TOUR_TYPES,
  Location,
  TourType,
  normalizeLocation,
} from "@/lib/catalog";
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
  const [emailStatus, setEmailStatus] = useState<
    Record<string, "idle" | "sending" | "success" | "error">
  >({});
  const [emailMessage, setEmailMessage] = useState<Record<string, string>>({});

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

  const sendBookingEmail = async (
    booking: BookingRow,
    tourType?: TourType,
    location?: Location
  ) => {
    setEmailStatus((prev) => ({ ...prev, [booking.id]: "sending" }));
    setEmailMessage((prev) => ({ ...prev, [booking.id]: "" }));

    try {
      const response = await fetch("/api/send-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: booking.contactEmail,
          booking: {
            contactName: booking.contactName,
            date: booking.date,
            time: booking.time,
            duration: booking.duration,
            tourTypeLabelEn: tourType?.labelEn ?? booking.tourType,
            locationNameEn: location?.nameEn ?? booking.locationId,
            partySize: booking.partySize,
            addons: booking.addons,
            priceTotal: booking.price?.total ?? 0,
            notes: booking.notes ?? "",
          },
          locale: booking.locale,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      setEmailStatus((prev) => ({ ...prev, [booking.id]: "success" }));
      setEmailMessage((prev) => ({ ...prev, [booking.id]: "Email sent" }));
    } catch (error) {
      setEmailStatus((prev) => ({ ...prev, [booking.id]: "error" }));
      setEmailMessage((prev) => ({
        ...prev,
        [booking.id]:
          error instanceof Error ? error.message : "Failed to send email",
      }));
    }
  };

  return (
    <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
            Bookings
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            Recent bookings
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
            className="w-56 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
            placeholder="Search name/email"
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
          <p className="text-sm text-slate-500">Loading bookings...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500">
            No bookings match your filters yet.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="py-3">Date/time</th>
                <th className="py-3">Contact</th>
                <th className="py-3">Tour</th>
                <th className="py-3">Add-ons</th>
                <th className="py-3 text-right">Total</th>
                <th className="py-3 text-right">Email</th>
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
                          ? "Full day"
                          : "Half day"}{" "}
                        • {booking.partySize} people
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
                        {tourType?.labelEn ?? booking.tourType}
                      </p>
                      <p className="text-xs text-slate-500">
                        {location?.nameEn ?? booking.locationId}
                      </p>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2">
                        {booking.addons.guide ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-600">
                            Guide
                          </span>
                        ) : null}
                        {booking.addons.meals ? (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-600">
                            Meals
                          </span>
                        ) : null}
                        {booking.addons.pickup ? (
                          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-600">
                            Pickup
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
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300"
                        disabled={emailStatus[booking.id] === "sending"}
                        onClick={() =>
                          sendBookingEmail(booking, tourType, location)
                        }
                      >
                        {emailStatus[booking.id] === "sending"
                          ? "Sending..."
                          : "Send email"}
                      </button>
                      {emailMessage[booking.id] ? (
                        <p
                          className={`mt-2 text-xs ${
                            emailStatus[booking.id] === "error"
                              ? "text-rose-500"
                              : "text-emerald-600"
                          }`}
                        >
                          {emailMessage[booking.id]}
                        </p>
                      ) : null}
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
