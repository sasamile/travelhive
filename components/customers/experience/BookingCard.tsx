"use client";

import { BadgeCheck, CalendarDays, Minus, Plus, Ticket } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import type { Expedition } from "@/types/trips";

type BookingCardProps = {
  idTrip: string;
  expeditions?: Expedition[] | null;
  priceFallback?: number | null;
  currencyFallback?: string | null;
  startDateFallback?: string | null;
  endDateFallback?: string | null;
  maxPersons?: number | null;
  promoterCode?: string;
};

export function BookingCard({
  idTrip,
  expeditions,
  priceFallback,
  currencyFallback = "COP",
  startDateFallback,
  endDateFallback,
  maxPersons,
  promoterCode,
}: BookingCardProps) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "A confirmar";
    try {
      return format(new Date(dateString), "d MMM, yyyy", { locale: es });
    } catch {
      return "A confirmar";
    }
  };

  const formatAmount = (value?: number | null) => {
    if (!value) return "Consultar precio";
    return new Intl.NumberFormat("es-CO", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const toDateInputValue = (iso?: string | null) => {
    if (!iso) return "";
    try {
      // yyyy-mm-dd
      return new Date(iso).toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  const buildIsoWithFallbackTime = (
    dateYYYYMMDD: string,
    fallbackIso?: string | null
  ) => {
    // Usa la hora del viaje (fallbackIso) para evitar quedar fuera por timezone (ej. 05:00Z)
    const [y, m, d] = dateYYYYMMDD.split("-").map((n) => parseInt(n, 10));
    if (!y || !m || !d) return new Date(dateYYYYMMDD).toISOString();

    let hh = 0,
      mm = 0,
      ss = 0,
      ms = 0;
    if (fallbackIso) {
      const f = new Date(fallbackIso);
      if (!isNaN(f.getTime())) {
        hh = f.getUTCHours();
        mm = f.getUTCMinutes();
        ss = f.getUTCSeconds();
        ms = f.getUTCMilliseconds();
      }
    }
    return new Date(Date.UTC(y, m - 1, d, hh, mm, ss, ms)).toISOString();
  };

  // Filtrar expediciones disponibles: no canceladas
  // NO filtrar por capacityAvailable aquí, porque queremos mostrar todas las expediciones
  // incluso si están sin cupo, para que el usuario pueda verlas
  const availableExpeditions = useMemo(
    () =>
      (expeditions || [])
        .filter(Boolean)
        .filter((e) => e.status !== "CANCELLED")
        .slice(),
    [expeditions]
  );

  // Filtrar expediciones con cupo disponible para determinar si mostrar selector de fechas
  const expeditionsWithCapacity = useMemo(
    () =>
      availableExpeditions.filter((e) => {
        // Incluir expediciones con cupo disponible (capacityAvailable > 0)
        // O si capacityAvailable es null/undefined, asumir que hay cupo
        return e.capacityAvailable === null || e.capacityAvailable === undefined || e.capacityAvailable > 0;
      }),
    [availableExpeditions]
  );

  // Si hay expediciones con cupo, usar la primera; si no, modo "crear nueva"
  const [selectedExpeditionId, setSelectedExpeditionId] = useState<string>(
    expeditionsWithCapacity[0]?.idExpedition || ""
  );
  const [persons, setPersons] = useState(1);
  const [discountCode, setDiscountCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validatingDiscount, setValidatingDiscount] = useState(false);
  const [discountData, setDiscountData] = useState<{
    isValid: boolean;
    code: string;
    originalSubtotal: number;
    discountAmount: number;
    total: number;
    currency: string;
  } | null>(null);

  // Para reservar "desde viaje" cuando no hay expediciones
  // Calcular la fecha mínima: máximo entre la fecha actual y la fecha de inicio del viaje
  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche
    const todayStr = today.toISOString().slice(0, 10); // yyyy-mm-dd
    
    const tripStart = startDateFallback ? toDateInputValue(startDateFallback) : "";
    
    // Si no hay fecha de inicio del viaje, usar hoy
    if (!tripStart) return todayStr;
    
    // Usar la fecha más reciente entre hoy y la fecha de inicio del viaje
    return tripStart > todayStr ? tripStart : todayStr;
  };

  const getMaxDate = () => {
    return toDateInputValue(endDateFallback) || "";
  };

  const tripMinDate = getMinDate();
  const tripMaxDate = getMaxDate();

  // Inicializar fechas con valores válidos (no en el pasado)
  const getInitialStartDate = () => {
    const minDate = tripMinDate;
    const fallbackDate = toDateInputValue(startDateFallback);
    
    // Si la fecha de inicio del viaje es en el pasado, usar la fecha mínima (hoy)
    if (fallbackDate && fallbackDate < minDate) {
      return minDate;
    }
    return fallbackDate || minDate;
  };

  const getInitialEndDate = () => {
    const maxDate = tripMaxDate;
    const fallbackDate = toDateInputValue(endDateFallback);
    
    // Si la fecha de fin del viaje es en el pasado, usar la fecha máxima disponible
    if (fallbackDate && fallbackDate < tripMinDate) {
      return maxDate || tripMinDate;
    }
    return fallbackDate || maxDate;
  };

  const [fromTripStart, setFromTripStart] = useState(getInitialStartDate());
  const [fromTripEnd, setFromTripEnd] = useState(getInitialEndDate());

  const selectedExpedition = useMemo(() => {
    const found = availableExpeditions.find(
      (e) => e.idExpedition === selectedExpeditionId
    );
    return found || expeditionsWithCapacity[0] || null;
  }, [availableExpeditions, expeditionsWithCapacity, selectedExpeditionId]);

  const startDate = selectedExpedition?.startDate || startDateFallback || null;
  const endDate = selectedExpedition?.endDate || endDateFallback || null;

  const currency =
    selectedExpedition?.currency || currencyFallback || "COP";

  const displayPrice =
    selectedExpedition?.priceAdult ?? priceFallback ?? null;

  const capacityAvailable =
    selectedExpedition?.capacityAvailable ?? null;
  const maxAllowed = typeof maxPersons === "number" ? maxPersons : null;
  const maxByCapacity =
    typeof capacityAvailable === "number" ? capacityAvailable : null;
  const effectiveMax =
    maxAllowed !== null && maxByCapacity !== null
      ? Math.min(maxAllowed, maxByCapacity)
      : maxAllowed ?? maxByCapacity ?? null;
  const isOverMax = maxAllowed !== null && persons > maxAllowed;
  const isAtMax = effectiveMax !== null && persons >= effectiveMax;

  // Calcular precio total con descuento aplicado
  const calculateTotalPrice = () => {
    if (!displayPrice) return null;
    
    const subtotal = displayPrice * persons;
    
    // Si hay un código de descuento válido aplicado, usar ese total
    if (discountData?.isValid) {
      return discountData.total;
    }
    
    return subtotal;
  };

  const finalPrice = calculateTotalPrice();
  const originalSubtotal = displayPrice 
    ? displayPrice * persons
    : null;

  const bumpPersons = (delta: number) => {
    const newPersons = persons + delta;
    if (delta > 0 && effectiveMax !== null && newPersons > effectiveMax) {
      toast.error(`Máximo ${effectiveMax} persona(s)`);
      return;
    }
    if (newPersons < 1) {
      toast.error("Debe haber al menos 1 persona");
      return;
    }
    setPersons(newPersons);
    // Limpiar descuento cuando cambian las personas
    if (discountData) {
      setDiscountData(null);
    }
  };

  // Función para validar y aplicar código de descuento
  const validateAndApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error("Ingresa un código de descuento");
      return;
    }

    if (!fromTripStart || !fromTripEnd) {
      toast.error("Selecciona las fechas de tu viaje primero");
      return;
    }

    if (persons === 0) {
      toast.error("Selecciona al menos una persona");
      return;
    }

    try {
      setValidatingDiscount(true);
      
      const startIso = buildIsoWithFallbackTime(fromTripStart, startDateFallback);
      const endIso = buildIsoWithFallbackTime(fromTripEnd, endDateFallback);

      const response = await api.post("/bookings/validate-discount", {
        idTrip,
        startDate: startIso,
        endDate: endIso,
        adults: persons,
        children: 0,
        discountCode: discountCode.trim().toUpperCase(),
      });

      if (response.data?.data?.isValid) {
        setDiscountData(response.data.data);
        toast.success("¡Código de descuento aplicado!");
      } else {
        setDiscountData(null);
        toast.error(response.data?.message || "Código de descuento inválido");
      }
    } catch (err: any) {
      setDiscountData(null);
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          "No se pudo validar el código de descuento";
      toast.error(errorMessage);
    } finally {
      setValidatingDiscount(false);
    }
  };

  // Limpiar descuento cuando cambia el código manualmente
  const handleDiscountCodeChange = (value: string) => {
    setDiscountCode(value);
    if (discountData) {
      setDiscountData(null);
    }
  };

  const canReserve =
    Boolean(selectedExpedition?.idExpedition) &&
    persons > 0 &&
    !isOverMax &&
    (capacityAvailable === null || capacityAvailable >= persons);

  // Verificar si hay cupo disponible para las fechas seleccionadas
  const hasCapacityForSelectedDates = useMemo(() => {
    if (!fromTripStart || !fromTripEnd) return true; // Si no hay fechas seleccionadas, permitir (se validará después)
    
    // Buscar expediciones existentes que coincidan con las fechas seleccionadas
    const matchingExpeditions = availableExpeditions.filter((exp) => {
      if (!exp.startDate || !exp.endDate) return false;
      
      const expStart = new Date(exp.startDate).toISOString().slice(0, 10);
      const expEnd = new Date(exp.endDate).toISOString().slice(0, 10);
      
      // Verificar si las fechas seleccionadas se solapan con la expedición existente
      return (
        (fromTripStart >= expStart && fromTripStart <= expEnd) ||
        (fromTripEnd >= expStart && fromTripEnd <= expEnd) ||
        (fromTripStart <= expStart && fromTripEnd >= expEnd)
      );
    });
    
    // Si hay expediciones que coinciden, verificar capacidad
    if (matchingExpeditions.length > 0) {
      // Verificar si alguna tiene cupo disponible
      const hasAvailableCapacity = matchingExpeditions.some((exp) => {
        const capacity = exp.capacityAvailable ?? null;
        // Si capacityAvailable es null/undefined, asumir que hay cupo
        // Si es un número, debe ser >= a las personas solicitadas
        return capacity === null || capacity === undefined || capacity >= persons;
      });
      
      return hasAvailableCapacity;
    }
    
    // Si no hay expediciones que coincidan, asumir que se puede crear una nueva (hay cupo)
    return true;
  }, [fromTripStart, fromTripEnd, availableExpeditions, persons]);

  // Siempre usar selector de fechas (nunca mostrar select de expediciones)
  const canReserveFromTrip =
    Boolean(fromTripStart) &&
    Boolean(fromTripEnd) &&
    persons > 0 &&
    !isOverMax &&
    hasCapacityForSelectedDates;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-2xl shadow-gray-200/50 dark:shadow-none">
      <div className="mb-8 space-y-3">
        <div className="space-y-2">
          {discountData?.isValid && finalPrice !== null ? (
            <>
              <div className="flex items-end gap-2 max-w-full">
                <span className="text-xl md:text-3xl font-extrabold text-primary leading-none wrap-break-word">
                  {formatAmount(finalPrice)}
                </span>
                <span className="shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-gray-600 dark:text-gray-300">
                  {(discountData.currency || currency || "COP").toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  {formatAmount(originalSubtotal)} {(currency || "COP").toUpperCase()}
                </span>
                <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                  Ahorras {formatAmount(discountData.discountAmount)} {(discountData.currency || currency || "COP").toUpperCase()}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-end gap-2 max-w-full">
              <span className="text-xl md:text-3xl font-extrabold text-primary leading-none wrap-break-word">
                {finalPrice !== null ? formatAmount(finalPrice) : formatAmount(displayPrice)}
              </span>
              <span className="shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-gray-600 dark:text-gray-300">
                {(currency || "COP").toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm font-bold text-[#121717] dark:text-white">
          <BadgeCheck className="size-4 text-primary" />
          <span>Todo incluido</span>
        </div>
      </div>
      <div className="space-y-4 mb-8">
        {/* Siempre mostrar selector de fechas, nunca un select de expediciones */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-extrabold tracking-tight">
                Selecciona tus fechas
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Elige las fechas de inicio y fin de tu viaje
              </p>
            </div>
          </div>

            <div className="mt-4 space-y-3">
              {/* Mensaje de error si no hay cupo disponible */}
              {fromTripStart && fromTripEnd && !hasCapacityForSelectedDates && (
                <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                        No hay cupos disponibles
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        No hay disponibilidad para las fechas seleccionadas. Por favor, elige otras fechas.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Fechas
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Salida
                    </span>
                    <input
                      type="date"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900"
                      value={fromTripStart}
                      min={tripMinDate || undefined}
                      max={tripMaxDate || undefined}
                      onChange={(e) => {
                        const next = e.target.value;
                        // Validar que la fecha no sea en el pasado
                        const today = new Date().toISOString().slice(0, 10);
                        if (next < today) {
                          toast.error("No puedes seleccionar fechas en el pasado");
                          return;
                        }
                        setFromTripStart(next);
                        // Mantener end >= start y ambos dentro del rango
                        if (fromTripEnd && next && fromTripEnd < next) {
                          setFromTripEnd(next);
                        }
                        // Limpiar descuento cuando cambian las fechas
                        if (discountData) {
                          setDiscountData(null);
                        }
                      }}
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Regreso
                    </span>
                    <input
                      type="date"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900"
                      value={fromTripEnd}
                      min={fromTripStart || tripMinDate || undefined}
                      max={tripMaxDate || undefined}
                      onChange={(e) => {
                        const next = e.target.value;
                        // Validar que la fecha no sea en el pasado
                        const today = new Date().toISOString().slice(0, 10);
                        if (next < today) {
                          toast.error("No puedes seleccionar fechas en el pasado");
                          return;
                        }
                        setFromTripEnd(next);
                        // Si end < start, ajustar start hacia end
                        if (fromTripStart && next && next < fromTripStart) {
                          setFromTripStart(next);
                        }
                        // Limpiar descuento cuando cambian las fechas
                        if (discountData) {
                          setDiscountData(null);
                        }
                      }}
                      disabled={submitting}
                    />
                  </div>
                </div>
                {(startDateFallback || endDateFallback) && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Rango permitido:{" "}
                    <span className="font-semibold">
                      {formatDate(startDateFallback)} - {formatDate(endDateFallback)}
                    </span>
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
                      Cantidad de personas
                    </p>
                    {typeof displayPrice === "number" && (
                      <p className="mt-1 text-xs text-gray-500">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency,
                          maximumFractionDigits: 0,
                        }).format(displayPrice)}{" "}
                        / persona
                      </p>
                    )}
                  </div>

                  <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                    <button
                      type="button"
                      className="h-9 w-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => bumpPersons(-1)}
                      disabled={submitting || persons <= 1}
                      aria-label="Restar persona"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="h-9 w-12 flex items-center justify-center font-extrabold tabular-nums">
                      {persons}
                    </div>
                    <button
                      type="button"
                      className="h-9 w-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => bumpPersons(1)}
                      disabled={submitting || isAtMax}
                      aria-label="Sumar persona"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 overflow-hidden">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Código de descuento {discountData?.isValid && <span className="text-green-600 dark:text-green-400">• Aplicado</span>}
                </label>
                {discountData?.isValid ? (
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300 truncate min-w-0">
                        {discountData.code}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountData(null);
                        setDiscountCode("");
                        toast.success("Código de descuento removido");
                      }}
                      className="shrink-0 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors whitespace-nowrap"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 min-w-0 w-full">
                    <div className="shrink-0 flex items-center justify-center">
                      <Ticket className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      className="flex-1 min-w-0 h-10 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm font-semibold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-gray-800"
                      placeholder="Ingresa tu código"
                      value={discountCode}
                      onChange={(e) => handleDiscountCodeChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !validatingDiscount && discountCode.trim()) {
                          e.preventDefault();
                          validateAndApplyDiscount();
                        }
                      }}
                      disabled={submitting || validatingDiscount}
                    />
                    <button
                      type="button"
                      onClick={validateAndApplyDiscount}
                      disabled={submitting || validatingDiscount || !discountCode.trim()}
                      className="shrink-0 h-10 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {validatingDiscount ? "..." : "Aplicar"}
                    </button>
                  </div>
                )}
              </div>

              {typeof maxPersons === "number" && (
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                  Máx. por reserva: <span className="font-semibold">{maxPersons}</span>
                </p>
              )}
            </div>
          </div>
      </div>
      <button
        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={submitting || !canReserveFromTrip}
        onClick={async () => {
          try {
            setSubmitting(true);
            // No enviar redirectUrl (backend valida estrictamente)

            let res;
            
            // Siempre usar el modo "from-trip" para crear expedición automáticamente
            // Esto permite al usuario seleccionar cualquier rango de fechas válido
            if (!fromTripStart || !fromTripEnd) {
              toast.error("Selecciona fechas de inicio y fin");
              return;
            }

            // Validar por día (YYYY-MM-DD) para evitar problemas de zona horaria
            if (fromTripStart > fromTripEnd) {
              toast.error("La fecha de inicio debe ser anterior a la fecha de fin");
              return;
            }

            // Validar rango si el viaje lo trae
            if (tripMinDate && fromTripStart < tripMinDate) {
              toast.error("Las fechas deben estar dentro del rango del viaje");
              return;
            }
            if (tripMaxDate && fromTripEnd > tripMaxDate) {
              toast.error("Las fechas deben estar dentro del rango del viaje");
              return;
            }

            // Validar que no sean fechas en el pasado
            const today = new Date().toISOString().slice(0, 10);
            if (fromTripStart < today) {
              toast.error("No puedes seleccionar fechas en el pasado");
              return;
            }

            // Verificar capacidad disponible antes de crear la reserva
            const matchingExpeditions = availableExpeditions.filter((exp) => {
              if (!exp.startDate || !exp.endDate) return false;
              
              const expStart = new Date(exp.startDate).toISOString().slice(0, 10);
              const expEnd = new Date(exp.endDate).toISOString().slice(0, 10);
              
              return (
                (fromTripStart >= expStart && fromTripStart <= expEnd) ||
                (fromTripEnd >= expStart && fromTripEnd <= expEnd) ||
                (fromTripStart <= expStart && fromTripEnd >= expEnd)
              );
            });
            
            if (matchingExpeditions.length > 0) {
              // Verificar si hay cupo disponible en las expediciones existentes
              const availableCapacity = matchingExpeditions.reduce((total, exp) => {
                const capacity = exp.capacityAvailable ?? null;
                if (capacity === null || capacity === undefined) {
                  // Si no hay información de capacidad, asumir que hay cupo ilimitado
                  return total + 999;
                }
                return total + Math.max(0, capacity);
              }, 0);
              
              if (availableCapacity < persons) {
                toast.error(
                  `No hay cupos suficientes. Disponibles: ${availableCapacity}, Solicitados: ${persons}`
                );
                return;
              }
            }

            const startIso = buildIsoWithFallbackTime(
              fromTripStart,
              startDateFallback
            );
            const endIso = buildIsoWithFallbackTime(fromTripEnd, endDateFallback);

            // Solo enviar código de descuento si está validado y es válido
            const codeToSend = discountData?.isValid && discountData.code === discountCode.trim().toUpperCase()
              ? discountCode.trim().toUpperCase()
              : null;

            res = await api.post("/bookings/from-trip", {
              idTrip,
              startDate: startIso,
              endDate: endIso,
              adults: persons,
              children: 0,
              ...(codeToSend ? { discountCode: codeToSend } : {}),
              ...(promoterCode ? { promoterCode: promoterCode.toUpperCase() } : {}),
            });

            const wompiPaymentLink =
              res?.data?.data?.wompiPaymentLink ||
              res?.data?.wompiPaymentLink ||
              null;
            const idBooking =
              res?.data?.data?.idBooking || res?.data?.idBooking || null;

            toast.success("Reserva creada. Redirigiendo a pago...");
            if (typeof window !== "undefined" && idBooking) {
              localStorage.setItem("th_last_booking_id", String(idBooking));
              localStorage.setItem("th_last_booking_created_at", String(Date.now()));
            }
            if (wompiPaymentLink) {
              window.location.href = wompiPaymentLink;
              return;
            }

            toast(
              "La reserva se creó, pero no se generó link de pago. Revisa tus reservas.",
              { icon: "ℹ️" as any }
            );
          } catch (err: any) {
            toast.error(
              err?.response?.data?.message ||
                err?.message ||
                "No se pudo crear la reserva"
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {submitting ? "Creando reserva..." : "Reservar Ahora"}
      </button>
      <p className="text-center text-xs text-gray-400">
        Serás redirigido a Wompi para completar el pago
      </p>
    </div>
  );
}
