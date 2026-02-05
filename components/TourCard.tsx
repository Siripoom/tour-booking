"use client";

import { useMemo } from "react";
import { Location } from "@/lib/catalog";
import { getPublicImageUrl } from "@/lib/supabase";

type TourCardProps = {
  location: Location;
};

export default function TourCard({ location }: TourCardProps) {
  const imageUrl = useMemo(
    () => getPublicImageUrl(location.imagePath),
    [location.imagePath]
  );

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-[0_30px_60px_-50px_rgba(15,23,42,0.55)]">
      <div className="relative h-48 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_65%)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={location.nameEn}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : null}
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
          {location.areaEn}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">
          {location.nameEn}
        </h3>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {(location.highlights ?? []).map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
