import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Briefcase, Settings2, Fuel, Calendar as CalIcon, Check, Star, Shield } from "lucide-react";
import { useState } from "react";
import { getCarById, CARS } from "../data/cars";
import { CarIllustration } from "../components/CarIllustration";
import { api } from "../services/api";
import { useSyncRefresh } from "../services/sync";
import { useApp } from "../context/AppContext";
import { formatPrice } from "../utils/format";
import { useToast } from "../hooks/useToast";
import { CarCard } from "../components/CarCard";

export function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, locale, currency, setBookingDraft } = useApp();
  const { show } = useToast();
  const [imgIdx, setImgIdx] = useState(0);
  const car = getCarById(id || "");

  if (!car) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-700">{t("cars.notFound")}</p>
          <Link to="/fleet" className="mt-4 inline-block rounded-full bg-navy-700 px-5 py-2.5 text-sm font-bold text-white">
            ← {t("nav.fleet")}
          </Link>
        </div>
      </div>
    );
  }

  const handleReserve = () => {
    setBookingDraft((d) => ({ ...d, carId: car.id }));
    show(locale === "ar" ? "تم اختيار السيارة" : locale === "en" ? "Vehicle selected" : "Véhicule sélectionné", "success");
    navigate("/booking");
  };

  // Mock availability calendar (current month)
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  // Real reservation data — live from admin / public bookings
  useSyncRefresh(["booking:created", "booking:updated", "booking:deleted", "car:status-changed"]);
  const reservedRanges = api.getCarReservedRanges(car.id);
  const unavailable = new Set<number>();
  reservedRanges.forEach((r) => {
    const start = new Date(r.start);
    const end = new Date(r.end);
    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 86400000)) {
      if (d.getMonth() === month && d.getFullYear() === year) unavailable.add(d.getDate());
    }
  });
  const monthName = today.toLocaleDateString(locale === "ar" ? "ar-MA" : locale === "en" ? "en-US" : "fr-FR", { month: "long", year: "numeric" });
  const weekdays = locale === "ar"
    ? ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"]
    : locale === "en"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  return (
    <div className="bg-slate-50">
      {/* Top bar */}
      <div className="bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4 rtl-flip" />
          </button>
          <div className="min-w-0">
            <p className="text-xs text-slate-500">{t("nav.fleet")} / <span className="font-semibold text-slate-700">{car.make} {car.model}</span></p>
            <h1 className="truncate text-xl font-extrabold text-slate-900 sm:text-2xl">{car.make} {car.model} {car.trim}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Image gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200/60"
          >
            <div className={`relative h-72 sm:h-96 ${car.imageUrl ? "bg-gradient-to-br from-slate-50 to-slate-100" : car.cardBg}`}>
              {!car.imageUrl && <div className="absolute inset-0 bg-grid opacity-30" />}
              <div className="relative h-full p-3">
                <CarIllustration car={car} animated showBadge={false} />
              </div>
              {car.badge && (
                <div className="absolute left-4 top-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                    {car.badge}
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 p-3 sm:gap-3 sm:p-4">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`relative h-16 overflow-hidden rounded-xl ring-2 transition-all sm:h-20 ${
                    imgIdx === i ? "ring-amber-500" : "ring-transparent opacity-60 hover:opacity-100"
                  } ${car.cardBg}`}
                >
                  <CarIllustration car={car} showBadge={false} />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Side info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200/60 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{car.make} {car.model}</h2>
                  <p className="text-sm text-slate-500">{car.trim} · {car.year} · {car.colors.join(" / ")}</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                  <Star className="h-3 w-3 fill-current" />
                  4.9
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">{car.description[locale]}</p>

              {/* Quick specs */}
              <div className="mt-5 grid grid-cols-4 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
                {[
                  { icon: Users, val: car.seats, l: t("cars.specs.seats") },
                  { icon: Briefcase, val: car.bags, l: t("cars.specs.bags") },
                  { icon: Settings2, val: car.transmission === "automatic" ? "Auto" : "Man.", l: t("cars.specs.transmission") },
                  { icon: Fuel, val: car.fuel === "hybride" ? "Hybr." : car.fuel === "essence" ? "Ess." : "Dies.", l: t("cars.specs.fuel") },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <Icon className="h-4 w-4 text-navy-700" />
                      <p className="text-sm font-extrabold text-slate-900">{s.val}</p>
                      <p className="text-[10px] text-slate-500">{s.l}</p>
                    </div>
                  );
                })}
              </div>

              {/* Pricing */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-emerald-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{t("cars.pricing.low")}</p>
                  <p className="mt-1 text-lg font-extrabold text-emerald-900">{formatPrice(car.priceLow, currency)}<span className="text-xs text-emerald-600"> /{t("common.day")}</span></p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">{t("cars.pricing.high")}</p>
                  <p className="mt-1 text-lg font-extrabold text-amber-900">{formatPrice(car.priceHigh, currency)}<span className="text-xs text-amber-600"> /{t("common.day")}</span></p>
                </div>
              </div>

              <button
                onClick={handleReserve}
                className="btn-premium mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-amber-500/30"
              >
                {t("cars.reserve")} →
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">💡 {t("banner.noPaymentShort")}</p>
            </div>

            {/* Availability calendar */}
            <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200/60 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <CalIcon className="h-4 w-4 text-navy-700" />
                <h3 className="text-sm font-extrabold text-slate-900">{t("cars.availability")} · {monthName}</h3>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-slate-500">
                {weekdays.map((d) => <div key={d} className="py-1">{d.slice(0, 2)}</div>)}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`b${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isPast = day < today.getDate();
                  const isUnavail = unavailable.has(day) || isPast;
                  return (
                    <div
                      key={day}
                      className={`flex h-7 items-center justify-center rounded-md text-[11px] font-semibold sm:h-8 ${
                        isUnavail
                          ? "bg-slate-100 text-slate-400 line-through"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-600">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-200" /> {t("cars.available")}</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-slate-200" /> {t("cars.unavailable")}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features & Specs */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
            <h3 className="mb-4 text-lg font-extrabold text-slate-900">{t("cars.features")}</h3>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {car.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="h-4 w-4 flex-shrink-0 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
            <h3 className="mb-4 text-lg font-extrabold text-slate-900">{t("cars.specs.fuel")} · {t("cars.specs.year")}</h3>
            <dl className="space-y-2 text-sm">
              {[
                [t("cars.specs.seats"), car.seats],
                [t("cars.specs.doors"), car.doors],
                [t("cars.specs.bags"), car.bags],
                [t("cars.specs.transmission"), car.transmission === "automatic" ? t("cars.filter.automatic") : t("cars.filter.manual")],
                [t("cars.specs.fuel"), car.fuel === "hybride" ? t("cars.filter.hybride") : car.fuel === "essence" ? t("cars.filter.essence") : t("cars.filter.diesel")],
                [t("cars.specs.year"), car.year],
                [t("cars.specs.colors"), car.colors.join(", ")],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between border-b border-slate-100 py-1.5">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-bold text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Insurance info */}
        <div className="mt-6 flex items-start gap-4 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5">
          <Shield className="h-7 w-7 flex-shrink-0 text-emerald-600" />
          <div>
            <h3 className="text-base font-extrabold text-emerald-900">{t("about.insurance")}</h3>
            <p className="mt-1 text-sm text-emerald-800">
              {locale === "ar" ? "التأمين الأساسي مشمول. الإصلاح الذاتي للضرر يتراوح بين 5,000 و15,000 درهم حسب الفئة." : locale === "en" ? "Basic insurance included. Damage deductible ranges from 5,000 to 15,000 MAD depending on category." : "Assurance de base incluse. Franchise de 5 000 à 15 000 MAD selon la catégorie."}
            </p>
          </div>
        </div>

        {/* Related */}
        <div className="mt-12">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {locale === "ar" ? "قد يعجبك أيضاً" : locale === "en" ? "You may also like" : "Vous aimerez aussi"}
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {CARS.filter((c) => c.id !== car.id).slice(0, 3).map((c, i) => (
              <CarCard key={c.id} car={c} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
