"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarRange,
  Plus,
  Sparkles,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
  Eye,
  ChevronDown,
} from "lucide-react";
import { AgentHeader } from "@/components/agent/AgentHeader";
import NewTripModal from "@/components/agent/NewTripModal";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es as dateFnsEs } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
} from "recharts";

interface UserData {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
  agencies?: Array<{
    agency?: {
      nameAgency?: string;
      picture?: string;
      email?: string;
    };
  }>;
}

interface DashboardData {
  agency: {
    idAgency: string;
    nameAgency: string;
    email: string;
    phone?: string;
    nit?: string;
    rntNumber?: string;
    picture?: string;
    status: string;
    approvalStatus: string;
    createdAt: string;
    updatedAt: string;
  };
  metrics: {
    totalTrips: number;
    activeTrips: number;
    totalExpeditions: number;
    upcomingExpeditions: number;
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    totalRevenue: number;
    currency: string;
    totalMembers: number;
    activeMembers: number;
  };
  recentActivity: {
    recentBookings: Array<{
      idBooking: string;
      status: string;
      totalBuy: number;
      currency: string;
      dateBuy: string;
      tripTitle: string;
      ownerName: string;
      ownerEmail: string;
    }>;
    upcomingExpeditions: Array<{
      idExpedition: string;
      tripTitle: string;
      startDate: string;
      endDate: string;
      capacityTotal: number;
      capacityAvailable: number;
      occupancyPercentage: number;
    }>;
  };
  quickStats: {
    bookingsThisMonth: number;
    revenueThisMonth: number;
    bookingsLastMonth: number;
    revenueLastMonth: number;
    monthOverMonthChange: number;
  };
}

interface InsightsData {
  stats: {
    avgBookingValue: {
      value: number;
      currency: string;
      change: number;
    };
    customerLTV: {
      value: number;
      currency: string;
      change: number;
    };
    conversionRate: {
      value: number;
      change: number;
      status: string;
    };
  };
  revenueGrowth: {
    currentYear: Array<{ month: string; revenue: number | string; currency: string }>;
  };
}

interface Expedition {
  id: string;
  title: string;
  location: string;
  image: string;
  status: string;
  occupancy: {
    current: number;
    total: number;
    percentage: number;
  };
  startDate?: string;
  endDate?: string;
}

interface Booking {
  id: string;
  expedition: string;
  departure: string;
  traveler: {
    name: string;
    email: string;
    avatar: string;
  };
  total: string;
  status: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: string;
  joinedDate?: string;
}

