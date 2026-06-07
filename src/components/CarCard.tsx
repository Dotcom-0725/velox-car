import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Fuel, Users, Settings2, Briefcase, ArrowRight, Check } from "lucide-react";
import { Car } from "../data/cars";
import { useApp } from "../context/AppContext";
import { formatPrice } from "../utils/format";
import { CarIllustration } from "./CarIllustration";

type Props = {
  car: Car;
  delay?: number;
  showReserveButton?: boolean;
  compact?: boolean;
  onSelect?: () => void;
  selected?: boolean;
};

export function CarCard({ car, delay = 0, showReserveButton = true, compact = false, onSelect, selected }: Props) {
  const { t, currency, locale } = useApp();

  const isSelectable = !!onSelect;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      onClick={isSelectable ? onSelect : undefined}
      className={`card-hover group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200/60 ${
        selected ? "ring-4 ring-amber-500 shadow-amber-500/30" : ""
      } ${isSelectable ? "cursor-pointer" : ""}`}
    >
      {/* Selected overlay */}
      {selected && (
        <div className="pointer-events-none absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg ring-4 ring-white">
          <Check className="h-5 w-5" strokeWidth={3} />
        </div>
      )}
      {/* Image / Illustration area */}
      <div className={`relative h-48 overflow-hidden ${car.imageUrl ? "bg-gradient-to-br from-slate-50 to-slate-100" : car.cardBg} sm:h-56`}>
        {!car.imageUrl && <div className="absolute inset-0 bg-grid opacity-40" />}
        <div className="relative h-full w-full p-2">
          <CarIllustration car={car} showBadge={false} animated={false} />
        </div>
        {car.badge && (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md shadow-amber-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {car.badge}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 backdrop-blur">
            {car.year}
          </div>
          <div className="flex items-center gap-1 rounded-full bg-emerald-500/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {t("cars.available")}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-extrabold leading-tight text-slate-900">
              {car.make} {car.model}
            </h3>
            <p className="text-xs font-semibold text-slate-500">{car.trim} · {car.colors.join(" / ")}</p>
          </div>
        </div>

        {!compact && (
          <p className="mb-4 line-clamp-2 text-sm text-slate-600">
            {car.description[locale]?.slice(0, 100)}…
          </p>
        )}

        {/* Specs grid */}
        <div className="mb-4 grid grid-cols-4 gap-2 rounded-2xl bg-slate-50 p-2.5 text-center">
          <div className="flex flex-col items-center gap-0.5">
            <Users className="h-4 w-4 text-navy-700" />
            <span className="text-[10px] font-bold text-slate-700">{car.seats}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Briefcase className="h-4 w-4 text-navy-700" />
            <span className="text-[10px] font-bold text-slate-700">{car.bags}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Settings2 className="h-4 w-4 text-navy-700" />
            <span className="text-[10px] font-bold text-slate-700">
              {car.transmission === "automatic" ? "Auto" : "Man."}
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Fuel className="h-4 w-4 text-navy-700" />
            <span className="text-[10px] font-bold text-slate-700 capitalize">
              {car.fuel === "hybride" ? "Hybr." : car.fuel === "essence" ? "Ess." : "Dies."}
            </span>
          </div>
        </div>

        {/* Features preview */}
        {!compact && (
          <ul className="mb-4 space-y-1">
            {car.features.slice(0, 3).map((f) => (
              <li key={f} className="flex items-center gap-1.5 text-xs text-slate-600">
                <Check className="h-3 w-3 flex-shrink-0 text-emerald-500" />
                <span className="truncate">{f}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Price + CTA */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("cars.from")}</p>
            <p className="text-xl font-extrabold leading-none text-navy-700 sm:text-2xl">
              {formatPrice(car.priceLow, currency)}
              <span className="text-xs font-medium text-slate-500"> {t("cars.perDay")}</span>
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {t("cars.highSeason")}: {formatPrice(car.priceHigh, currency)}
            </p>
          </div>
          {/* Always show CTA when onSelect is provided, OR when showReserveButton is true */}
          {onSelect ? (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              type="button"
              className={`btn-premium flex items-center gap-1 rounded-full px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide shadow-md transition-all ${
                selected
                  ? "bg-emerald-500 text-white shadow-emerald-500/30"
                  : "bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-amber-500/30 hover:shadow-lg"
              }`}
            >
              {selected ? (
                <>
                  <Check className="h-3.5 w-3.5" strokeWidth={3} /> {t("booking.car.selected")}
                </>
              ) : (
                <>
                  {t("booking.car.select")}
                  <ArrowRight className="h-3.5 w-3.5 rtl-flip" />
                </>
              )}
            </button>
          ) : showReserveButton ? (
            <Link
              to={`/fleet/${car.id}`}
              className="btn-premium flex items-center gap-1 rounded-full bg-navy-700 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-navy-800"
            >
              {t("cars.viewDetails")}
              <ArrowRight className="h-3.5 w-3.5 rtl-flip" />
            </Link>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
