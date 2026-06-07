import { useMemo, useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import { Download, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import { Card, PageHeader, StatCard, Button, Select } from "../components/AdminUI";
import { db } from "../data/mockDb";
import { CARS, getCarById } from "../../data/cars";
import { useToast } from "../../hooks/useToast";

export function Reports() {
  const { show } = useToast();
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "year">("30d");

  const bookings = db.getBookings();
  const customers = db.getCustomers();

  const rangeDays = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
  const since = new Date(Date.now() - rangeDays * 86400000);

  const inRange = useMemo(() => bookings.filter((b) => new Date(b.createdAt) >= since), [bookings, rangeDays]);

  // Key metrics
  const metrics = useMemo(() => {
    const completed = inRange.filter((b) => b.status === "completed");
    const cancelled = inRange.filter((b) => b.status === "cancelled");
    const noShow = inRange.filter((b) => b.status === "no-show");
    const revenue = completed.reduce((s, b) => s + b.totalPrice, 0);
    const avgValue = completed.length > 0 ? Math.round(revenue / completed.length) : 0;
    const avgDuration = completed.length > 0
      ? Math.round(completed.reduce((s, b) => {
          return s + Math.ceil((new Date(b.returnDate).getTime() - new Date(b.pickupDate).getTime()) / 86400000);
        }, 0) / completed.length)
      : 0;
    return {
      totalBookings: inRange.length,
      revenue,
      avgValue,
      avgDuration,
      cancellationRate: inRange.length > 0 ? Math.round((cancelled.length / inRange.length) * 100) : 0,
      noShowRate: inRange.length > 0 ? Math.round((noShow.length / inRange.length) * 100) : 0,
      conversionRate: inRange.length > 0 ? Math.round((completed.length / inRange.length) * 100) : 0,
      newCustomers: customers.filter((c) => new Date(c.createdAt) >= since).length,
    };
  }, [inRange, customers, rangeDays]);

  // Revenue over time
  const revenueData = useMemo(() => {
    const bucketSize = rangeDays <= 7 ? 1 : rangeDays <= 30 ? 1 : 7;
    const buckets: { date: string; revenue: number; bookings: number }[] = [];
    const totalBuckets = Math.ceil(rangeDays / bucketSize);
    for (let i = totalBuckets - 1; i >= 0; i--) {
      const start = new Date(Date.now() - (i + 1) * bucketSize * 86400000);
      const end = new Date(Date.now() - i * bucketSize * 86400000);
      const filteredBk = bookings.filter((b) => {
        const d = new Date(b.pickupDate);
        return d >= start && d < end && b.status === "completed";
      });
      buckets.push({
        date: start.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
        revenue: filteredBk.reduce((s, b) => s + b.totalPrice, 0),
        bookings: filteredBk.length,
      });
    }
    return buckets;
  }, [bookings, rangeDays]);

  // Revenue by car
  const revenueByCar = useMemo(() => {
    const map: Record<string, { revenue: number; bookings: number }> = {};
    inRange.filter((b) => b.status === "completed").forEach((b) => {
      map[b.carId] = map[b.carId] || { revenue: 0, bookings: 0 };
      map[b.carId].revenue += b.totalPrice;
      map[b.carId].bookings += 1;
    });
    return Object.entries(map).map(([carId, d]) => {
      const car = getCarById(carId);
      return { name: car ? `${car.make} ${car.model}` : carId, revenue: d.revenue, bookings: d.bookings };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [inRange]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    inRange.forEach((b) => {
      const car = getCarById(b.carId);
      if (car) map[car.category] = (map[car.category] || 0) + 1;
    });
    return Object.entries(map).map(([k, v]) => ({ name: k, value: v }));
  }, [inRange]);

  // Source
  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    inRange.forEach((b) => { map[b.source] = (map[b.source] || 0) + 1; });
    return Object.entries(map).map(([k, v]) => ({ name: k, value: v }));
  }, [inRange]);

  // Top customers
  const topCustomers = useMemo(() => {
    return [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 8);
  }, [customers]);

  // Fleet utilization
  const fleetUtilization = useMemo(() => {
    return CARS.map((car) => {
      const carBookings = inRange.filter((b) => b.carId === car.id && (b.status === "completed" || b.status === "active"));
      const totalDays = carBookings.reduce((s, b) => {
        return s + Math.ceil((new Date(b.returnDate).getTime() - new Date(b.pickupDate).getTime()) / 86400000);
      }, 0);
      const occupancy = Math.round((totalDays / rangeDays) * 100);
      return { name: `${car.make} ${car.model.slice(0, 8)}`, occupancy: Math.min(100, occupancy), bookings: carBookings.length };
    }).sort((a, b) => b.occupancy - a.occupancy);
  }, [inRange, rangeDays]);

  const COLORS = ["#1E3A8A", "#F59E0B", "#10B981", "#0EA5E9", "#8B5CF6", "#EC4899"];

  const exportReport = () => {
    const csv = [
      ["Métrique", "Valeur"],
      ["Période", range],
      ["Total réservations", metrics.totalBookings],
      ["Revenus", `${metrics.revenue} MAD`],
      ["Panier moyen", `${metrics.avgValue} MAD`],
      ["Durée moyenne", `${metrics.avgDuration} jours`],
      ["Taux de conversion", `${metrics.conversionRate}%`],
      ["Taux d'annulation", `${metrics.cancellationRate}%`],
      ["Taux de no-show", `${metrics.noShowRate}%`],
      ["Nouveaux clients", metrics.newCustomers],
      [],
      ["Voiture", "Revenus (MAD)", "Réservations"],
      ...revenueByCar.map((c) => [c.name, c.revenue, c.bookings]),
    ];
    const csvStr = csv.map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvStr], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `velox-report-${range}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    show("Rapport exporté", "success");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rapports & Analyses"
        subtitle="Suivez les performances de votre agence"
        breadcrumb={[{ label: "Admin" }, { label: "Rapports" }]}
        action={
          <>
            <Select
              value={range}
              onChange={(v) => setRange(v as any)}
              options={[
                { value: "7d", label: "7 derniers jours" },
                { value: "30d", label: "30 derniers jours" },
                { value: "90d", label: "90 derniers jours" },
                { value: "year", label: "12 derniers mois" },
              ]}
              className="w-48"
            />
            <Button variant="primary" onClick={exportReport}><Download className="h-4 w-4" />Exporter</Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenus" value={`${metrics.revenue.toLocaleString()} MAD`} icon={DollarSign} color="emerald" delta={{ value: 12, positive: true }} />
        <StatCard label="Réservations" value={metrics.totalBookings} icon={Calendar} color="navy" delta={{ value: 8, positive: true }} />
        <StatCard label="Panier moyen" value={`${metrics.avgValue.toLocaleString()} MAD`} icon={TrendingUp} color="amber" subtitle={`${metrics.avgDuration}j en moyenne`} />
        <StatCard label="Nouveaux clients" value={metrics.newCustomers} icon={Users} color="violet" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><div className="p-4 text-center"><p className="text-3xl font-black text-emerald-600">{metrics.conversionRate}%</p><p className="text-[10px] font-bold uppercase text-slate-500">Conversion</p></div></Card>
        <Card><div className="p-4 text-center"><p className="text-3xl font-black text-rose-500">{metrics.cancellationRate}%</p><p className="text-[10px] font-bold uppercase text-slate-500">Annulation</p></div></Card>
        <Card><div className="p-4 text-center"><p className="text-3xl font-black text-amber-500">{metrics.noShowRate}%</p><p className="text-[10px] font-bold uppercase text-slate-500">No-show</p></div></Card>
        <Card><div className="p-4 text-center"><p className="text-3xl font-black text-navy-700">{metrics.avgDuration}j</p><p className="text-[10px] font-bold uppercase text-slate-500">Durée moy.</p></div></Card>
      </div>

      {/* Revenue chart */}
      <Card title="Évolution des revenus">
        <div className="p-5">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#revG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Revenue by car */}
        <Card title="Revenus par véhicule">
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueByCar} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={100} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} formatter={(v: any) => `${v.toLocaleString()} MAD`} />
                <Bar dataKey="revenue" fill="#1E3A8A" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category pie */}
        <Card title="Répartition par catégorie">
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} label={(e: any) => `${e.name}: ${e.value}`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Sources */}
        <Card title="Sources des réservations">
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="value" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Fleet utilization */}
        <Card title="Taux d'occupation flotte (%)">
          <div className="space-y-3 p-5">
            {fleetUtilization.map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-bold text-slate-700">{c.name}</span>
                  <span className="font-extrabold text-navy-700">{c.occupancy}% · {c.bookings} résa.</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-navy-700 to-amber-500 transition-all" style={{ width: `${c.occupancy}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top customers */}
      <Card title="Top clients">
        <div className="divide-y divide-slate-100">
          {topCustomers.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 px-5 py-3">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${i === 0 ? "bg-amber-500 text-white" : i === 1 ? "bg-slate-300 text-slate-700" : i === 2 ? "bg-amber-700 text-white" : "bg-slate-100 text-slate-600"}`}>{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{c.fullName}</p>
                <p className="text-xs text-slate-500">{c.totalBookings} réservation(s) · {c.phone}</p>
              </div>
              <p className="text-right text-sm font-extrabold text-emerald-700">{c.totalSpent.toLocaleString()}<span className="text-[10px] text-slate-500"> MAD</span></p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
