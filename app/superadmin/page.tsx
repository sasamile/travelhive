"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  DollarSign,
  Calendar,
  Info
} from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Metrics {
  agencies: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  hosts: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  general: {
    totalUsers: number;
    totalTrips: number;
    totalExperiences: number;
    totalBookings: number;
    totalRevenue: number;
  };
  pendingApprovals: {
    agencies: number;
    hosts: number;
    total: number;
  };
}

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get<Metrics>("/admin/metrics");
      setMetrics(response.data);
    } catch (error: any) {
      console.error("Error al cargar métricas:", error);
      toast.error(error.response?.data?.message || "Error al cargar las métricas");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Skeleton Components
  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg w-10 h-10"></div>
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      ))}
    </div>
  );

  const SectionsSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm animate-pulse">
          <div className="p-6 border-b border-slate-100 dark:border-zinc-900">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="text-center">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2 mx-auto"></div>
                  <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0a0a0b] p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header Skeleton */}
          <header className="flex justify-between items-end mb-10">
            <div>
              <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-40 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
          </header>

          <StatsSkeleton />
          <SectionsSkeleton />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-600">No se pudieron cargar las métricas</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0a0a0b] p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-caveat font-medium text-slate-800 dark:text-white">
              Resumen del sistema
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Monitoreo general de operaciones y usuarios.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl">
              <Calendar className="size-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {format(new Date(), "MMMM yyyy", { locale: es })}
              </span>
            </div>
          </div>
        </header>


        {/* General Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                <Users className="size-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Usuarios
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                {metrics.general.totalUsers.toLocaleString()}
              </h3>
              <span className="text-xs font-medium text-emerald-500">+12%</span>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <Building2 className="size-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Viajes
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                {metrics.general.totalTrips.toLocaleString()}
              </h3>
              <span className="text-xs font-medium text-slate-400">0%</span>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
                <Calendar className="size-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Experiencias
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                {metrics.general.totalExperiences.toLocaleString()}
              </h3>
              <span className="text-xs font-medium text-emerald-500">+100%</span>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm bg-linear-to-br from-white to-indigo-600/5 dark:from-zinc-950 dark:to-indigo-600/10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-600 text-white rounded-lg">
                <DollarSign className="size-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Ingresos
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(metrics.general.totalRevenue)}
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">Facturado este mes</p>
          </div>
        </div>

        {/* Agencies & Hosts Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Agencies Stats */}
          <section className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-900 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Building2 className="size-5 text-indigo-600" />
                <h4 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  Agencias Registradas
                </h4>
              </div>
              <Link
                href="/superadmin/agencies"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Ver todas
              </Link>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {metrics.agencies.total}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-amber-500 mb-1">Pendientes</p>
                  <p className="text-2xl font-bold text-amber-500">{metrics.agencies.pending}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-500 mb-1">Aprobadas</p>
                  <p className="text-2xl font-bold text-emerald-500">{metrics.agencies.approved}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-red-500 mb-1">Rechazadas</p>
                  <p className="text-2xl font-bold text-red-500">{metrics.agencies.rejected}</p>
                </div>
              </div>
              <div className="mt-8 p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Este mes: {metrics.agencies.thisMonth} Agencia{metrics.agencies.thisMonth !== 1 ? 's' : ''} nueva{metrics.agencies.thisMonth !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-500">
                  <TrendingUp className="size-3" />
                  <span className="text-xs font-bold">
                    {metrics.agencies.change >= 0 ? '+' : ''}{metrics.agencies.change.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Hosts Stats */}
          <section className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-900 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Users className="size-5 text-indigo-600" />
                <h4 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  Hosts Activos
                </h4>
              </div>
              <Link
                href="/superadmin/hosts"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Ver todos
              </Link>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {metrics.hosts.total}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-amber-500 mb-1">Pendientes</p>
                  <p className="text-2xl font-bold text-amber-500">{metrics.hosts.pending}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-500 mb-1">Aprobadas</p>
                  <p className="text-2xl font-bold text-emerald-500">{metrics.hosts.approved}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-red-500 mb-1">Rechazadas</p>
                  <p className="text-2xl font-bold text-red-500">{metrics.hosts.rejected}</p>
                </div>
              </div>
              <div className="mt-8 p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Este mes: {metrics.hosts.thisMonth} Host{metrics.hosts.thisMonth !== 1 ? 's' : ''} registrado{metrics.hosts.thisMonth !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-500">
                  <TrendingUp className="size-3" />
                  <span className="text-xs font-bold">
                    {metrics.hosts.change >= 0 ? '+' : ''}{metrics.hosts.change.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Recent Requests Table */}
        {metrics.pendingApprovals.total > 0 && (
          <section className="mt-10 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-900">
              <h4 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                Últimas Solicitudes
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-900/50">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Entidad
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Contacto
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                  {/* Aquí se pueden agregar las solicitudes pendientes si hay un endpoint para eso */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center overflow-hidden">
                          <Building2 className="size-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {metrics.pendingApprovals.agencies} Agencia{metrics.pendingApprovals.agencies !== 1 ? 's' : ''} pendiente{metrics.pendingApprovals.agencies !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Requieren revisión
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Ver detalles
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-500/20">
                        PENDIENTE
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href="/superadmin/agencies"
                        className="text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        Revisar →
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Info Floating Card */}
      <div className="fixed bottom-6 right-6 max-w-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-5 rounded-xl border border-indigo-600/20 dark:border-indigo-500/20 shadow-2xl z-40 transform hover:-translate-y-1 transition-transform border-l-4 border-l-indigo-600 dark:border-l-indigo-500">
        <div className="flex gap-3">
          <Info className="size-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">
              Información Importante
            </h5>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 shrink-0"></span>
                Solo super administradores pueden gestionar roles.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 shrink-0"></span>
                El acceso total incluye aprobación de entidades.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
