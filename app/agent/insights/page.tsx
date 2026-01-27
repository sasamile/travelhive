"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Download,
  DollarSign,
  Users,
  MousePointerClick,
  CheckCircle2,
  Circle,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { AgentHeader } from "@/components/agent/AgentHeader";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface InsightsData {
  stats: {
    avgBookingValue: {
      value: number;
      currency: string;
      change: number;
      target: number;
    };
    customerLTV: {
      value: number;
      currency: string;
      change: number;
      retention: number;
    };
    conversionRate: {
      value: number;
      change: number;
      status: "stable" | "up" | "down";
    };
  };
  revenueGrowth: {
    currentYear: Array<{ month: string; revenue: number; currency: string }>;
    lastYear: Array<{ month: string; revenue: number; currency: string }>;
  };
  topDestinations: Array<{
    destination: string;
    bookings: number;
    percentage: number;
  }>;
  optimizationChecklist: Array<{
    id: string;
    type: "completed" | "warning" | "pending";
    title: string;
    description: string;
    actionLabel?: string;
    actionUrl?: string;
  }>;
}

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [dateRange, setDateRange] = useState("Últimos 6 meses");

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        const response = await api.get<InsightsData>("/agencies/insights");
        setInsightsData(response.data);
        
        // Formatear rango de fechas si viene en la respuesta
        if (response.data.revenueGrowth?.currentYear?.length > 0) {
          const months = response.data.revenueGrowth.currentYear.map(m => m.month);
          if (months.length > 0) {
            setDateRange(`${months[0]} — ${months[months.length - 1]}`);
          }
        }
      } catch (error: any) {
        console.error("Error al cargar insights:", error);
        toast.error("Error al cargar los insights");
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  const formatCurrency = (value: number, currency: string = "USD") => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency === "COP" ? "COP" : currency === "EUR" ? "EUR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "bg-emerald-50 text-emerald-600";
    if (change < 0) return "bg-rose-50 text-rose-600";
    return "bg-amber-50 text-amber-600";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "up":
        return "bg-emerald-50 text-emerald-600";
      case "down":
        return "bg-rose-50 text-rose-600";
      default:
        return "bg-amber-50 text-amber-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "up":
        return "Subiendo";
      case "down":
        return "Bajando";
      default:
        return "Estable";
    }
  };

  // Preparar datos para el gráfico de revenue
  const prepareChartData = () => {
    if (!insightsData?.revenueGrowth) return [];
    
    const currentYear = insightsData.revenueGrowth.currentYear || [];
    const lastYear = insightsData.revenueGrowth.lastYear || [];
    
    // Crear un mapa de meses del año actual
    const currentMap = new Map(currentYear.map(item => [item.month, item.revenue]));
    const lastMap = new Map(lastYear.map(item => [item.month, item.revenue]));
    
    // Obtener todos los meses únicos
    const allMonths = Array.from(new Set([
      ...currentYear.map(m => m.month),
      ...lastYear.map(m => m.month)
    ]));
    
    return allMonths.map(month => ({
      month,
      currentYear: currentMap.get(month) || 0,
      lastYear: lastMap.get(month) || 0,
    }));
  };

  const chartData = prepareChartData();
  return (
    <>
      <main className="flex flex-col min-h-screen">
        <AgentHeader
          title="Análisis e Insights de Negocio"
          rightContent={
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
                <Calendar className="size-4" />
                {dateRange}
              </div>
              <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
                <Download className="size-5" />
              </button>
            </div>
          }
        />

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="size-8 animate-spin text-indigo-600" />
                <p className="text-sm text-zinc-500">Cargando insights...</p>
              </div>
            </div>
          ) : !insightsData ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <AlertCircle className="size-8 text-zinc-400" />
                <p className="text-sm text-zinc-500">No se pudieron cargar los insights</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="size-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <DollarSign className="size-5" />
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${getChangeColor(insightsData.stats.avgBookingValue.change)}`}>
                      {formatChange(insightsData.stats.avgBookingValue.change)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Avg. Booking Value</p>
                  <h4 className="text-3xl font-bold tracking-tight mt-1 group-hover:text-indigo-600 transition-colors">
                    {formatCurrency(insightsData.stats.avgBookingValue.value, insightsData.stats.avgBookingValue.currency)}
                  </h4>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600" 
                        style={{ width: `${insightsData.stats.avgBookingValue.target}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-zinc-500">{insightsData.stats.avgBookingValue.target}% target</span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="size-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Users className="size-5" />
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${getChangeColor(insightsData.stats.customerLTV.change)}`}>
                      {formatChange(insightsData.stats.customerLTV.change)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Customer LTV</p>
                  <h4 className="text-3xl font-bold tracking-tight mt-1 group-hover:text-indigo-600 transition-colors">
                    {formatCurrency(insightsData.stats.customerLTV.value, insightsData.stats.customerLTV.currency)}
                  </h4>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600" 
                        style={{ width: `${insightsData.stats.customerLTV.retention}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-zinc-500">{insightsData.stats.customerLTV.retention}% retention</span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="size-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <MousePointerClick className="size-5" />
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${getStatusColor(insightsData.stats.conversionRate.status)}`}>
                      {getStatusLabel(insightsData.stats.conversionRate.status)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Conversion Rate</p>
                  <h4 className="text-3xl font-bold tracking-tight mt-1 group-hover:text-indigo-600 transition-colors">
                    {insightsData.stats.conversionRate.value.toFixed(2)}%
                  </h4>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 w-[42%]"></div>
                    </div>
                    <span className="text-[10px] text-zinc-500">Top 10% Industry</span>
                  </div>
                </div>
              </div>

              {/* Revenue Growth Chart */}
              <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-caveat text-3xl font-bold">Revenue Growth</h3>
                    <p className="text-sm text-zinc-500">Monthly performance across all expeditions.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-indigo-600"></span>
                      <span className="text-xs font-medium text-zinc-500">Current Year</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-zinc-200"></span>
                      <span className="text-xs font-medium text-zinc-500">Last Year</span>
                    </div>
                  </div>
                </div>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCurrentYear" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorLastYear" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E4E4E7" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#E4E4E7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
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
                          return formatCurrency(value, insightsData?.revenueGrowth?.currentYear?.[0]?.currency || "USD");
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="lastYear" 
                        stroke="#E4E4E7" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorLastYear)" 
                        strokeDasharray="4 4"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="currentYear" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorCurrentYear)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-72 flex items-center justify-center text-zinc-400">
                    <p className="text-sm">No hay datos disponibles</p>
                  </div>
                )}
              </div>

              {/* Bottom Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Performing Destinations */}
                <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-caveat text-3xl font-bold">Top Performing Destinations</h3>
                    <span className="text-xs text-zinc-500">By Bookings</span>
                  </div>
                  <div className="space-y-6">
                    {insightsData.topDestinations && insightsData.topDestinations.length > 0 ? (
                      insightsData.topDestinations.map((destination, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span>{destination.destination}</span>
                            <span className="text-indigo-600 font-bold">{destination.bookings} Bookings</span>
                          </div>
                          <div className="h-2 bg-zinc-50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                              style={{ width: `${destination.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-400 text-center py-8">No hay destinos disponibles</p>
                    )}
                  </div>
                </div>

                {/* Optimization Checklist */}
                <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
                  <h3 className="font-caveat text-3xl font-bold mb-6">Optimization Checklist</h3>
                  <div className="space-y-4">
                    {insightsData.optimizationChecklist && insightsData.optimizationChecklist.length > 0 ? (
                      insightsData.optimizationChecklist.map((item) => (
                        <div 
                          key={item.id} 
                          className={`flex gap-4 p-4 rounded-xl border ${
                            item.type === "completed" 
                              ? "border-zinc-50 bg-zinc-50/30" 
                              : "border-zinc-50"
                          }`}
                        >
                          <div className="shrink-0">
                            {item.type === "completed" ? (
                              <CheckCircle2 className="size-5 text-indigo-600 font-bold" />
                            ) : item.type === "warning" ? (
                              <div className="size-5 rounded-full border-2 border-indigo-600/30 flex items-center justify-center">
                                <div className="size-1 bg-indigo-600 rounded-full"></div>
                              </div>
                            ) : (
                              <Circle className="size-5 text-zinc-300" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className={`text-sm font-semibold ${item.type === "pending" ? "text-zinc-500" : ""}`}>
                              {item.title}
                            </h5>
                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{item.description}</p>
                            {item.actionLabel && item.actionUrl && (
                              <a 
                                href={item.actionUrl}
                                className="text-[10px] font-bold text-indigo-600 mt-3 flex items-center gap-1 hover:text-indigo-700 transition-colors"
                              >
                                {item.actionLabel} <ArrowRight className="size-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-400 text-center py-8">No hay items de optimización</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .chart-gradient-indigo {
          fill: url(#indigoGradient);
        }
      `}</style>
    </>
  );
}
