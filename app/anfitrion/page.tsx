"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Plus, Heart, TrendingUp, Users, DollarSign, Star, Calendar, MapPin, Loader2, ArrowRight, Eye } from "lucide-react";
import CreateExperienceModal from "@/components/anfitrion/CreateExperienceModal";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DashboardData {
  stats: {
    totalEarnings: number;
    averageRating: number;
    conversionRate: number;
    totalBookings: number;
    totalExperiences: number;
    totalViews: number;
  };
  monthlyRevenue: Array<{
    date: string;
    revenue: number;
  }>;
  recentBookings: Array<{
    idBooking: string;
    experience: {
      title: string;
    };
    customer: {
      name: string;
      email: string;
    };
    totalBuy: number;
    currency: string;
    dateBuy: string;
    status: string;
  }>;
  topExperiences: Array<{
    id: string;
    title: string;
    coverImage: string | null;
    stats: {
      totalBookings: number;
      totalReviews: number;
      averageRating: number | null;
      revenueRaw: number;
    };
    price: number;
    currency: string;
  }>;
}

interface Experience {
  idTrip: string;
  title: string;
  city?: {
    name: string;
  };
  category?: string;
  price: number | null;
  currency: string | null;
  coverImage: string | null;
  averageRating?: number;
  totalReviews?: number;
}

