import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "../data/mockDb";
import { CARS, getCarById } from "../../data/cars";
import { Card, PageHeader, Select, BookingStatusBadge } from "../components/AdminUI";

export function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [carFilter, setCarFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const bookings = db.getBookings();
  const customers = db.getCustomers();

  const filtered = useMemo(() => bookings.filter((b) => {
    if (b.status === "cancelled" && statusFilter !== "cancelled") return false;
    if (carFilter && b.carId !== carFilter) return false;
    if (statusFilter && b.status !== statusFilter) return false;
    return true;
  }), [bookings, carFilter, statusFilter]);

  // Generate calendar grid
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay(); // 0=Sun

  const monthName = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const cells: { day: number | null; date: string | null; bookings: typeof filtered }[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null, date: null, bookings: [] });
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = new Date(year, month, d).toISOString().split("T")[0];
    const dayBookings = filtered.filter((b) => {
      const start = b.pickupDate;
      const end = b.returnDate;
      return dStr >= start && dStr <= end;
    });
    cells.push({ day: d, date: dStr, bookings: dayBookings });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, date: null, bookings: [] });

  const statusColors: Record<string, string> = {
    pending: "bg-amber-400 text-white",
    confirmed: "bg-sky-500 text-white",
    active: "bg-emerald-500 text-white",
    completed: "bg-slate-400 text-white",
    cancelled: "bg-rose-400 text-white",
    "no-show": "bg-slate-300 text-slate-700",
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Calendrier"
        subtitle="Vue d'ensemble des réservations par jour"
        breadcrumb={[{ label: "Admin" }, { label: "Calendrier" }]}
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setDate(new Date(year, month - 1, 1))} className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200"><ChevronLeft className="h-4 w-4" /></button>
            <h2 className="text-lg font-extrabold capitalize text-slate-900">{monthName}</h2>
            <button onClick={() => setDate(new Date(year, month + 1, 1))} className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200"><ChevronRight className="h-4 w-4" /></button>
            <button onClick={() => setDate(new Date())} className="rounded-lg bg-navy-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-navy-800">Aujourd'hui</button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={carFilter}
              onChange={setCarFilter}
              options={[{ value: "", label: "Toutes voitures" }, ...CARS.map((c) => ({ value: c.id, label: `${c.make} ${c.model}` }))]}
              className="w-48"
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "", label: "Tous statuts" },
                { value: "pending", label: "En attente" },
                { value: "confirmed", label: "Confirmées" },
                { value: "active", label: "En cours" },
                { value: "completed", label: "Terminées" },
                { value: "cancelled", label: "Annulées" },
              ]}
              className="w-44"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />En attente</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" />Confirmée</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />En cours</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400" />Terminée</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-400" />Annulée</span>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 border-t border-slate-100 bg-slate-50">
          {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((d) => (
            <div key={d} className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">{d}</div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 border-t border-s border-slate-100">
          {cells.map((cell, i) => {
            const isToday = cell.date === todayStr;
            return (
              <div key={i} className={`min-h-[96px] border-e border-b border-slate-100 p-1.5 ${cell.day === null ? "bg-slate-50/50" : isToday ? "bg-amber-50/40" : ""}`}>
                {cell.day && (
                  <>
                    <div className={`mb-1 text-xs font-bold ${isToday ? "text-amber-700" : "text-slate-700"}`}>
                      {isToday && <span className="me-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />}
                      {cell.day}
                    </div>
                    <div className="space-y-0.5">
                      {cell.bookings.slice(0, 3).map((b) => {
                        const car = getCarById(b.carId);
                        const cust = customers.find((c) => c.id === b.customerId);
                        const isStart = b.pickupDate === cell.date;
                        const isEnd = b.returnDate === cell.date;
                        return (
                          <Link
                            key={b.id}
                            to={`/admin/bookings/${b.id}`}
                            title={`${cust?.fullName} - ${car?.make} ${car?.model} (${b.reference})`}
                            className={`block truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-opacity hover:opacity-80 ${statusColors[b.status]}`}
                          >
                            {isStart && "▶ "}{isEnd && "◀ "}
                            {car?.make} {car?.model.slice(0, 6)}
                          </Link>
                        );
                      })}
                      {cell.bookings.length > 3 && (
                        <p className="px-1.5 text-[10px] font-bold text-slate-500">+{cell.bookings.length - 3} autres</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Today's summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title={`Prises en charge - ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}`}>
          <div className="divide-y divide-slate-100">
            {filtered.filter((b) => b.pickupDate === todayStr).length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">Aucune prise en charge aujourd'hui</p>
            ) : filtered.filter((b) => b.pickupDate === todayStr).map((b) => {
              const car = getCarById(b.carId);
              const cust = customers.find((c) => c.id === b.customerId);
              return (
                <Link key={b.id} to={`/admin/bookings/${b.id}`} className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{cust?.fullName}</p>
                    <p className="text-xs text-slate-500">{car?.make} {car?.model} · {b.pickupTime}</p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </Link>
              );
            })}
          </div>
        </Card>
        <Card title={`Restitutions - ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}`}>
          <div className="divide-y divide-slate-100">
            {filtered.filter((b) => b.returnDate === todayStr).length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">Aucune restitution aujourd'hui</p>
            ) : filtered.filter((b) => b.returnDate === todayStr).map((b) => {
              const car = getCarById(b.carId);
              const cust = customers.find((c) => c.id === b.customerId);
              return (
                <Link key={b.id} to={`/admin/bookings/${b.id}`} className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{cust?.fullName}</p>
                    <p className="text-xs text-slate-500">{car?.make} {car?.model} · {b.returnTime}</p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
