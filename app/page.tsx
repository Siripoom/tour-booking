import BookingForm from "@/components/BookingForm";
import HighlightsSection from "@/components/HighlightsSection";
import { TOUR_TYPES } from "@/lib/catalog";

export default function Home() {
  return (
    <div className="page-shell min-h-screen">
      <div className="relative z-10">
        <header className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-14 lg:pb-20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">
                Coastal Journeys
              </p>
              <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
                ออกแบบทริปพรีเมียมให้คุณได้พักผ่อนแบบไร้กังวล
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-600">
                Curated tours across Thailand with seamless planning, bilingual
                guidance, and flexible add-ons.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Open daily
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {TOUR_TYPES.map((type) => (
                  <span
                    key={type.id}
                    className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700"
                  >
                    {type.labelTh} / {type.labelEn}
                  </span>
                ))}
              </div>
              <p className="text-lg text-slate-600">
                เลือกวัน เวลา จำนวนคน และบริการเสริมได้ในแบบของคุณ เราดูแลทุก
                รายละเอียดตั้งแต่รับส่งจนถึงมื้ออาหาร
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#booking"
                  className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
                >
                  จองทัวร์เลย / Start booking
                </a>
                {/* <a
                  href="#highlights"
                  className="rounded-full border border-emerald-200 bg-white/70 px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300"
                >
                  ดูสถานที่ยอดนิยม
                </a> */}
              </div>
              {/* <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["20+", "เส้นทางพิเศษ / curated routes"],
                  ["4.9", "คะแนนเฉลี่ย / avg rating"],
                  ["24h", "ตอบกลับไว / admin response"],
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
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
                  Signature experience
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  ทริปแนะนำ: อ่าวสวรรค์ + ดินเนอร์ริมทะเล
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
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
                Included / สิ่งที่ได้รับ
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                ดูแลครบทุกรายละเอียด
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                เพิ่มไกด์ อาหาร และรับ-ส่งได้ตามต้องการ
              </p>
            </div>
            {[
              {
                title: "ไกด์ท้องถิ่นมืออาชีพ",
                subtitle: "Professional bilingual guide",
                detail: "ผู้เชี่ยวชาญพื้นที่ คอยดูแลและแนะนำแบบใกล้ชิดตลอดทริป",
              },
              {
                title: "อาหารและเครื่องดื่มพรีเมียม",
                subtitle: "Curated meals",
                detail: "เลือกเมนูสุขภาพ ซีฟู้ด หรือวีแกนได้",
              },
              {
                title: "บริการรับ-ส่งส่วนตัว",
                subtitle: "Private transfer",
                detail: "รถตู้หรือรถหรูพร้อมคนขับดูแลถึงโรงแรม",
              },
            ].map((item) => (
              <div key={item.title} className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-sm text-emerald-600">{item.subtitle}</p>
                <p className="text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </section> */}

        <footer className="border-t border-white/60 bg-white/60">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Coastal Journeys
              </p>
              <p className="text-xs text-slate-500">
                88 ถนนสุขุมวิท กรุงเทพฯ / Sukhumvit Rd, Bangkok
              </p>
            </div>
            <div className="text-sm text-slate-500">
              ติดต่อ / Contact: hello@coastaljourneys.co | +66 90 000 0000
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
