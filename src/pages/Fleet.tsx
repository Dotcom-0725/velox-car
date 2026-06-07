import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, X, SlidersHorizontal, Check } from "lucide-react";
import { useApp } from "../context/AppContext";
import { CARS } from "../data/cars";
import { CarCard } from "../components/CarCard";
import { api } from "../services/api";
import { useSyncRefresh } from "../services/sync";

type Filters = {
  category: string;
  transmission: string;
  fuel: string;
  maxPrice: number;
  minSeats: number;
};

export function Fleet() {
  const { t, locale } = useApp();
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    category: searchParams.get("category") || "",
    transmission: "",
    fuel: "",
    maxPrice: 1000,
    minSeats: 0,
  });

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setFilters((f) => ({ ...f, category: cat }));
  }, [searchParams]);

  // Re-render whenever admin changes car status / pricing
  const tick = useSyncRefresh(["car:status-changed", "pricing:updated", "settings:updated"]);

  const filtered = useMemo(() => {
    // Use api.getPublicCars() so admin-toggled "unavailable" cars are hidden
    return api.getPublicCars().filter((car) => {
      if (filters.category && car.category !== filters.category) return false;
      if (filters.transmission && car.transmission !== filters.transmission) return false;
      if (filters.fuel && car.fuel !== filters.fuel) return false;
      if (car.priceLow > filters.maxPrice) return false;
      if (car.seats < filters.minSeats) return false;
      return true;
    });
  }, [filters, tick]);

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.transmission ? 1 : 0) +
    (filters.fuel ? 1 : 0) +
    (filters.maxPrice < 1000 ? 1 : 0) +
    (filters.minSeats > 0 ? 1 : 0);

  const resetFilters = () =>
    setFilters({ category: "", transmission: "", fuel: "", maxPrice: 1000, minSeats: 0 });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <section className="hero-mesh relative overflow-hidden py-12 text-white sm:py-16">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="inline-block rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
              🚗 {CARS.length} {t("cars.results")}
            </span>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{t("cars.title")}</h1>
            <p className="mx-auto mt-3 max-w-2xl text-white/80">{t("cars.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            <span className="font-bold text-slate-900">{filtered.length}</span> {t("cars.results")}
          </p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-navy-700 hover:text-navy-700"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-extrabold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Filters sidebar */}
          <aside
            className={`${
              showFilters ? "fixed inset-0 z-50 overflow-y-auto bg-white p-5 sm:relative sm:inset-auto sm:z-auto sm:bg-slate-100/50 sm:p-0" : "hidden"
            } lg:block`}
          >
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <Filter className="h-4 w-4" />
                  {locale === "ar" ? "الفلاتر" : locale === "en" ? "Filters" : "Filtres"}
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-semibold text-navy-700 hover:underline"
                  >
                    {locale === "ar" ? "إعادة تعيين" : locale === "en" ? "Reset" : "Réinitialiser"}
                  </button>
                )}
                <button onClick={() => setShowFilters(false)} className="lg:hidden">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Category */}
              <div className="mb-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{t("cars.filter.category")}</p>
                <div className="space-y-1.5">
                  {[
                    { value: "", label: t("cars.filter.all") },
                    { value: "economy", label: t("cars.filter.economy") },
                    { value: "compact", label: t("cars.filter.compact") },
                    { value: "compact-suv", label: t("cars.filter.compactSuv") },
                    { value: "suv", label: t("cars.filter.suv") },
                    { value: "luxury", label: t("cars.filter.luxury") },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilters((f) => ({ ...f, category: opt.value }))}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                        filters.category === opt.value
                          ? "bg-navy-50 text-navy-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {filters.category === opt.value && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transmission */}
              <div className="mb-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{t("cars.filter.transmission")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {["", "automatic", "manual"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setFilters((f) => ({ ...f, transmission: val }))}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        filters.transmission === val
                          ? "bg-navy-700 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {val === "" ? t("cars.filter.all") : val === "automatic" ? t("cars.filter.automatic") : t("cars.filter.manual")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fuel */}
              <div className="mb-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{t("cars.filter.fuel")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {["", "essence", "diesel", "hybride"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setFilters((f) => ({ ...f, fuel: val }))}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        filters.fuel === val
                          ? "bg-navy-700 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {val === "" ? t("cars.filter.all") : val === "essence" ? t("cars.filter.essence") : val === "diesel" ? t("cars.filter.diesel") : t("cars.filter.hybride")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("cars.filter.price")}</p>
                  <span className="text-xs font-bold text-navy-700">≤ {filters.maxPrice} MAD</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="50"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, maxPrice: parseInt(e.target.value) }))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-amber-500"
                />
              </div>

              {/* Seats */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{t("cars.filter.seats")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 4, 5, 7].map((val) => (
                    <button
                      key={val}
                      onClick={() => setFilters((f) => ({ ...f, minSeats: val }))}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        filters.minSeats === val
                          ? "bg-navy-700 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {val === 0 ? t("cars.filter.all") : `${val}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            {filtered.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
                <p className="text-lg font-bold text-slate-700">{t("cars.notFound")}</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 rounded-full bg-navy-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800"
                >
                  {locale === "ar" ? "إعادة تعيين" : locale === "en" ? "Reset filters" : "Réinitialiser les filtres"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
                {filtered.map((car, i) => (
                  <CarCard key={car.id} car={car} delay={i * 0.05} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
