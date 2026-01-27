"use client";

import { X, Calendar, MapPin, Users, DollarSign, Building2, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type BookingDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    idBooking?: string;
    id?: string;
    status: string;
    totalBuy: number;
    currency?: string;
    totalPersons?: number;
    trip?: {
      title?: string;
      description?: string;
      coverImage?: string;
      city?: {
        nameCity?: string;
      };
      agency?: {
        nameAgency?: string;
        picture?: string;
      };
    };
    expedition?: {
      startDate?: string;
      endDate?: string;
      dates?: string;
      duration?: string;
    };
    bookingItems?: Array<{
      adults?: number;
      children?: number;
    }>;
  } | null;
};

export function BookingDetailsModal({ isOpen, onClose, booking }: BookingDetailsModalProps) {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No disponible";
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number, currency: string = "COP") => {
    try {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: currency || "COP",
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${currency || "COP"} ${amount.toLocaleString()}`;
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      CONFIRMED: {
        label: "Confirmado",
        className: "bg-green-50 text-green-700 border-green-200",
      },
      PENDING: {
        label: "Pendiente",
        className: "bg-orange-50 text-orange-700 border-orange-200",
      },
      CANCELLED: {
        label: "Cancelado",
        className: "bg-red-50 text-red-700 border-red-200",
      },
      REJECTED: {
        label: "Rechazado",
        className: "bg-red-50 text-red-700 border-red-200",
      },
    };
    return statusMap[status] || { label: status, className: "bg-gray-50 text-gray-700 border-gray-200" };
  };

  const statusInfo = getStatusLabel(booking.status);
  const expedition = booking.expedition || {};
  const trip = booking.trip || {};
  const adults = booking.bookingItems?.reduce((sum, item) => sum + (item.adults || 0), 0) || 0;
  const children = booking.bookingItems?.reduce((sum, item) => sum + (item.children || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="size-5" />
          </button>
          
          <div className="pr-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Detalles de la Reserva
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID: {booking.idBooking || booking.id || "N/A"}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Imagen del viaje */}
          {trip.coverImage && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden">
              <img
                src={trip.coverImage}
                alt={trip.title || "Viaje"}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Información del viaje */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {trip.title || "Viaje sin título"}
              </h3>
              {trip.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {trip.description}
                </p>
              )}
            </div>

            {/* Estado */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>

            {/* Información de fechas y ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Calendar className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Fechas
                  </p>
                  {expedition.dates ? (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {expedition.dates}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Salida: {formatDate(expedition.startDate)}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Regreso: {formatDate(expedition.endDate)}
                      </p>
                    </div>
                  )}
                  {expedition.duration && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Duración: {expedition.duration}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <MapPin className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Destino
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {trip.city?.nameCity || "Ubicación no disponible"}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de viajeros */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <Users className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Viajeros
                </p>
                <div className="space-y-1">
                  {adults > 0 && (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {adults} {adults === 1 ? "Adulto" : "Adultos"}
                    </p>
                  )}
                  {children > 0 && (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {children} {children === 1 ? "Niño" : "Niños"}
                    </p>
                  )}
                  {booking.totalPersons && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total: {booking.totalPersons} {booking.totalPersons === 1 ? "persona" : "personas"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de la agencia */}
            {trip.agency && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Building2 className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Agencia
                  </p>
                  <div className="flex items-center gap-2">
                    {trip.agency.picture && (
                      <img
                        src={trip.agency.picture}
                        alt={trip.agency.nameAgency}
                        className="size-8 rounded-full object-cover"
                      />
                    )}
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {trip.agency.nameAgency}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Precio total */}
            <div className="flex items-center justify-between p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
              <div className="flex items-center gap-3">
                <DollarSign className="size-5 text-primary" />
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Monto Total
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(booking.totalBuy, booking.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
