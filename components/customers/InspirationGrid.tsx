"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PublicTrip } from "@/types/trips";
import api from "@/lib/axios";

function InspirationGrid() {
  const [trips, setTrips] = useState<PublicTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        // Obtener los primeros 6 viajes publicados para mostrar en la página principal
        // Intentar primero con /trips (endpoint público)
        const response = await api.get<{ data: PublicTrip[]; pagination: any }>(
          "/trips?limit=6"
        );
        setTrips(response.data.data);
      } catch (error: any) {
        console.error("Error al cargar viajes:", error);
        // Si falla, intentar con /public/trips como alternativa
        if (error.response?.status === 404) {
          try {
            const altResponse = await api.get<{ data: PublicTrip[]; pagination: any }>(
              "/public/trips?limit=6"
            );
            setTrips(altResponse.data.data);
          } catch (altError) {
            console.error("Error con endpoint alternativo:", altError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="aspect-4/5 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    // No mostrar nada si no hay viajes - todo debe venir de la base de datos
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No hay viajes disponibles en este momento
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {trips.slice(0, 3).map((trip) => {
        // Usar solo imágenes de la base de datos
        const coverImage =
          trip.coverImage || trip.galleryImages?.[0]?.imageUrl || null;
        const priceFrom = trip.expeditions?.[0]?.priceAdult || trip.price;

        // Si no hay imagen, mostrar placeholder o no mostrar la tarjeta
        if (!coverImage) {
          return null;
        }

        return (
          <Link
            key={trip.idTrip}
            href={`/customers/${trip.idTrip}`}
            className="group relative cursor-pointer overflow-hidden rounded-xl shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-all hover:shadow-[0px_8px_24px_rgba(0,0,0,0.12)]"
          >
            <div
              className="aspect-4/5 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%), url("${coverImage}")`,
              }}
            />
            <div className="absolute bottom-0 left-0 w-full p-8">
              {trip.category && (
                <span className="mb-3 inline-block rounded-full bg-primary/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                  {trip.category}
                </span>
              )}
              <h3 className="text-2xl font-extrabold leading-tight text-white">
                {trip.title}
              </h3>
              <p className="mt-1 text-sm text-white/80 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {trip.destinationRegion 
                  ? `${trip.destinationRegion}${trip.city?.nameCity ? ` • ${trip.city.nameCity}` : ""}`
                  : trip.city?.nameCity || ""}
              </p>
              {priceFrom && (
                <p className="mt-2 text-lg font-bold text-white">
                  Desde{" "}
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: trip.expeditions?.[0]?.currency || trip.currency || "COP",
                    minimumFractionDigits: 0,
                  }).format(priceFrom)}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default InspirationGrid;