function Page() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [dateRange, setDateRange] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Crear strings estables para las dependencias
  const startDateStr = selectedDateRange?.from ? format(selectedDateRange.from, "yyyy-MM-dd") : null;
  const endDateStr = selectedDateRange?.to ? format(selectedDateRange.to, "yyyy-MM-dd") : null;

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Cargar datos del usuario
        const userResponse = await api.get<UserData>("/auth/me");
        setUserData(userResponse.data);

        // Cargar datos del dashboard principal
        try {
          const dashboardResponse = await api.get<DashboardData>("/agencies/dashboard");
          const data = dashboardResponse.data;
          console.log("📊 Datos del dashboard:", data);
          
          setDashboardData(data);

          // Mapear expediciones próximas
          const mappedExpeditions: Expedition[] = (data.recentActivity?.upcomingExpeditions || []).slice(0, 5).map((exp) => {
            const startDate = new Date(exp.startDate);
            const endDate = new Date(exp.endDate);
            
            return {
              id: exp.idExpedition,
              title: exp.tripTitle,
              location: `${format(startDate, "d MMM", { locale: dateFnsEs })} - ${format(endDate, "d MMM yyyy", { locale: dateFnsEs })}`,
              image: "", // No usar imágenes externas
              status: exp.occupancyPercentage >= 100 ? "FULL" : exp.occupancyPercentage >= 80 ? "ACTIVE" : "ACTIVE",
              occupancy: {
                current: exp.capacityTotal - exp.capacityAvailable,
                total: exp.capacityTotal,
                percentage: exp.occupancyPercentage,
              },
              startDate: exp.startDate,
              endDate: exp.endDate,
            };
          });
          console.log("🗺️ Expediciones mapeadas:", mappedExpeditions);
          setExpeditions(mappedExpeditions);

          // Mapear reservas recientes
          const mappedBookings: Booking[] = (data.recentActivity?.recentBookings || []).slice(0, 5).map((booking) => ({
            id: booking.idBooking,
            expedition: booking.tripTitle,
            departure: format(new Date(booking.dateBuy), "d MMM, yyyy", { locale: dateFnsEs }),
            traveler: {
              name: booking.ownerName,
              email: booking.ownerEmail,
              avatar: "", // No usar avatares externos
            },
            total: formatCurrency(booking.totalBuy, booking.currency),
            status: booking.status.toLowerCase(),
          }));
          console.log("📋 Reservas mapeadas:", mappedBookings);
          setRecentBookings(mappedBookings);

        } catch (error: any) {
          console.error("Error al cargar dashboard:", error);
          if (error?.response?.status === 404) {
            toast.error("No se encontró ninguna agencia asociada");
          } else if (error?.response?.status === 403) {
            toast.error("No tienes permiso para acceder al dashboard");
          } else {
            toast.error("Error al cargar el dashboard");
          }
        }

        // Cargar insights (para gráficas y métricas avanzadas)
        try {
          const params: any = {};
          
          // Si hay un rango de fechas seleccionado, agregarlo a los parámetros
          if (startDateStr && endDateStr) {
            params.startDate = startDateStr;
            params.endDate = endDateStr;
          }
          
          const insightsResponse = await api.get<InsightsData>("/agencies/insights", { params });
          setInsightsData(insightsResponse.data);
          
          // Formatear rango de fechas para mostrar
          if (selectedDateRange?.from && selectedDateRange?.to) {
            setDateRange(
              `${format(selectedDateRange.from, "d MMM", { locale: dateFnsEs })} — ${format(selectedDateRange.to, "d MMM, yyyy", { locale: dateFnsEs })}`
            );
          } else if (insightsResponse.data.revenueGrowth?.currentYear?.length > 0) {
            const months = insightsResponse.data.revenueGrowth.currentYear.map(m => m.month);
            if (months.length > 0) {
              setDateRange(`${months[0]} — ${months[months.length - 1]}`);
            }
          }
        } catch (error) {
          console.error("Error al cargar insights:", error);
          // No es crítico, continuar sin insights
        }

        // Cargar miembros del equipo (si el endpoint existe)
        try {
          const membersResponse = await api.get<any>("/agencies/members");
          const members = membersResponse.data?.members || [];
          // Limitar a los primeros 10 miembros para el dashboard
          const limitedMembers = members.slice(0, 10);
          const mappedMembers: TeamMember[] = limitedMembers.map((member: any) => ({
            id: member.id || member.user?.id,
            name: member.user?.name || "Sin nombre",
            email: member.user?.email || "",
            avatar: member.user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user?.name || "U")}&background=random`,
            role: member.role === "admin" ? "Administrador" : member.role === "organizer" ? "Organizador" : "Jipper",
            status: member.isActive ? "Activo" : "Pendiente",
            joinedDate: member.createdAt,
          }));
          setTeamMembers(mappedMembers);
        } catch (error: any) {
          console.error("Error al cargar miembros del equipo:", error);
          // Si hay error, simplemente dejar el array vacío
          setTeamMembers([]);
        }
      } catch (error: any) {
        console.error("Error al cargar datos del dashboard:", error);
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
          toast.error("Error al cargar el dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [startDateStr, endDateStr]);

  // Función para manejar el cambio de rango de fechas
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setSelectedDateRange(range);
    setIsDatePickerOpen(false);
    // Los datos se recargarán automáticamente por el useEffect
  };

  // Formatear el rango de fechas para mostrar
  const formatDateRangeDisplay = () => {
    if (selectedDateRange?.from && selectedDateRange?.to) {
      return `${format(selectedDateRange.from, "d MMM", { locale: dateFnsEs })} — ${format(selectedDateRange.to, "d MMM, yyyy", { locale: dateFnsEs })}`;
    }
    return dateRange || "Últimos 6 meses";
  };

  const formatCurrency = (value: number, currency: string = "USD") => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency === "COP" ? "COP" : currency === "EUR" ? "EUR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
    const statusUpper = status.toUpperCase();
    if (statusUpper === "ACTIVO" || statusUpper === "PUBLISHED" || statusUpper === "ACTIVE") {
      return "text-emerald-600";
    }
    if (statusUpper === "LISTA DE ESPERA" || statusUpper === "WAITING_LIST") {
      return "text-amber-600";
    }
    if (statusUpper === "LLENO" || statusUpper === "FULL") {
      return "text-orange-600";
    }
    return "text-indigo-600";
  };

  const getStatusLabel = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "PUBLISHED" || statusUpper === "ACTIVE") return "ACTIVO";
    if (statusUpper === "LISTA DE ESPERA" || statusUpper === "WAITING_LIST") return "LISTA DE ESPERA";
    if (statusUpper === "LLENO" || statusUpper === "FULL") return "LLENO";
    return status;
  };

  // Preparar datos para mini gráfica
  const prepareMiniChartData = () => {
    if (!insightsData?.revenueGrowth?.currentYear || insightsData.revenueGrowth.currentYear.length === 0) {
      console.log("No hay datos de revenueGrowth.currentYear");
      return [];
    }
    
    console.log("Datos de revenueGrowth:", insightsData.revenueGrowth.currentYear);
    console.log("Rango de fechas seleccionado:", selectedDateRange);
    
    // Mapear nombres de meses en español
    const monthMap: Record<string, string> = {
      "Jan": "Ene", "January": "Ene",
      "Feb": "Feb", "February": "Feb",
      "Mar": "Mar", "March": "Mar",
      "Apr": "Abr", "April": "Abr",
      "May": "May",
      "Jun": "Jun", "June": "Jun",
      "Jul": "Jul", "July": "Jul",
      "Aug": "Ago", "August": "Ago",
      "Sep": "Sep", "September": "Sep",
      "Oct": "Oct", "October": "Oct",
      "Nov": "Nov", "November": "Nov",
      "Dec": "Dic", "December": "Dic",
      "Ene": "Ene", "Abr": "Abr", "Ago": "Ago", "Dic": "Dic"
    };
    
    // Mapeo inverso para convertir mes español/inglés a número de mes (1-12)
    const monthToNumber: Record<string, number> = {
      "Ene": 1, "Jan": 1,
      "Feb": 2,
      "Mar": 3,
      "Abr": 4, "Apr": 4,
      "May": 5,
      "Jun": 6,
      "Jul": 7,
      "Ago": 8, "Aug": 8,
      "Sep": 9,
      "Oct": 10,
      "Nov": 11,
      "Dic": 12, "Dec": 12
    };
    
    // Obtener todos los meses con datos válidos
    let allData = insightsData.revenueGrowth.currentYear
      .map((item, index) => {
        // Intentar extraer el mes de diferentes formatos
        let monthKey = "";
        if (item.month) {
          const monthStr = item.month.substring(0, 3);
          monthKey = monthMap[monthStr] || monthMap[item.month] || item.month.substring(0, 3);
        } else {
          monthKey = `Mes ${index + 1}`;
        }
        
        // Convertir revenue a número de forma segura
        let revenue = 0;
        if (typeof item.revenue === 'number') {
          revenue = item.revenue;
        } else if (typeof item.revenue === 'string') {
          // Remover cualquier carácter no numérico excepto punto y guión
          const cleaned = String(item.revenue).replace(/[^0-9.-]/g, '');
          revenue = parseFloat(cleaned) || 0;
        } else if (item.revenue != null) {
          // Intentar convertir cualquier otro tipo
          revenue = Number(item.revenue) || 0;
        }
        
        return {
          month: monthKey,
          monthNumber: monthToNumber[monthKey] || index + 1,
          revenue: Math.max(0, revenue), // Asegurar que no sea negativo
        };
      });
    
    // Si hay un rango de fechas seleccionado, filtrar los datos
    if (selectedDateRange?.from && selectedDateRange?.to) {
      const startMonth = selectedDateRange.from.getMonth() + 1; // getMonth() devuelve 0-11
      const endMonth = selectedDateRange.to.getMonth() + 1;
      const startYear = selectedDateRange.from.getFullYear();
      const endYear = selectedDateRange.to.getFullYear();
      
      console.log(`Filtrando datos: mes ${startMonth} del ${startYear} a mes ${endMonth} del ${endYear}`);
      
      // Filtrar datos que estén dentro del rango seleccionado
      allData = allData.filter(item => {
        // Asumimos que los datos son del año actual o del año del rango seleccionado
        // Si el mes está entre startMonth y endMonth (considerando el mismo año)
        if (startYear === endYear) {
          return item.monthNumber >= startMonth && item.monthNumber <= endMonth;
        } else {
          // Si el rango cruza años, incluir meses del año de inicio >= startMonth y del año final <= endMonth
          return true; // Por ahora, mostrar todos si cruza años
        }
      });
      
      console.log("Datos filtrados por rango de fechas:", allData);
    }
    
    console.log("Datos procesados para gráfica:", allData);
    
    // Si no hay datos, devolver array vacío
    if (allData.length === 0) {
      console.log("No hay datos válidos para mostrar");
      return [];
    }
    
    // Si hay un rango seleccionado, mostrar todos los datos filtrados
    // Si no, tomar los últimos 6 meses
    const result = selectedDateRange?.from && selectedDateRange?.to 
      ? allData 
      : allData.slice(-6);
    
    console.log("Resultado final para gráfica:", result);
    
    // Verificar que hay al menos algunos datos
    const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);
    console.log("Total de ingresos:", totalRevenue);
    
    return result;
  };

  const chartData = prepareMiniChartData();
  const displayName = dashboardData?.agency?.nameAgency || userData?.agencies?.[0]?.agency?.nameAgency || userData?.user?.name || "Agente";

  // Componente Skeleton para las métricas
  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="size-12 rounded-xl bg-zinc-200"></div>
            <div className="h-5 w-16 bg-zinc-200 rounded-full"></div>
          </div>
          <div className="h-3 w-32 bg-zinc-200 rounded mb-2"></div>
          <div className="h-8 w-40 bg-zinc-200 rounded mb-3"></div>
          <div className="h-2 w-24 bg-zinc-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  // Componente Skeleton para expediciones
  const ExpeditionsSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 bg-white border border-zinc-200 rounded-xl animate-pulse">
          <div className="flex gap-4">
            <div className="size-20 rounded-xl bg-zinc-200"></div>
            <div className="flex-1">
              <div className="h-4 w-3/4 bg-zinc-200 rounded mb-2"></div>
              <div className="h-3 w-1/2 bg-zinc-200 rounded mb-3"></div>
              <div className="h-2 w-full bg-zinc-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Componente Skeleton para sidebar
  const SidebarSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm animate-pulse">
          <div className="h-4 w-32 bg-zinc-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-3 pb-3 border-b border-zinc-100">
                <div className="size-10 rounded-full bg-zinc-200"></div>
                <div className="flex-1">
                  <div className="h-3 w-24 bg-zinc-200 rounded mb-2"></div>
                  <div className="h-2 w-32 bg-zinc-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="flex flex-col min-h-screen bg-linear-to-br from-zinc-50 via-white to-indigo-50/30">
      <AgentHeader
        showSearch
        searchPlaceholder="Buscar viajes o análisis..."
        showNotifications
        actions={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-linear-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="size-4" />
            Crear Viaje
          </button>
        }
      />

      <div className="p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div>
            <h2 className="font-caveat text-4xl lg:text-5xl font-bold text-zinc-900 mb-1.5">
              ¡Hola, {displayName}! 👋
            </h2>
            <p className="text-zinc-600 text-base lg:text-lg">
              Resumen de tu negocio hoy
            </p>
          </div>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 text-sm font-medium text-zinc-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-zinc-200 shadow-sm hover:bg-white hover:border-zinc-300 transition-colors">
                <CalendarRange className="size-4" />
                <span>{formatDateRangeDisplay()}</span>
                <ChevronDown className="size-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={selectedDateRange?.from || new Date()}
                selected={selectedDateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                className="rounded-md border-0"
              />
              {selectedDateRange?.from && selectedDateRange?.to && (
                <div className="p-3 border-t border-zinc-200 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedDateRange(undefined);
                      setIsDatePickerOpen(false);
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-700"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={() => setIsDatePickerOpen(false)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Aplicar
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <StatsSkeleton />
        ) : dashboardData?.metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Valor Promedio por Reserva */}
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-100/50 to-transparent rounded-bl-full"></div>
              <div className="relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="size-12 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                    <DollarSign className="size-6" />
                  </div>
                  {(dashboardData.quickStats?.monthOverMonthChange !== undefined ? (
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${getChangeColor(dashboardData.quickStats.monthOverMonthChange)}`}>
                      {formatChange(dashboardData.quickStats.monthOverMonthChange)}
                    </span>
                  ) : insightsData?.stats?.avgBookingValue?.change !== undefined && (
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${getChangeColor(insightsData.stats.avgBookingValue.change)}`}>
                      {formatChange(insightsData.stats.avgBookingValue.change)}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Valor Promedio</p>
                <h4 className="text-3xl font-bold tracking-tight group-hover:text-emerald-600 transition-colors">
                  {dashboardData.metrics.totalBookings > 0
                    ? formatCurrency(
                        Math.round(dashboardData.metrics.totalRevenue / dashboardData.metrics.totalBookings),
                        dashboardData.metrics.currency
                      )
                    : formatCurrency(0, dashboardData.metrics.currency)}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-3">Por reserva confirmada</p>
              </div>
            </div>

            {/* Ingresos Totales */}
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-indigo-100/50 to-transparent rounded-bl-full"></div>
              <div className="relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="size-12 rounded-xl bg-linear-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <TrendingUp className="size-6" />
                  </div>
                  {dashboardData.quickStats && dashboardData.quickStats.revenueLastMonth > 0 && (
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${getChangeColor(
                      ((dashboardData.quickStats.revenueThisMonth - dashboardData.quickStats.revenueLastMonth) / dashboardData.quickStats.revenueLastMonth) * 100
                    )}`}>
                      {formatChange(
                        ((dashboardData.quickStats.revenueThisMonth - dashboardData.quickStats.revenueLastMonth) / dashboardData.quickStats.revenueLastMonth) * 100
                      )}
                    </span>
                  )}
                  {dashboardData.quickStats && dashboardData.quickStats.revenueLastMonth === 0 && dashboardData.quickStats.revenueThisMonth > 0 && (
                    <span className="text-[10px] px-2 py-1 rounded-full font-bold bg-emerald-50 text-emerald-600">
                      Nuevo
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Ingresos Totales</p>
                <h4 className="text-3xl font-bold tracking-tight group-hover:text-indigo-600 transition-colors">
                  {formatCurrency(dashboardData.metrics.totalRevenue, dashboardData.metrics.currency)}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-3">
                  {dashboardData.quickStats ? `${formatCurrency(dashboardData.quickStats.revenueThisMonth, dashboardData.metrics.currency)} este mes` : "Total de ingresos"}
                </p>
              </div>
            </div>

            {/* Tasa de Conversión */}
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-100/50 to-transparent rounded-bl-full"></div>
              <div className="relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="size-12 rounded-xl bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg">
                    <Users className="size-6" />
                  </div>
                  {insightsData?.stats?.conversionRate?.change !== undefined && (
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${getChangeColor(insightsData.stats.conversionRate.change)}`}>
                      {formatChange(insightsData.stats.conversionRate.change)}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Tasa de Conversión</p>
                <h4 className="text-3xl font-bold tracking-tight group-hover:text-amber-600 transition-colors">
                  {dashboardData.metrics.totalBookings > 0
                    ? ((dashboardData.metrics.confirmedBookings / dashboardData.metrics.totalBookings) * 100).toFixed(1)
                    : "0.0"}%
                </h4>
                <p className="text-[10px] text-zinc-400 mt-3">
                  {dashboardData.metrics.confirmedBookings} de {dashboardData.metrics.totalBookings} confirmadas
                </p>
              </div>
            </div>
          </div>
        ) : (
          <StatsSkeleton />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expediciones Activas */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-caveat text-2xl font-bold text-zinc-900">
                  Expediciones Próximas
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Próximas salidas programadas</p>
              </div>
              <button 
                onClick={() => router.push("/agent/expeditions")}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Ver todas <ArrowRight className="size-3.5" />
              </button>
            </div>
            
            {loading ? (
              <ExpeditionsSkeleton />
            ) : expeditions.length > 0 ? (
              <div className="space-y-3">
                {expeditions.map((expedition) => {
                  const startDate = expedition.startDate ? new Date(expedition.startDate) : null;
                  const endDate = expedition.endDate ? new Date(expedition.endDate) : null;
                  const daysDiff = startDate && endDate 
                    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  
                  return (
                    <div
                      key={expedition.id}
                      onClick={() => router.push(`/agent/expeditions`)}
                      className="p-5 bg-white border border-zinc-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="size-12 rounded-lg bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
                                <MapPin className="size-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors mb-1">
                                  {expedition.title}
                                </h5>
                                <div className="flex items-center gap-2 text-xs text-zinc-600 mb-2">
                                  <CalendarRange className="size-3.5" />
                                  <span>{expedition.location}</span>
                                  {daysDiff && (
                                    <span className="text-zinc-400">• {daysDiff} {daysDiff === 1 ? "día" : "días"}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                            expedition.status === "FULL" 
                              ? "bg-orange-100 text-orange-700"
                              : expedition.occupancy.percentage >= 80
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-indigo-100 text-indigo-700"
                          }`}>
                            {getStatusLabel(expedition.status)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-100">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Users className="size-3.5 text-zinc-500" />
                              <span className="text-xs font-semibold text-zinc-700">
                                Ocupación
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    expedition.occupancy.percentage >= 100 
                                      ? "bg-orange-500" 
                                      : expedition.occupancy.percentage >= 80 
                                      ? "bg-emerald-500" 
                                      : "bg-indigo-500"
                                  }`}
                                  style={{ width: `${Math.min(expedition.occupancy.percentage, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-bold text-zinc-900 shrink-0 min-w-[70px] text-right">
                                {expedition.occupancy.current}/{expedition.occupancy.total}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-zinc-500 mb-0.5">Ocupación</div>
                            <div className={`text-sm font-bold ${
                              expedition.occupancy.percentage >= 100 
                                ? "text-orange-600" 
                                : expedition.occupancy.percentage >= 80 
                                ? "text-emerald-600" 
                                : "text-indigo-600"
                            }`}>
                              {expedition.occupancy.percentage}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
                <Sparkles className="size-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-sm text-zinc-500 mb-4">No tienes expediciones activas</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Crear tu primera expedición →
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Mini Revenue Chart */}
            {loading ? (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-4 w-32 bg-zinc-200 rounded mb-4"></div>
                <div className="h-[120px] bg-zinc-100 rounded"></div>
              </div>
            ) : chartData.length > 0 && insightsData ? (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-zinc-900 mb-4">Ingresos Recientes</h4>
                {(() => {
                  // Calcular el máximo para establecer el dominio del YAxis
                  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);
                  const minRevenue = Math.min(...chartData.map(d => d.revenue), 0);
                  
                  return (
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart 
                        data={chartData} 
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#71717A' }}
                          interval={0}
                        />
                        <YAxis 
                          hide={false}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 9, fill: '#71717A' }}
                          width={45}
                          domain={[minRevenue * 0.9, maxRevenue * 1.1]}
                          tickFormatter={(value) => {
                            if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                            if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                            return `$${Math.round(value)}`;
                          }}
                        />
                        <Tooltip 
                          formatter={(value: any) => {
                            if (typeof value !== 'number') return '';
                            return formatCurrency(value, insightsData?.revenueGrowth?.currentYear?.[0]?.currency || "USD");
                          }}
                          labelFormatter={(label) => `Mes: ${label}`}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #E4E4E7',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#6366f1" 
                          strokeWidth={2}
                          fill="url(#miniGradient)"
                          dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
                          activeDot={{ r: 5, stroke: '#6366f1', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-zinc-900 mb-4">Ingresos Recientes</h4>
                <div className="h-[120px] flex flex-col items-center justify-center">
                  <DollarSign className="size-8 text-zinc-300 mb-2" />
                  <p className="text-xs text-zinc-400">No hay datos de ingresos disponibles</p>
                </div>
              </div>
            )}

            {/* Reservas Recientes */}
            {loading ? (
              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm animate-pulse">
                <div className="h-4 w-32 bg-zinc-200 rounded mb-5"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-zinc-200"></div>
                        <div className="flex-1">
                          <div className="h-3 w-24 bg-zinc-200 rounded mb-2"></div>
                          <div className="h-2 w-32 bg-zinc-200 rounded"></div>
                        </div>
                      </div>
                      {i < 3 && <div className="h-px bg-zinc-100 mt-3"></div>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-sm font-semibold text-zinc-900">Reservas Recientes</h4>
                  <button 
                    onClick={() => router.push("/agent/bookings")}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Ver todas →
                  </button>
                </div>
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="group cursor-pointer"
                        onClick={() => router.push("/agent/bookings")}
                      >
                        <div className="flex items-center gap-3 py-2">
                          <div className="size-10 rounded-full bg-linear-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                            {booking.traveler.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                                {booking.traveler.name}
                              </p>
                              <span className={`size-2 rounded-full ${
                                booking.status === "confirmed" 
                                  ? "bg-emerald-500" 
                                  : booking.status === "pending"
                                  ? "bg-amber-500"
                                  : "bg-zinc-400"
                              }`}></span>
                            </div>
                            <p className="text-xs text-zinc-500 truncate">
                              {booking.expedition}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-zinc-400">{booking.departure}</span>
                              <span className="text-sm font-bold text-zinc-900">{booking.total}</span>
                            </div>
                          </div>
                        </div>
                        {booking.id !== recentBookings[recentBookings.length - 1].id && (
                          <div className="h-px bg-zinc-100 mt-3"></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="size-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-xs text-zinc-400">No hay reservas recientes</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de creación de viaje */}
      <NewTripModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}

export default Page;
