import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Calendar, MapPin, Car as CarIcon, Sparkles, User, FileText, MessageCircle, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { EXTRAS, getCarById } from "../data/cars";
import { LOCATIONS, getLocationById } from "../data/locations";
import { CarCard } from "../components/CarCard";
import { CarIllustration } from "../components/CarIllustration";
import { useToast } from "../hooks/useToast";
import { formatPrice, daysBetween, formatBookingMessage, waLink, googleMapsDirectionsUrl } from "../utils/format";
import { api } from "../services/api";

const STEPS = [
  { num: 1, key: "booking.step1", icon: Calendar },
  { num: 2, key: "booking.step2", icon: MapPin },
  { num: 3, key: "booking.step3", icon: CarIcon },
  { num: 4, key: "booking.step4", icon: Sparkles },
  { num: 5, key: "booking.step5", icon: User },
  { num: 6, key: "booking.step6", icon: FileText },
] as const;

export function Booking() {
  const { t, locale, currency, bookingDraft, setBookingDraft, resetBooking } = useApp();
  const { show } = useToast();
  const [step, setStep] = useState(1);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set default dates on first load
  useEffect(() => {
    if (!bookingDraft.pickupDate) {
      const today = new Date();
      const inThree = new Date(today.getTime() + 3 * 86400000);
      const inFive = new Date(today.getTime() + 5 * 86400000);
      setBookingDraft((d) => ({
        ...d,
        pickupDate: inThree.toISOString().split("T")[0],
        returnDate: inFive.toISOString().split("T")[0],
      }));
    }
  }, []);

  const days = daysBetween(bookingDraft.pickupDate, bookingDraft.returnDate);
  const selectedCar = bookingDraft.carId ? getCarById(bookingDraft.carId) : null;
  const selectedLocation = getLocationById(bookingDraft.pickupLocationId);

  // Price calculation
  // Use shared api.calculatePrice so admin-controlled pricing rules apply live
  const pricing = useMemo(() => {
    if (!selectedCar || !bookingDraft.pickupDate || !bookingDraft.returnDate) {
      return { base: 0, extrasTotal: 0, subtotal: 0, discount: 0, total: 0, deposit: 3000, dailyRate: 0 };
    }
    const p = api.calculatePrice(selectedCar.id, bookingDraft.pickupDate, bookingDraft.returnDate, bookingDraft.extras as any);
    return { base: p.base, extrasTotal: p.extrasTotal, subtotal: p.subtotal, discount: p.discount, total: p.total, deposit: p.deposit, dailyRate: p.dailyRate };
  }, [selectedCar, days, bookingDraft.extras, bookingDraft.pickupDate, bookingDraft.returnDate]);

  // Step validation
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!bookingDraft.pickupDate) newErrors.pickupDate = t("booking.error.required");
      if (!bookingDraft.returnDate) newErrors.returnDate = t("booking.error.required");
      if (bookingDraft.pickupDate && bookingDraft.returnDate && new Date(bookingDraft.returnDate) <= new Date(bookingDraft.pickupDate)) {
        newErrors.returnDate = locale === "ar" ? "يجب أن يكون بعد تاريخ الاستلام" : locale === "en" ? "Must be after pickup date" : "Doit être après la date de prise en charge";
      }
    }
    if (step === 3) {
      if (!bookingDraft.carId) newErrors.carId = locale === "ar" ? "اختر سيارة" : locale === "en" ? "Select a car" : "Choisissez un véhicule";
    }
    if (step === 5) {
      if (!bookingDraft.driver.fullName) newErrors.fullName = t("booking.error.required");
      if (!bookingDraft.driver.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(bookingDraft.driver.email)) newErrors.email = t("booking.error.email");
      if (!bookingDraft.driver.phone || bookingDraft.driver.phone.length < 6) newErrors.phone = t("booking.error.phone");
      if (!bookingDraft.driver.licenseNumber) newErrors.license = t("booking.error.license");
      if (!bookingDraft.agreedToTerms) newErrors.agreed = t("booking.error.agree");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validateStep()) {
      setStep((s) => Math.min(6, s + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      show(locale === "ar" ? "يرجى ملء الحقول المطلوبة" : locale === "en" ? "Please fill required fields" : "Veuillez remplir les champs requis", "error");
    }
  };
  const prev = () => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirm = () => {
    if (!validateStep()) {
      show(locale === "ar" ? "يرجى إكمال النموذج" : locale === "en" ? "Please complete the form" : "Veuillez compléter le formulaire", "error");
      return;
    }
    if (!bookingDraft.carId) {
      show(locale === "ar" ? "اختر سيارة" : "Sélectionnez un véhicule", "error");
      setStep(3);
      return;
    }
    // Final availability check (defensive — admin may have changed car status meanwhile)
    const avail = api.checkAvailability(bookingDraft.carId, bookingDraft.pickupDate, bookingDraft.returnDate);
    if (!avail.available) {
      show(
        locale === "ar" ? `هذه السيارة ${avail.reason || "غير متاحة"}` :
        locale === "en" ? `This car is ${avail.reason || "unavailable"}` :
        `Ce véhicule est ${avail.reason || "indisponible"}`,
        "error"
      );
      setStep(3);
      return;
    }
    // Submit to shared API → creates real booking + notifies admin in real-time
    try {
      const { booking } = api.submitPublicBooking({
        fullName: bookingDraft.driver.fullName,
        email: bookingDraft.driver.email,
        phone: bookingDraft.driver.phone,
        licenseNumber: bookingDraft.driver.licenseNumber,
        licenseExpiry: bookingDraft.driver.licenseExpiry,
        idType: bookingDraft.driver.idType,
        idNumber: bookingDraft.driver.idNumber,
        notes: bookingDraft.driver.notes,
        carId: bookingDraft.carId,
        pickupDate: bookingDraft.pickupDate,
        pickupTime: bookingDraft.pickupTime,
        returnDate: bookingDraft.returnDate,
        returnTime: bookingDraft.returnTime,
        pickupLocationId: bookingDraft.pickupLocationId,
        returnLocationId: bookingDraft.returnLocationId,
        extras: bookingDraft.extras,
      });
      setBookingRef(booking.reference);
      show(locale === "ar" ? "تم إرسال طلبك بنجاح!" : locale === "en" ? "Request sent!" : "Demande envoyée !", "success");
      setStep(7);
    } catch (err) {
      console.error(err);
      show(locale === "ar" ? "حدث خطأ" : locale === "en" ? "An error occurred" : "Une erreur est survenue", "error");
    }
  };

  // Success screen
  if (step === 7 && bookingRef) {
    const message = formatBookingMessage({
      reference: bookingRef,
      name: bookingDraft.driver.fullName,
      phone: bookingDraft.driver.phone,
      pickupDate: bookingDraft.pickupDate,
      returnDate: bookingDraft.returnDate,
      pickupLocation: selectedLocation?.name[locale] || "",
      carModel: selectedCar ? `${selectedCar.make} ${selectedCar.model}` : "",
      totalPrice: pricing.total,
    });
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 18 }}
            className="rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200/60 sm:p-10"
          >
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
              <h1 className="mt-5 text-2xl font-black text-slate-900 sm:text-3xl">{t("booking.success.title")}</h1>
              <p className="mt-3 text-slate-600">{t("booking.success.message")}</p>
            </div>
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-navy-700 to-navy-900 p-5 text-center text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-300">{t("booking.success.reference")}</p>
              <p className="mt-1 text-2xl font-black sm:text-3xl">{bookingRef}</p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href={waLink(message)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/30"
              >
                <MessageCircle className="h-4 w-4" /> {t("booking.success.whatsapp")}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(message);
                  show(locale === "ar" ? "تم نسخ الرسالة" : locale === "en" ? "Message copied" : "Message copié", "success");
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-extrabold text-slate-700 hover:border-slate-300"
              >
                <Mail className="h-4 w-4" /> {locale === "ar" ? "نسخ" : locale === "en" ? "Copy" : "Copier"}
              </button>
            </div>
            <Link
              to="/"
              onClick={() => { resetBooking(); setStep(1); }}
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700"
            >
              {t("booking.success.new")}
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{t("booking.title")}</h1>
          <p className="mt-1 text-sm text-slate-600">{t("booking.subtitle")}</p>
        </div>
        {/* Progress steps */}
        <div className="mx-auto max-w-6xl overflow-x-auto px-4 pb-4 sm:px-6">
          <div className="flex min-w-fit items-center gap-1 sm:gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = step > s.num;
              const active = step === s.num;
              return (
                <div key={s.num} className="flex items-center">
                  <button
                    onClick={() => s.num < step && setStep(s.num)}
                    disabled={s.num > step}
                    className={`group flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition-all sm:text-sm ${
                      active ? "bg-navy-700 text-white shadow-md" : done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                    } ${s.num <= step ? "cursor-pointer hover:scale-105" : "cursor-not-allowed"}`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[10px] sm:h-7 sm:w-7">
                      {done ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : <Icon className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </span>
                    <span className="hidden md:inline">{t(s.key)}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-1 h-0.5 w-4 sm:mx-2 sm:w-8 ${done ? "bg-emerald-500" : "bg-slate-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[1fr_360px]">
        {/* Main form */}
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* STEP 1: Dates & Times */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{t("booking.dates.title")}</h2>
                  <p className="mt-1 text-sm text-slate-500">{t("booking.dates.pickup")} & {t("booking.dates.return")}</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label={t("booking.dates.pickup")} error={errors.pickupDate}>
                      <input
                        type="date"
                        value={bookingDraft.pickupDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                          setBookingDraft((d) => ({
                            ...d,
                            pickupDate: e.target.value,
                            returnDate: d.returnDate <= e.target.value
                              ? new Date(new Date(e.target.value).getTime() + 86400000 * 3).toISOString().split("T")[0]
                              : d.returnDate,
                          }));
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                      />
                    </Field>
                    <Field label={t("booking.dates.time")} error={errors.pickupDate}>
                      <input
                        type="time"
                        value={bookingDraft.pickupTime}
                        onChange={(e) => setBookingDraft((d) => ({ ...d, pickupTime: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                      />
                    </Field>
                    <Field label={t("booking.dates.return")} error={errors.returnDate}>
                      <input
                        type="date"
                        value={bookingDraft.returnDate}
                        min={bookingDraft.pickupDate || new Date().toISOString().split("T")[0]}
                        onChange={(e) => setBookingDraft((d) => ({ ...d, returnDate: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                      />
                    </Field>
                    <Field label={t("booking.dates.time")}>
                      <input
                        type="time"
                        value={bookingDraft.returnTime}
                        onChange={(e) => setBookingDraft((d) => ({ ...d, returnTime: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                      />
                    </Field>
                  </div>
                  <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-bold">{t("booking.dates.duration")}: {days} {t("booking.dates.days")}</p>
                    {days >= 7 && (
                      <p className="mt-1 text-emerald-700">
                        ✅ {days >= 14 ? t("booking.price.discount15") : t("booking.price.discount10")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Location */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{t("booking.location.title")}</h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {LOCATIONS.map((loc) => {
                      const isSelected = bookingDraft.pickupLocationId === loc.id;
                      const Icon = loc.isAirport ? "✈️" : loc.isPort ? "⚓" : loc.isMain ? "🏢" : loc.type === "seasonal" ? "☀️" : "📍";
                      return (
                        <button
                          key={loc.id}
                          onClick={() => setBookingDraft((d) => ({ ...d, pickupLocationId: loc.id, returnLocationId: loc.id }))}
                          className={`relative flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                            isSelected
                              ? "border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/10"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="text-2xl">{Icon}</div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-extrabold text-slate-900">{loc.name[locale]}</p>
                            <p className="text-xs text-slate-500">{loc.city} · {loc.address}</p>
                            <p className="mt-1 text-xs font-semibold text-navy-700">{loc.hours[locale]}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="absolute end-3 top-3 h-5 w-5 text-amber-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Car selection */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{t("booking.car.title")}</h2>
                  {errors.carId && <p className="mt-1 text-sm text-rose-600">{errors.carId}</p>}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {api.getPublicCars().map((car) => (
                      <CarCard
                        key={car.id}
                        car={car}
                        showReserveButton={false}
                        onSelect={() => setBookingDraft((d) => ({ ...d, carId: car.id }))}
                        selected={bookingDraft.carId === car.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Extras */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{t("booking.extras.title")}</h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {EXTRAS.map((extra) => {
                      const isOn = bookingDraft.extras[extra.id as keyof typeof bookingDraft.extras];
                      const icons: Record<string, string> = { gps: "🗺️", "child-seat": "👶", "additional-driver": "👥", "full-insurance": "🛡️" };
                      return (
                        <button
                          key={extra.id}
                          onClick={() => setBookingDraft((d) => ({
                            ...d,
                            extras: { ...d.extras, [extra.id]: !d.extras[extra.id as keyof typeof d.extras] },
                          }))}
                          className={`relative flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                            isOn ? "border-emerald-500 bg-emerald-50 shadow-md" : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-100 to-amber-100 text-2xl">
                            {icons[extra.id]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-extrabold text-slate-900">
                              {t(`booking.extras.${extra.id === "gps" ? "gps" : extra.id === "child-seat" ? "childSeat" : extra.id === "additional-driver" ? "driver" : "insurance"}` as any)}
                            </p>
                            <p className="text-xs text-slate-500">{t(`booking.extras.${extra.id === "gps" ? "gpsDesc" : extra.id === "child-seat" ? "childSeatDesc" : extra.id === "additional-driver" ? "driverDesc" : "insuranceDesc"}` as any)}</p>
                            <p className="mt-1 text-sm font-extrabold text-navy-700">+{formatPrice(extra.pricePerDay, currency)}{t("booking.extras.perDay")}</p>
                          </div>
                          {isOn && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: Driver info */}
              {step === 5 && (
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{t("booking.driver.title")}</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label={t("booking.driver.fullName")} error={errors.fullName} className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder={t("booking.driver.fullNamePh")}
                        value={bookingDraft.driver.fullName}
                        onChange={(e) => setBookingDraft((d) => ({ ...d, driver: { ...d.driver, fullName: e.target.value } }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                      />
                    </Field>
                    <Field label={t("booking.driver.email")} error={errors.email}>
                      <input
                        type="email"
                        value={bookingDraft.driver.email}
                        onChange={(e) => setBookingDraft((d) => ({ ...d, driver: { ...d.driver, email: e.target.value } }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                      />
                    </Field>
                    <Field label={t("booking.driver.phone")} error={errors.phone}>
                      <input
                        type="tel"
                        value={bookingDraft.driver.phone}
                        onChange={(e) => setBookingDraft((d) => ({ ...d, driver: { ...d.driver, phone: e.target.value } }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                      />
                    </Field>
                    <Field label={t("booking.driver.license")} error={errors.license}>
                      <input
                        type="text"
                        value={bookingDraft.driver.licenseNumber}
                        onChange={(e) => setBookingDraft((d) => ({ ...d, driver: { ...d.driver, licenseNumber: e.target.value } }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                      />
                    </Field>
                    <Field label={t("booking.driver.licenseExpiry")}>
                      <input
                        type="date"
                        value={bookingDraft.driver.licenseExpiry}
                        onChange={(e) => setBookingDraft((d) => ({ ...d, driver: { ...d.driver, licenseExpiry: e.target.value } }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                      />
                    </Field>
                    <Field label={t("booking.driver.idType")}>
                      <select
                        value={bookingDraft.driver.idType}
                        onChange={(e) => setBookingDraft((d) => ({ ...d, driver: { ...d.driver, idType: e.target.value as "CIN" | "Passport" } }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                      >
                        <option value="CIN">{t("booking.driver.idTypeCIN")}</option>
                        <option value="Passport">{t("booking.driver.idTypePassport")}</option>
                      </select>
                    </Field>
                    <Field label={t("booking.driver.idNumber")}>
                      <input
                        type="text"
                        value={bookingDraft.driver.idNumber}
                        onChange={(e) => setBookingDraft((d) => ({ ...d, driver: { ...d.driver, idNumber: e.target.value } }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                      />
                    </Field>
                    <Field label={t("booking.driver.notes")} className="sm:col-span-2">
                      <textarea
                        rows={3}
                        value={bookingDraft.driver.notes}
                        onChange={(e) => setBookingDraft((d) => ({ ...d, driver: { ...d.driver, notes: e.target.value } }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                      />
                    </Field>
                    <label className="sm:col-span-2 flex items-start gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={bookingDraft.agreedToTerms}
                        onChange={(e) => setBookingDraft((d) => ({ ...d, agreedToTerms: e.target.checked }))}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-700"
                      />
                      <span>
                        {t("booking.driver.agree")}{" "}
                        <Link to="/terms" className="font-bold text-navy-700 underline">{t("booking.driver.terms")}</Link>{" "}
                        {t("booking.driver.and")}{" "}
                        <Link to="/privacy" className="font-bold text-navy-700 underline">{t("booking.driver.privacy")}</Link>.
                        {errors.agreed && <span className="ms-2 text-rose-600">⚠ {errors.agreed}</span>}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 6: Summary */}
              {step === 6 && (
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{t("booking.summary.title")}</h2>
                  <p className="mt-1 text-sm text-slate-500">{t("booking.subtitle")}</p>
                  <div className="mt-6 space-y-4">
                    {/* Car */}
                    {selectedCar && (
                      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className={`flex h-16 w-24 items-center justify-center rounded-xl ${selectedCar.cardBg} flex-shrink-0`}>
                          <CarIllustration car={selectedCar} showBadge={false} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold uppercase text-slate-500">{t("booking.summary.car")}</p>
                          <p className="text-base font-extrabold text-slate-900">{selectedCar.make} {selectedCar.model} {selectedCar.trim}</p>
                          <p className="text-xs text-slate-500">{selectedCar.year} · {selectedCar.transmission === "automatic" ? "Auto" : "Man."} · {selectedCar.fuel}</p>
                        </div>
                        <p className="text-right text-sm font-extrabold text-navy-700">{formatPrice(pricing.dailyRate || 0, currency)}<span className="text-xs text-slate-500">/{t("common.day")}</span></p>
                      </div>
                    )}
                    {/* Dates */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <SummaryBlock label={t("booking.dates.pickup")} value={`${bookingDraft.pickupDate} · ${bookingDraft.pickupTime}`} icon={Calendar} />
                      <SummaryBlock label={t("booking.dates.return")} value={`${bookingDraft.returnDate} · ${bookingDraft.returnTime}`} icon={Calendar} />
                      <SummaryBlock label={t("booking.summary.location")} value={selectedLocation?.name[locale] || ""} icon={MapPin} />
                      <SummaryBlock label={t("booking.dates.duration")} value={`${days} ${t("booking.dates.days")}`} icon={Calendar} />
                    </div>
                    {/* Map for selected location */}
                    {selectedLocation && (
                      <a
                        href={googleMapsDirectionsUrl(selectedLocation.gps.lat, selectedLocation.gps.lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded-2xl border border-slate-200 transition-colors hover:border-navy-700"
                      >
                        <iframe
                          title="map"
                          src={`https://maps.google.com/maps?q=${selectedLocation.gps.lat},${selectedLocation.gps.lng}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                          className="h-40 w-full"
                          loading="lazy"
                        />
                      </a>
                    )}
                    {/* Driver */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase text-slate-500">{t("booking.driver.title")}</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{bookingDraft.driver.fullName}</p>
                      <p className="text-xs text-slate-500">{bookingDraft.driver.email} · {bookingDraft.driver.phone}</p>
                    </div>
                    {/* Extras */}
                    {Object.entries(bookingDraft.extras).some(([, v]) => v) && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase text-slate-500">{t("booking.summary.extras")}</p>
                        <ul className="mt-2 space-y-1 text-sm">
                          {EXTRAS.filter((e) => bookingDraft.extras[e.id as keyof typeof bookingDraft.extras]).map((e) => (
                            <li key={e.id} className="flex justify-between">
                              <span>{t(`booking.extras.${e.id === "gps" ? "gps" : e.id === "child-seat" ? "childSeat" : e.id === "additional-driver" ? "driver" : "insurance"}` as any)}</span>
                              <span className="font-bold">+{formatPrice(e.pricePerDay * days, currency)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Reference note */}
                    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                      <p className="font-bold">📌 {t("booking.summary.reference")}</p>
                      <p className="mt-1">VELOX-2026-XXXX</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
            <button
              onClick={prev}
              disabled={step === 1}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4 rtl-flip" /> {t("booking.previous")}
            </button>
            {step < 6 ? (
              <button
                onClick={next}
                className="btn-premium flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-amber-500/30"
              >
                {t("booking.next")} <ChevronRight className="h-4 w-4 rtl-flip" />
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                className="btn-premium flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/30"
              >
                {t("booking.confirm")} <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sticky summary */}
        <aside className="hidden lg:block">
          <div className="sticky top-32 space-y-4">
            <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200/60">
              <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-slate-500">{t("booking.summary.title")}</h3>
              {selectedCar ? (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`flex h-14 w-20 items-center justify-center rounded-xl ${selectedCar.cardBg}`}>
                      <CarIllustration car={selectedCar} showBadge={false} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold text-slate-900">{selectedCar.make} {selectedCar.model}</p>
                      <p className="text-xs text-slate-500">{days} {t("common.days")}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 border-t border-slate-200 pt-3 text-sm">
                    <Row label={`${t("cars.from")} (${days} ${t("common.days")})`} value={formatPrice(pricing.base, currency)} />
                    {pricing.extrasTotal > 0 && (
                      <Row label={t("booking.summary.extras")} value={formatPrice(pricing.extrasTotal, currency)} />
                    )}
                    <Row label={t("booking.summary.subtotal")} value={formatPrice(pricing.subtotal, currency)} bold />
                    {pricing.discount > 0 && (
                      <Row
                        label={t("booking.summary.discount")}
                        value={`-${formatPrice(pricing.discount, currency)}`}
                        green
                      />
                    )}
                  </div>
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-700">{t("booking.summary.total")}</p>
                      <p className="text-2xl font-black text-navy-700">{formatPrice(pricing.total, currency)}</p>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">+ {t("booking.summary.deposit")}: {formatPrice(pricing.deposit, currency)}</p>
                  </div>
                  <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-xs text-emerald-800">
                    <p className="font-bold">✓ {t("banner.noPaymentShort")}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">— {t("booking.car.select")} —</p>
              )}
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-navy-700 to-navy-900 p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-300">{locale === "ar" ? "تحتاج مساعدة؟" : locale === "en" ? "Need help?" : "Besoin d'aide ?"}</p>
              <a href="tel:+212668353949" className="mt-2 block text-sm font-bold hover:text-amber-300">+212 6 68 35 39 49</a>
              <a href="https://wa.me/212671615948" target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm font-bold hover:text-amber-300">WhatsApp</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, error, children, className = "" }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">{label}</label>
      {children}
      {error && <p className="mt-1 flex items-center gap-1 text-xs text-rose-600"><AlertCircle className="h-3 w-3" />{error}</p>}
    </div>
  );
}

function SummaryBlock({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <Icon className="h-5 w-5 flex-shrink-0 text-navy-700" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="truncate text-sm font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function Row({ label, value, bold, green }: { label: string; value: string; bold?: boolean; green?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-slate-600 ${bold ? "font-bold" : ""}`}>{label}</span>
      <span className={`${bold ? "font-extrabold text-slate-900" : "font-semibold"} ${green ? "text-emerald-600" : "text-slate-900"}`}>
        {value}
      </span>
    </div>
  );
}
