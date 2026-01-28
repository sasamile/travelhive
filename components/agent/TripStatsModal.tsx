"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronRight, ChevronLeft, TrendingUp, Users, DollarSign, Tag, User, Calendar, CheckCircle, Loader2, Download, Receipt, CreditCard, Building2, Wallet, Star, MessageSquare } from "lucide-react";
import api from "@/lib/axios";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface TripStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  expeditionId?: string | null;
}

interface Promoter {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  referralCount: number;
  views?: number;
  conversionRate?: number;
  revenueGenerated?: number;
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

interface TripStats {
  trip: {
    idTrip: string;
    title: string;
    status: string;
    isActive: boolean;
    maxPersons?: number;
    totalViews?: number;
  };
  promoters?: Promoter[];
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
    totalSeats?: number;
    occupiedSeats?: number;
  };
  bookingHistory: BookingHistoryItem[];
  reviews?: Review[];
  reviewStats?: ReviewStats;
}

const steps = [
  { id: "stats", label: "Stats", number: 1 },
  { id: "promoters", label: "Promoters", number: 2 },
  { id: "discounts", label: "Discounts", number: 3 },
  { id: "reviews", label: "Reviews", number: 4 },
  { id: "sales", label: "Sales", number: 5 },
];

export default function TripStatsModal({ isOpen, onClose, tripId, expeditionId }: TripStatsModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<TripStats | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && tripId) {
      loadStats();
      setCurrentStep(0); // Reset to first step when opening
    }
  }, [isOpen, tripId, expeditionId]);

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
    if (!tripId) {
      console.error("TripStatsModal: tripId no proporcionado");
      return;
    }

    try {
      setLoading(true);
      
      const directApi = axios.create({
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token");
        if (token) {
          directApi.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
      }
      
      let url: string;
      let response;
      
      // Opción 1: Si tenemos expeditionId, usar el endpoint de expediciones (recomendado)
      if (expeditionId) {
        url = `/agencies/expeditions/${expeditionId}/stats`;
        console.log(`Cargando estadísticas para expeditionId: ${expeditionId}`);
        response = await directApi.get<TripStats>(url);
      } 
      // Opción 2: Si no hay expeditionId pero tenemos tripId, usar el endpoint de trips
      else {
        url = `/agencies/trips/${tripId}/stats`;
        console.log(`Cargando estadísticas para tripId: ${tripId}`);
        response = await directApi.get<TripStats>(url);
      }
      
      console.log(`URL completa (sin /api): ${url}`);
      console.log("Respuesta de estadísticas:", response.data);
      
      if (response.data) {
        setStats(response.data);
      } else {
        console.warn("La respuesta no contiene datos");
        toast.error("No se recibieron datos de estadísticas");
      }
    } catch (error: any) {
      console.error("Error completo al cargar estadísticas:", error);
      console.error("Status:", error.response?.status);
      console.error("URL intentada:", error.config?.url);
      console.error("Mensaje de error:", error.response?.data?.message || error.message);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          "Error al cargar las estadísticas del viaje";
      
      if (error.response?.status === 404) {
        const idLabel = expeditionId ? `expedición (ID: ${expeditionId})` : `viaje (ID: ${tripId})`;
        toast.error(`No se encontraron estadísticas para esta ${idLabel}`);
      } else {
        toast.error(errorMessage);
      }
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

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM d, HH:mm", { locale: es });
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "CONFIRMED" || statusUpper === "CONFIRMADO") {
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    }
    if (statusUpper === "PENDING" || statusUpper === "PENDIENTE") {
      return "bg-amber-50 text-amber-600 border-amber-100";
    }
    if (statusUpper === "CANCELLED" || statusUpper === "CANCELADO") {
      return "bg-red-50 text-red-600 border-red-100";
    }
    return "bg-zinc-50 text-zinc-600 border-zinc-100";
  };

  const getStatusLabel = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "CONFIRMED" || statusUpper === "CONFIRMADO") return "CONFIRMADA";
    if (statusUpper === "PENDING" || statusUpper === "PENDIENTE") return "PENDIENTE";
    if (statusUpper === "CANCELLED" || statusUpper === "CANCELADO") return "CANCELADA";
    return status.toUpperCase();
  };

  const getDiscountStatus = (code: DiscountCode) => {
    if (!code.active) return { label: "Expired", color: "bg-zinc-200 text-zinc-600 border-zinc-300" };
    if (code.maxUses && code.usedCount >= code.maxUses * 0.9) {
      return { label: "Near Limit", color: "bg-amber-50 text-amber-600 border-amber-100" };
    }
    return { label: "Active", color: "bg-emerald-50 text-emerald-600 border-emerald-100" };
  };

  const getPaymentMethodIcon = (method?: string) => {
    if (!method) return CreditCard;
    const methodUpper = method.toUpperCase();
    if (methodUpper.includes("VISA") || methodUpper.includes("MASTERCARD") || methodUpper.includes("CREDIT")) {
      return CreditCard;
    }
    if (methodUpper.includes("APPLE") || methodUpper.includes("PAY")) {
      return Wallet;
    }
    if (methodUpper.includes("BANK") || methodUpper.includes("ACCOUNT")) {
      return Building2;
    }
    return CreditCard;
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

  // Calculate derived stats
  const totalSeats = stats?.totalStats.totalSeats || stats?.trip.maxPersons || 0;
  const occupiedSeats = stats?.totalStats.occupiedSeats || stats?.totalStats.totalBookings || 0;
  const occupancyPercentage = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;
  const revenueChange = stats?.monthlyStats.change.revenue || 0;
  const promotersList = stats?.promoters || (stats?.promoter ? [stats.promoter] : []);
  const totalViews = stats?.trip.totalViews || 0;
  const conversionRate = stats?.totalStats.conversionRate || (totalViews > 0 ? (stats?.totalStats.totalBookings || 0) / totalViews * 100 : 0);

  // Calculate promoter stats
  const promotersWithStats = promotersList.map(p => ({
    ...p,
    views: p.views || 0,
    conversionRate: p.conversionRate || (p.views && p.views > 0 ? (p.referralCount / p.views) * 100 : 0),
    revenueGenerated: p.revenueGenerated || 0,
  }));

  const topPerformer = promotersWithStats.length > 0 
    ? promotersWithStats.reduce((max, p) => (p.revenueGenerated || 0) > (max.revenueGenerated || 0) ? p : max)
    : null;
  
  const avgConversionRate = promotersWithStats.length > 0
    ? promotersWithStats.reduce((sum, p) => sum + (p.conversionRate || 0), 0) / promotersWithStats.length
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        ref={backdropRef}
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-zinc-200"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-zinc-200 bg-zinc-50/30">
          <div>
            <h3 className="font-caveat text-4xl font-bold text-zinc-900 leading-none">
              {stats?.trip.title || "Estadísticas del Viaje"}
            </h3>
            <p className="text-xs text-zinc-500 mt-2 font-medium uppercase tracking-widest">
              Expedition Analytics Performance
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
            {/* Progress line base - behind everything */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-100 -translate-y-1/2 z-0" />
            {/* Progress line active - smooth transition */}
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-[1] transition-all duration-500 ease-out"
              style={{ 
                width: currentStep === 0 
                  ? '0%' 
                  : currentStep === steps.length - 1
                  ? '100%'
                  : `${(currentStep / (steps.length - 1)) * 100}%`
              }}
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
                    {isCompleted ? (
                      <CheckCircle className="size-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-semibold tracking-wide uppercase",
                    isActive && "font-bold"
                  )}>
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
          ) : stats ? (
            <>
              {/* Step 1: Stats */}
              {currentStep === 0 && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                        Total Revenue
                      </span>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-zinc-900">
                          {formatCurrency(stats.totalStats.totalRevenue, stats.totalStats.currency)}
                        </span>
                        {revenueChange !== 0 && (
                          <span className={cn(
                            "text-xs font-medium mb-1 flex items-center",
                            revenueChange >= 0 ? "text-emerald-600" : "text-red-600"
                          )}>
                            <TrendingUp className="size-3 mr-0.5" />
                            {revenueChange >= 0 ? "+" : ""}{revenueChange.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                        Tickets Sold
                      </span>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-zinc-900">
                          {occupiedSeats} / {totalSeats || "—"}
                        </span>
                        {totalSeats > 0 && (
                          <span className="text-xs font-medium text-primary mb-1">
                            {occupancyPercentage}% Capacity
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                        Views-to-Booking
                      </span>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-zinc-900">
                          {conversionRate.toFixed(1)}%
                        </span>
                        <span className="text-xs font-medium text-zinc-500 mb-1">
                          Avg. 3.1%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Promoters */}
                  {promotersWithStats.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
                          Active Promoters
                        </h4>
                        <button className="text-xs font-semibold text-primary hover:underline">
                          View All
                        </button>
                      </div>
                      <div className="border border-zinc-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-zinc-50/50 border-b border-zinc-200">
                            <tr>
                              <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase">
                                Promoter Code
                              </th>
                              <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase text-center">
                                Views
                              </th>
                              <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase text-right">
                                Sales Generated
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200">
                            {promotersWithStats.slice(0, 2).map((promoter) => (
                              <tr key={promoter.id || promoter.code}>
                                <td className="px-6 py-3 font-medium text-zinc-900">
                                  {promoter.code}
                                </td>
                                <td className="px-6 py-3 text-center text-zinc-600">
                                  {promoter.views.toLocaleString()}
                                </td>
                                <td className="px-6 py-3 text-right font-semibold">
                                  {formatCurrency(promoter.revenueGenerated || 0, stats.totalStats.currency)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Discount Codes */}
                  {stats.discountCodes.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
                          Discount Codes (SKU Tracking)
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {stats.discountCodes.slice(0, 2).map((code, idx) => {
                          const status = getDiscountStatus(code);
                          const usagePercentage = code.maxUses ? Math.round((code.usedCount / code.maxUses) * 100) : 0;
                          const remaining = code.maxUses ? code.maxUses - code.usedCount : null;
                          
                          return (
                            <div
                              key={idx}
                              className={cn(
                                "p-4 rounded-xl border bg-white flex items-center justify-between shadow-sm",
                                status.label === "Active" && "border-indigo-100 bg-indigo-50/30",
                                status.label === "Near Limit" && "border-amber-200",
                                status.label === "Expired" && "border-zinc-200 bg-zinc-50/50 opacity-75"
                              )}
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-mono font-bold text-zinc-900 px-2 py-0.5 bg-zinc-100 rounded">
                                    {code.code}
                                  </span>
                                  <span className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                                    status.color
                                  )}>
                                    {status.label}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-500">
                                  {code.discountType === "PERCENTAGE" 
                                    ? `${code.value}% discount` 
                                    : `${formatCurrency(code.value, stats.totalStats.currency)} fixed credit`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-zinc-900">
                                  {code.usedCount} / {code.maxUses || "∞"} Used
                                </p>
                                {remaining !== null && (
                                  <p className={cn(
                                    "text-[10px] font-medium",
                                    remaining > 0 ? "text-emerald-600" : "text-zinc-400"
                                  )}>
                                    {remaining} Remaining
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recent Transactions */}
                  {stats.bookingHistory.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
                          Recent Transactions
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {stats.bookingHistory.slice(0, 2).map((booking) => {
                          const PaymentIcon = getPaymentMethodIcon(booking.paymentMethod);
                          const initials = booking.customer.name
                            .split(" ")
                            .map(n => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2);
                          
                          return (
                            <div
                              key={booking.idBooking}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 transition-colors border-b border-zinc-100"
                            >
                              <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold">
                                  {initials}
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-zinc-900">
                                    {booking.customer.name}
                                  </p>
                                  <p className="text-[10px] text-zinc-500">
                                    {formatDateTime(booking.dateBuy)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-zinc-900">
                                  {formatCurrency(booking.totalBuy, booking.currency)}
                                </p>
                                <p className="text-[10px] text-zinc-400 font-medium flex items-center justify-end gap-1">
                                  <PaymentIcon className="size-3" />
                                  {booking.paymentMethod || "Payment"}
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

              {/* Step 2: Promoters */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-zinc-900">Active Promoters</h4>
                      <p className="text-xs text-zinc-500">
                        Tracking affiliate performance and engagement metrics.
                      </p>
                    </div>
                    <button className="flex items-center gap-2 bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors shadow-sm">
                      <User className="size-3" />
                      Invite Promoter
                    </button>
                  </div>

                  {promotersWithStats.length > 0 ? (
                    <>
                      <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-zinc-50/50 border-b border-zinc-200">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                Promoter Name
                              </th>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                Unique Code
                              </th>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                                Page Views
                              </th>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                                Conversion Rate (%)
                              </th>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">
                                Revenue Generated
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200">
                            {promotersWithStats.map((promoter) => {
                              const initials = promoter.name
                                .split(" ")
                                .map(n => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2);
                              
                              return (
                                <tr key={promoter.id || promoter.code} className="hover:bg-zinc-50/30 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="size-8 rounded-full bg-indigo-50 flex items-center justify-center text-primary font-bold text-[10px]">
                                        {initials}
                                      </div>
                                      <span className="font-medium text-zinc-900">{promoter.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 font-mono text-xs text-primary font-semibold">
                                    {promoter.code}
                                  </td>
                                  <td className="px-6 py-4 text-center text-zinc-600">
                                    {promoter.views.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    {promoter.conversionRate > 0 ? (
                                      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                                        {promoter.conversionRate.toFixed(1)}%{" "}
                                        <TrendingUp className="size-[10px]" />
                                      </span>
                                    ) : (
                                      <span className="text-zinc-600 font-medium">
                                        {promoter.conversionRate.toFixed(1)}%
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-right font-bold text-zinc-900">
                                    {formatCurrency(promoter.revenueGenerated || 0, stats.totalStats.currency)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {topPerformer && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg border border-zinc-200">
                                <Users className="size-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                  Top Performer
                                </p>
                                <p className="text-sm font-semibold text-zinc-900">{topPerformer.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-emerald-600">
                                {promotersWithStats.length > 0
                                  ? Math.round((topPerformer.revenueGenerated || 0) / promotersWithStats.reduce((sum, p) => sum + (p.revenueGenerated || 0), 0) * 100)
                                  : 0}% of total
                              </p>
                            </div>
                          </div>
                          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg border border-zinc-200">
                                <TrendingUp className="size-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                  Avg. Conversion
                                </p>
                                <p className="text-sm font-semibold text-zinc-900">
                                  {avgConversionRate.toFixed(2)}%
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-zinc-900">+0.4% MoM</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <User className="size-16 text-zinc-300 mx-auto mb-4" />
                      <p className="text-zinc-600">Este viaje no tiene promotores asociados</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Discounts */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-zinc-900">Discount Code Inventory</h4>
                      <p className="text-sm text-zinc-500">
                        Track SKU usage and limit status for active promotions.
                      </p>
                    </div>
                    <button className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-zinc-100 transition-colors">
                      <Tag className="size-3" />
                      New Code
                    </button>
                  </div>

                  {stats.discountCodes.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stats.discountCodes.map((code, idx) => {
                          const status = getDiscountStatus(code);
                          const usagePercentage = code.maxUses ? Math.round((code.usedCount / code.maxUses) * 100) : 0;
                          const remaining = code.maxUses ? code.maxUses - code.usedCount : null;
                          const sku = code.sku || `DISC-${code.code.slice(0, 2).toUpperCase()}-${String(idx + 1).padStart(2, "0")}`;
                          
                          return (
                            <div
                              key={idx}
                              className={cn(
                                "p-5 rounded-xl border bg-white hover:border-primary/20 transition-all shadow-sm group",
                                status.label === "Active" && "border-zinc-200",
                                status.label === "Near Limit" && "border-amber-200",
                                status.label === "Expired" && "border-zinc-200 bg-zinc-50/50 opacity-75"
                              )}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-mono font-bold text-zinc-900 px-2 py-0.5 bg-zinc-100 rounded">
                                      {code.code}
                                    </span>
                                    <span className={cn(
                                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                                      status.color
                                    )}>
                                      {status.label}
                                    </span>
                                  </div>
                                  <p className="text-xs text-zinc-500">
                                    {code.discountType === "PERCENTAGE"
                                      ? `${code.value}% discount on base price`
                                      : `${formatCurrency(code.value, stats.totalStats.currency)} fixed credit`}
                                  </p>
                                </div>
                                <button className="text-zinc-300 hover:text-zinc-600 transition-colors">
                                  <X className="size-4" />
                                </button>
                              </div>
                              <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                      Usage Limit
                                    </span>
                                    <span className="text-sm font-semibold text-zinc-900">
                                      {code.usedCount} / {code.maxUses || "∞"}{" "}
                                      <span className="text-xs text-zinc-400 font-normal">used</span>
                                    </span>
                                  </div>
                                  <span className={cn(
                                    "text-[10px] font-bold",
                                    usagePercentage >= 90 ? "text-amber-600" : "text-primary"
                                  )}>
                                    {usagePercentage}%
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all",
                                      usagePercentage >= 90 ? "bg-amber-500" : "bg-primary"
                                    )}
                                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                  />
                                </div>
                                <div className="flex items-center gap-4 pt-2">
                                  {code.expiresAt && (
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="size-[14px] text-zinc-400" />
                                      <span className="text-[10px] text-zinc-500">
                                        Expires {formatDate(code.expiresAt)}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1.5">
                                    <Tag className="size-[14px] text-zinc-400" />
                                    <span className="text-[10px] text-zinc-500">SKU: {sku}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Recent Redemption SKU Log */}
                      <div className="mt-8 space-y-4">
                        <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          Recent Redemption SKU Log
                        </h5>
                        <div className="border border-zinc-200 rounded-xl overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 border-b border-zinc-200">
                              <tr>
                                <th className="px-6 py-3 font-bold text-zinc-400 uppercase tracking-wider">
                                  SKU
                                </th>
                                <th className="px-6 py-3 font-bold text-zinc-400 uppercase tracking-wider">
                                  Customer
                                </th>
                                <th className="px-6 py-3 font-bold text-zinc-400 uppercase tracking-wider">
                                  Discount
                                </th>
                                <th className="px-6 py-3 font-bold text-zinc-400 uppercase tracking-wider text-right">
                                  Applied At
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200">
                              {stats.bookingHistory
                                .filter(b => b.discountCode && b.discountAmount)
                                .slice(0, 2)
                                .map((booking, idx) => {
                                  const discountCode = stats.discountCodes.find(c => c.code === booking.discountCode);
                                  const sku = discountCode?.sku || 
                                            `DISC-${booking.discountCode?.slice(0, 2).toUpperCase()}-${String(idx + 1).padStart(3, "0")}`;
                                  
                                  return (
                                    <tr key={booking.idBooking}>
                                      <td className="px-6 py-3 font-mono text-zinc-600">{sku}</td>
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
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Tag className="size-16 text-zinc-300 mx-auto mb-4" />
                      <p className="text-zinc-600">Este viaje no tiene códigos de descuento</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Reviews */}
              {currentStep === 3 && (
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
                      <MessageSquare className="size-16 text-zinc-300 mx-auto mb-4" />
                      <p className="text-zinc-600">Aún no hay reseñas para este viaje</p>
                      <p className="text-xs text-zinc-500 mt-1">Las reseñas aparecerán aquí cuando los clientes las publiquen</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Sales */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
                      Comprehensive Transaction Log
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 text-[10px] font-bold text-zinc-600 uppercase">
                        {stats.bookingHistory.length} Successful Payments
                      </span>
                    </div>
                  </div>

                  {stats.bookingHistory.length > 0 ? (
                    <>
                      <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-200">
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                Booking Date
                              </th>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                Customer
                              </th>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                                Seats
                              </th>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                Total Paid
                              </th>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                Method
                              </th>
                              <th className="px-6 py-4 text-right"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200">
                            {stats.bookingHistory.map((booking) => {
                              const PaymentIcon = getPaymentMethodIcon(booking.paymentMethod);
                              const initials = booking.customer.name
                                .split(" ")
                                .map(n => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2);
                              const totalSeats = booking.bookingItems.reduce((sum, item) => sum + item.quantity, 0);
                              
                              return (
                                <tr key={booking.idBooking} className="hover:bg-zinc-50/50 transition-colors">
                                  <td className="px-6 py-4 text-xs text-zinc-600 font-medium">
                                    {formatDate(booking.dateBuy)}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="size-8 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-primary">
                                        {initials}
                                      </div>
                                      <span className="text-sm font-semibold text-zinc-900">
                                        {booking.customer.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span className="text-xs font-medium text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full">
                                      {totalSeats}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-zinc-900">
                                      {formatCurrency(booking.totalBuy, booking.currency)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <PaymentIcon className="size-4 text-zinc-400" />
                                      <span className="text-xs text-zinc-500">
                                        {booking.paymentMethod || "Payment"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      className="p-2 text-zinc-400 hover:text-primary transition-colors hover:bg-indigo-50 rounded-lg"
                                      title="Download Receipt"
                                    >
                                      <Receipt className="size-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium uppercase tracking-wider px-2">
                        <p>Showing {stats.bookingHistory.length} of {stats.bookingHistory.length} transactions</p>
                        <div className="flex items-center gap-4">
                          <button className="hover:text-zinc-900 flex items-center gap-1 transition-colors">
                            <ChevronLeft className="size-3" />
                            Previous
                          </button>
                          <button className="hover:text-zinc-900 flex items-center gap-1 transition-colors">
                            Next
                            <ChevronRight className="size-3" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="size-16 text-zinc-300 mx-auto mb-4" />
                      <p className="text-zinc-600">No hay historial de transacciones disponible</p>
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
        <div className="px-8 py-5 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
          <button
            onClick={() => {}}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-2"
          >
            <Download className="size-4" />
            {currentStep === 0 && "Export Report"}
            {currentStep === 1 && "Export Promoter Report"}
            {currentStep === 2 && "Export CSV Report"}
            {currentStep === 3 && "Export Reviews (CSV)"}
            {currentStep === 4 && "Export All Sales (CSV)"}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={cn(
                "px-4 py-2 text-sm font-medium border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors",
                currentStep === 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              {currentStep === 0 ? "Close" : "Previous"}
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Next: {steps[currentStep + 1].label}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-8 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
