"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LOCATIONS, Location, TOUR_TYPES, normalizeLocation } from "@/lib/catalog";
import TourCard from "@/components/TourCard";

export default function HighlightsSection() {
  const [locations, setLocations] = useState<Location[]>(LOCATIONS);

  useEffect(() => {
    const fetchLocations = async () => {
      const snap = await getDocs(collection(db, "locations"));
      const locs = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Location, "id">),
      }));
      if (locs.length) {
        const allTourTypeIds = TOUR_TYPES.map((type) => type.id);
        setLocations(
          locs.map((location) => normalizeLocation(location, allTourTypeIds))
        );
      }
    };

    fetchLocations().catch(() => setLocations(LOCATIONS));
  }, []);

  return (
    <section id="highlights" className="mx-auto w-full max-w-6xl px-6 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-600">
            Highlights
          </p>
          <h2 className="text-display mt-2 text-3xl font-semibold text-slate-900">
            Most loved destinations
          </h2>
        </div>
        <p className="max-w-xl text-sm text-slate-500">
          Pick a destination that matches your travel style — our team will take
          care of every detail.
        </p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {locations.map((location) => (
          <TourCard key={location.id} location={location} />
        ))}
      </div>
    </section>
  );
}
