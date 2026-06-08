import { useState, useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, Car, Users, MapPin, BadgePercent, BarChart3, Star, MessageSquare, Settings, FileText, Bell,
  LogOut, Menu, X, ChevronDown, Plus, Database, ExternalLink, Activity, Inbox, Search, FileSignature
} from "lucide-react";
import { api } from "../../services/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import { CarLogo } from "../../components/CarIllustration";
import { db } from "../data/mockDb";
import { useSyncRefresh, subscribe } from "../../services/sync";
import { useToast } from "../../hooks/useToast";
import { useAdminT } from "../data/adminI18n";
import { useApp } from "../../context/AppContext";

type NavItem = { to: string; labelKey: any; icon: any; roles?: string[]; badge?: () => number };

const NAV: NavItem[] = [
  { to: "/admin", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/admin/bookings", labelKey: "nav.bookings", icon: FileText, badge: () => db.getBookings().filter((b) => b.status === "pending").length },
  { to: "/admin/contracts", labelKey: "nav.contracts", icon: FileSignature, badge: () => db.getContracts().length },
  { to: "/admin/messages", labelKey: "nav.messages", icon: Inbox, badge: () => api.getContactMessages().filter((m) => m.status === "new").length },
  { to: "/admin/calendar", labelKey: "nav.calendar", icon: Calendar },
  { to: "/admin/cars", labelKey: "nav.fleet", icon: Car },
  { to: "/admin/customers", labelKey: "nav.customers", icon: Users },
  { to: "/admin/locations", labelKey: "nav.locations", icon: MapPin },
  { to: "/admin/pricing", labelKey: "nav.pricing", icon: BadgePercent },
  { to: "/admin/reports", labelKey: "nav.reports", icon: BarChart3 },
  { to: "/admin/reviews", labelKey: "nav.reviews", icon: Star, badge: () => db.getReviews().filter((r) => !r.approved).length },
  { to: "/admin/whatsapp", labelKey: "nav.whatsapp", icon: MessageSquare },
  { to: "/admin/logs", labelKey: "nav.logs", icon: Activity },
  { to: "/admin/settings", labelKey: "nav.settings", icon: Settings, roles: ["super-admin", "manager"] },
];

export function AdminLayout() {
  const { user, logout, hasRole } = useAdminAuth();
  const t = useAdminT();
  const { locale, dir } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { show } = useToast();

  // Re-render badges / notification count whenever a sync event arrives
  useSyncRefresh(["booking:created", "booking:updated", "booking:deleted", "contact:received", "review:submitted", "car:status-changed"]);

  // Show a desktop-style toast on incoming public submissions (real-time feel)
  useEffect(() => {
    return subscribe((evt) => {
      if (evt.type === "booking:created") {
        show(`🎉 Nouvelle réservation : ${evt.payload.reference} — ${evt.payload.customerName}`, "success");
      } else if (evt.type === "contact:received") {
        show(`✉️ Message de ${evt.payload.name} : ${evt.payload.subject}`, "info");
      } else if (evt.type === "review:submitted") {
        show(`⭐ Nouvel avis (${evt.payload.rating}/5) de ${evt.payload.name}`, "info");
      }
    });
  }, [show]);

  // Close sidebar on navigation
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Click outside
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        navigate("/admin/contracts/new");
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [navigate]);

  if (!user) return <Navigate to="/admin/login" replace />;

  const notifications = db.getNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNav = NAV.filter((n) => !n.roles || n.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-100" dir={dir} lang={locale}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 z-50 w-72 border-e border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${dir === "rtl" ? "end-0 start-auto" : "start-0"}`}
        dir="ltr"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <Link to="/admin" className="flex items-center gap-2.5">
              <CarLogo size={40} />
              <div>
                <div className="text-base font-extrabold text-navy-700">VELOX</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-500">Admin Panel</div>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 lg:hidden">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick action */}
          <div className="space-y-2 border-b border-slate-100 p-3">
            <Link
              to="/admin/contracts/new"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2.5 text-sm font-extrabold text-white shadow-md shadow-amber-500/20 transition-all hover:shadow-lg"
            >
              <FileSignature className="h-4 w-4" />
              {t("nav.newContract")}
              <kbd className="ms-1 hidden rounded bg-white/20 px-1.5 py-0.5 text-[10px] sm:inline">⌘N</kbd>
            </Link>
            <Link
              to="/admin/bookings/new"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("nav.quickBooking")}
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-0.5">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                const badgeCount = item.badge?.() ?? 0;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/admin"}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${isActive
                          ? "bg-navy-700 text-white shadow-md shadow-navy-700/20"
                          : "text-slate-600 hover:bg-slate-100 hover:text-navy-700"}`
                      }
                    >
                      <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                      <span className="flex-1">{t(item.labelKey)}</span>
                      {badgeCount > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-extrabold text-white">
                          {badgeCount}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer in sidebar */}
          <div className="border-t border-slate-100 p-3">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("admin.publicSite")}
            </Link>
            <button
              onClick={() => { if (confirm("Réinitialiser toutes les données démo ?")) { db.reset(); window.location.reload(); } }}
              className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <Database className="h-3.5 w-3.5" />
              {t("admin.resetData")}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main area */}
      <div className={`${sidebarOpen ? (dir === "rtl" ? "me-72" : "ms-72") : ""}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-lg">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Hamburger menu - always visible */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="relative hidden sm:block">
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t("admin.search")}
                  className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 ps-10 pe-4 text-sm placeholder:text-slate-400 focus:border-navy-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-100 lg:w-80"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute end-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 sm:w-96"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <p className="text-sm font-extrabold text-slate-900">Notifications</p>
                        <button
                          onClick={() => {
                            db.saveNotifications(notifications.map((n) => ({ ...n, read: true })));
                            setNotifOpen(false);
                          }}
                          className="text-xs font-semibold text-navy-700 hover:underline"
                        >
                          {t("admin.markAllRead")}
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-6 text-center text-sm text-slate-400">{t("admin.noNotifications")}</p>
                        ) : (
                          notifications.map((n) => (
                            <Link
                              key={n.id}
                              to={n.link || "/admin"}
                              onClick={() => setNotifOpen(false)}
                              className={`block border-b border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50 ${!n.read ? "bg-amber-50/40" : ""}`}
                            >
                              <div className="flex items-start gap-2">
                                {!n.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-900">{n.title}</p>
                                  <p className="mt-0.5 text-xs text-slate-600">{n.message}</p>
                                  <p className="mt-1 text-[10px] text-slate-400">{timeAgo(n.createdAt)}</p>
                                </div>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-xl bg-slate-100 px-2 py-1.5 hover:bg-slate-200"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-xs font-extrabold text-white">
                    {user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <span className="hidden text-sm font-semibold text-slate-700 sm:inline">{user.fullName}</span>
                  <ChevronDown className="h-3 w-3 text-slate-500" />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute end-0 z-40 mt-2 w-64 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
                    >
                      <div className="border-b border-slate-100 p-4">
                        <p className="text-sm font-extrabold text-slate-900">{user.fullName}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                        <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${user.role === "super-admin" ? "bg-amber-100 text-amber-700" : user.role === "manager" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-700"}`}>
                          {user.role === "super-admin" ? t("role.superAdmin") : user.role === "manager" ? t("role.manager") : t("role.staff")}
                        </span>
                      </div>
                      {hasRole("super-admin") && (
                        <Link
                          to="/admin/settings"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Settings className="h-4 w-4" /> {t("nav.settings")}
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); navigate("/admin/login"); }}
                        className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" /> {t("admin.logout")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `il y a ${Math.floor(seconds / 86400)}j`;
  return new Date(iso).toLocaleDateString("fr-FR");
}
