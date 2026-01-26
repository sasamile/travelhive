"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Heart, Star, Users } from "lucide-react";
import { PublicTrip } from "@/types/trips";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface PublicTripCardProps {
  trip: PublicTrip;
}

export function PublicTripCard({ trip }: PublicTripCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLButtonElement>(null);
  
  // Obtener la primera expedition disponible para mostrar precio y fechas
  const firstExpedition = trip.expeditions?.[0];
  
  // Formatear precio
  const formatPrice = (price: number | null, currency: string | null) => {
    if (!price) return "Consultar precio";
    const formattedPrice = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency || "COP",
      minimumFractionDigits: 0,
    }).format(price);
    return formattedPrice;
  };

  // Formatear fechas
  const formatDateRange = () => {
    if (!firstExpedition) return "Fechas flexibles";
    
    try {
      const startDate = format(new Date(firstExpedition.startDate), "d MMM", { locale: es });
      const endDate = format(new Date(firstExpedition.endDate), "d MMM yyyy", { locale: es });
      return `${startDate} - ${endDate}`;
    } catch {
      return "Fechas flexibles";
    }
  };

  // Obtener imagen de portada - solo de la base de datos
  const coverImage = trip.coverImage || trip.galleryImages?.[0]?.imageUrl || null;
  
  // Duración del viaje
  const duration = trip.durationDays 
    ? `${trip.durationDays} ${trip.durationDays === 1 ? "día" : "días"}`
    : trip.durationNights 
    ? `${trip.durationNights} ${trip.durationNights === 1 ? "noche" : "noches"}`
    : "";

  // Precio desde
  const priceFrom = firstExpedition?.priceAdult 
    ? formatPrice(firstExpedition.priceAdult, firstExpedition.currency)
    : trip.price 
    ? formatPrice(trip.price, trip.currency)
    : "Consultar precio";

  // Animaciones GSAP
  useEffect(() => {
    if (cardRef.current) {
      // Animación de entrada
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
        }
      );
    }
  }, []);

  // Animación de brillo/overlay en la imagen al hover
  const handleImageHover = (isHovering: boolean) => {
    if (imageRef.current) {
      const overlay = imageRef.current.querySelector('.image-overlay') as HTMLElement;
      if (overlay) {
        gsap.to(overlay, {
          opacity: isHovering ? 0.3 : 0,
          duration: 0.4,
          ease: "power2.out",
        });
      }
      
      // Efecto de brillo sutil
      const shine = imageRef.current.querySelector('.image-shine') as HTMLElement;
      if (shine) {
        if (isHovering) {
          gsap.to(shine, {
            x: '100%',
            duration: 0.6,
            ease: "power2.out",
          });
        } else {
          gsap.set(shine, { x: '-100%' });
        }
      }
    }
  };

  // Animación del botón de corazón
  const handleHeartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (heartRef.current) {
      gsap.to(heartRef.current, {
        scale: 1.3,
        rotation: 360,
        duration: 0.5,
        ease: "back.out(1.7)",
        yoyo: true,
        repeat: 1,
      });
    }
  };

  return (
    <article 
      ref={cardRef}
      className="group flex flex-col gap-3"
      onMouseEnter={() => handleImageHover(true)}
      onMouseLeave={() => handleImageHover(false)}
    >
      <div ref={imageRef} className="relative aspect-4/3 overflow-hidden rounded-2xl bg-gray-200">
        {/* Overlay para efecto de brillo */}
        <div className="image-overlay absolute inset-0 bg-linear-to-br from-white/0 via-white/0 to-white/20 z-10 pointer-events-none opacity-0" />
        {/* Efecto de brillo que se desliza */}
        <div className="image-shine absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full z-10 pointer-events-none" 
          style={{ transform: 'translateX(-100%)' }}
        />
        {trip.category && (
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur-sm dark:bg-gray-900/90">
            {trip.category}
          </div>
        )}
        <button
          ref={heartRef}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md z-10"
          type="button"
          aria-label="Guardar experiencia"
          onClick={handleHeartClick}
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, {
              scale: 1.2,
              duration: 0.2,
              ease: "power2.out",
            });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, {
              scale: 1,
              duration: 0.2,
              ease: "power2.out",
            });
          }}
        >
          <Heart className="h-4 w-4 fill-white text-white" />
        </button>
        <Link href={`/customers/${trip.idTrip}`}>
          {coverImage ? (
            <Image
              src={coverImage}
              alt={trip.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Sin imagen disponible</span>
            </div>
          )}
        </Link>
      </div>
      <div className="px-1">
        <div className="mb-1 flex items-start justify-between">
          <Link 
            href={`/customers/${trip.idTrip}`}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                x: 5,
                duration: 0.3,
                ease: "power2.out",
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                x: 0,
                duration: 0.3,
                ease: "power2.out",
              });
            }}
          >
            <h4 className="text-lg font-bold leading-tight transition-colors group-hover:text-primary">
              {trip.title}
            </h4>
          </Link>
        </div>
        <div className="mb-2 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {trip.destinationRegion ? (
              <>
                <span>{trip.destinationRegion}</span>
                {trip.city.nameCity && (
                  <span className="text-gray-400">• {trip.city.nameCity}</span>
                )}
              </>
            ) : (
              <span>{trip.city.nameCity}</span>
            )}
          </div>
          {duration && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{duration}</span>
            </div>
          )}
        </div>
        {firstExpedition && (
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            {formatDateRange()}
          </p>
        )}
        {trip.agency && (
          <div className="mb-2 flex items-center gap-2">
            {trip.agency.picture && (
              <Image
                src={trip.agency.picture}
                alt={trip.agency.nameAgency}
                width={20}
                height={20}
                className="rounded-full"
              />
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {trip.agency.nameAgency}
            </span>
          </div>
        )}
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Desde
            </p>
            <p className="text-xl font-extrabold">
              {priceFrom}
              {firstExpedition?.priceAdult && (
                <span className="text-sm font-medium text-gray-500">
                  {" "}
                  / pers.
                </span>
              )}
            </p>
            {firstExpedition && firstExpedition.capacityAvailable > 0 && (
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span>
                  {firstExpedition.capacityAvailable} cupos disponibles
                </span>
              </div>
            )}
          </div>
          <Link
            href={`/customers/${trip.idTrip}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ebefef] transition-all hover:bg-primary hover:text-white dark:bg-gray-800"
            aria-label="Ver detalles"
          >
            <svg
              className="h-4 w-4 -rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