export default function AnfitrionPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<{ user: { name: string } } | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Evitar hidration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadData = async () => {
      try {
        setLoading(true);

        // Cargar datos del usuario
        try {
          const userResponse = await api.get("/auth/me");
          if (userResponse?.data) {
            setUserData(userResponse.data);
          }
        } catch (error: any) {
          console.error("Error al cargar datos del usuario:", error);
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            router.push("/auth/login");
            return;
          }
        }

        // Cargar datos del dashboard
        try {
          const dashboardResponse = await api.get<any>("/hosts/dashboard");
          if (dashboardResponse?.data) {
            const data = dashboardResponse.data;
            console.log("📊 Datos recibidos del dashboard:", data);
            
            const summary = data.summary || {};
            const topExperiencesData = data.topExperiences?.byRevenue || data.topExperiences?.byFavorites || [];
            const recentBookingsData = data.recentBookings || [];
            
            // Mapear los datos a la estructura esperada
            // Los datos vienen en data.summary según la estructura del backend
            const mappedData = {
              stats: {
                totalEarnings: summary.totalEarnings !== undefined ? summary.totalEarnings : (data.totalEarnings !== undefined ? data.totalEarnings : 0),
                averageRating: summary.averageRating !== undefined ? summary.averageRating : (data.averageRating !== undefined ? data.averageRating : 0),
                conversionRate: summary.conversionRate !== undefined ? summary.conversionRate : (data.conversionRate !== undefined ? data.conversionRate : 0),
                totalBookings: summary.totalBookings !== undefined ? summary.totalBookings : (data.totalBookings !== undefined ? data.totalBookings : 0),
                totalExperiences: summary.totalExperiences !== undefined ? summary.totalExperiences : (data.totalExperiences !== undefined ? data.totalExperiences : 0),
                totalViews: summary.totalFavorites !== undefined ? summary.totalFavorites : (data.totalFavorites !== undefined ? data.totalFavorites : 0),
              },
              monthlyRevenue: data.monthlyRevenue || [],
              recentBookings: recentBookingsData.map((booking: any) => ({
                idBooking: booking.idBooking || booking.id,
                experience: {
                  title: booking.tripTitle || booking.experience?.title || "Experiencia",
                },
                customer: {
                  name: booking.customer?.name || "Cliente",
                  email: booking.customer?.email || "",
                },
                totalBuy: booking.totalBuy || booking.total || 0,
                currency: booking.currency || "COP",
                dateBuy: booking.dateBuy || booking.createdAt || new Date().toISOString(),
                status: booking.status || "PENDING",
              })),
              topExperiences: topExperiencesData.slice(0, 3).map((exp: any) => ({
                id: exp.idTrip || exp.id,
                title: exp.title,
                coverImage: exp.coverImage || null,
                stats: {
                  totalBookings: exp.stats?.totalBookings || exp.totalBookings || 0,
                  totalReviews: exp.stats?.totalReviews || exp.totalReviews || 0,
                  averageRating: exp.stats?.averageRating ?? exp.averageRating ?? null,
                  revenueRaw: exp.stats?.revenueRaw || exp.revenue || 0,
                },
                price: exp.price || 0,
                currency: exp.currency || "COP",
              })),
            };
            
            console.log("✅ Datos mapeados:", mappedData);
            setDashboardData(mappedData);
          }
        } catch (error: any) {
          console.error("Error al cargar dashboard:", error);
          // Si el endpoint no existe aún, usar datos de analytics como fallback
          try {
            const analyticsResponse = await api.get("/experiences/analytics");
            if (analyticsResponse?.data) {
              const analytics = analyticsResponse.data;
              const summary = analytics.summary || {};
              setDashboardData({
                stats: {
                  totalEarnings: summary.totalEarnings || analytics.totalEarnings || 0,
                  averageRating: summary.averageRating || analytics.averageRating || 0,
                  conversionRate: summary.conversionRate || analytics.conversionRate || 0,
                  totalBookings: summary.totalBookings || analytics.totalBookings || 0,
                  totalExperiences: summary.totalExperiences || analytics.totalExperiences || 0,
                  totalViews: summary.totalFavorites || analytics.totalFavorites || 0,
                },
                monthlyRevenue: analytics.monthlyRevenue || [],
                recentBookings: (analytics.recentBookings || []).map((booking: any) => ({
                  idBooking: booking.idBooking || booking.id,
                  experience: {
                    title: booking.tripTitle || booking.experience?.title || "Experiencia",
                  },
                  customer: {
                    name: booking.customer?.name || "Cliente",
                    email: booking.customer?.email || "",
                  },
                  totalBuy: booking.totalBuy || booking.total || 0,
                  currency: booking.currency || "COP",
                  dateBuy: booking.dateBuy || booking.createdAt || new Date().toISOString(),
                  status: booking.status || "PENDING",
                })),
                topExperiences: (analytics.topExperiences?.byRevenue || analytics.experiences || []).slice(0, 3).map((exp: any) => ({
                  id: exp.idTrip || exp.id,
                  title: exp.title,
                  coverImage: exp.coverImage || null,
                  stats: {
                    totalBookings: exp.stats?.totalBookings || exp.totalBookings || 0,
                    totalReviews: exp.stats?.totalReviews || exp.totalReviews || 0,
                    averageRating: exp.stats?.averageRating || exp.averageRating || null,
                    revenueRaw: exp.stats?.revenueRaw || exp.revenue || 0,
                  },
                  price: exp.price || 0,
                  currency: exp.currency || "COP",
                })),
              });
            }
          } catch (fallbackError) {
            console.error("Error al cargar datos de fallback:", fallbackError);
          }
        }
      } catch (error: any) {
        console.error("Error inesperado:", error);
        if (!error?.response || (error.response.status !== 401 && error.response.status !== 403)) {
          toast.error("Error al cargar el dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const formatCurrency = (value: number | null, currency: string | null = "COP") => {
    if (!value) return "$0";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency === "COP" ? "COP" : currency === "EUR" ? "EUR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMM, yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  const userName = userData?.user?.name?.split(" ")?.[0] || "Usuario";

  const handleExperienceCreated = () => {
    // Recargar datos del dashboard
    window.location.reload();
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="h-12 w-64 bg-zinc-200 rounded-lg animate-pulse"></div>
              <div className="h-4 w-96 bg-zinc-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-40 bg-zinc-200 rounded-full animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 bg-zinc-200 rounded-lg"></div>
                  <div className="h-6 w-16 bg-zinc-200 rounded"></div>
                </div>
                <div className="h-4 w-24 bg-zinc-200 rounded mb-2"></div>
                <div className="h-8 w-32 bg-zinc-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-6 w-48 bg-zinc-200 rounded mb-4"></div>
            <div className="h-64 bg-zinc-100 rounded-lg"></div>
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-6 w-40 bg-zinc-200 rounded mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-20 bg-zinc-100 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalEarnings: 0,
    averageRating: 0,
    conversionRate: 0,
    totalBookings: 0,
    totalExperiences: 0,
    totalViews: 0,
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-caveat font-bold mb-2">
                Bienvenido de vuelta, {userName}
              </h1>
              <p className="text-zinc-500 text-sm">
                Resumen de tu negocio hoy
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-zinc-800 text-white px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <Plus className="size-4" />
              Crear Experiencia
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Earnings */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <DollarSign className="size-6 text-indigo-600" />
                </div>
                <TrendingUp className="size-5 text-emerald-600" />
              </div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Ingresos Totales
              </p>
              <p className="text-2xl font-bold text-zinc-900">
                {formatCurrency(stats.totalEarnings)}
              </p>
            </div>

            {/* Total Bookings */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Users className="size-6 text-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  {stats.totalBookings}
                </span>
              </div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Reservas Totales
              </p>
              <p className="text-2xl font-bold text-zinc-900">
                {stats.totalBookings}
              </p>
            </div>

            {/* Average Rating */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="size-6 text-yellow-600 fill-yellow-600" />
                </div>
              </div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Calificación Promedio
              </p>
              <p className="text-2xl font-bold text-zinc-900">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
              </p>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="size-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Tasa de Conversión
              </p>
              <p className="text-2xl font-bold text-zinc-900">
                {stats.conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Chart Section */}
          {dashboardData?.monthlyRevenue && dashboardData.monthlyRevenue.length > 0 && (() => {
            // Preparar datos para el gráfico
            const sortedRevenue = [...dashboardData.monthlyRevenue].sort((a, b) => a.date.localeCompare(b.date));
            const maxRevenue = Math.max(...sortedRevenue.map(d => d.revenue), 1);
            
            const chartData = sortedRevenue.map((item) => {
              const [year, month] = item.date.split("-").map(Number);
              const date = new Date(year, month - 1, 1);
              return {
                date: format(date, "MMM yyyy", { locale: es }).toUpperCase(),
                revenue: item.revenue,
                height: maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0,
              };
            });

            return (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
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
                <div className="h-64 relative">
                  <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        y1={y * 2}
                        x2="1000"
                        y2={y * 2}
                        stroke="#e4e4e7"
                        strokeWidth="1"
                        strokeDasharray="4"
                      />
                    ))}
                    
                    {/* Previous Month Line (dotted gray) */}
                    {chartData.length > 1 && (
                      <polyline
                        points={chartData.map((item, index) => {
                          const divisor = chartData.length - 1;
                          const x = divisor > 0 ? (index / divisor) * 1000 : 500;
                          // Mes anterior con 70% del revenue actual
                          const prevRevenue = item.revenue * 0.7;
                          const prevHeight = maxRevenue > 0 ? (prevRevenue / maxRevenue) * 100 : 0;
                          const y = 200 - (prevHeight / 100) * 200;
                          return `${x},${y}`;
                        }).join(" ")}
                        fill="none"
                        stroke="#d4d4d8"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    )}
                    
                    {/* Current Month Line (solid purple) */}
                    {chartData.length > 0 && (
                      <polyline
                        points={chartData.map((item, index) => {
                          const divisor = chartData.length - 1;
                          const x = divisor > 0 ? (index / divisor) * 1000 : 500;
                          const y = 200 - (item.height / 100) * 200;
                          return `${x},${y}`;
                        }).join(" ")}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3"
                      />
                    )}
                    
                    {/* Data points for current month */}
                    {chartData.map((item, index) => {
                      const divisor = chartData.length - 1;
                      const x = divisor > 0 ? (index / divisor) * 1000 : 500;
                      const y = 200 - (item.height / 100) * 200;
                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#6366f1"
                        />
                      );
                    })}
                  </svg>
                  
                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
                    {chartData.map((item, index) => (
                      <span key={index} className="text-[10px] font-bold text-zinc-400 uppercase">
                        {item.date}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Experiences */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-zinc-900">Experiencias Destacadas</h3>
                <Link
                  href="/anfitrion/experiencias"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Ver todas
                  <ArrowRight className="size-4" />
                </Link>
              </div>
              {dashboardData?.topExperiences && dashboardData.topExperiences.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.topExperiences.map((exp) => (
                    <div key={exp.id} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                      <div
                        className="size-16 rounded-lg bg-cover bg-center shrink-0 border border-zinc-200"
                        style={{
                          backgroundImage: exp.coverImage ? `url(${exp.coverImage})` : undefined,
                          backgroundColor: exp.coverImage ? undefined : "#f4f4f5",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-zinc-900 truncate">{exp.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                          <span>{exp.stats.totalBookings} reservas</span>
                          {exp.stats.averageRating && (
                            <span className="flex items-center gap-1">
                              <Star className="size-3 fill-yellow-400 text-yellow-400" />
                              {exp.stats.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-zinc-900">
                          {formatCurrency(exp.stats.revenueRaw, exp.currency)}
                        </p>
                        <p className="text-xs text-zinc-500">Ingresos</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-zinc-500 text-sm">No hay experiencias destacadas aún</p>
                </div>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-zinc-900">Reservas Recientes</h3>
                <Link
                  href="/anfitrion/pagos"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Ver todas
                  <ArrowRight className="size-4" />
                </Link>
              </div>
              {dashboardData?.recentBookings && dashboardData.recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentBookings.slice(0, 5).map((booking) => (
                    <div key={booking.idBooking} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-zinc-900 truncate">
                          {booking.experience?.title || "Experiencia"}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                          <span>{booking.customer?.name || "Cliente"}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {formatDate(booking.dateBuy)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-zinc-900">
                          {formatCurrency(booking.totalBuy, booking.currency)}
                        </p>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          booking.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" :
                          booking.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                          "bg-zinc-100 text-zinc-700"
                        )}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-zinc-500 text-sm">No hay reservas recientes</p>
                  <Link
                    href="/anfitrion/experiencias"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    Crear tu primera experiencia
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-linear-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-1">Acciones Rápidas</h3>
                <p className="text-sm text-zinc-600">Gestiona tu negocio desde aquí</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/anfitrion/experiencias"
                  className="px-4 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-indigo-50 transition-colors flex items-center gap-2"
                >
                  <Eye className="size-4" />
                  Ver Experiencias
                </Link>
                <Link
                  href="/anfitrion/rendimiento"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="size-4" />
                  Ver Analíticas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateExperienceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleExperienceCreated}
      />
    </>
  );
}
