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
};

export function BookingCard({
  idTrip,
  expeditions,
  priceFallback,
  currencyFallback = "COP",
  startDateFallback,
  endDateFallback,
  maxPersons,
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

  const availableExpeditions = useMemo(
    () =>
      (expeditions || [])
        .filter(Boolean)
        .filter((e) => e.status !== "CANCELLED")
        .slice(),
    [expeditions]
  );

  const [selectedExpeditionId, setSelectedExpeditionId] = useState<string>(
    availableExpeditions[0]?.idExpedition || ""
  );
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Para reservar "desde viaje" cuando no hay expediciones
  const [fromTripStart, setFromTripStart] = useState(
    toDateInputValue(startDateFallback)
  );
  const [fromTripEnd, setFromTripEnd] = useState(toDateInputValue(endDateFallback));
  const tripMinDate = toDateInputValue(startDateFallback);
  const tripMaxDate = toDateInputValue(endDateFallback);

  const selectedExpedition = useMemo(() => {
    const found = availableExpeditions.find(
      (e) => e.idExpedition === selectedExpeditionId
    );
    return found || availableExpeditions[0] || null;
  }, [availableExpeditions, selectedExpeditionId]);

  const startDate = selectedExpedition?.startDate || startDateFallback || null;
  const endDate = selectedExpedition?.endDate || endDateFallback || null;

  const currency =
    selectedExpedition?.currency || currencyFallback || "COP";

  const displayPrice =
    selectedExpedition?.priceAdult ?? priceFallback ?? null;

  const capacityAvailable =
    selectedExpedition?.capacityAvailable ?? null;

  const persons = adults + children;
  const maxAllowed = typeof maxPersons === "number" ? maxPersons : null;
  const maxByCapacity =
    typeof capacityAvailable === "number" ? capacityAvailable : null;
  const effectiveMax =
    maxAllowed !== null && maxByCapacity !== null
      ? Math.min(maxAllowed, maxByCapacity)
      : maxAllowed ?? maxByCapacity ?? null;
  const isOverMax = maxAllowed !== null && persons > maxAllowed;
  const isAtMax = effectiveMax !== null && persons >= effectiveMax;

  const bumpAdults = (delta: number) => {
    if (delta > 0 && effectiveMax !== null && persons + delta > effectiveMax) {
      toast.error(`Máximo ${effectiveMax} persona(s)`);
      return;
    }
    setAdults((v) => Math.max(0, v + delta));
  };

  const bumpChildren = (delta: number) => {
    if (delta > 0 && effectiveMax !== null && persons + delta > effectiveMax) {
      toast.error(`Máximo ${effectiveMax} persona(s)`);
      return;
    }
    setChildren((v) => Math.max(0, v + delta));
  };

  const canReserve =
    Boolean(selectedExpedition?.idExpedition) &&
    persons > 0 &&
    adults >= 0 &&
    children >= 0 &&
    !isOverMax &&
    (capacityAvailable === null || capacityAvailable >= persons);

  const hasExpeditions = availableExpeditions.length > 0;
  const canReserveFromTrip =
    !hasExpeditions &&
    Boolean(fromTripStart) &&
    Boolean(fromTripEnd) &&
    persons > 0 &&
    !isOverMax;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-2xl shadow-gray-200/50 dark:shadow-none">
      <div className="mb-8 space-y-3">
        <div className="space-y-1">
          <div className="flex items-end gap-2 max-w-full">
            <span className="text-xl md:text-3xl font-extrabold text-primary leading-none wrap-break-word">
              {formatAmount(displayPrice)}
            </span>
            <span className="shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-gray-600 dark:text-gray-300">
              {(currency || "COP").toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-bold text-[#121717] dark:text-white">
          <BadgeCheck className="size-4 text-primary" />
          <span>Todo incluido</span>
        </div>
      </div>
      <div className="space-y-4 mb-8">
        {availableExpeditions.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold tracking-tight">
                  Reserva directa del viaje
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No hay expediciones creadas. Reservaremos creando la expedición automáticamente.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
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
                        setFromTripStart(next);
                        // Mantener end >= start y ambos dentro del rango
                        if (fromTripEnd && next && fromTripEnd < next) {
                          setFromTripEnd(next);
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
                        setFromTripEnd(next);
                        // Si end < start, ajustar start hacia end
                        if (fromTripStart && next && next < fromTripStart) {
                          setFromTripStart(next);
                        }
                      }}
                      disabled={submitting}
                    />
                  </div>
                </div>
                {(startDateFallback || endDateFallback) && (
                  <p className="mt-3 text-xs text-gray-500">
                    Rango permitido:{" "}
                    <span className="font-bold">
                      {formatDate(startDateFallback)} - {formatDate(endDateFallback)}
                    </span>
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                {([
                  {
                    label: "Adultos",
                    value: adults,
                    minusLabel: "Restar adulto",
                    plusLabel: "Sumar adulto",
                    bump: bumpAdults,
                  },
                  {
                    label: "Niños",
                    value: children,
                    minusLabel: "Restar niño",
                    plusLabel: "Sumar niño",
                    bump: bumpChildren,
                  },
                ] as const).map((c, idx) => (
                  <div
                    key={c.label}
                    className={[
                      "flex items-center justify-between gap-3 px-3 py-3",
                      idx === 0 ? "border-b border-gray-200 dark:border-gray-700" : "",
                    ].join(" ")}
                  >
                    <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
                      {c.label}
                    </span>
                    <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
                      <button
                        type="button"
                        className="h-9 w-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => c.bump(-1)}
                        disabled={submitting}
                        aria-label={c.minusLabel}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="h-9 w-12 flex items-center justify-center font-extrabold tabular-nums">
                        {c.value}
                      </div>
                      <button
                        type="button"
                        className="h-9 w-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => c.bump(1)}
                        disabled={submitting || isAtMax}
                        aria-label={c.plusLabel}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Código de descuento (opcional)
                </label>
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-gray-400" />
                  <input
                    className="w-full bg-transparent outline-none text-sm font-semibold"
                    placeholder="DESCUENTO10"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              {typeof maxPersons === "number" && (
                <p className="text-xs text-gray-500">
                  Máx. por reserva: <span className="font-bold">{maxPersons}</span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Expedición / Fechas
              </label>
              <select
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900"
                value={selectedExpedition?.idExpedition || ""}
                onChange={(e) => setSelectedExpeditionId(e.target.value)}
              >
                {availableExpeditions.map((e) => (
                  <option key={e.idExpedition} value={e.idExpedition}>
                    {formatDate(e.startDate)} - {formatDate(e.endDate)}{" "}
                    {typeof e.capacityAvailable === "number"
                      ? `• ${e.capacityAvailable} cupos`
                      : ""}
                  </option>
                ))}
              </select>

              <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {[
                  {
                    label: "Adultos",
                    value: adults,
                    unitPrice: selectedExpedition?.priceAdult ?? null,
                    bump: bumpAdults,
                    minusLabel: "Restar adulto",
                    plusLabel: "Sumar adulto",
                  },
                  {
                    label: "Niños",
                    value: children,
                    unitPrice: selectedExpedition?.priceChild ?? null,
                    bump: bumpChildren,
                    minusLabel: "Restar niño",
                    plusLabel: "Sumar niño",
                  },
                ].map((row, idx) => (
                  <div
                    key={row.label}
                    className={[
                      "px-3 py-3 bg-white dark:bg-gray-900",
                      idx === 0 ? "border-b border-gray-200 dark:border-gray-700" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
                          {row.label}
                        </p>
                        {typeof row.unitPrice === "number" && (
                          <p className="mt-1 text-xs text-gray-500">
                            {new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency,
                              maximumFractionDigits: 0,
                            }).format(row.unitPrice)}{" "}
                            / {row.label === "Niños" ? "niño" : "adulto"}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                        <button
                          type="button"
                          className="h-9 w-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => row.bump(-1)}
                          disabled={submitting}
                          aria-label={row.minusLabel}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="h-9 w-12 flex items-center justify-center font-extrabold tabular-nums">
                          {row.value}
                        </div>
                        <button
                          type="button"
                          className="h-9 w-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => row.bump(1)}
                          disabled={submitting || isAtMax}
                          aria-label={row.plusLabel}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Código de descuento (opcional)
                </label>
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-gray-400" />
                  <input
                    className="w-full bg-transparent outline-none text-sm font-semibold"
                    placeholder="DESCUENTO10"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                {typeof capacityAvailable === "number" && (
                  <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-1">
                    Cupos: <span className="font-bold">{capacityAvailable}</span>
                  </span>
                )}
                {typeof maxPersons === "number" && (
                  <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-1">
                    Máx. por reserva:{" "}
                    <span className="font-bold">{maxPersons}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <button
        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={submitting || (hasExpeditions ? !canReserve : !canReserveFromTrip)}
        onClick={async () => {
          try {
            setSubmitting(true);
            // No enviar redirectUrl (backend valida estrictamente)

            let res;
            if (hasExpeditions) {
              if (!selectedExpedition?.idExpedition) {
                toast.error("Selecciona una expedición");
                return;
              }
              if (persons <= 0) {
                toast.error("Selecciona al menos 1 viajero");
                return;
              }
              if (
                typeof capacityAvailable === "number" &&
                capacityAvailable < persons
              ) {
                toast.error("No hay cupos suficientes");
                return;
              }
              res = await api.post("/bookings", {
                idTrip,
                idExpedition: selectedExpedition.idExpedition,
                adults,
                children,
                ...(discountCode.trim()
                  ? { discountCode: discountCode.trim() }
                  : {}),
              });
            } else {
              // Reserva recomendada: crea expedición automáticamente
              if (!fromTripStart || !fromTripEnd) {
                toast.error("Selecciona fechas");
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

              const startIso = buildIsoWithFallbackTime(
                fromTripStart,
                startDateFallback
              );
              const endIso = buildIsoWithFallbackTime(fromTripEnd, endDateFallback);

              res = await api.post("/bookings/from-trip", {
                idTrip,
                startDate: startIso,
                endDate: endIso,
                adults,
                children,
                ...(discountCode.trim()
                  ? { discountCode: discountCode.trim() }
                  : {}),
              });
            }

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
