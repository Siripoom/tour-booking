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
                {/* <a
                  href="#highlights"
                  className="rounded-full border border-cyan-200 bg-white/70 px-6 py-3 text-sm font-semibold text-cyan-700 transition hover:border-cyan-300"
                >
                  Explore highlights
                </a> */}
              </div>
              {/* <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["20+", "Curated routes"],
                  ["4.9", "Average rating"],
                  ["24h", "Fast admin response"],
                ].map(([value, label]) => (
                  <div
                    key={value}
                    className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-slate-600"
                  >
                    <p className="text-2xl font-semibold text-slate-900">
                      {value}
                    </p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div> */}
            </div>
            {/* <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/70 shadow-[0_35px_80px_-60px_rgba(15,23,42,0.65)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_60%)]" />
              {heroImage ? (
                <img
                  src={heroImage}
                  alt="Thailand coast"
                  className="relative h-full w-full object-cover"
                />
              ) : null}
              <div className="relative p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-600">
                  Signature experience
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Featured trip: Paradise Cove + seaside dinner
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Includes boat, snorkeling, and sunset dinner for small groups.
                </p>
              </div>
            </div> */}
          </div>
        </header>

        <section id="booking" className="mx-auto w-full max-w-6xl px-6 pb-16">
          <BookingForm />
        </section>

        <HighlightsSection />

        {/* <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="grid gap-8 rounded-[36px] border border-white/70 bg-white/70 p-8 shadow-[0_35px_90px_-70px_rgba(15,23,42,0.65)] md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-600">
                Included
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                We cover every detail
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Add a guide, meals, and pickup as needed.
              </p>
            </div>
            {[
              {
                title: "Professional local guide",
                subtitle: "Professional bilingual guide",
                detail: "Local experts who stay close and guide the entire trip.",
              },
              {
                title: "Premium meals and drinks",
                subtitle: "Curated meals",
                detail: "Choose from healthy, seafood, or vegan menus.",
              },
              {
                title: "Private pickup service",
                subtitle: "Private transfer",
                detail: "Private vans or luxury cars with door-to-door service.",
              },
            ].map((item) => (
              <div key={item.title} className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-sm text-cyan-600">{item.subtitle}</p>
                <p className="text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </section> */}

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
