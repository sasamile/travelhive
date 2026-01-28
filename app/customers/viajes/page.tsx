"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";

import { Sidebar } from "@/components/customers/viajes/Sidebar";
import { TripsHeader } from "@/components/customers/viajes/TripsHeader";
import { TripsSearch } from "@/components/customers/viajes/TripsSearch";
import { UpcomingTripsSection } from "@/components/customers/viajes/UpcomingTripsSection";
import { PastTripsSection } from "@/components/customers/viajes/PastTripsSection";
import { FavoritesSection } from "@/components/customers/viajes/FavoritesSection";
import { TripsSkeleton } from "@/components/customers/viajes/TripsSkeleton";
import { pastTrips, upcomingTrips, type Trip, type PastTrip } from "@/components/customers/viajes/data";
import CustomersNav from "@/components/customers/CustomersNav";
import { Compass, Plane, Heart } from "lucide-react";

function MyViajes() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [upcomingTripsData, setUpcomingTripsData] = useState<Trip[]>([]);
  const [pastTripsData, setPastTripsData] = useState<PastTrip[]>([]);
  const [favoritesData, setFavoritesData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "history" | "favorites">("upcoming");
  const [bookingsRawData, setBookingsRawData] = useState<any[]>([]); // Guardar datos completos de las reservas
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Función para mapear booking a Trip
  const mapBookingToTrip = (booking: any): Trip => {
    const expedition = booking.expedition || {};
    const trip = booking.trip || {};
    const startDate = expedition.startDate ? new Date(expedition.startDate) : null;
    const endDate = expedition.endDate ? new Date(expedition.endDate) : null;
    
    // Formatear precio
    const currency = booking.currency || "COP";
    const totalBuy = booking.totalBuy || 0;
    const formattedPrice = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(totalBuy);

    // Formatear rango de fechas
    let dateRange = "Fecha no disponible";
    if (expedition.dates) {
      dateRange = expedition.dates;
    } else if (startDate && endDate) {
      dateRange = `${startDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} - ${endDate.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}`;
    }

    return {
      id: booking.idBooking || booking.id,
      title: trip.title || "Viaje sin título",
      price: formattedPrice,
      image: trip.coverImage || trip.galleryImages?.[0]?.imageUrl || "",
      imageAlt: trip.title || "",
      dateRange,
      location: trip.city?.nameCity || "Ubicación no disponible",
      status: {
        label: booking.status === "CONFIRMED" ? "Confirmado" : booking.status === "PENDING" ? "Pendiente" : "Cancelado",
        className: booking.status === "CONFIRMED" 
          ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800"
          : booking.status === "PENDING"
          ? "bg-orange-50 dark:bg-orange-900/20 text-accent-terracotta border border-orange-100 dark:border-orange-800"
          : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800",
      },
      primaryAction: "Ver Detalles",
      secondaryAction: booking.status === "PENDING" ? "Cancelar" : "Modificar",
    };
  };

  // Función para mapear booking a PastTrip
  const mapBookingToPastTrip = (booking: any): PastTrip => {
    const expedition = booking.expedition || {};
    const trip = booking.trip || {};
    const startDate = expedition.startDate ? new Date(expedition.startDate) : null;
    
    return {
      id: booking.idBooking || booking.id,
      title: trip.title || "Viaje sin título",
      date: startDate 
        ? startDate.toLocaleDateString("es-ES", { month: "short", year: "numeric" })
        : "Fecha no disponible",
      location: trip.city?.nameCity || "Ubicación no disponible",
      image: trip.coverImage || trip.galleryImages?.[0]?.imageUrl || "",
      imageAlt: trip.title || "",
    };
  };

  // Cargar favoritos
  useEffect(() => {
    const loadFavorites = async () => {
      if (activeTab !== "favorites") return;
      
      try {
        setLoadingFavorites(true);
        const response = await api.get("/favorites/trips");
        setFavoritesData(response.data?.data || []);
      } catch (err: any) {
        console.error("Error al cargar favoritos:", err);
        if (err.response?.status !== 401) {
          toast.error("No se pudieron cargar tus favoritos");
        }
        setFavoritesData([]);
      } finally {
        setLoadingFavorites(false);
      }
    };

    loadFavorites();
  }, [activeTab]);

  // Cargar viajes del usuario
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        console.log("🔍 Cargando reservas del usuario...");
        
        // Construir parámetros de consulta
        const params: any = {};
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        
        // Cargar todas las reservas (el backend separa automáticamente)
        const response = await api.get("/bookings", { params });
        console.log("✅ Reservas cargadas:", response.data);
        
        // El backend ya separa en upcoming e history
        const upcomingBookings = response.data?.upcoming || [];
        const historyBookings = response.data?.history || [];
        
        // Si no vienen separados, usar el array bookings y separar manualmente
        const allBookings = response.data?.bookings || response.data?.data || [];
        
        // Mapear a los formatos esperados
        const upcoming: Trip[] = upcomingBookings.length > 0
          ? upcomingBookings.map(mapBookingToTrip)
          : allBookings
              .filter((b: any) => {
                const exp = b.expedition || {};
                const startDate = exp.startDate ? new Date(exp.startDate) : null;
                return startDate && startDate >= new Date();
              })
              .map(mapBookingToTrip);
        
        const past: PastTrip[] = historyBookings.length > 0
          ? historyBookings.map(mapBookingToPastTrip)
          : allBookings
              .filter((b: any) => {
                const exp = b.expedition || {};
                const startDate = exp.startDate ? new Date(exp.startDate) : null;
                return startDate && startDate < new Date();
              })
              .map(mapBookingToPastTrip);
        
        setUpcomingTripsData(upcoming);
        setPastTripsData(past);
        
        // Guardar los datos completos de las reservas para el modal
        const allBookingsData = upcomingBookings.length > 0 
          ? [...upcomingBookings, ...historyBookings]
          : allBookings;
        setBookingsRawData(allBookingsData);
        
        console.log(`✅ ${upcoming.length} próximos viajes, ${past.length} viajes pasados`);
      } catch (err: any) {
        console.error("❌ Error al cargar reservas:", err);
        // Si falla, usar datos estáticos como fallback
        setUpcomingTripsData(upcomingTrips);
        setPastTripsData(pastTrips);
        if (err.response?.status !== 401) {
          toast.error("No se pudieron cargar tus reservas");
        }
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [searchQuery]);

  // Verificar pago si viene de Wompi
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    // Detectar si viene de Wompi de varias formas:
    // 1. Parámetro payment=1 (redirección automática)
    // 2. Parámetro reference (referencia de Wompi)
    // 3. Parámetro id (transactionId de Wompi)
    const shouldVerify =
      params.get("payment") === "1" ||
      params.get("reference") !== null ||
      params.get("id") !== null;

    if (!shouldVerify) return;

    const bookingId =
      params.get("bookingId") || localStorage.getItem("th_last_booking_id");

    const reference = params.get("reference");
    const transactionId = params.get("id");

    const verify = async () => {
      if (!bookingId) {
        toast.error("No se encontró la reserva para verificar el pago");
        router.replace("/customers/viajes");
        return;
      }

      try {
        toast.loading("Verificando pago...", { id: "verify-payment" });

        // Construir la URL con los parámetros de query si están disponibles
        let verifyUrl = `/bookings/${bookingId}/verify-payment`;
        const queryParams = new URLSearchParams();

        if (reference) {
          queryParams.append("reference", reference);
        }
        if (transactionId) {
          queryParams.append("id", transactionId);
        }

        if (queryParams.toString()) {
          verifyUrl += `?${queryParams.toString()}`;
        }

        const res = await api.post(verifyUrl);
        const status =
          res?.data?.status ||
          res?.data?.data?.status ||
          res?.data?.booking?.status;

        if (status === "CONFIRMED") {
          toast.success("✅ Pago confirmado. Tu reserva está activa.", {
            id: "verify-payment",
            duration: 5000,
          });
          // Recargar las reservas después de verificar el pago
          window.location.reload();
        } else if (status === "PENDING") {
          toast("⏳ Pago pendiente. Puedes intentarlo de nuevo más tarde.", {
            id: "verify-payment",
            icon: "⏳" as any,
            duration: 5000,
          });
        } else if (status === "CANCELLED" || status === "REJECTED") {
          toast.error(
            "❌ El pago fue rechazado o cancelado. Intenta nuevamente.",
            {
              id: "verify-payment",
              duration: 6000,
            },
          );
        } else {
          toast.success("Pago verificado.", { id: "verify-payment" });
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo verificar el pago";
        toast.error(errorMessage, {
          id: "verify-payment",
          duration: 6000,
        });
      } finally {
        if (typeof window !== "undefined") {
          localStorage.removeItem("th_last_booking_id");
          localStorage.removeItem("th_last_booking_created_at");

          // Limpiar los parámetros de la URL
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, "", cleanUrl);
        }
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#4a4a4a] dark:text-gray-200">
      <CustomersNav />
      <div className="flex min-h-screen">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 max-w-5xl mx-auto px-10 py-12 ml-64     ">
          <TripsHeader 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            upcomingCount={upcomingTripsData.length}
            historyCount={pastTripsData.length}
            favoritesCount={favoritesData.length}
          />
          <TripsSearch onSearch={setSearchQuery} />
          {loading ? (
            <TripsSkeleton />
          ) : (
            <>

              {/* Contenido según el tab activo */}
              {activeTab === "upcoming" ? (
                <>
                  {upcomingTripsData.length > 0 ? (
                    <UpcomingTripsSection 
                      trips={upcomingTripsData} 
                      bookingsData={bookingsRawData.filter((b: any) => {
                        const exp = b.expedition || {};
                        const startDate = exp.startDate ? new Date(exp.startDate) : null;
                        return startDate && startDate >= new Date();
                      })}
                    />
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="size-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Compass className="size-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">No tienes viajes próximos</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Explora nuestros destinos y reserva tu próximo viaje</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : activeTab === "history" ? (
                <>
                  {pastTripsData.length > 0 ? (
                    <PastTripsSection 
                      trips={pastTripsData}
                      bookingsData={bookingsRawData.filter((b: any) => {
                        const exp = b.expedition || {};
                        const startDate = exp.startDate ? new Date(exp.startDate) : null;
                        return startDate && startDate < new Date();
                      })}
                    />
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="size-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Plane className="size-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">No tienes viajes pasados</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tus viajes completados aparecerán aquí</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {loadingFavorites ? (
                    <TripsSkeleton />
                  ) : (
                    <FavoritesSection favoritesData={favoritesData} />
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default MyViajes;
