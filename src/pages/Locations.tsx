import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Navigation, Plane, Anchor, Building2, Sun } from "lucide-react";
import { useState } from "react";
import { LOCATIONS } from "../data/locations";
import { useApp } from "../context/AppContext";
import { googleMapsDirectionsUrl } from "../utils/format";

const TYPE_ICONS: Record<string, any> = {
  office: Building2,
  airport: Plane,
  port: Anchor,
  city: MapPin,
  seasonal: Sun,
};

const TYPE_GRADIENTS: Record<string, string> = {
  office: "from-navy-700 to-navy-900",
  airport: "from-sky-500 to-sky-700",
  port: "from-indigo-500 to-indigo-700",
  city: "from-emerald-500 to-emerald-700",
  seasonal: "from-amber-500 to-amber-700",
};

export function Locations() {
  const { t, locale } = useApp();
  const [selected, setSelected] = useState(LOCATIONS[0]);

  return (
    <div className="bg-slate-50">
      <section className="hero-mesh relative overflow-hidden py-12 text-white sm:py-16">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black tracking-tight sm:text-5xl">
            {t("locations.title")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mx-auto mt-3 max-w-2xl text-white/80">
            {t("locations.subtitle")}
          </motion.p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Location list */}
          <div className="space-y-3">
            {LOCATIONS.map((loc, i) => {
              const Icon = TYPE_ICONS[loc.type] || MapPin;
              const isSelected = selected.id === loc.id;
              return (
                <motion.button
                  key={loc.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(loc)}
                  className={`group flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-amber-500 bg-white shadow-lg"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${TYPE_GRADIENTS[loc.type]} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-slate-900">{loc.name[locale]}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{loc.address}, {loc.city}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{loc.hours[locale]}</span>
                      {loc.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{loc.phone}</span>}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{loc.notes[locale]}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Map + details */}
          <div className="space-y-4 lg:sticky lg:top-32 lg:self-start">
            <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200/60">
              <div className="aspect-[4/3] w-full sm:aspect-video">
                <iframe
                  key={selected.id}
                  title={selected.name[locale]}
                  src={`https://maps.google.com/maps?q=${selected.gps.lat},${selected.gps.lng}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  className="h-full w-full"
                  loading="lazy"
                />
              </div>
              <div className="border-t border-slate-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">{selected.name[locale]}</h3>
                    <p className="mt-0.5 text-sm text-slate-500">{selected.address}, {selected.city}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={googleMapsDirectionsUrl(selected.gps.lat, selected.gps.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-premium inline-flex items-center gap-1.5 rounded-full bg-navy-700 px-4 py-2 text-xs font-bold text-white hover:bg-navy-800"
                    >
                      <Navigation className="h-3.5 w-3.5" /> {t("locations.directions")}
                    </a>
                    {selected.phone && (
                      <a
                        href={`tel:${selected.phone.replace(/\s/g, "")}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600"
                      >
                        <Phone className="h-3.5 w-3.5" /> {t("locations.call")}
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="font-bold">{selected.hours[locale]}</p>
                  <p className="mt-1">{selected.notes[locale]}</p>
                </div>
                {selected.isAirport && (
                  <div className="mt-3 rounded-2xl bg-sky-50 p-3 text-xs text-sky-900">
                    <p className="font-bold">✈️ {t("locations.airportInfo")}</p>
                  </div>
                )}
                {selected.isPort && (
                  <div className="mt-3 rounded-2xl bg-indigo-50 p-3 text-xs text-indigo-900">
                    <p className="font-bold">⚓ {t("locations.portInfo")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
