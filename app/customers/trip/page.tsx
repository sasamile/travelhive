"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, XCircle, Calendar, MapPin, Users, ArrowRight } from "lucide-react";

interface BookingData {
  idBooking: string;
  status: string;
  message: string;
  qrCode?: string;
  qrImageUrl?: string;
  trip?: {
    idTrip: string;
    title: string;
    description?: string;
    coverImage?: string;
    category?: string;
    city?: {
      nameCity: string;
    };
  };
  expedition?: {
    startDate: string;
    endDate: string;
  };
  booking?: {
    totalPersons?: number;
    totalBuy?: number;
    currency?: string;
  };
}

function TripPaymentVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">("loading");
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");
      const bookingId = searchParams.get("bookingId");
      const transactionId = searchParams.get("id");
      const env = searchParams.get("env");

      if (!bookingId) {
        toast.error("No se encontró el ID de la reserva");
        setStatus("error");
        setVerifying(false);
        return;
      }

      try {
        setVerifying(true);
        toast.loading("Verificando pago...", { id: "verify-payment" });

        let verifyUrl = `/bookings/${bookingId}/verify-payment`;
        const queryParams = new URLSearchParams();

        if (transactionId) {
          queryParams.append("id", transactionId);
        } else if (reference) {
          queryParams.append("reference", reference);
        }

        if (env) {
          queryParams.append("env", env);
        }

        if (queryParams.toString()) {
          verifyUrl += `?${queryParams.toString()}`;
        }

        let res;
        try {
          res = await api.post(verifyUrl);
        } catch (firstError: any) {
          // Si es un error 400 (bad request), puede ser un problema temporal del backend
          if (firstError?.response?.status === 400) {
            const errorMsg = firstError?.response?.data?.message || firstError?.message || "";
            
            // Si es un timeout de transacción, intentar una vez más después de un delay
            if (errorMsg.includes("timeout") || errorMsg.includes("transaction") && retryCount < 1) {
              console.log("⚠️ Timeout detectado, reintentando...");
              await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
              setRetryCount(prev => prev + 1);
              res = await api.post(verifyUrl);
            } else {
              throw firstError;
            }
          } else if (firstError?.response?.status === 404) {
            try {
              res = await api.get(verifyUrl);
            } catch (getError: any) {
              if (getError?.response?.status === 404) {
                const bodyUrl = `/bookings/${bookingId}/verify-payment`;
                const body: any = {};
                if (transactionId) {
                  body.id = transactionId;
                  body.transactionId = transactionId;
                }
                if (reference) {
                  body.reference = reference;
                }
                if (env) {
                  body.env = env;
                }
                res = await api.post(bodyUrl, body);
              } else {
                throw getError;
              }
            }
          } else {
            throw firstError;
          }
        }

        const responseData = res?.data || res?.data?.data || {};
        const paymentStatus = responseData.status || "UNKNOWN";
        const wompiStatus = responseData.wompiStatus;
        const message = responseData.message;

        // Guardar datos de la respuesta
        setBookingData({
          idBooking: responseData.idBooking || bookingId,
          status: paymentStatus,
          message: message || "",
          qrCode: responseData.qrCode,
          qrImageUrl: responseData.qrImageUrl,
          trip: responseData.trip,
          expedition: responseData.expedition,
          booking: responseData.booking,
        });

        if (paymentStatus === "CONFIRMED" || wompiStatus === "APPROVED") {
          setStatus("success");
          toast.success(message || "✅ Pago confirmado. Tu reserva está activa.", {
            id: "verify-payment",
            duration: 5000,
          });
        } else if (paymentStatus === "PENDING") {
          setStatus("pending");
          toast(message || "⏳ Pago pendiente. Puedes intentarlo de nuevo más tarde.", {
            id: "verify-payment",
            icon: "⏳" as any,
            duration: 5000,
          });
        } else if (
          paymentStatus === "CANCELLED" ||
          paymentStatus === "REJECTED" ||
          wompiStatus === "DECLINED" ||
          wompiStatus === "VOIDED"
        ) {
          setStatus("error");
          toast.error(message || "❌ El pago fue rechazado o cancelado.", {
            id: "verify-payment",
            duration: 6000,
          });
        } else {
          setStatus("success");
          toast.success(message || "Pago verificado.", {
            id: "verify-payment",
            duration: 4000,
          });
        }
      } catch (err: any) {
        console.error("❌ Error al verificar pago:", err);
        setStatus("error");
        
        let errorMsg = "No se pudo verificar el pago";
        const errorResponse = err?.response;
        
        if (errorResponse?.status === 400) {
          const backendMsg = errorResponse?.data?.message || "";
          if (backendMsg.includes("timeout") || backendMsg.includes("transaction")) {
            errorMsg = "El servidor está procesando tu solicitud. Por favor, espera unos momentos e intenta nuevamente.";
          } else if (backendMsg) {
            errorMsg = backendMsg;
          } else {
            errorMsg = "Error al procesar la verificación del pago. Por favor, intenta nuevamente.";
          }
        } else if (errorResponse?.status === 404) {
          errorMsg = `Endpoint no encontrado. Verifica que el backend tenga el endpoint POST /bookings/${bookingId}/verify-payment`;
        } else if (errorResponse?.data?.message) {
          errorMsg = errorResponse.data.message;
        } else if (err?.message) {
          errorMsg = err.message;
        }

        setErrorMessage(errorMsg);
        toast.error(errorMsg, {
          id: "verify-payment",
          duration: 8000,
        });
      } finally {
        setVerifying(false);
        
        if (typeof window !== "undefined") {
          localStorage.removeItem("th_last_booking_id");
          localStorage.removeItem("th_last_booking_created_at");
        }
      }
    };

    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Fecha no disponible";
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value?: number, currency: string = "COP") => {
    if (!value) return "$0";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency === "COP" ? "COP" : currency === "EUR" ? "EUR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {verifying ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">
              Verificando pago...
            </h2>
            <p className="text-zinc-600">
              Por favor espera mientras confirmamos tu pago
            </p>
          </div>
        ) : status === "success" && bookingData ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header con éxito */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="size-8" />
                <h2 className="text-2xl font-bold">¡Pago Confirmado!</h2>
              </div>
              <p className="text-emerald-50">{bookingData.message || "Tu reserva está activa"}</p>
            </div>

            {/* Información del evento */}
            <div className="p-8">
              {bookingData.trip && (
                <div className="mb-6">
                  <div className="flex items-start gap-4 mb-6">
                    {bookingData.trip.coverImage && (
                      <img
                        src={bookingData.trip.coverImage}
                        alt={bookingData.trip.title}
                        className="w-24 h-24 rounded-xl object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-zinc-900 mb-2">{bookingData.trip.title}</h3>
                      {bookingData.trip.city && (
                        <div className="flex items-center gap-2 text-zinc-600 mb-2">
                          <MapPin className="size-4" />
                          <span className="text-sm">{bookingData.trip.city.nameCity}</span>
                        </div>
                      )}
                      {bookingData.expedition && (
                        <div className="flex items-center gap-2 text-zinc-600">
                          <Calendar className="size-4" />
                          <span className="text-sm">{formatDate(bookingData.expedition.startDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {bookingData.booking && (
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-zinc-50 rounded-lg">
                      {bookingData.booking.totalPersons && (
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">Personas</p>
                          <p className="text-lg font-semibold text-zinc-900 flex items-center gap-1">
                            <Users className="size-4" />
                            {bookingData.booking.totalPersons}
                          </p>
                        </div>
                      )}
                      {bookingData.booking.totalBuy && (
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">Total Pagado</p>
                          <p className="text-lg font-semibold text-zinc-900">
                            {formatCurrency(bookingData.booking.totalBuy, bookingData.booking.currency)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Código QR */}
              {bookingData.qrImageUrl && (
                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 bg-zinc-50 mb-6">
                  <h4 className="text-sm font-semibold text-zinc-700 mb-3 text-center">Tu Código QR</h4>
                  <div className="flex justify-center mb-3">
                    <img
                      src={bookingData.qrImageUrl}
                      alt="Código QR"
                      className="w-48 h-48 object-contain bg-white p-4 rounded-lg"
                    />
                  </div>
                  {bookingData.qrCode && (
                    <p className="text-xs text-center text-zinc-500 font-mono">
                      {bookingData.qrCode}
                    </p>
                  )}
                  <p className="text-xs text-center text-zinc-500 mt-2">
                    Presenta este código QR al llegar al evento
                  </p>
                </div>
              )}

              {/* Botón para ver viajes */}
              <button
                onClick={() => router.push("/customers/viajes")}
                className="w-full bg-zinc-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
              >
                Ver mis viajes
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        ) : status === "error" && bookingData ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header con error */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="size-8" />
                <h2 className="text-2xl font-bold">Lo sentimos</h2>
              </div>
              <p className="text-red-50">{bookingData.message || "El pago no pudo ser procesado"}</p>
            </div>

            {/* Información del evento */}
            <div className="p-8">
              {bookingData.trip && (
                <div className="mb-6">
                  <div className="flex items-start gap-4 mb-4">
                    {bookingData.trip.coverImage && (
                      <img
                        src={bookingData.trip.coverImage}
                        alt={bookingData.trip.title}
                        className="w-24 h-24 rounded-xl object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-zinc-900 mb-2">{bookingData.trip.title}</h3>
                      {bookingData.trip.city && (
                        <div className="flex items-center gap-2 text-zinc-600">
                          <MapPin className="size-4" />
                          <span className="text-sm">{bookingData.trip.city.nameCity}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  No se pudo procesar tu pago. Por favor, intenta nuevamente o contacta con soporte si el problema persiste.
                </p>
              </div>

              {/* Botón para ver viajes */}
              <button
                onClick={() => router.push("/customers/viajes")}
                className="w-full bg-zinc-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
              >
                Ver mis viajes
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        ) : status === "pending" ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-600 border-t-transparent"></div>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">
              Pago Pendiente
            </h2>
            <p className="text-zinc-600 mb-6">
              Tu pago está siendo procesado. Te notificaremos cuando se confirme.
            </p>
            <button
              onClick={() => router.push("/customers/viajes")}
              className="w-full bg-zinc-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
            >
              Ver mis viajes
              <ArrowRight className="size-4" />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <XCircle className="size-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">
              Error en el Pago
            </h2>
            <p className="text-zinc-600 mb-6">
              {errorMessage || "No se pudo verificar el pago. Por favor, intenta nuevamente."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRetryCount(0);
                  setErrorMessage(null);
                  setVerifying(true);
                  setStatus("loading");
                  // Re-ejecutar la verificación
                  const verifyPayment = async () => {
                    const reference = searchParams.get("reference");
                    const bookingId = searchParams.get("bookingId");
                    const transactionId = searchParams.get("id");
                    const env = searchParams.get("env");

                    if (!bookingId) {
                      toast.error("No se encontró el ID de la reserva");
                      setStatus("error");
                      setVerifying(false);
                      return;
                    }

                    try {
                      setVerifying(true);
                      toast.loading("Reintentando verificación...", { id: "verify-payment" });

                      let verifyUrl = `/bookings/${bookingId}/verify-payment`;
                      const queryParams = new URLSearchParams();

                      if (transactionId) {
                        queryParams.append("id", transactionId);
                      } else if (reference) {
                        queryParams.append("reference", reference);
                      }

                      if (env) {
                        queryParams.append("env", env);
                      }

                      if (queryParams.toString()) {
                        verifyUrl += `?${queryParams.toString()}`;
                      }

                      const res = await api.post(verifyUrl);
                      const responseData = res?.data || res?.data?.data || {};
                      const paymentStatus = responseData.status || "UNKNOWN";
                      const wompiStatus = responseData.wompiStatus;
                      const message = responseData.message;

                      setBookingData({
                        idBooking: responseData.idBooking || bookingId,
                        status: paymentStatus,
                        message: message || "",
                        qrCode: responseData.qrCode,
                        qrImageUrl: responseData.qrImageUrl,
                        trip: responseData.trip,
                        expedition: responseData.expedition,
                        booking: responseData.booking,
                      });

                      if (paymentStatus === "CONFIRMED" || wompiStatus === "APPROVED") {
                        setStatus("success");
                        toast.success(message || "✅ Pago confirmado. Tu reserva está activa.", {
                          id: "verify-payment",
                          duration: 5000,
                        });
                      } else {
                        setStatus("error");
                        toast.error(message || "El pago no pudo ser verificado", {
                          id: "verify-payment",
                          duration: 6000,
                        });
                      }
                    } catch (err: any) {
                      console.error("❌ Error al reintentar verificación:", err);
                      setStatus("error");
                      const errorMsg = err?.response?.data?.message || err?.message || "Error al verificar el pago";
                      setErrorMessage(errorMsg);
                      toast.error(errorMsg, {
                        id: "verify-payment",
                        duration: 6000,
                      });
                    } finally {
                      setVerifying(false);
                    }
                  };
                  verifyPayment();
                }}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                Reintentar
              </button>
              <button
                onClick={() => router.push("/customers/viajes")}
                className="flex-1 bg-zinc-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
              >
                Ver mis viajes
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TripPaymentVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">
              Cargando...
            </h2>
          </div>
        </div>
      }
    >
      <TripPaymentVerificationContent />
    </Suspense>
  );
}
