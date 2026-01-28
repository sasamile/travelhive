"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

type FavoriteTrip = {
  id: string;
  idTrip: string;
  createdAt: string;
  trip: {
    idTrip: string;
    title: string;
    description: string;
    category: string;
    coverImage: string;
    price: number;
    currency: string;
    agency: {
      idAgency: string;
      nameAgency: string;
      picture: string;
    };
    city: {
      idCity: string;
      nameCity: string;
    };
  };
};

type FavoritesSectionProps = {
  favoritesData: FavoriteTrip[];
};

export function FavoritesSection({ favoritesData }: FavoritesSectionProps) {
  const [favorites, setFavorites] = useState<FavoriteTrip[]>(favoritesData);
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemoveFavorite = async (idTrip: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (removing) return;
    
    try {
      setRemoving(idTrip);
      const response = await api.post(`/favorites/trips/${idTrip}`);
      
      if (response.data?.data?.isFavorite === false) {
        setFavorites(favorites.filter(fav => fav.idTrip !== idTrip));
        toast.success("Removido de favoritos");
      }
    } catch (err: any) {
      console.error("Error al remover favorito:", err);
      toast.error(err?.response?.data?.message || "No se pudo remover de favoritos");
    } finally {
      setRemoving(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency === "USD" ? "USD" : currency === "EUR" ? "EUR" : "COP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (favorites.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Heart className="size-8 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">No tienes favoritos aún</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Guarda tus viajes favoritos para acceder fácilmente</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((favorite) => {
        const trip = favorite.trip;
        const coverImage = trip.coverImage || "";
        
        return (
          <Link
            key={favorite.id}
            href={`/customers/${trip.idTrip}`}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02]"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-gray-200">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={trip.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0" />
              
              {/* Badge de categoría */}
              {trip.category && (
                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur-sm dark:bg-gray-900/90">
                  {trip.category}
                </div>
              )}
              
              {/* Botón de favorito */}
              <button
                onClick={(e) => handleRemoveFavorite(trip.idTrip, e)}
                disabled={removing === trip.idTrip}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 hover:bg-red-500 text-white backdrop-blur-md transition-all z-10"
                aria-label="Remover de favoritos"
              >
                <Heart className={`size-5 fill-white ${removing === trip.idTrip ? "animate-pulse" : ""}`} />
              </button>
              
              {/* Precio */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-white">
                  <span className="text-2xl font-extrabold">
                    {formatPrice(trip.price || 0, trip.currency || "COP")}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-5 space-y-3">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
                {trip.title}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">{trip.city?.nameCity || "Ubicación no disponible"}</span>
                {trip.agency?.nameAgency && (
                  <>
                    <span>•</span>
                    <span>{trip.agency.nameAgency}</span>
                  </>
                )}
              </div>
              
              {trip.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {trip.description.replace(/<[^>]*>/g, "")}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
