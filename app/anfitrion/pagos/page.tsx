"use client";

import { useState, useEffect, useRef } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileDown,
  Loader2,
  Search,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  idBooking: string;
  idTrip: string;
  expedition: string; // Título de la experiencia
  trip?: {
    idTrip: string;
    title: string;
    type: string;
  } | null;
  traveler?: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  } | null;
  status: string;
  statusRaw?: string;
  dateBuy: string;
  departure?: string;
  totalBuy: number;
  total?: string; // Ya viene formateado
  currency: string;
  totalSeats?: number;
  seats?: string; // Ya viene formateado como "1/20"
  discountCode?: string | null;
  discountAmount?: number;
  referenceBuy?: string;
  transactionId?: string;
  paymentSource?: string;
}

interface BookingsResponse {
  data?: Booking[];
  bookings?: Booking[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function PagosPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isExperienceDropdownOpen, setIsExperienceDropdownOpen] = useState(false);
  const [experiences, setExperiences] = useState<Array<{ id: string; title: string }>>([]);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const experienceDropdownRef = useRef<HTMLDivElement>(null);

  // Cargar experiencias para el filtro
  useEffect(() => {
    const loadExperiences = async () => {
      try {
        const response = await api.get("/experiences", {
          params: { limit: 100, page: 1 },
        });
        const experiencesData = response.data?.data || [];
        setExperiences(
          experiencesData.map((exp: any) => ({
            id: exp.id,
            title: exp.title,
          }))
        );
      } catch (error) {
        console.error("Error al cargar experiencias:", error);
      }
    };
    loadExperiences();
  }, []);

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
      if (
        experienceDropdownRef.current &&
        !experienceDropdownRef.current.contains(event.target as Node)
      ) {
        setIsExperienceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cargar reservas
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const params: any = {
          page,
          limit,
        };

        if (statusFilter !== "all") {
          params.status = statusFilter.toUpperCase();
        }

        if (experienceFilter !== "all") {
          params.experienceId = experienceFilter;
        }

        if (debouncedSearchQuery.trim()) {
          // La búsqueda podría ser por nombre de cliente o email
          // El backend podría soportar esto, por ahora solo aplicamos filtros
        }

        const response = await api.get<BookingsResponse>(
          "/experiences/bookings",
          { params }
        );

        if (response.data) {
          // El backend devuelve los datos en un campo 'data'
          const bookingsData = (response.data as any).data || [];
          setBookings(bookingsData);
          const pagination = (response.data as any).pagination;
          setTotal(pagination?.total || bookingsData.length);
          setTotalPages(pagination?.totalPages || 1);
        }
      } catch (error: any) {
        console.error("Error al cargar reservas:", error);
        toast.error(
          error?.response?.data?.message || "Error al cargar las reservas"
        );
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [page, statusFilter, experienceFilter, debouncedSearchQuery]);

