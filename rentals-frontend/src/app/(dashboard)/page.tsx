"use client";

import { useEffect, useState } from "react";
import { dashboardApi, DashboardResponse } from "@/lib/api";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  TrendingUp, TrendingDown, Home, Wallet, 
  Calendar, ArrowRight, Clock, Plus, BarChart3
} from "lucide-react";
import Link from "next/link";

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

function KpiCard({ label, value, sub, color, icon: Icon }: any) {
  return (
    <div className="rounded-3xl p-6 border group hover:border-[var(--color-primary)] transition-all animate-fade-in"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-[var(--color-primary)]/10 transition-colors">
          <Icon className="w-6 h-6" style={{ color: color }} />
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] mb-1">{label}</p>
      <p className="text-3xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-[var(--color-muted)] mt-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {sub}</p>}
    </div>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("MES");

  useEffect(() => {
    setLoading(true);
    dashboardApi.getMetrics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
    </div>
  );

  if (!data || data.totalRentals === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
        <Home className="w-10 h-10 text-[var(--color-muted)]" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Portfolio vacío</h2>
      <p className="text-[var(--color-muted)] max-w-sm mb-8">Añade tus propiedades para empezar a gestionar tu patrimonio de forma profesional.</p>
      <Link href="/rentals" className="px-6 py-3 rounded-2xl bg-[var(--color-primary)] text-white font-bold flex items-center gap-2 hover:opacity-90 transition-all">
        <Plus className="w-5 h-5" /> Añadir Propiedad
      </Link>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Portfolio Global</h1>
          <p className="text-sm text-[var(--color-muted)]">Resumen consolidado de todos tus activos</p>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
          {["MES", "TRIMESTRE", "AÑO"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-[10px] font-bold transition-all ${filter === f ? 'bg-[var(--color-primary)] text-white shadow-lg' : 'text-[var(--color-muted)] hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label="Ocupación Total" value={`${data.occupancyRate.toFixed(1)}%`} sub={`${data.activeRentals} de ${data.totalRentals} activos`} icon={Home} color="#3b82f6" />
        <KpiCard label="Ingresos Totales" value={fmt(data.monthlyIncome)} sub="Este periodo" icon={Wallet} color="#10b981" />
        <KpiCard label="Gastos Totales" value={fmt(data.monthlyExpenses)} sub="Gastos operativos" icon={TrendingDown} color="#ef4444" />
        <KpiCard label="Cashflow Neto" value={fmt(data.netCashFlow)} sub="Beneficio neto" icon={TrendingUp} color="#8b5cf6" />
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-[32px] p-8 border"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3"><TrendingUp className="w-6 h-6 text-[var(--color-primary)]"/> Rendimiento Histórico</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--color-muted)" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
                <Tooltip contentStyle={{ background: "var(--color-surface-light)", border: "1px solid var(--color-border)", borderRadius: 20, color: "#fff" }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorInc)" name="Ingresos" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorExp)" name="Gastos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[32px] p-8 border"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="text-xl font-bold text-white mb-8">Origen del Gasto</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.expenseDistribution.length > 0 ? data.expenseDistribution : [{ name: 'Sin gastos', amount: 1 }]} innerRadius={75} outerRadius={100} paddingAngle={8} dataKey="amount">
                  {(data.expenseDistribution.length > 0 ? data.expenseDistribution : [{ name: 'Sin gastos', amount: 1 }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-surface-light)", border: "1px solid var(--color-border)", borderRadius: 20, color: "#fff" }} />
                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 11, paddingTop: 30 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Property Performance Table - THE CORE FOR MULTI-PROPERTY OWNERS */}
      <div className="rounded-[32px] p-8 border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-3"><BarChart3 className="w-6 h-6 text-amber-500"/> Rendimiento por Propiedad</h2>
          <Link href="/rentals" className="text-xs font-bold text-[var(--color-primary)] hover:underline">Gestionar Inmuebles</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] border-b border-white/5">
                <th className="pb-4">Propiedad</th>
                <th className="pb-4">Estado</th>
                <th className="pb-4">Ingresos</th>
                <th className="pb-4">Gastos</th>
                <th className="pb-4 text-right">Beneficio Neto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.propertyPerformances.map((p, i) => (
                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-5 font-bold text-white">{p.name}</td>
                  <td className="py-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${p.status === 'VACÍO' || p.status === 'VACIO' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-5 text-emerald-400 font-medium">{fmt(p.income)}</td>
                  <td className="py-5 text-red-400 font-medium">{fmt(p.expenses)}</td>
                  <td className="py-5 text-right">
                    <span className={`text-sm font-black ${p.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {fmt(p.profit)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-[32px] p-8 border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="text-xl font-bold text-white mb-6">Alertas de Contrato</h2>
          <div className="space-y-4">
            {data.upcomingExpirations.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-[var(--color-primary)]/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-black text-lg">{c.rentalName.charAt(0)}</div>
                  <div><p className="font-bold text-white">{c.rentalName}</p><p className="text-xs text-[var(--color-muted)]">{c.tenantName}</p></div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-red-400 uppercase">Expira el</p>
                  <p className="text-sm font-black text-white">{c.endDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] p-8 border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="text-xl font-bold text-white mb-6">Actividad Reciente</h2>
          <div className="space-y-4">
            {data.recentTransactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${tx.type === 'INGRESO' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{tx.type === 'INGRESO' ? '+' : '-'}</div>
                  <div><p className="font-bold text-white truncate max-w-[200px]">{tx.description}</p><p className="text-xs text-[var(--color-muted)]">{tx.dueDate}</p></div>
                </div>
                <p className={`text-lg font-black ${tx.type === 'INGRESO' ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(tx.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
