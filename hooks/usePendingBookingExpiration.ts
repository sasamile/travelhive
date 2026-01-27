"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";

/**
 * Hook para manejar la expiración automática de reservas pendientes
 * Cancela automáticamente reservas PENDING que tengan más de 10 minutos sin completar el pago
 * No muestra nada al usuario, solo cancela silenciosamente
 */
export function usePendingBookingExpiration() {
  const router = useRouter();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    const checkPendingBookings = async () => {
      try {
        const bookingId = localStorage.getItem("th_last_booking_id");
        const createdAtStr = localStorage.getItem("th_last_booking_created_at");
        
        if (!bookingId || !createdAtStr) {
          return; // No hay reserva pendiente
        }

        const createdAt = parseInt(createdAtStr, 10);
        if (isNaN(createdAt)) {
          // Timestamp inválido, limpiar
          localStorage.removeItem("th_last_booking_id");
          localStorage.removeItem("th_last_booking_created_at");
          return;
        }

        const now = Date.now();
        const elapsedMinutes = (now - createdAt) / (1000 * 60);

        // Si han pasado más de 10 minutos, intentar cancelar la reserva
        if (elapsedMinutes > 10) {
          try {
            // Intentar cancelar la reserva automáticamente
            // Nota: El endpoint puede variar según el backend
            // Si el endpoint no existe, el backend debería manejar esto automáticamente
            try {
              await api.patch(`/bookings/${bookingId}/cancel`, {
                reason: "Expired: Payment not completed within 10 minutes",
              });
            } catch (cancelApiError: any) {
              // Si el endpoint no existe o falla, intentar con DELETE
              if (cancelApiError.response?.status === 404 || cancelApiError.response?.status === 405) {
                try {
                  await api.delete(`/bookings/${bookingId}`);
                } catch (deleteError) {
                  // Si tampoco funciona, solo limpiar localStorage
                  console.log("No se pudo cancelar la reserva automáticamente. El backend debería manejarlo.");
                }
              } else {
                throw cancelApiError;
              }
            }
            
            // Limpiar localStorage silenciosamente
            localStorage.removeItem("th_last_booking_id");
            localStorage.removeItem("th_last_booking_created_at");
          } catch (cancelError: any) {
            // Si no se puede cancelar (ya fue cancelada, confirmada, etc.), solo limpiar
            console.log("Reserva ya no está pendiente o no se pudo cancelar:", cancelError);
            localStorage.removeItem("th_last_booking_id");
            localStorage.removeItem("th_last_booking_created_at");
          }
        }
        // No mostrar advertencias al usuario, solo cancelar automáticamente
      } catch (error: any) {
        console.error("Error al verificar reserva pendiente:", error);
        // No mostrar error al usuario, solo log
      }
    };

    // Verificar inmediatamente
    checkPendingBookings();

    // Verificar cada minuto
    checkIntervalRef.current = setInterval(checkPendingBookings, 60000); // 60 segundos

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [router]);

  return null;
}
