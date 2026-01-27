"use client";

import { usePendingBookingExpiration } from "@/hooks/usePendingBookingExpiration";

/**
 * Componente que maneja la expiración automática de reservas pendientes
 * Se debe agregar en el layout principal para que funcione en toda la aplicación
 * Cancela automáticamente sin mostrar nada al usuario
 */
export function PendingBookingExpirationHandler() {
  usePendingBookingExpiration();
  return null;
}
