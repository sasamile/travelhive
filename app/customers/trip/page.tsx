"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";

function TripPaymentVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">("loading");

  useEffect(() => {
    const verifyPayment = async () => {
      // Obtener parámetros de la URL
      const reference = searchParams.get("reference");
      const bookingId = searchParams.get("bookingId");
      const transactionId = searchParams.get("id"); // El parámetro 'id' de Wompi es el transactionId
      const env = searchParams.get("env");

      if (!bookingId) {
        toast.error("No se encontró el ID de la reserva");
        setStatus("error");
        setVerifying(false);
        setTimeout(() => {
          router.push("/customers/viajes");
        }, 2000);
        return;
      }

      try {
        setVerifying(true);
        toast.loading("Verificando pago...", { id: "verify-payment" });

        // Construir la URL base (sin /api porque baseURL ya lo incluye)
        // El proxy de Next.js redirige /api/* al backend
        let verifyUrl = `/bookings/${bookingId}/verify-payment`;
        const queryParams = new URLSearchParams();

        // Prioridad: transactionId (id) > reference
        // El backend acepta 'id' o 'transactionId' como query parameter
        if (transactionId) {
          queryParams.append("id", transactionId);
        } else if (reference) {
          queryParams.append("reference", reference);
        }

        if (env) {
          queryParams.append("env", env);
        }

        // Construir la URL final con query params si existen
        if (queryParams.toString()) {
          verifyUrl += `?${queryParams.toString()}`;
        }

        console.log("🔍 Verificando pago:", {
          bookingId,
          transactionId,
          reference,
          env,
          verifyUrl,
          finalUrl: `/api${verifyUrl}`,
        });

        // Intentar primero con POST y query params
        let res;
        try {
          // Enviar solicitud POST al backend con query params
          res = await api.post(verifyUrl);
        } catch (firstError: any) {
          // Si falla con 404, intentar con GET
          if (firstError?.response?.status === 404) {
            console.log("⚠️ POST falló con 404, intentando con GET...");
            try {
              res = await api.get(verifyUrl);
            } catch (getError: any) {
              // Si GET también falla, intentar con body en POST
              if (getError?.response?.status === 404) {
                console.log("⚠️ GET también falló, intentando POST con body...");
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
        
        // Extraer el estado del pago de la respuesta
        const paymentStatus =
          res?.data?.status ||
          res?.data?.data?.status ||
          res?.data?.booking?.status ||
          "UNKNOWN";

        const wompiStatus = res?.data?.wompiStatus || res?.data?.data?.wompiStatus;
        const message = res?.data?.message || res?.data?.data?.message;

        if (paymentStatus === "CONFIRMED" || wompiStatus === "APPROVED") {
          setStatus("success");
          toast.success(
            message || "✅ Pago confirmado. Tu reserva está activa.",
            {
              id: "verify-payment",
              duration: 5000,
            }
          );
        } else if (paymentStatus === "PENDING") {
          setStatus("pending");
          toast(
            message || "⏳ Pago pendiente. Puedes intentarlo de nuevo más tarde.",
            {
              id: "verify-payment",
              icon: "⏳" as any,
              duration: 5000,
            }
          );
        } else if (
          paymentStatus === "CANCELLED" ||
          paymentStatus === "REJECTED" ||
          wompiStatus === "DECLINED" ||
          wompiStatus === "VOIDED"
        ) {
          setStatus("error");
          toast.error(
            message || "❌ El pago fue rechazado o cancelado. Intenta nuevamente.",
            {
              id: "verify-payment",
              duration: 6000,
            }
          );
        } else {
          setStatus("success");
          toast.success(message || "Pago verificado.", {
            id: "verify-payment",
            duration: 4000,
          });
        }
      } catch (err: any) {
        console.error("❌ Error al verificar pago:", {
          error: err,
          response: err?.response,
          status: err?.response?.status,
          data: err?.response?.data,
          url: err?.config?.url,
          baseURL: err?.config?.baseURL,
        });

        setStatus("error");
        
        // Mensaje de error más detallado
        let errorMessage = "No se pudo verificar el pago";
        if (err?.response?.status === 404) {
          errorMessage = `Endpoint no encontrado. Verifica que el backend tenga el endpoint POST /bookings/${bookingId}/verify-payment`;
        } else if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err?.message) {
          errorMessage = err.message;
        }

        toast.error(errorMessage, {
          id: "verify-payment",
          duration: 6000,
        });
      } finally {
        setVerifying(false);
        
        // Limpiar localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("th_last_booking_id");
          localStorage.removeItem("th_last_booking_created_at");
        }

        // Limpiar la URL y redirigir después de unos segundos
        setTimeout(() => {
          const cleanUrl = "/customers/viajes";
          router.push(cleanUrl);
        }, 3000);
      }
    };

    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        {verifying ? (
          <>
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verificando pago...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Por favor espera mientras confirmamos tu pago
            </p>
          </>
        ) : status === "success" ? (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Pago Confirmado!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Tu reserva está activa. Serás redirigido a tus viajes...
            </p>
          </>
        ) : status === "pending" ? (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
              <svg
                className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Pago Pendiente
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Tu pago está siendo procesado. Serás redirigido a tus viajes...
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error en el Pago
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No se pudo verificar el pago. Serás redirigido a tus viajes...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function TripPaymentVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
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