  const formatCurrency = (value: number, currency: string = "COP") => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency === "USD" ? "USD" : currency === "EUR" ? "EUR" : "COP",
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

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "confirmed" || statusLower === "confirmado") {
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
    if (statusLower === "pending" || statusLower === "pendiente") {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }
    if (
      statusLower === "cancelled" ||
      statusLower === "canceled" ||
      statusLower === "cancelado"
    ) {
      return "bg-red-100 text-red-700 border-red-200";
    }
    if (statusLower === "refunded" || statusLower === "reembolsado") {
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
    return "bg-zinc-100 text-zinc-700 border-zinc-200";
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    const statusMap: Record<string, string> = {
      confirmed: "Confirmada",
      confirmado: "Confirmada",
      pending: "Pendiente",
      pendiente: "Pendiente",
      cancelled: "Cancelada",
      canceled: "Cancelada",
      cancelado: "Cancelada",
      refunded: "Reembolsada",
      reembolsado: "Reembolsada",
    };
    return statusMap[statusLower] || status;
  };

  const handleExportData = () => {
    // Crear CSV con los datos
    const csvContent = [
      [
        "ID",
        "Experiencia",
        "Cliente",
        "Email",
        "Fecha",
        "Estado",
        "Total",
        "Asientos",
      ],
      ...bookings.map((booking) => [
        booking.idBooking,
        booking.expedition || booking.trip?.title || "N/A",
        booking.traveler?.name || "N/A",
        booking.traveler?.email || "N/A",
        booking.departure || formatDate(booking.dateBuy),
        getStatusLabel(booking.statusRaw || booking.status),
        booking.total || formatCurrency(booking.totalBuy, booking.currency),
        booking.seats || booking.totalSeats || 0,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `reservas-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Datos exportados exitosamente");
  };

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "CONFIRMED", label: "Confirmadas" },
    { value: "PENDING", label: "Pendientes" },
    { value: "CANCELLED", label: "Canceladas" },
    { value: "REFUNDED", label: "Reembolsadas" },
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-caveat font-bold text-zinc-900 mb-2">
              Pagos y Reservas
            </h1>
            <p className="text-zinc-500">
              Gestiona y monitorea todas las reservas de tus experiencias
            </p>
          </div>
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            <FileDown className="size-4" />
            Exportar
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-wrap items-center gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cliente o email..."
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="size-3 text-zinc-400" />
              </button>
            )}
          </div>

          {/* Filtro por estado */}
          <div className="relative" ref={statusDropdownRef}>
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <Filter className="size-4" />
              {statusOptions.find((opt) => opt.value === statusFilter)?.label ||
                "Estado"}
              <ChevronDown className="size-4" />
            </button>
            {isStatusDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-zinc-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setIsStatusDropdownOpen(false);
                      setPage(1);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 transition-colors",
                      statusFilter === option.value && "bg-zinc-50 font-medium"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filtro por experiencia */}
          {experiences.length > 0 && (
            <div className="relative" ref={experienceDropdownRef}>
              <button
                onClick={() =>
                  setIsExperienceDropdownOpen(!isExperienceDropdownOpen)
                }
                className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <Filter className="size-4" />
                {experienceFilter === "all"
                  ? "Todas las experiencias"
                  : experiences.find((exp) => exp.id === experienceFilter)
                      ?.title || "Experiencia"}
                <ChevronDown className="size-4" />
              </button>
              {isExperienceDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-zinc-200 rounded-lg shadow-lg z-10 min-w-[250px] max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setExperienceFilter("all");
                      setIsExperienceDropdownOpen(false);
                      setPage(1);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 transition-colors",
                      experienceFilter === "all" && "bg-zinc-50 font-medium"
                    )}
                  >
                    Todas las experiencias
                  </button>
                  {experiences.map((exp) => (
                    <button
                      key={exp.id}
                      onClick={() => {
                        setExperienceFilter(exp.id);
                        setIsExperienceDropdownOpen(false);
                        setPage(1);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 transition-colors truncate",
                        experienceFilter === exp.id && "bg-zinc-50 font-medium"
                      )}
                      title={exp.title}
                    >
                      {exp.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabla de reservas */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                      ID Reserva
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                      Experiencia
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                      Asientos
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-zinc-600 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-zinc-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-48 bg-zinc-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-zinc-200 rounded"></div>
                          <div className="h-3 w-40 bg-zinc-200 rounded"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-zinc-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-20 bg-zinc-200 rounded-full"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-12 bg-zinc-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-4 w-20 bg-zinc-200 rounded ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-zinc-500">
                No hay reservas disponibles con los filtros seleccionados
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                        ID Reserva
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                        Experiencia
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                        Asientos
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-zinc-600 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {bookings.map((booking) => (
                      <tr
                        key={booking.idBooking}
                        className="hover:bg-zinc-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-zinc-900">
                            #{booking.idBooking.slice(-8)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-zinc-900 max-w-xs truncate">
                            {booking.expedition || booking.trip?.title || "Experiencia no disponible"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-zinc-900">
                              {booking.traveler?.name || "Cliente no disponible"}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {booking.traveler?.email || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-zinc-600">
                            <CalendarDays className="size-4" />
                            {booking.departure || formatDate(booking.dateBuy)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              "px-3 py-1 text-xs font-semibold rounded-full border",
                              getStatusColor(booking.statusRaw || booking.status)
                            )}
                          >
                            {getStatusLabel(booking.statusRaw || booking.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                          {booking.seats || `${booking.totalSeats || 0}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-bold text-zinc-900">
                            {booking.total || formatCurrency(booking.totalBuy, booking.currency)}
                          </div>
                          {booking.discountCode && (
                            <div className="text-xs text-zinc-500">
                              Código: {booking.discountCode}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between">
                  <p className="text-sm text-zinc-500">
                    Mostrando {((page - 1) * limit) + 1} -{" "}
                    {Math.min(page * limit, total)} de {total} reservas
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={cn(
                        "p-2 border rounded-lg transition-colors",
                        page === 1
                          ? "border-zinc-200 text-zinc-400 cursor-not-allowed"
                          : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                      )}
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="text-sm text-zinc-600 px-3">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className={cn(
                        "p-2 border rounded-lg transition-colors",
                        page === totalPages
                          ? "border-zinc-200 text-zinc-400 cursor-not-allowed"
                          : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                      )}
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
