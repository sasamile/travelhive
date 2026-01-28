"use client";

import { useState, useEffect } from "react";
import { Calendar, Download, Wallet, Star, TrendingUp, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Experience {
  id: string;
  idTrip: string;
  title: string;
  price: number;
  currency: string;
  stats: {
    totalBookings: number;
    totalReviews: number;
    averageRating: number | null;
    totalFavorites: number;
  };
  revenueRaw: number;
}

interface MonthlyRevenue {
  date: string; // Formato: "YYYY-MM"
  revenue: number;
}

interface AnalyticsResponse {
  totalEarnings: number;
  averageRating: number;
  conversionRate: number;
  monthlyRevenue: MonthlyRevenue[];
  experiences: Experience[];
}

export default function RendimientoPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  useEffect(() => {
    const loadPerformanceData = async () => {
      try {
        setLoading(true);
        
        // Construir parámetros de query
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        
        // Cargar analíticas desde el endpoint
        const analyticsResponse = await api.get<AnalyticsResponse>("/experiences/analytics", { params });
        
        if (analyticsResponse.data) {
          setData(analyticsResponse.data);
        }
      } catch (error: any) {
        console.error("Error al cargar datos de rendimiento:", error);
        toast.error(error?.response?.data?.message || "Error al cargar las analíticas");
      } finally {
        setLoading(false);
      }
    };

    loadPerformanceData();
  }, [startDate, endDate]);

  const formatCurrency = (value: number, currency: string = "COP") => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency === "COP" ? "COP" : currency === "EUR" ? "EUR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleExportData = () => {
    if (!data) return;
    
    // Crear CSV con los datos
    const csvContent = [
      ["Métrica", "Valor"],
      ["Total Earnings", formatCurrency(data.totalEarnings)],
      ["Average Rating", data.averageRating.toFixed(2)],
      ["Conversion Rate", `${data.conversionRate.toFixed(1)}%`],
      ["", ""],
      ["Mes", "Revenue"],
      ...data.monthlyRevenue.map(m => [m.date, formatCurrency(m.revenue)]),
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Datos exportados exitosamente");
  };

  const handleDateRangeChange = () => {
    // Calcular fechas para los últimos 30 días
    const end = new Date();
    const start = subDays(end, 30);
    setStartDate(format(start, "yyyy-MM-dd"));
    setEndDate(format(end, "yyyy-MM-dd"));
    setDateRange("Last 30 Days");
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="h-10 w-48 bg-zinc-200 rounded-lg animate-pulse"></div>
              <div className="h-4 w-64 bg-zinc-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-32 bg-zinc-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-32 bg-zinc-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* KPI Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="size-12 bg-zinc-200 rounded-lg animate-pulse"></div>
                  <div className="h-6 w-16 bg-zinc-200 rounded animate-pulse"></div>
                </div>
                <div className="h-3 w-32 bg-zinc-200 rounded mb-2 animate-pulse"></div>
                <div className="h-10 w-40 bg-zinc-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <div className="h-6 w-48 bg-zinc-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-64 bg-zinc-200 rounded animate-pulse"></div>
            </div>
            <div className="h-64 bg-zinc-50 rounded-lg animate-pulse"></div>
          </div>

          {/* Bottom Sections Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <div className="h-6 w-48 bg-zinc-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-56 bg-zinc-200 rounded mb-6 animate-pulse"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-16 bg-zinc-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
        <p className="text-zinc-500">No hay datos disponibles</p>
      </div>
    );
  }

  // Calcular cambio porcentual comparando meses
  const calculateChange = () => {
    if (data.monthlyRevenue.length < 2) {
      return { earningsChange: 0, conversionChange: 0 };
    }
    
    const currentMonth = data.monthlyRevenue[data.monthlyRevenue.length - 1];
    const previousMonth = data.monthlyRevenue[data.monthlyRevenue.length - 2];
    
    const earningsChange = previousMonth.revenue > 0
      ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
      : 0;
    
    // Conversion change simulado por ahora (podría venir del backend)
    const conversionChange = 3.1;
    
    return { earningsChange, conversionChange };
  };

  const { earningsChange, conversionChange } = calculateChange();

  // Preparar datos mensuales para el gráfico de Recharts
  const prepareChartData = () => {
    if (!data.monthlyRevenue || data.monthlyRevenue.length === 0) {
      return [];
    }

    // Ordenar por fecha
    const sortedRevenue = [...data.monthlyRevenue].sort((a, b) => a.date.localeCompare(b.date));
    
    // Convertir formato "YYYY-MM" a formato de fecha legible y agregar mes anterior simulado
    return sortedRevenue.map((item) => {
      const [year, month] = item.date.split("-").map(Number);
      const date = new Date(year, month - 1, 1);
      return {
        month: format(date, "MMM yyyy", { locale: es }).toUpperCase(),
        "Current Month": item.revenue,
        "Previous Month": item.revenue * 0.7, // Simular mes anterior con 70% del revenue actual
      };
    });
  };

  const chartData = prepareChartData();

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-caveat font-bold text-zinc-900 mb-2">
              Your Impact
            </h1>
            <p className="text-zinc-500">
              Comprehensive analytics for your creative business.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDateRangeChange}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <Calendar className="size-4" />
              {dateRange}
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              <Download className="size-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Earnings */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Wallet className="size-6 text-indigo-600" />
              </div>
              <span className={cn(
                "text-sm font-semibold px-2 py-1 rounded",
                earningsChange > 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
              )}>
                {earningsChange > 0 ? "+" : ""}{earningsChange.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              TOTAL EARNINGS
            </p>
            <p className="text-3xl font-bold text-zinc-900">
              {formatCurrency(data.totalEarnings)}
            </p>
          </div>

          {/* Average Rating */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="size-6 text-yellow-600 fill-yellow-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded text-zinc-500 bg-zinc-100">
                Steady
              </span>
            </div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              AVG. RATING
            </p>
            <p className="text-3xl font-bold text-zinc-900">
              {data.averageRating.toFixed(2)}
            </p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="size-6 text-purple-600" />
              </div>
              <span className={cn(
                "text-sm font-semibold px-2 py-1 rounded",
                conversionChange > 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
              )}>
                {conversionChange > 0 ? "+" : ""}{conversionChange.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              CONVERSION RATE
            </p>
            <p className="text-3xl font-bold text-zinc-900">
              {data.conversionRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Monthly Revenue</h3>
            <p className="text-sm text-zinc-500">Daily revenue streams aggregated monthly</p>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-indigo-600"></div>
              <span className="text-sm text-zinc-600">Current Month</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-zinc-300"></div>
              <span className="text-sm text-zinc-600">Previous Month</span>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#71717A"
                  style={{ fontSize: '11px', fontWeight: 500 }}
                  tick={{ fill: '#71717A' }}
                />
                <YAxis 
                  stroke="#71717A"
                  style={{ fontSize: '11px', fontWeight: 500 }}
                  tick={{ fill: '#71717A' }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                    return `$${value}`;
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E4E4E7',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  formatter={(value: any) => {
                    if (typeof value !== 'number') return '';
                    return formatCurrency(value, "COP");
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="Previous Month" 
                  stroke="#D4D4D8" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ fill: '#D4D4D8', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Current Month" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-zinc-500">
              <p>No hay datos de revenue disponibles</p>
            </div>
          )}
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Experience Performance */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Experience Performance</h3>
            <p className="text-sm text-zinc-500 mb-6">Bookings by destination category</p>
            <div className="space-y-4">
              {data.experiences.slice(0, 5).map((exp) => (
                <div key={exp.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900">{exp.title}</p>
                    <p className="text-xs text-zinc-500">{exp.stats.totalBookings} reservas</p>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">
                    {formatCurrency(exp.revenueRaw || 0, exp.currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Engagement */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Recent Engagement</h3>
            <p className="text-sm text-primary mb-6">Active Threads</p>
            <div className="text-center py-12">
              <p className="text-zinc-500 text-sm">
                No hay actividad reciente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
