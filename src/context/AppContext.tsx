import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { LocaleCode, translations, TranslationKey } from "../data/i18n";
import { Currency } from "../data/info";

type AppState = {
  locale: LocaleCode;
  setLocale: (l: LocaleCode) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
  currency: Currency;
  setCurrency: (c: Currency) => void;
  // Booking draft
  bookingDraft: BookingDraft;
  setBookingDraft: React.Dispatch<React.SetStateAction<BookingDraft>>;
  resetBooking: () => void;
};

export type BookingDraft = {
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  pickupLocationId: string;
  returnLocationId: string;
  carId: string | null;
  extras: { gps: boolean; childSeat: boolean; additionalDriver: boolean; fullInsurance: boolean };
  driver: {
    fullName: string;
    email: string;
    phone: string;
    licenseNumber: string;
    licenseExpiry: string;
    idType: "CIN" | "Passport";
    idNumber: string;
    notes: string;
  };
  agreedToTerms: boolean;
};

const initialDraft: BookingDraft = {
  pickupDate: "",
  returnDate: "",
  pickupTime: "10:00",
  returnTime: "10:00",
  pickupLocationId: "main-office",
  returnLocationId: "main-office",
  carId: null,
  extras: { gps: false, childSeat: false, additionalDriver: false, fullInsurance: false },
  driver: {
    fullName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    licenseExpiry: "",
    idType: "CIN",
    idNumber: "",
    notes: "",
  },
  agreedToTerms: false,
};

const AppContext = createContext<AppState | null>(null);

const LOCALE_DIR: Record<LocaleCode, "ltr" | "rtl"> = {
  fr: "ltr",
  en: "ltr",
  ar: "rtl",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("velox-locale") : null;
    return (saved as LocaleCode) || "fr";
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("velox-currency") : null;
    return (saved as Currency) || "MAD";
  });

  const [bookingDraft, setBookingDraft] = useState<BookingDraft>(() => {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem("velox-draft") : null;
    if (saved) {
      try { return { ...initialDraft, ...JSON.parse(saved) }; } catch { return initialDraft; }
    }
    return initialDraft;
  });

  const dir = LOCALE_DIR[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    localStorage.setItem("velox-locale", locale);
  }, [locale, dir]);

  useEffect(() => {
    localStorage.setItem("velox-currency", currency);
  }, [currency]);

  useEffect(() => {
    sessionStorage.setItem("velox-draft", JSON.stringify(bookingDraft));
  }, [bookingDraft]);

  const t = useMemo(() => {
    return (key: TranslationKey): string => {
      return translations[locale]?.[key] || translations.fr[key] || key;
    };
  }, [locale]);

  const setLocale = (l: LocaleCode) => setLocaleState(l);
  const setCurrency = (c: Currency) => setCurrencyState(c);

  const resetBooking = () => {
    setBookingDraft(initialDraft);
    sessionStorage.removeItem("velox-draft");
  };

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale,
        t,
        dir,
        currency,
        setCurrency,
        bookingDraft,
        setBookingDraft,
        resetBooking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
