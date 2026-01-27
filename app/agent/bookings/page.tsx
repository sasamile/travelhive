"use client";

import React, { useState, useEffect, useRef } from 'react'
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileDown,
  ShieldCheck,
} from 'lucide-react'
import { AgentHeader } from "@/components/agent/AgentHeader";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Booking {
  id: string;
  expedition: string;
  departure: string;
  traveler: {
    name: string;
    email: string;
    avatar: string;
  };
  seats: string;
  total: string;
  status: 'confirmed' | 'pending' | 'canceled' | 'cancelled';
}

interface BookingsResponse {
  bookings: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function Page() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Resetear a la primera página al buscar
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Función para mapear datos del backend al formato del frontend
  const mapBookingToFrontend = (booking: any): Booking => {
    // El backend ya formatea muchos campos, así que los usamos directamente
    // pero con fallbacks por si acaso
    
    // ID - ya viene formateado como "#BK-08417"
    const id = booking.id || `#BK-${booking.idBooking || "00000"}`;

    // Expedición - puede venir como string o necesitar extraerse del trip
    const expedition = booking.expedition || booking.trip?.title || "Expedición sin título";

    // Fecha de salida - ya viene formateada como "Ene 27, 2026"
    const departure = booking.departure || (() => {
      if (booking.expeditionDetails?.startDate) {
        try {
          return format(new Date(booking.expeditionDetails.startDate), "MMM dd, yyyy", { locale: es });
        } catch {
          return "Fecha no disponible";
        }
      }
      return "Fecha no disponible";
    })();

    // Asientos - ya viene formateado como "1/1"
    const seats = booking.seats || (() => {
      const totalSeats = booking.totalSeats || booking.totalPersons || 0;
      const capacity = booking.expeditionDetails?.capacity || booking.expeditionDetails?.capacityAvailable || "?";
      return `${totalSeats}/${capacity}`;
    })();

    // Monto total - ya viene formateado como "$200.000"
    const total = booking.total || (() => {
      const currency = booking.currency || "COP";
      const totalBuy = booking.totalBuy || 0;
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: currency === "USD" ? "USD" : currency === "EUR" ? "EUR" : "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(totalBuy);
    })();

    // Estado - ya viene como "confirmed" pero puede venir como "CONFIRMED" en statusRaw
    const backendStatus = (booking.status || booking.statusRaw || "").toLowerCase();
    let frontendStatus: 'confirmed' | 'pending' | 'canceled' | 'cancelled' = 'pending';
    if (backendStatus === 'confirmed' || backendStatus === 'confirmado') {
      frontendStatus = 'confirmed';
    } else if (backendStatus === 'cancelled' || backendStatus === 'canceled' || backendStatus === 'cancelado') {
      frontendStatus = 'canceled';
    } else {
      frontendStatus = 'pending';
    }

    // Viajero - el backend ya formatea estos campos
    const traveler = booking.traveler || {};
    const travelerName = traveler.name || "Viajero sin nombre";
    const travelerEmail = traveler.email || "sin-email@example.com";
    const travelerAvatar = traveler.avatar || traveler.picture || 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(travelerName)}&background=random`;

    return {
      id,
      expedition,
      departure,
      traveler: {
        name: travelerName,
        email: travelerEmail,
        avatar: travelerAvatar,
      },
      seats,
      total,
      status: frontendStatus,
    };
  };

  // Cargar bookings del backend
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        
        const params: any = {
          page,
          limit,
        };

        // Agregar filtro de estado
        if (statusFilter && statusFilter !== "all") {
          params.status = statusFilter;
        }

        // Agregar búsqueda
        if (debouncedSearchQuery.trim()) {
          params.search = debouncedSearchQuery.trim();
        }

        const response = await api.get<BookingsResponse>("/agencies/bookings", { params });
        
        if (response.data) {
          const responseData = response.data;
          const bookingsData = responseData.bookings || [];
          const pagination = responseData.pagination || {
            total: bookingsData.length,
            page: 1,
            limit: limit,
            totalPages: 1,
          };
          
          const mappedBookings = bookingsData.map(mapBookingToFrontend);
          
          setBookings(mappedBookings);
          setTotal(pagination.total);
          setTotalPages(pagination.totalPages);
        }
      } catch (error: any) {
        console.error("Error al cargar reservas:", error);
        toast.error("Error al cargar las reservas");
        setBookings([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [page, limit, statusFilter, debouncedSearchQuery]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-100'
      case 'canceled':
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-100'
      default:
        return 'bg-zinc-50 text-zinc-700 border border-zinc-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada'
      case 'pending':
        return 'Pendiente'
      case 'canceled':
      case 'cancelled':
        return 'Cancelada'
      default:
        return status
    }
  }

  const getStatusFilterLabel = (status: string) => {
    switch (status) {
      case 'all':
        return 'Todos'
      case 'confirmed':
        return 'Confirmadas'
      case 'pending':
        return 'Pendientes'
      case 'canceled':
      case 'cancelled':
        return 'Canceladas'
      default:
        return 'Todos'
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPaginationNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <>
      <main className="flex flex-col min-h-screen">
        <AgentHeader
          showSearch
          searchPlaceholder="Buscar por ID de reserva o viajero..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          showNotifications
          actions={
            <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
              <FileDown className="size-4" />
              Exportar Lista
            </button>
          }
        />

          <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-caveat text-4xl font-bold text-zinc-900">
                  Gestión de Reservas
                </h2>
                <p className="text-[#71717A] mt-1 text-sm">
                  Gestiona eficientemente las reservas individuales y detalles de los viajeros.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group" ref={statusDropdownRef}>
                  <button 
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-zinc-600 bg-white px-3 py-2 rounded-[0.5rem] border border-[#F4F4F5] hover:border-zinc-300 transition-all"
                  >
                    <Filter className="size-4 text-zinc-400" aria-hidden="true" />
                    Estado: {getStatusFilterLabel(statusFilter)}
                    <ChevronDown className={`size-3 text-zinc-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  
                  {isStatusDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-[#F4F4F5] rounded-lg shadow-lg z-50 min-w-[160px]">
                      {['all', 'confirmed', 'pending', 'canceled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setIsStatusDropdownOpen(false);
                            setPage(1);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 transition-colors ${
                            statusFilter === status ? 'bg-zinc-100 font-semibold' : ''
                          }`}
                        >
                          {getStatusFilterLabel(status)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#F4F4F5] rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#F4F4F5] bg-zinc-50/30">
                      <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        ID de Reserva
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Nombre de Expedición
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Viajero Principal
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider text-center">
                        Asientos
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Monto Total
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F4F5]">
                    {loading ? (
                      <>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <tr key={`skeleton-${index}`} className="animate-pulse">
                            <td className="px-6 py-4">
                              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                              <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                <div className="flex-1">
                                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                  <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            </td>
                          </tr>
                        ))}
                      </>
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <p className="text-sm text-zinc-500">No se encontraron reservas</p>
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="hover:bg-zinc-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-zinc-500">
                            {booking.id}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-zinc-900">
                              {booking.expedition}
                            </p>
                            <p className="text-[10px] text-[#71717A]">
                              Salida: {booking.departure}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="size-8 rounded-full bg-zinc-100 bg-cover bg-center border border-[#F4F4F5]"
                                style={{
                                  backgroundImage: `url('${booking.traveler.avatar}')`,
                                }}
                              ></div>
                              <div>
                                <p className="text-sm font-medium text-zinc-900">
                                  {booking.traveler.name}
                                </p>
                                <p className="text-[10px] text-[#71717A]">
                                  {booking.traveler.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-medium text-zinc-900">
                              {booking.seats}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-zinc-900">
                              {booking.total}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${getStatusBadgeClass(booking.status)}`}
                            >
                              {getStatusLabel(booking.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-[#F4F4F5] flex items-center justify-between bg-zinc-50/20">
                <p className="text-xs text-[#71717A] italic">
                  {loading ? (
                    "Cargando..."
                  ) : total === 0 ? (
                    "No hay reservas"
                  ) : (
                    `Mostrando ${(page - 1) * limit + 1} a ${Math.min(page * limit, total)} de ${total} reservas`
                  )}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1 || loading}
                      className="p-1 rounded border border-[#F4F4F5] text-zinc-400 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="size-4" aria-hidden="true" />
                    </button>
                    {getPaginationNumbers().map((pageNum, index) => (
                      pageNum === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-zinc-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum as number)}
                          disabled={loading}
                          className={`size-7 flex items-center justify-center rounded text-xs font-semibold transition-colors ${
                            page === pageNum
                              ? 'bg-zinc-900 text-white'
                              : 'text-zinc-600 hover:bg-zinc-100'
                          } disabled:opacity-50`}
                        >
                          {pageNum}
                        </button>
                      )
                    ))}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages || loading}
                      className="p-1 rounded border border-[#F4F4F5] text-zinc-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#F4F4F5] rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-indigo-50 flex items-center justify-center text-primary">
                  <ShieldCheck className="size-6" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-caveat text-xl font-bold">
                    Completa la configuración de tu perfil de pagos
                  </h4>
                  <p className="text-xs text-[#71717A]">
                    Tienes 3 pagos pendientes esperando ser procesados.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-48 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: '75%' }}
                  ></div>
                </div>
                <span className="font-caveat text-xl text-primary font-bold">75%</span>
                <button className="text-xs font-bold text-zinc-900 underline underline-offset-4 decoration-zinc-300 hover:decoration-primary transition-all">
                  Completar Configuración
                </button>
              </div>
            </div>
          </div>
      </main>
    </>
  )
}

export default Page
