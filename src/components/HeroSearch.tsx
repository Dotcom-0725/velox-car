import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Clock, Car, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { LOCATIONS } from "../data/locations";

export function HeroSearch() {
  const { t, locale } = useApp();
  const navigate = useNavigate();
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");
  const [locationId, setLocationId] = useState("main-office");
  const [category, setCategory] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickupDate) params.set("pickupDate", pickupDate);
    if (returnDate) params.set("returnDate", returnDate);
    if (pickupTime) params.set("pickupTime", pickupTime);
    if (returnTime) params.set("returnTime", returnTime);
    params.set("location", locationId);
    if (category) params.set("category", category);
    navigate(`/fleet?${params.toString()}`);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white/95 p-4 shadow-2xl shadow-navy-900/30 ring-1 ring-white/40 backdrop-blur-xl sm:p-6"
    >
      <div className="absolute inset-0 -z-10 bg-grid opacity-30" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        {/* Pickup date */}
        <label className="group flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-3 transition-all focus-within:border-navy-700 focus-within:ring-2 focus-within:ring-navy-100 hover:border-slate-300">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Calendar className="h-3 w-3" />
            {t("search.pickupDate")}
          </span>
          <input
            type="date"
            value={pickupDate}
            min={today}
            onChange={(e) => {
              setPickupDate(e.target.value);
              if (!returnDate || e.target.value >= returnDate) {
                const next = new Date(e.target.value);
                next.setDate(next.getDate() + 3);
                setReturnDate(next.toISOString().split("T")[0]);
              }
            }}
            className="border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none focus:ring-0"
          />
        </label>

        {/* Return date */}
        <label className="group flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-3 transition-all focus-within:border-navy-700 focus-within:ring-2 focus-within:ring-navy-100 hover:border-slate-300">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Calendar className="h-3 w-3" />
            {t("search.returnDate")}
          </span>
          <input
            type="date"
            value={returnDate}
            min={pickupDate || today}
            onChange={(e) => setReturnDate(e.target.value)}
            className="border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none focus:ring-0"
          />
        </label>

        {/* Time */}
        <label className="group flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-3 transition-all focus-within:border-navy-700 focus-within:ring-2 focus-within:ring-navy-100 hover:border-slate-300">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Clock className="h-3 w-3" />
            {t("search.pickupTime")} · {t("search.returnTime")}
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-1/2 border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none focus:ring-0"
            />
            <span className="text-slate-400">→</span>
            <input
              type="time"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className="w-1/2 border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none focus:ring-0"
            />
          </div>
        </label>

        {/* Location */}
        <label className="group flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-3 transition-all focus-within:border-navy-700 focus-within:ring-2 focus-within:ring-navy-100 hover:border-slate-300">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <MapPin className="h-3 w-3" />
            {t("search.location")}
          </span>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none focus:ring-0"
          >
            {LOCATIONS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name[locale]} · {l.city}
              </option>
            ))}
          </select>
        </label>

        {/* Category */}
        <label className="group flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-3 transition-all focus-within:border-navy-700 focus-within:ring-2 focus-within:ring-navy-100 hover:border-slate-300">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Car className="h-3 w-3" />
            {t("search.carCategory")}
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none focus:ring-0"
          >
            <option value="">{t("search.anyCategory")}</option>
            <option value="economy">{t("cars.filter.economy")}</option>
            <option value="compact">{t("cars.filter.compact")}</option>
            <option value="compact-suv">{t("cars.filter.compactSuv")}</option>
            <option value="suv">{t("cars.filter.suv")}</option>
            <option value="luxury">{t("cars.filter.luxury")}</option>
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="btn-premium group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-400 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/40 sm:text-lg"
      >
        <Search className="h-5 w-5" />
        {t("search.cta")}
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 rtl-flip" />
      </button>

      <p className="mt-3 text-center text-xs text-slate-500">
        💡 {locale === "ar" ? "بدون مبلغ مسبق — الدفع عند الاستلام" : locale === "en" ? "No upfront charge — Pay on pickup" : "Aucun montant débité — Paiement à la livraison"}
      </p>
    </motion.form>
  );
}
