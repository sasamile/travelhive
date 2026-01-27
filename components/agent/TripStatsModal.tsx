"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronRight, ChevronLeft, TrendingUp, Users, DollarSign, Tag, User, Calendar, CheckCircle, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface TripStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
}

interface Promoter {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  referralCount: number;
  isActive: boolean;
}

interface MonthlyStats {
  bookings: number;
  revenue: number;
  currency: string;
  averageBookingValue: number;
  discountCodesUsed?: number;
  totalDiscountAmount?: number;
}

interface DiscountCode {
  code: string;
  discountType: string;
  value: number;
  timesUsed: number;
  totalDiscountAmount: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
}

interface BookingHistoryItem {
  idBooking: string;
  status: string;
  dateBuy: string;
  totalBuy: number;
  subtotal?: number;
  discountAmount?: number;
  discountCode?: string;
  currency: string;
  transactionId?: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  expedition: {
    idExpedition: string;
    startDate: string;
    endDate: string;
  };
  bookingItems: Array<{
    itemType: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface TripStats {
  trip: {
    idTrip: string;
    title: string;
    status: string;
    isActive: boolean;
  };
  promoter?: Promoter;
  monthlyStats: {
    currentMonth: MonthlyStats;
    previousMonth: MonthlyStats;
    change: {
      bookings: number;
      revenue: number;
    };
  };
  discountCodes: DiscountCode[];
  totalStats: {
    totalBookings: number;
    totalRevenue: number;
    currency: string;
    totalDiscountAmount: number;
    averageBookingValue: number;
    conversionRate: number;
  };
  bookingHistory: BookingHistoryItem[];
}

const steps = [
  { id: "overview", label: "Resumen", icon: TrendingUp },
  { id: "promoter", label: "Promoter", icon: User },
  { id: "discounts", label: "Códigos", icon: Tag },
  { id: "bookings", label: "Reservas", icon: Calendar },
];

export default function TripStatsModal({ isOpen, onClose, tripId }: TripStatsModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<TripStats | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && tripId) {
      loadStats();
    }
  }, [isOpen, tripId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Animación de entrada
      if (modalRef.current && backdropRef.current) {
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.9, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" }
        );
      }
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get<TripStats>(`/agencies/trips/${tripId}/stats`);
      setStats(response.data);
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error);
      toast.error(error.response?.data?.message || "Error al cargar las estadísticas del viaje");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number, currency: string = "USD") => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency === "COP" ? "COP" : currency === "EUR" ? "EUR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMM yyyy", { locale: es });
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "CONFIRMED" || statusUpper === "CONFIRMADO") {
      return "bg-emerald-50 text-emerald-600";
    }
    if (statusUpper === "PENDING" || statusUpper === "PENDIENTE") {
      return "bg-amber-50 text-amber-600";
    }
    if (statusUpper === "CANCELLED" || statusUpper === "CANCELADO") {
      return "bg-red-50 text-red-600";
    }
    return "bg-zinc-50 text-zinc-600";
  };

  const getStatusLabel = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "CONFIRMED" || statusUpper === "CONFIRMADO") return "Confirmada";
    if (statusUpper === "PENDING" || statusUpper === "PENDIENTE") return "Pendiente";
    if (statusUpper === "CANCELLED" || statusUpper === "CANCELADO") return "Cancelada";
    return status;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">{stats?.trip.title || "Estadísticas del Viaje"}</h2>
            <p className="text-sm text-zinc-600 mt-1">Información detallada y análisis de rendimiento</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-lg transition-colors"
          >
            <X className="size-5 text-zinc-600" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-white">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center flex-1">
                    <div
                      className={cn(
                        "flex items-center justify-center size-10 rounded-full border-2 transition-all",
                        isActive
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "bg-white border-zinc-300 text-zinc-400"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="size-5" />
                      ) : (
                        <Icon className="size-5" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={cn("text-xs font-medium", isActive ? "text-indigo-600" : "text-zinc-500")}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn("h-0.5 flex-1 mx-4", isCompleted ? "bg-emerald-500" : "bg-zinc-200")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="size-8 animate-spin text-indigo-600" />
            </div>
          ) : stats ? (
            <>
              {/* Step 1: Overview */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="size-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                          <DollarSign className="size-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-600">Ingresos Totales</p>
                          <p className="text-2xl font-bold text-zinc-900">
                            {formatCurrency(stats.totalStats.totalRevenue, stats.totalStats.currency)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="size-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                          <Users className="size-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-600">Total Reservas</p>
                          <p className="text-2xl font-bold text-zinc-900">{stats.totalStats.totalBookings}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="size-12 bg-amber-600 rounded-xl flex items-center justify-center">
                          <TrendingUp className="size-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-600">Valor Promedio</p>
                          <p className="text-2xl font-bold text-zinc-900">
                            {formatCurrency(stats.totalStats.averageBookingValue, stats.totalStats.currency)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="size-12 bg-purple-600 rounded-xl flex items-center justify-center">
                          <Tag className="size-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-600">Descuentos Totales</p>
                          <p className="text-2xl font-bold text-zinc-900">
                            {formatCurrency(stats.totalStats.totalDiscountAmount, stats.totalStats.currency)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Comparison */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-zinc-900 mb-4">Comparación Mensual</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-zinc-600 mb-2">Mes Actual</p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-600">Reservas:</span>
                            <span className="font-semibold">{stats.monthlyStats.currentMonth.bookings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-600">Ingresos:</span>
                            <span className="font-semibold">
                              {formatCurrency(stats.monthlyStats.currentMonth.revenue, stats.monthlyStats.currentMonth.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-600 mb-2">Mes Anterior</p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-600">Reservas:</span>
                            <span className="font-semibold">{stats.monthlyStats.previousMonth.bookings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-600">Ingresos:</span>
                            <span className="font-semibold">
                              {formatCurrency(stats.monthlyStats.previousMonth.revenue, stats.monthlyStats.previousMonth.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-200">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-sm text-zinc-600">Cambio en Reservas: </span>
                          <span className={cn("font-semibold", stats.monthlyStats.change.bookings >= 0 ? "text-emerald-600" : "text-red-600")}>
                            {stats.monthlyStats.change.bookings >= 0 ? "+" : ""}{stats.monthlyStats.change.bookings}%
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-zinc-600">Cambio en Ingresos: </span>
                          <span className={cn("font-semibold", stats.monthlyStats.change.revenue >= 0 ? "text-emerald-600" : "text-red-600")}>
                            {stats.monthlyStats.change.revenue >= 0 ? "+" : ""}{stats.monthlyStats.change.revenue}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Promoter */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {stats.promoter ? (
                    <>
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
                        <div className="flex items-start gap-4">
                          <div className="size-16 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <User className="size-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-zinc-900 mb-1">{stats.promoter.name}</h3>
                            <p className="text-sm text-zinc-600 mb-2">Código: {stats.promoter.code}</p>
                            {stats.promoter.email && (
                              <p className="text-sm text-zinc-600">{stats.promoter.email}</p>
                            )}
                            {stats.promoter.phone && (
                              <p className="text-sm text-zinc-600">{stats.promoter.phone}</p>
                            )}
                          </div>
                          <div className={cn("px-3 py-1 rounded-full text-xs font-semibold", stats.promoter.isActive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-700")}>
                            {stats.promoter.isActive ? "Activo" : "Inactivo"}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-zinc-200 p-6 rounded-xl">
                          <p className="text-sm text-zinc-600 mb-2">Referidos Totales</p>
                          <p className="text-3xl font-bold text-zinc-900">{stats.promoter.referralCount}</p>
                        </div>
                        <div className="bg-white border border-zinc-200 p-6 rounded-xl">
                          <p className="text-sm text-zinc-600 mb-2">Estado</p>
                          <p className={cn("text-lg font-semibold", stats.promoter.isActive ? "text-emerald-600" : "text-zinc-600")}>
                            {stats.promoter.isActive ? "Activo" : "Inactivo"}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <User className="size-16 text-zinc-300 mx-auto mb-4" />
                      <p className="text-zinc-600">Este viaje no tiene promoter asociado</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Discount Codes */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {stats.discountCodes.length > 0 ? (
                    stats.discountCodes.map((code, index) => (
                      <div key={index} className="bg-white border border-zinc-200 p-6 rounded-xl">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-zinc-900">{code.code}</h3>
                            <p className="text-sm text-zinc-600">
                              {code.discountType === "PERCENTAGE" ? `${code.value}%` : formatCurrency(code.value, stats.totalStats.currency)} de descuento
                            </p>
                          </div>
                          <div className={cn("px-3 py-1 rounded-full text-xs font-semibold", code.active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-700")}>
                            {code.active ? "Activo" : "Inactivo"}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-zinc-600 mb-1">Veces Usado</p>
                            <p className="text-lg font-semibold text-zinc-900">{code.timesUsed}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-600 mb-1">Descuento Total</p>
                            <p className="text-lg font-semibold text-zinc-900">
                              {formatCurrency(code.totalDiscountAmount, stats.totalStats.currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-600 mb-1">Usos Disponibles</p>
                            <p className="text-lg font-semibold text-zinc-900">
                              {code.maxUses ? `${code.maxUses - code.usedCount}` : "Ilimitado"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-600 mb-1">Límite Máximo</p>
                            <p className="text-lg font-semibold text-zinc-900">
                              {code.maxUses || "Sin límite"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Tag className="size-16 text-zinc-300 mx-auto mb-4" />
                      <p className="text-zinc-600">Este viaje no tiene códigos de descuento</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Booking History */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  {stats.bookingHistory.length > 0 ? (
                    <div className="space-y-4">
                      {stats.bookingHistory.map((booking) => (
                        <div key={booking.idBooking} className="bg-white border border-zinc-200 p-6 rounded-xl">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-zinc-900">Reserva #{booking.idBooking.slice(-8)}</h3>
                              <p className="text-sm text-zinc-600">{formatDate(booking.dateBuy)}</p>
                            </div>
                            <div className={cn("px-3 py-1 rounded-full text-xs font-semibold", getStatusColor(booking.status))}>
                              {getStatusLabel(booking.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                              <p className="text-xs text-zinc-600 mb-2">Cliente</p>
                              <p className="font-semibold text-zinc-900">{booking.customer.name}</p>
                              <p className="text-sm text-zinc-600">{booking.customer.email}</p>
                              {booking.customer.phone && (
                                <p className="text-sm text-zinc-600">{booking.customer.phone}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-zinc-600 mb-2">Expedición</p>
                              <p className="text-sm text-zinc-900">
                                {formatDate(booking.expedition.startDate)} - {formatDate(booking.expedition.endDate)}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-zinc-200 pt-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-zinc-600">Total:</span>
                              <span className="text-xl font-bold text-zinc-900">
                                {formatCurrency(booking.totalBuy, booking.currency)}
                              </span>
                            </div>
                            {booking.discountAmount && booking.discountAmount > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-600">
                                  Descuento {booking.discountCode && `(${booking.discountCode})`}:
                                </span>
                                <span className="text-emerald-600 font-semibold">
                                  -{formatCurrency(booking.discountAmount, booking.currency)}
                                </span>
                              </div>
                            )}
                            {booking.subtotal && (
                              <div className="flex justify-between items-center text-sm text-zinc-600">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(booking.subtotal, booking.currency)}</span>
                              </div>
                            )}
                          </div>

                          {booking.bookingItems.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-zinc-200">
                              <p className="text-xs text-zinc-600 mb-2">Items:</p>
                              <div className="space-y-1">
                                {booking.bookingItems.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-zinc-600">
                                      {item.itemType === "ADULT" ? "Adultos" : "Niños"} x{item.quantity}
                                    </span>
                                    <span className="text-zinc-900">{formatCurrency(item.totalPrice, booking.currency)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="size-16 text-zinc-300 mx-auto mb-4" />
                      <p className="text-zinc-600">No hay historial de reservas disponible</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-600">No se pudieron cargar las estadísticas</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              currentStep === 0
                ? "text-zinc-400 cursor-not-allowed"
                : "text-zinc-700 hover:bg-white"
            )}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </button>
          <div className="text-sm text-zinc-600">
            Paso {currentStep + 1} de {steps.length}
          </div>
          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              currentStep === steps.length - 1
                ? "text-zinc-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            )}
          >
            Siguiente
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
