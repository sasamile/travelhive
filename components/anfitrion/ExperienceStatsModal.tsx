"use client";

import { useState, useEffect, useRef } from "react";
import { X, CheckCircle, TrendingUp, Users, DollarSign, Tag, Calendar, Loader2, Download, Receipt, Wallet, CreditCard, Star, MessageSquare, User } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface ExperienceStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceId: string;
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
  expiresAt?: string;
  sku?: string;
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
  paymentMethod?: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  seats?: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

interface ExperienceStats {
  experience: {
    idTrip: string;
    title: string;
    status: string;
    isActive: boolean;
    maxPersons?: number;
    totalViews?: number;
  };
  monthlyStats?: {
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
    totalSeats?: number;
    occupiedSeats?: number;
  };
  bookingHistory: BookingHistoryItem[];
  reviews?: Review[];
  reviewStats?: ReviewStats;
}

const steps = [
  { id: "stats", label: "Estadísticas", number: 1 },
  { id: "discounts", label: "Descuentos", number: 2 },
  { id: "reviews", label: "Reseñas", number: 3 },
  { id: "sales", label: "Ventas", number: 4 },
];

export default function ExperienceStatsModal({ isOpen, onClose, experienceId }: ExperienceStatsModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ExperienceStats | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && experienceId) {
      loadStats();
      setCurrentStep(0);
    }
  }, [isOpen, experienceId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
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
    if (!experienceId) {
      console.error("ExperienceStatsModal: experienceId no proporcionado");
      return;
    }

    try {
      setLoading(true);
      const response = await api.get<ExperienceStats>(`/experiences/${experienceId}/stats`);

      if (response.data) {
        setStats(response.data);
      } else {
        toast.error("No se recibieron datos de estadísticas");
      }
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Error al cargar las estadísticas de la experiencia";

      if (error.response?.status === 404) {
        toast.error(`No se encontraron estadísticas para esta experiencia`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number, currency: string = "COP") => {
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

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMM, yyyy HH:mm", { locale: es });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper.includes("CONFIRM") || statusUpper.includes("COMPLET")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (statusUpper.includes("PENDING") || statusUpper.includes("PENDIENTE")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (statusUpper.includes("CANCEL") || statusUpper.includes("CANCELADO")) {
      return "bg-red-50 text-red-700 border-red-200";
    }
    return "bg-zinc-50 text-zinc-700 border-zinc-200";
  };

  const getStatusLabel = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper.includes("CONFIRM")) return "Confirmada";
    if (statusUpper.includes("COMPLET")) return "Completada";
    if (statusUpper.includes("PENDING")) return "Pendiente";
    if (statusUpper.includes("CANCEL")) return "Cancelada";
    return status;
  };

  const getDiscountStatus = (code: DiscountCode) => {
    if (!code.active) return { label: "Inactivo", color: "bg-zinc-200 text-zinc-600 border-zinc-300" };
    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return { label: "Expirado", color: "bg-zinc-200 text-zinc-600 border-zinc-300" };
    }
    if (code.maxUses && code.usedCount >= code.maxUses) {
      return { label: "Sin cupo", color: "bg-red-50 text-red-600 border-red-200" };
    }
    if (code.maxUses && code.usedCount >= code.maxUses * 0.9) {
      return { label: "Casi lleno", color: "bg-amber-50 text-amber-600 border-amber-200" };
    }
    return { label: "Activo", color: "bg-emerald-50 text-emerald-600 border-emerald-200" };
  };

  const getPaymentMethodIcon = (method?: string) => {
    if (!method) return Wallet;
    const methodUpper = method.toUpperCase();
    if (methodUpper.includes("CARD") || methodUpper.includes("TARJETA")) return CreditCard;
    if (methodUpper.includes("TRANSFER") || methodUpper.includes("TRANSFERENCIA")) return Receipt;
    return Wallet;
  };

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;
  const totalStats = stats?.totalStats;
  const monthlyStats = stats?.monthlyStats;
  const discountCodes = stats?.discountCodes || [];
  const bookingHistory = stats?.bookingHistory || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div ref={backdropRef} className="absolute inset-0" onClick={onClose} />
      <div
        ref={modalRef}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-zinc-200 relative z-10"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-zinc-200 bg-zinc-50/30">
          <div>
            <h3 className="font-caveat text-4xl font-bold text-zinc-900 leading-none">
              {stats?.experience?.title || "Estadísticas"}
            </h3>
            <p className="text-xs text-zinc-500 mt-2 font-medium uppercase tracking-widest">
              Rendimiento de la Experiencia
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-900"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-8 py-6 bg-white border-b border-zinc-200">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            {/* Progress line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-100 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />

            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "relative z-10 flex flex-col items-center gap-2 group cursor-pointer transition-all",
                    isActive ? "stepper-active" : isCompleted ? "stepper-completed" : "stepper-pending"
                  )}
                  onClick={() => setCurrentStep(index)}
                >
                  <div
                    className={cn(
                      "step-icon size-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all bg-white relative z-10",
                      isActive && "shadow-sm ring-4 ring-indigo-50"
                    )}
                  >
                    {isCompleted ? <CheckCircle className="size-5" /> : step.number}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold tracking-wide uppercase text-center",
                      isActive && "font-bold"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : !stats ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-zinc-500">No hay datos disponibles</p>
            </div>
          ) : (
            <>
              {/* Step 1: Estadísticas */}
              {currentStep === 0 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                        Ingresos Totales
                      </span>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-zinc-900">
                          {formatCurrency(totalStats?.totalRevenue || 0, totalStats?.currency || "COP")}
                        </span>
                        {monthlyStats && monthlyStats.change.revenue !== 0 && (
                          <span
                            className={cn(
                              "text-xs font-medium mb-1 flex items-center",
                              monthlyStats.change.revenue > 0 ? "text-emerald-600" : "text-red-600"
                            )}
                          >
                            <TrendingUp
                              className={cn(
                                "size-3",
                                monthlyStats.change.revenue < 0 && "rotate-180"
                              )}
                            />
                            {Math.abs(monthlyStats.change.revenue).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                        Reservas Totales
                      </span>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-zinc-900">
                          {totalStats?.totalBookings || 0}
                        </span>
                        {monthlyStats && monthlyStats.change.bookings !== 0 && (
                          <span
                            className={cn(
                              "text-xs font-medium mb-1 flex items-center",
                              monthlyStats.change.bookings > 0 ? "text-emerald-600" : "text-red-600"
                            )}
                          >
                            <TrendingUp
                              className={cn(
                                "size-3",
                                monthlyStats.change.bookings < 0 && "rotate-180"
                              )}
                            />
                            {Math.abs(monthlyStats.change.bookings).toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                        Vistas a Reservas
                      </span>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-zinc-900">
                          {totalStats?.conversionRate ? `${totalStats.conversionRate.toFixed(1)}%` : "0%"}
                        </span>
                        <span className="text-xs font-medium text-zinc-500 mb-1">Promedio</span>
                      </div>
                    </div>
                  </div>

                  {totalStats && (totalStats.totalSeats || totalStats.occupiedSeats) && (
                    <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Ocupación</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-zinc-600">
                            {totalStats.occupiedSeats || 0} / {totalStats.totalSeats || 0} personas
                          </span>
                          <span className="text-sm font-semibold text-zinc-900">
                            {totalStats.totalSeats
                              ? Math.round(((totalStats.occupiedSeats || 0) / totalStats.totalSeats) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: `${
                                totalStats.totalSeats
                                  ? Math.round(((totalStats.occupiedSeats || 0) / totalStats.totalSeats) * 100)
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {discountCodes.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
                          Códigos de Descuento Activos
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {discountCodes.slice(0, 4).map((code, index) => {
                          const status = getDiscountStatus(code);
                          return (
                            <div
                              key={index}
                              className={cn(
                                "p-4 rounded-xl border flex items-center justify-between",
                                code.active && !code.expiresAt
                                  ? "border-indigo-100 bg-indigo-50/30"
                                  : "border-zinc-200 bg-white"
                              )}
                            >
                              <div>
                                <p className="text-xs font-bold text-primary tracking-wide">{code.code}</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">
                                  {code.discountType === "PERCENTAGE" ? `${code.value}%` : formatCurrency(code.value, totalStats?.currency || "COP")}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-zinc-900">
                                  {code.usedCount} / {code.maxUses || "∞"} Usados
                                </p>
                                <p className={cn("text-[10px] font-medium", status.color.includes("emerald") ? "text-emerald-600" : status.color.includes("amber") ? "text-amber-600" : "text-zinc-400")}>
                                  {code.maxUses ? code.maxUses - code.usedCount : "∞"} Restantes
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Descuentos */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-zinc-900">Inventario de Códigos de Descuento</h4>
                      <p className="text-sm text-zinc-500">Rastrea el uso y estado de límite de promociones activas</p>
                    </div>
                    <button className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-zinc-100 transition-colors">
                      <Tag className="size-3.5" />
                      Nuevo Código
                    </button>
                  </div>

                  {discountCodes.length === 0 ? (
                    <div className="text-center py-12">
                      <Tag className="size-12 text-zinc-300 mx-auto mb-3" />
                      <p className="text-sm text-zinc-500">No hay códigos de descuento</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {discountCodes.map((code, index) => {
                        const status = getDiscountStatus(code);
                        const usagePercentage = code.maxUses
                          ? Math.round((code.usedCount / code.maxUses) * 100)
                          : 0;

                        return (
                          <div
                            key={index}
                            className={cn(
                              "p-5 rounded-xl border hover:border-primary/20 transition-all shadow-sm group",
                              status.color.includes("zinc") ? "border-zinc-200 bg-zinc-50/50 opacity-75" : "border-zinc-200 bg-white"
                            )}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-mono font-bold text-zinc-900 px-2 py-0.5 bg-zinc-100 rounded">
                                    {code.code}
                                  </span>
                                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase", status.color)}>
                                    {status.label}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-500">
                                  {code.discountType === "PERCENTAGE"
                                    ? `${code.value}% de descuento`
                                    : `${formatCurrency(code.value, totalStats?.currency || "COP")} de descuento`}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    Límite de Uso
                                  </span>
                                  <span className="text-sm font-semibold text-zinc-900">
                                    {code.usedCount} / {code.maxUses || "∞"}{" "}
                                    <span className="text-xs text-zinc-400 font-normal">usados</span>
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-primary">{usagePercentage}%</span>
                              </div>
                              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    usagePercentage >= 90 ? "bg-amber-500" : "bg-primary"
                                  )}
                                  style={{ width: `${usagePercentage}%` }}
                                />
                              </div>
                              <div className="flex items-center gap-4 pt-2">
                                {code.expiresAt && (
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="size-[14px] text-zinc-400" />
                                    <span className="text-[10px] text-zinc-500">
                                      Expira {formatDate(code.expiresAt)}
                                    </span>
                                  </div>
                                )}
                                {code.sku && (
                                  <div className="flex items-center gap-1.5">
                                    <Tag className="size-[14px] text-zinc-400" />
                                    <span className="text-[10px] text-zinc-500">SKU: {code.sku}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {discountCodes.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Registro de Canjes Recientes
                      </h5>
                      <div className="border border-zinc-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                              <th className="px-6 py-3 font-bold text-zinc-400 uppercase tracking-wider">SKU</th>
                              <th className="px-6 py-3 font-bold text-zinc-400 uppercase tracking-wider">Cliente</th>
                              <th className="px-6 py-3 font-bold text-zinc-400 uppercase tracking-wider">Descuento</th>
                              <th className="px-6 py-3 font-bold text-zinc-400 uppercase tracking-wider text-right">
                                Aplicado En
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200">
                            {bookingHistory
                              .filter((booking) => booking.discountCode)
                              .slice(0, 5)
                              .map((booking, index) => {
                                const discountCode = discountCodes.find((c) => c.code === booking.discountCode);
                                return (
                                  <tr key={index}>
                                    <td className="px-6 py-3 font-mono text-zinc-600">
                                      {discountCode?.sku || `DISC-${booking.discountCode?.substring(0, 3).toUpperCase()}-${index + 1}`}
                                    </td>
                                    <td className="px-6 py-3 font-medium">{booking.customer.name}</td>
                                    <td className="px-6 py-3 text-emerald-600">
                                      -{formatCurrency(booking.discountAmount || 0, booking.currency)}
                                    </td>
                                    <td className="px-6 py-3 text-right text-zinc-400">
                                      {formatDateTime(booking.dateBuy)}
                                    </td>
                                  </tr>
                                );
                              })}
                            {bookingHistory.filter((booking) => booking.discountCode).length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-6 py-6 text-center text-zinc-500">
                                  No hay canjes registrados
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Reseñas */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-zinc-900">Reseñas y Comentarios</h4>
                      <p className="text-sm text-zinc-500">
                        Revisa las opiniones y calificaciones de tus clientes
                      </p>
                    </div>
                    {stats.reviewStats && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="size-5 text-yellow-500 fill-yellow-500" />
                          <span className="text-2xl font-bold text-zinc-900">
                            {stats.reviewStats.averageRating.toFixed(1)}
                          </span>
                        </div>
                        <div className="h-8 w-px bg-zinc-200"></div>
                        <div className="text-sm text-zinc-600">
                          <span className="font-semibold">{stats.reviewStats.totalReviews}</span> reseñas
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Estadísticas de calificaciones */}
                  {stats.reviewStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Calificación Promedio</span>
                          <Star className="size-4 text-yellow-600 fill-yellow-600" />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-zinc-900">
                            {stats.reviewStats.averageRating.toFixed(1)}
                          </span>
                          <span className="text-sm text-zinc-500">/ 5.0</span>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Total de Reseñas</span>
                          <MessageSquare className="size-4 text-indigo-600" />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-zinc-900">
                            {stats.reviewStats.totalReviews}
                          </span>
                          <span className="text-sm text-zinc-500">comentarios</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Distribución de calificaciones */}
                  {stats.reviewStats && stats.reviewStats.ratingDistribution && (
                    <div className="p-6 bg-white border border-zinc-200 rounded-xl">
                      <h5 className="text-sm font-semibold text-zinc-900 mb-4">Distribución de Calificaciones</h5>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = stats.reviewStats?.ratingDistribution?.[rating] || 0;
                          const total = stats.reviewStats?.totalReviews || 1;
                          const percentage = (count / total) * 100;
                          
                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <div className="flex items-center gap-1 w-16">
                                <span className="text-sm font-semibold text-zinc-900">{rating}</span>
                                <Star className="size-4 text-yellow-500 fill-yellow-500" />
                              </div>
                              <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-500 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-zinc-600 w-12 text-right">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Lista de reseñas */}
                  {stats.reviews && stats.reviews.length > 0 ? (
                    <div className="space-y-4">
                      <h5 className="text-sm font-semibold text-zinc-900">Todas las Reseñas</h5>
                      {stats.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="p-6 bg-white border border-zinc-200 rounded-xl hover:border-indigo-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {review.user.image ? (
                                <img
                                  src={review.user.image}
                                  alt={review.user.name}
                                  className="size-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="size-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <User className="size-5 text-indigo-600" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-zinc-900">{review.user.name}</p>
                                <p className="text-xs text-zinc-500">{review.user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`size-4 ${
                                      star <= review.rating
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-zinc-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-zinc-500">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-zinc-700 leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="size-12 text-zinc-300 mx-auto mb-3" />
                      <p className="text-sm text-zinc-500">No hay reseñas disponibles</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Ventas */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-zinc-900">Historial de Transacciones</h4>
                      <p className="text-sm text-zinc-500">Registro completo de todas las reservas y pagos</p>
                    </div>
                  </div>

                  {bookingHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <Receipt className="size-12 text-zinc-300 mx-auto mb-3" />
                      <p className="text-sm text-zinc-500">No hay transacciones registradas</p>
                    </div>
                  ) : (
                    <div className="border border-zinc-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50/50 border-b border-zinc-200">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                              Fecha de Reserva
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                              Cliente
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                              Personas
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">
                              Total Pagado
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                              Método
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                              Estado
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {bookingHistory.map((booking) => {
                            const PaymentIcon = getPaymentMethodIcon(booking.paymentMethod);
                            return (
                              <tr key={booking.idBooking} className="hover:bg-zinc-50/30 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="size-4 text-zinc-400" />
                                    <span className="text-sm text-zinc-600">{formatDateTime(booking.dateBuy)}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    <p className="text-sm font-medium text-zinc-900">{booking.customer.name}</p>
                                    <p className="text-xs text-zinc-500">{booking.customer.email}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center text-zinc-600">
                                  {booking.seats || 1}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex flex-col items-end">
                                    <span className="text-sm font-bold text-zinc-900">
                                      {formatCurrency(booking.totalBuy, booking.currency)}
                                    </span>
                                    {booking.discountAmount && booking.discountAmount > 0 && (
                                      <span className="text-xs text-emerald-600">
                                        -{formatCurrency(booking.discountAmount, booking.currency)} desc.
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <PaymentIcon className="size-4 text-zinc-400" />
                                    <span className="text-xs text-zinc-500">
                                      {booking.paymentMethod || "N/A"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                      getStatusColor(booking.status)
                                    )}
                                  >
                                    {getStatusLabel(booking.status)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
          <button className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-2">
            <Download className="size-4" />
            {currentStep === 0 && "Exportar Estadísticas (CSV)"}
            {currentStep === 1 && "Exportar Descuentos (CSV)"}
            {currentStep === 2 && "Exportar Reseñas (CSV)"}
            {currentStep === 3 && "Exportar Ventas (CSV)"}
          </button>
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-sm font-medium border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                Atrás
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-8 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
              >
                Finalizar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
