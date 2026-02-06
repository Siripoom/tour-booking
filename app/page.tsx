import BookingForm from "@/components/BookingForm";
import HighlightsSection from "@/components/HighlightsSection";
import { TOUR_TYPES } from "@/lib/catalog";

export default function Home() {
  return (
    <div className="page-shell--public min-h-screen">
      <div className="relative z-10">
        <header className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-14 lg:pb-20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="fade-up text-xs uppercase tracking-[0.4em] text-cyan-600">
                On The Way Tour
              </p>
              <h1 className="text-display fade-up mt-3 max-w-2xl text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
                Premium tours designed for a worry-free escape
              </h1>
              <p className="fade-up mt-3 max-w-2xl text-base text-slate-600">
                Curated tours across Thailand with seamless planning, expert
                guidance, and flexible add-ons.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-600 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.3)]">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Open daily
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <div className="fade-up flex flex-wrap gap-2">
                {TOUR_TYPES.map((type) => (
                  <span
                    key={type.id}
                    className="rounded-full border border-cyan-200/70 bg-white/80 px-4 py-2 text-xs font-semibold text-cyan-700 shadow-[0_10px_30px_-25px_rgba(6,182,212,0.5)]"
                  >
                    {type.labelEn}
                  </span>
                ))}
              </div>
              <p className="fade-up text-lg text-slate-600">
                Choose your date, time, party size, and add-ons. We handle every
                detail from pickup to meals.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#booking"
                  className="rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(14,165,233,0.8)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_45px_-18px_rgba(16,185,129,0.85)]"
                >
                  Start booking
                </a>
              </div>
            </div>
          </div>
        </header>

        <section id="booking" className="mx-auto w-full max-w-6xl px-6 pb-16">
          <BookingForm />
        </section>

        <HighlightsSection />

        <footer className="border-t border-white/60 bg-white/60">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                On The Way Tour
              </p>
              <p className="text-xs text-slate-500">88 Sukhumvit Rd, Bangkok</p>
            </div>
            <div className="text-sm text-slate-500">
              Contact: hello@coastaljourneys.co | +66 90 000 0000
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
