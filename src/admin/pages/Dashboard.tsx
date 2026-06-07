import { useMemo } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { FileText, DollarSign, Activity, Clock, Car as CarIcon, TrendingUp, Calendar, ArrowRight, AlertTriangle, Plus, MessageCircle, Eye } from "lucide-react";
import { StatCard, Card, BookingStatusBadge, PaymentStatusBadge, Button, PageHeader } from "../components/AdminUI";
import { db } from "../data/mockDb";
import { getCarById } from "../../data/cars";
import { getLocationById } from "../../data/locations";
import { formatBookingMessage, waLink } from "../../utils/format";
import { useAdminT } from "../data/adminI18n";
import { useApp } from "../../context/AppContext";

export function Dashboard() {
  const t = useAdminT();
  const { locale } = useApp();
  const dateLocale = locale === "ar" ? "ar-MA" : locale === "en" ? "en-US" : "fr-FR";
  const bookings = db.getBookings();
  const customers = db.getCustomers();
  const carRecords = db.getCarRecords();

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split("T")[0];
  const month7Ago = new Date(today.getTime() - 7 * 86400000);
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  // Stats
  const stats = useMemo(() => {
    const last7 = bookings.filter((b) => new Date(b.createdAt) >= month7Ago);
    const thisMonthBookings = bookings.filter((b) => {
      const d = new Date(b.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const completed = bookings.filter((b) => b.status === "completed");
    const revenueThisMonth = thisMonthBookings.filter((b) => b.paymentStatus === "paid").reduce((s, b) => s + b.totalPrice, 0);
    const revenueAll = completed.reduce((s, b) => s + b.totalPrice, 0);
    const active = bookings.filter((b) => b.status === "active").length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const availableCars = carRecords.filter((c) => c.status === "available").length;
    const totalCars = carRecords.length;
    const occupancyRate = totalCars > 0 ? Math.round((active / totalCars) * 100) : 0;
    return {
      totalBookings: bookings.length,
      bookingsLast7: last7.length,
      revenueThisMonth,
      revenueAll,
      active,
      pending,
      availableCars,
      totalCars,
      occupancyRate,
      customers: customers.length,
      completed: completed.length,
    };
  }, [bookings, customers, carRecords]);

  // Revenue chart - last 30 days
  const revenueData = useMemo(() => {
    const data: { date: string; revenue: number; bookings: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const dStr = d.toISOString().split("T")[0];
      const dayBookings = bookings.filter((b) => b.pickupDate === dStr && b.status === "completed");
      data.push({
        date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
        revenue: dayBookings.reduce((s, b) => s + b.totalPrice, 0),
        bookings: dayBookings.length,
      });
    }
    return data;
  }, [bookings]);

  // Status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => { counts[b.status] = (counts[b.status] || 0) + 1; });
    return [
      { name: "En attente", value: counts.pending || 0, color: "#F59E0B" },
      { name: "Confirmées", value: counts.confirmed || 0, color: "#0EA5E9" },
      { name: "En cours", value: counts.active || 0, color: "#10B981" },
      { name: "Terminées", value: counts.completed || 0, color: "#64748B" },
      { name: "Annulées", value: counts.cancelled || 0, color: "#EF4444" },
    ].filter((d) => d.value > 0);
  }, [bookings]);

  // Top cars
  const topCarsData = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => { counts[b.carId] = (counts[b.carId] || 0) + 1; });
    return Object.entries(counts)
      .map(([carId, count]) => {
        const car = getCarById(carId);
        return { name: car ? `${car.make} ${car.model}` : carId, value: count };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [bookings]);

  const COLORS = ["#1E3A8A", "#F59E0B", "#10B981", "#0EA5E9", "#8B5CF6"];

  // Upcoming pickups
  const upcomingPickups = bookings
    .filter((b) => (b.status === "confirmed" || b.status === "pending") && (b.pickupDate === todayStr || b.pickupDate === tomorrowStr))
    .sort((a, b) => a.pickupDate.localeCompare(b.pickupDate));

  const upcomingReturns = bookings
    .filter((b) => b.status === "active" && (b.returnDate === todayStr || b.returnDate === tomorrowStr))
    .sort((a, b) => a.returnDate.localeCompare(b.returnDate));

  const recentBookings = bookings.slice(0, 6);
  const maintenanceCars = carRecords.filter((c) => c.status === "maintenance");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.dashboard")}
        subtitle={`${t("admin.greeting")} ${new Date().toLocaleDateString(dateLocale, { day: "2-digit", month: "long", year: "numeric" })}.`}
        action={
          <>
            <Link to="/admin/bookings/new"><Button variant="amber"><Plus className="h-4 w-4" />{t("btn.newBooking")}</Button></Link>
            <Link to="/admin/calendar"><Button variant="outline"><Calendar className="h-4 w-4" />{t("btn.calendar")}</Button></Link>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label={t("stat.bookings")} value={stats.totalBookings} icon={FileText} color="navy" delta={{ value: 12, positive: true }} subtitle={`${stats.bookingsLast7} ${t("stat.last7days")}`} />
        <StatCard label={t("stat.revenue")} value={`${stats.revenueThisMonth.toLocaleString()} MAD`} icon={DollarSign} color="emerald" delta={{ value: 8, positive: true }} subtitle={t("stat.collections")} />
        <StatCard label={t("stat.active")} value={stats.active} icon={Activity} color="sky" subtitle={t("stat.carsOut")} />
        <StatCard label={t("stat.pending")} value={stats.pending} icon={Clock} color="amber" subtitle={t("stat.toConfirm")} />
        <StatCard label={t("stat.available")} value={`${stats.availableCars}/${stats.totalCars}`} icon={CarIcon} color="violet" subtitle={t("stat.readyToRent")} />
        <StatCard label={t("stat.occupancy")} value={`${stats.occupancyRate}%`} icon={TrendingUp} color="rose" subtitle={t("stat.fleetUsed")} />
      </div>

      {/* Maintenance alert */}
      {maintenanceCars.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900">{maintenanceCars.length} {t("alert.maintenance")}</p>
            <p className="mt-0.5 text-xs text-amber-800">
              {maintenanceCars.map((c) => { const car = getCarById(c.id); return car ? `${car.make} ${car.model}` : c.id; }).join(" · ")}
            </p>
          </div>
          <Link to="/admin/cars" className="text-xs font-bold text-amber-700 hover:underline">{t("alert.see")}</Link>
        </div>
      )}

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title={t("chart.revenue30d")} className="lg:col-span-2">
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                  formatter={((v: any, name: any) => name === "revenue" ? [`${v} MAD`, "Revenus"] : [v, "Réservations"]) as any}
                />
                <Line type="monotone" dataKey="revenue" stroke="#1E3A8A" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: "#F59E0B" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t("chart.topCars")}>
          <div className="p-5">
            {topCarsData.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={topCarsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3}>
                    {topCarsData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Status distribution + Upcoming */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title={t("chart.bookingStatus")}>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusData} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title={t("chart.upcomingPickups")}
          action={<Link to="/admin/calendar" className="text-xs font-bold text-navy-700 hover:underline">{t("chart.viewAll")}</Link>}
        >
          <div className="divide-y divide-slate-100">
            {upcomingPickups.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">{t("chart.noPickups")}</p>
            ) : (
              upcomingPickups.slice(0, 4).map((b) => {
                const c = customers.find((x) => x.id === b.customerId);
                const car = getCarById(b.carId);
                const loc = getLocationById(b.pickupLocationId);
                const isToday = b.pickupDate === todayStr;
                return (
                  <Link key={b.id} to={`/admin/bookings/${b.id}`} className="flex items-center gap-3 p-3 transition-colors hover:bg-slate-50">
                    <div className={`flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-xl ${isToday ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                      <span className="text-[10px] font-bold leading-none">{isToday ? t("chart.today") : t("chart.tomorrow")}</span>
                      <span className="text-sm font-extrabold leading-none">{b.pickupTime.slice(0, 5)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">{c?.fullName}</p>
                      <p className="truncate text-xs text-slate-500">{car?.make} {car?.model} · {loc?.name.fr}</p>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </Link>
                );
              })
            )}
          </div>
        </Card>

        <Card
          title="Restitutions (aujourd'hui & demain)"
          action={<Link to="/admin/calendar" className="text-xs font-bold text-navy-700 hover:underline">Voir tout →</Link>}
        >
          <div className="divide-y divide-slate-100">
            {upcomingReturns.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">Aucune restitution planifiée</p>
            ) : (
              upcomingReturns.slice(0, 4).map((b) => {
                const c = customers.find((x) => x.id === b.customerId);
                const car = getCarById(b.carId);
                const isToday = b.returnDate === todayStr;
                return (
                  <Link key={b.id} to={`/admin/bookings/${b.id}`} className="flex items-center gap-3 p-3 transition-colors hover:bg-slate-50">
                    <div className={`flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-xl ${isToday ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      <span className="text-[10px] font-bold leading-none">{isToday ? "AUJ." : "DEM."}</span>
                      <span className="text-sm font-extrabold leading-none">{b.returnTime.slice(0, 5)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">{c?.fullName}</p>
                      <p className="truncate text-xs text-slate-500">{car?.make} {car?.model}</p>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </Link>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Recent bookings table */}
      <Card
        title={t("chart.recentBookings")}
        action={<Link to="/admin/bookings" className="inline-flex items-center gap-1 text-xs font-bold text-navy-700 hover:underline">{t("chart.allBookings")} <ArrowRight className="h-3 w-3" /></Link>}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Référence</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Client</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Véhicule</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Dates</th>
                <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Montant</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Statut</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Paiement</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBookings.map((b) => {
                const c = customers.find((x) => x.id === b.customerId);
                const car = getCarById(b.carId);
                const loc = getLocationById(b.pickupLocationId);
                const msg = formatBookingMessage({
                  reference: b.reference,
                  name: c?.fullName || "",
                  phone: c?.phone || "",
                  pickupDate: b.pickupDate,
                  returnDate: b.returnDate,
                  pickupLocation: loc?.name.fr || "",
                  carModel: car ? `${car.make} ${car.model}` : "",
                  totalPrice: b.totalPrice,
                });
                return (
                  <tr key={b.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link to={`/admin/bookings/${b.id}`} className="font-mono text-xs font-bold text-navy-700 hover:underline">
                        {b.reference}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-bold text-slate-900">{c?.fullName}</p>
                      <p className="text-xs text-slate-500">{c?.phone}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-700">{car?.make} {car?.model}</td>
                    <td className="px-5 py-3 text-xs text-slate-600">
                      <p>{b.pickupDate}</p>
                      <p className="text-slate-400">→ {b.returnDate}</p>
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-extrabold text-slate-900">{b.totalPrice.toLocaleString()} MAD</td>
                    <td className="px-5 py-3"><BookingStatusBadge status={b.status} /></td>
                    <td className="px-5 py-3"><PaymentStatusBadge status={b.paymentStatus} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/bookings/${b.id}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-700" title="Voir">
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <a href={waLink(msg)} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600" title="WhatsApp">
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
