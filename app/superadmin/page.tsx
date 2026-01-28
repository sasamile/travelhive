"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  DollarSign,
  Calendar
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
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
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Dashboard</h1>
          <p className="text-zinc-600">Resumen general del sistema</p>
        </div>

        {/* Pending Approvals Alert */}
        {metrics.pendingApprovals.total > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="size-6 text-amber-600" />
              <h2 className="text-lg font-semibold text-amber-900">
                Aprobaciones Pendientes
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <div className="text-2xl font-bold text-amber-900">
                  {metrics.pendingApprovals.agencies}
                </div>
                <div className="text-sm text-amber-700">Agencias</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <div className="text-2xl font-bold text-amber-900">
                  {metrics.pendingApprovals.hosts}
                </div>
                <div className="text-sm text-amber-700">Hosts</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <div className="text-2xl font-bold text-amber-900">
                  {metrics.pendingApprovals.total}
                </div>
                <div className="text-sm text-amber-700">Total</div>
              </div>
            </div>
          </div>
        )}

        {/* General Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Users className="size-8 text-indigo-600" />
              <span className="text-xs font-semibold text-zinc-500 uppercase">Usuarios</span>
            </div>
            <div className="text-3xl font-bold text-zinc-900">
              {metrics.general.totalUsers.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="size-8 text-emerald-600" />
              <span className="text-xs font-semibold text-zinc-500 uppercase">Viajes</span>
            </div>
            <div className="text-3xl font-bold text-zinc-900">
              {metrics.general.totalTrips.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="size-8 text-purple-600" />
              <span className="text-xs font-semibold text-zinc-500 uppercase">Experiencias</span>
            </div>
            <div className="text-3xl font-bold text-zinc-900">
              {metrics.general.totalExperiences.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="size-8 text-yellow-600" />
              <span className="text-xs font-semibold text-zinc-500 uppercase">Ingresos</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900">
              {formatCurrency(metrics.general.totalRevenue)}
            </div>
          </div>
        </div>

        {/* Agencies Stats */}
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Building2 className="size-6 text-indigo-600" />
            Agencias
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-zinc-500 mb-1">Total</div>
              <div className="text-2xl font-bold text-zinc-900">{metrics.agencies.total}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-500 mb-1 flex items-center gap-1">
                <AlertCircle className="size-3 text-amber-600" />
                Pendientes
              </div>
              <div className="text-2xl font-bold text-amber-600">{metrics.agencies.pending}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-500 mb-1 flex items-center gap-1">
                <CheckCircle2 className="size-3 text-emerald-600" />
                Aprobadas
              </div>
              <div className="text-2xl font-bold text-emerald-600">{metrics.agencies.approved}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-500 mb-1 flex items-center gap-1">
                <XCircle className="size-3 text-red-600" />
                Rechazadas
              </div>
              <div className="text-2xl font-bold text-red-600">{metrics.agencies.rejected}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Este mes: {metrics.agencies.thisMonth}</span>
              <div className="flex items-center gap-2">
                <TrendingUp className={`size-4 ${metrics.agencies.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                <span className={`text-sm font-semibold ${metrics.agencies.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {metrics.agencies.change >= 0 ? '+' : ''}{metrics.agencies.change.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hosts Stats */}
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Users className="size-6 text-indigo-600" />
            Hosts
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-zinc-500 mb-1">Total</div>
              <div className="text-2xl font-bold text-zinc-900">{metrics.hosts.total}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-500 mb-1 flex items-center gap-1">
                <AlertCircle className="size-3 text-amber-600" />
                Pendientes
              </div>
              <div className="text-2xl font-bold text-amber-600">{metrics.hosts.pending}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-500 mb-1 flex items-center gap-1">
                <CheckCircle2 className="size-3 text-emerald-600" />
                Aprobados
              </div>
              <div className="text-2xl font-bold text-emerald-600">{metrics.hosts.approved}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-500 mb-1 flex items-center gap-1">
                <XCircle className="size-3 text-red-600" />
                Rechazados
              </div>
              <div className="text-2xl font-bold text-red-600">{metrics.hosts.rejected}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Este mes: {metrics.hosts.thisMonth}</span>
              <div className="flex items-center gap-2">
                <TrendingUp className={`size-4 ${metrics.hosts.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                <span className={`text-sm font-semibold ${metrics.hosts.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {metrics.hosts.change >= 0 ? '+' : ''}{metrics.hosts.change.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
