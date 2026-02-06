"use client";

import { formatTHB, PriceBreakdown } from "@/lib/pricing";

type PriceSummaryProps = {
  breakdown: PriceBreakdown;
};

export default function PriceSummary({ breakdown }: PriceSummaryProps) {
  return (
    <div className="sticky top-6 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.5)] backdrop-blur">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-600">
          Price
        </p>
        <h3 className="text-display mt-2 text-2xl font-semibold text-slate-900">
          Price Summary
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Based on selected location and duration.
        </p>
      </div>
      <div className="space-y-3 text-sm text-slate-600">
        {breakdown.lines.map((line) => (
          <div
            key={line.labelEn}
            className="flex items-start justify-between gap-4"
          >
            <div>
              <p className="text-slate-900">{line.labelEn}</p>
            </div>
            <span className="font-medium text-slate-800">
              {line.amount ? formatTHB(line.amount) : "-"}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-slate-200/70 pt-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Total
          </p>
          <p className="text-sm text-slate-500">
            Total service cost
          </p>
        </div>
        <p className="text-2xl font-semibold text-slate-900">
          {formatTHB(breakdown.total)}
        </p>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        This is an estimated price. Admin will confirm.
      </p>
    </div>
  );
}
