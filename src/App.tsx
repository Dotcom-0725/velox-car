import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./hooks/useToast";
import { NoPaymentBanner } from "./components/NoPaymentBanner";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { WhatsAppFloat } from "./components/WhatsAppFloat";
import { StickyBottomBar } from "./components/StickyBottomBar";
import { Home } from "./pages/Home";
import { Fleet } from "./pages/Fleet";
import { CarDetail } from "./pages/CarDetail";
import { Booking } from "./pages/Booking";
import { Locations } from "./pages/Locations";
import { About } from "./pages/About";
import { FAQ } from "./pages/FAQ";
import { Contact } from "./pages/Contact";
import { Legal } from "./pages/Legal";

// Admin
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import { AdminLayout } from "./admin/components/AdminLayout";
import { AdminLogin } from "./admin/pages/Login";
import { Dashboard } from "./admin/pages/Dashboard";
import { Bookings } from "./admin/pages/Bookings";
import { BookingDetail } from "./admin/pages/BookingDetail";
import { NewBooking } from "./admin/pages/NewBooking";
import { Cars as AdminCars } from "./admin/pages/Cars";
import { Customers } from "./admin/pages/Customers";
import { CalendarPage } from "./admin/pages/Calendar";
import { Reports } from "./admin/pages/Reports";
import { LocationsAdmin, PricingAdmin, ReviewsAdmin, WhatsAppAdmin, LogsAdmin, SettingsAdmin } from "./admin/pages/OtherPages";
import { MessagesAdmin } from "./admin/pages/Messages";
import { NewContract } from "./admin/pages/NewContract";
import { Contracts } from "./admin/pages/Contracts";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, [pathname]);
  return null;
}

function PublicShell() {
  return (
    <>
      <NoPaymentBanner />
      <Header />
      <main className="min-h-[60vh] pb-24 lg:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/fleet/:id" element={<CarDetail />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Legal />} />
          <Route path="/privacy" element={<Legal />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppFloat />
      <StickyBottomBar />
    </>
  );
}

function RootRouter() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <AppProvider>
      <ScrollToTop />
      {isAdmin ? (
        <AdminAuthProvider>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="bookings/new" element={<NewBooking />} />
              <Route path="bookings/:id" element={<BookingDetail />} />
              <Route path="messages" element={<MessagesAdmin />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="contracts/new" element={<NewContract />} />
              <Route path="contracts/:id/edit" element={<NewContract />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="cars" element={<AdminCars />} />
              <Route path="customers" element={<Customers />} />
              <Route path="locations" element={<LocationsAdmin />} />
              <Route path="pricing" element={<PricingAdmin />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reviews" element={<ReviewsAdmin />} />
              <Route path="whatsapp" element={<WhatsAppAdmin />} />
              <Route path="logs" element={<LogsAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
            </Route>
          </Routes>
        </AdminAuthProvider>
      ) : (
        <PublicShell />
      )}
    </AppProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <RootRouter />
      </ToastProvider>
    </BrowserRouter>
  );
}
