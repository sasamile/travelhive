"use client";

import { useEffect, useState, use, useRef } from "react";
import CustomersNav from "@/components/customers/CustomersNav";
import {
  ChevronDown,
  Layers,
  Map as MapIcon,
  Minus,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { PublicTripCard } from "@/components/customers/PublicTripCard";
import { PublicTripsResponse, TripFilters, PublicTrip } from "@/types/trips";
import Link from "next/link";
import api from "@/lib/axios";
import { Map as MapComponent, MapMarker, MarkerContent, MarkerPopup, MarkerTooltip, MapControls } from "@/components/ui/map";
import { useMemo } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registrar el plugin de ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function getParamValue(value?: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

// Componente de mapa para mostrar los viajes
function TripsMap({ trips }: { trips: PublicTrip[] }) {
  const [hoveredTrip, setHoveredTrip] = useState<PublicTrip | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Obtener viajes con coordenadas válidas (usar el primer punto de ruta o las coordenadas del viaje)
  const tripsWithCoords = useMemo(() => {
    const tripsWithCoordsResult = trips
      .map((trip, index) => {
        // Priorizar el primer punto de ruta, luego las coordenadas del viaje
        const firstRoutePoint = trip.routePoints?.[0];
        const lat = firstRoutePoint?.latitude || trip.latitude;
        const lng = firstRoutePoint?.longitude || trip.longitude;

        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          console.log(`✅ Viaje ${index + 1}: ${trip.title} - Coordenadas: [${lat}, ${lng}] - Ciudad: ${trip.city?.nameCity || 'N/A'}`);
          return { ...trip, lat, lng };
        } else {
          console.warn(`⚠️ Viaje ${index + 1}: ${trip.title} - Sin coordenadas válidas. Lat: ${lat}, Lng: ${lng}, RoutePoints: ${trip.routePoints?.length || 0}`);
          return null;
        }
      })
      .filter((trip): trip is PublicTrip & { lat: number; lng: number } => trip !== null);
    
    console.log(`🗺️ Total viajes recibidos: ${trips.length}, Viajes con coordenadas válidas: ${tripsWithCoordsResult.length}`);
    console.log(`📍 Viajes con coordenadas:`, tripsWithCoordsResult.map(t => ({ title: t.title, city: t.city?.nameCity, coords: [t.lat, t.lng] })));
    return tripsWithCoordsResult;
  }, [trips]);

  // Detectar marcadores en la misma ubicación y aplicar offsets a las coordenadas para separarlos
  const tripsWithOffsets = useMemo(() => {
    // Agrupar viajes por coordenadas similares usando un objeto simple
    const coordinateGroups: Record<string, (PublicTrip & { lat: number; lng: number })[]> = {};
    
    tripsWithCoords.forEach((trip) => {
      // Redondear coordenadas para agrupar puntos muy cercanos
      const roundedLat = Math.round(trip.lat * 10000) / 10000;
      const roundedLng = Math.round(trip.lng * 10000) / 10000;
      const key = `${roundedLat},${roundedLng}`;
      
      if (!coordinateGroups[key]) {
        coordinateGroups[key] = [];
      }
      coordinateGroups[key].push(trip);
    });
    
    // Aplicar offsets a las coordenadas reales para separar marcadores
    return tripsWithCoords.map((trip, index) => {
      const roundedLat = Math.round(trip.lat * 10000) / 10000;
      const roundedLng = Math.round(trip.lng * 10000) / 10000;
      const key = `${roundedLat},${roundedLng}`;
      const group = coordinateGroups[key] || [];
      
      let adjustedLat = trip.lat;
      let adjustedLng = trip.lng;
      let offsetX = 0;
      let offsetY = 0;
      
      // Si hay múltiples viajes en la misma ubicación, aplicar offset a las coordenadas
      if (group.length > 1) {
        const positionInGroup = group.findIndex(t => t.idTrip === trip.idTrip);
        const totalInGroup = group.length;
        
        // Calcular offset en grados (muy pequeño para no alejarlos mucho)
        // Aproximadamente 0.001 grados = ~100 metros
        const offsetInDegrees = 0.0005; // ~50 metros de separación
        
        // Distribuir en un círculo alrededor del punto original
        const angle = (positionInGroup / totalInGroup) * 2 * Math.PI;
        adjustedLat = trip.lat + Math.sin(angle) * offsetInDegrees;
        adjustedLng = trip.lng + Math.cos(angle) * offsetInDegrees;
        
        // También calcular offset en píxeles para los popups
        const radius = 60; // píxeles
        offsetX = Math.cos(angle) * radius;
        offsetY = Math.sin(angle) * radius - 10; // Un poco arriba para mejor visibilidad
      }

      return {
        ...trip,
        adjustedLat,
        adjustedLng,
        offsetX,
        offsetY,
        hasNearby: group.length > 1,
        groupSize: group.length,
      };
    });
  }, [tripsWithCoords]);

  // Calcular el centro del mapa basado en los viajes
  const mapCenter = useMemo(() => {
    if (tripsWithCoords.length === 0) {
      return { lng: -74.0817, lat: 4.6097 }; // Bogotá por defecto
    }

    const avgLng =
      tripsWithCoords.reduce((sum, trip) => sum + trip.lng, 0) /
      tripsWithCoords.length;
    const avgLat =
      tripsWithCoords.reduce((sum, trip) => sum + trip.lat, 0) /
      tripsWithCoords.length;

    return { lng: avgLng, lat: avgLat };
  }, [tripsWithCoords]);

  // Calcular el zoom apropiado basado en la distribución de los puntos
  const mapZoom = useMemo(() => {
    if (tripsWithCoords.length === 0) return 6;
    if (tripsWithCoords.length === 1) return 12;

    // Calcular el bounding box
    const lngs = tripsWithCoords.map((t) => t.lng);
    const lats = tripsWithCoords.map((t) => t.lat);
    const lngDiff = Math.max(...lngs) - Math.min(...lngs);
    const latDiff = Math.max(...lats) - Math.min(...lats);
    const maxDiff = Math.max(lngDiff, latDiff);

    // Si los puntos están muy cerca (misma ciudad), usar zoom más cercano para evitar amontonamiento
    // Ajustar zoom basado en la diferencia máxima, con zoom más cercano para puntos cercanos
    if (maxDiff > 10) return 4;
    if (maxDiff > 5) return 5;
    if (maxDiff > 2) return 6;
    if (maxDiff > 1) return 7;
    if (maxDiff > 0.5) return 8;
    if (maxDiff > 0.1) return 10; // Zoom más cercano para puntos en la misma ciudad
    if (maxDiff > 0.05) return 11;
    if (maxDiff > 0.01) return 12;
    return 13; // Zoom muy cercano si están prácticamente en el mismo lugar
  }, [tripsWithCoords]);

  if (tripsWithCoords.length === 0) {
    return (
      <div className="absolute inset-0 bg-linear-to-b from-[#f1f1ef] to-[#e7ebe8] dark:from-[#1e1e1e] dark:to-[#141414] flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No hay viajes con coordenadas disponibles
        </p>
      </div>
    );
  }

  // Animación del mapa cuando se carga
  useEffect(() => {
    if (mapContainerRef.current) {
      gsap.fromTo(
        mapContainerRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
        }
      );
    }
  }, []);

  // Animación de los marcadores cuando aparecen
  useEffect(() => {
    if (tripsWithOffsets.length > 0) {
      // Pequeño delay para que el mapa se cargue primero
      const timer = setTimeout(() => {
        const markers = document.querySelectorAll(".marker-price");
        gsap.fromTo(
          markers,
          {
            opacity: 0,
            scale: 0,
            rotation: -180,
          },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.6,
            stagger: {
              amount: 0.8,
              from: "random",
            },
            ease: "back.out(1.7)",
          }
        );
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [tripsWithOffsets]);

  // Animación de la tarjeta centrada cuando aparece/desaparece
  useEffect(() => {
    if (cardRef.current) {
      if (hoveredTrip) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, scale: 0.8, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: "back.out(1.7)",
          }
        );
      } else {
        gsap.to(cardRef.current, {
          opacity: 0,
          scale: 0.8,
          y: 20,
          duration: 0.3,
          ease: "power2.in",
        });
      }
    }
  }, [hoveredTrip]);

  return (
    <div ref={mapContainerRef} className="absolute inset-0 w-full h-full">
      <MapComponent
        center={[mapCenter.lng, mapCenter.lat]}
        zoom={mapZoom}
        dragPan={true}
        scrollZoom={true}
        boxZoom={false}
        doubleClickZoom={true}
        keyboard={false}
        touchZoomRotate={true}
        minZoom={2}
        maxZoom={18}
        styles={{
          light: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
          dark: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json", // Usar el mismo estilo colorido para dark también
        }}
      >
        <MapControls showZoom={true} position="bottom-right" />
        
        {tripsWithOffsets.map((trip, index) => {
          const priceFrom = trip.expeditions?.[0]?.priceAdult || trip.price;
          const priceLabel = priceFrom
            ? new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency:
                  trip.expeditions?.[0]?.currency || trip.currency || "COP",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(priceFrom)
            : "Ver";

          const coverImage = trip.coverImage || trip.galleryImages?.[0]?.imageUrl || null;

          return (
            <MapMarker
              key={trip.idTrip}
              longitude={trip.adjustedLng}
              latitude={trip.adjustedLat}
            >
              <MarkerContent className="cursor-pointer">
                <div
                  onMouseEnter={() => {
                    // Solo mostrar tarjeta centrada si hay puntos cercanos
                    if (trip.hasNearby) {
                      setHoveredTrip(trip);
                    }
                  }}
                  onMouseLeave={() => {
                    if (trip.hasNearby) {
                      setHoveredTrip(null);
                    }
                  }}
                  className="marker-price p-2"
                  style={{ 
                    cursor: 'pointer',
                    display: 'inline-block',
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <Link
                    href={`/customers/${trip.idTrip}`}
                    className="flex items-center gap-1 rounded-full border-2 border-white bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-lg hover:bg-primary/90 transition-colors"
                    style={{ cursor: 'pointer', display: 'inline-block' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Animación al hacer click
                      gsap.to(e.currentTarget, {
                        scale: 0.9,
                        duration: 0.1,
                        yoyo: true,
                        repeat: 1,
                        ease: "power2.inOut",
                      });
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.cursor = 'pointer';
                      gsap.to(e.currentTarget, {
                        scale: 1.15,
                        duration: 0.3,
                        ease: "back.out(1.7)",
                      });
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.cursor = 'pointer';
                      gsap.to(e.currentTarget, {
                        scale: 1,
                        duration: 0.2,
                        ease: "power2.out",
                      });
                    }}
                  >
                    {priceLabel}
                  </Link>
                </div>
              </MarkerContent>
              
              {/* Tooltip deshabilitado cuando hay puntos cercanos - solo usamos la tarjeta centrada */}
              {!trip.hasNearby && (
                <MarkerTooltip
                  offset={[trip.offsetX, trip.offsetY - 10]}
                  className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden min-w-[280px] max-w-[320px] p-0 m-0"
                >
                  {coverImage && (
                    <div className="relative w-full h-40 overflow-hidden rounded-t-xl">
                      <Image
                        src={coverImage}
                        alt={trip.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <Link
                      href={`/customers/${trip.idTrip}`}
                      className="block"
                      style={{ cursor: 'pointer' }}
                    >
                      <h4 className="font-bold text-base mb-1 hover:text-primary transition-colors line-clamp-2">
                        {trip.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {trip.destinationRegion ? (
                          <>
                            <span>{trip.destinationRegion}</span>
                            {trip.city?.nameCity && (
                              <>
                                <span>•</span>
                                <span>{trip.city.nameCity}</span>
                              </>
                            )}
                          </>
                        ) : (
                          <span>{trip.city?.nameCity || ""}</span>
                        )}
                      </div>
                      {trip.durationDays && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {trip.durationDays} {trip.durationDays === 1 ? "día" : "días"}
                        </p>
                      )}
                      {priceFrom && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Desde</p>
                          <p className="text-lg font-bold text-primary">
                            {priceLabel}
                            <span className="text-xs font-normal text-gray-500"> / pers.</span>
                          </p>
                        </div>
                      )}
                    </Link>
                  </div>
                </MarkerTooltip>
              )}
              
              {/* Popup que aparece al hacer click */}
              <MarkerPopup 
                closeButton={false}
                offset={[trip.offsetX, trip.offsetY]}
              >
                <div className="min-w-[200px]">
                  <Link
                    href={`/customers/${trip.idTrip}`}
                    className="block"
                  >
                    <h4 className="font-bold text-sm mb-1 hover:text-primary transition-colors">
                      {trip.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {trip.city?.nameCity || ""}
                    </p>
                    {priceFrom && (
                      <p className="text-sm font-bold text-primary mt-2">
                        {priceLabel}
                      </p>
                    )}
                  </Link>
                </div>
              </MarkerPopup>
            </MapMarker>
          );
        })}
      </MapComponent>
      
      {/* Tarjeta centrada que aparece al hacer hover sobre un marcador */}
      {hoveredTrip && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div
            ref={cardRef}
            className="min-w-[280px] max-w-[320px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {hoveredTrip.coverImage || hoveredTrip.galleryImages?.[0]?.imageUrl ? (
              <div className="relative w-full h-40 overflow-hidden">
                <Image
                  src={hoveredTrip.coverImage || hoveredTrip.galleryImages?.[0]?.imageUrl || ""}
                  alt={hoveredTrip.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="p-4">
              <Link
                href={`/customers/${hoveredTrip.idTrip}`}
                className="block pointer-events-auto"
              >
                <h4 className="font-bold text-base mb-1 hover:text-primary transition-colors line-clamp-2">
                  {hoveredTrip.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {hoveredTrip.destinationRegion ? (
                    <>
                      <span>{hoveredTrip.destinationRegion}</span>
                      {hoveredTrip.city?.nameCity && (
                        <>
                          <span>•</span>
                          <span>{hoveredTrip.city.nameCity}</span>
                        </>
                      )}
                    </>
                  ) : (
                    <span>{hoveredTrip.city?.nameCity || ""}</span>
                  )}
                </div>
                {hoveredTrip.durationDays && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {hoveredTrip.durationDays} {hoveredTrip.durationDays === 1 ? "día" : "días"}
                  </p>
                )}
                {(hoveredTrip.expeditions?.[0]?.priceAdult || hoveredTrip.price) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Desde</p>
                    <p className="text-lg font-bold text-primary">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency:
                          hoveredTrip.expeditions?.[0]?.currency || hoveredTrip.currency || "COP",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(hoveredTrip.expeditions?.[0]?.priceAdult || hoveredTrip.price || 0)}
                      <span className="text-xs font-normal text-gray-500"> / pers.</span>
                    </p>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{
    origen?: string | string[];
    destino?: string | string[];
    fechas?: string | string[];
    viajeros?: string | string[];
    tipo?: string | string[];
    page?: string | string[];
  }>;
}) {
  // Desenvolver la Promise usando React.use()
  const params = use(searchParams);
  
  const origin = getParamValue(params?.origen);
  const destination = getParamValue(params?.destino);
  const dates = getParamValue(params?.fechas);
  const travelers = getParamValue(params?.viajeros);
  const travelType = getParamValue(params?.tipo);
  const currentPage = parseInt(getParamValue(params?.page) || "1");

  const [trips, setTrips] = useState<PublicTripsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tripsContainerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Convertir parámetros del frontend a parámetros del endpoint
        const filters: TripFilters = {
          page: currentPage,
          limit: 20,
        };

        // Convertir destino: si es número, usar idCity; si es texto, usar parámetro destino
        if (destination) {
          const cityId = parseInt(destination);
          if (!isNaN(cityId)) {
            // Es un ID numérico
            filters.idCity = destination;
          } else {
            // Es un nombre de ciudad, usar el parámetro destino
            // El backend acepta destino=Bogotá para buscar por nombre
            // Lo agregamos directamente al query string más abajo
          }
        }

        // Convertir fechas al formato ISO
        if (dates) {
          // Asumimos formato "DD/MM/YYYY - DD/MM/YYYY" o similar
          // Por ahora, si viene en formato ISO, lo usamos directamente
          const dateParts = dates.split(" - ");
          if (dateParts.length === 2) {
            try {
              const startDate = new Date(dateParts[0].trim());
              const endDate = new Date(dateParts[1].trim());
              if (!isNaN(startDate.getTime())) {
                filters.startDate = startDate.toISOString();
              }
              if (!isNaN(endDate.getTime())) {
                filters.endDate = endDate.toISOString();
              }
            } catch {
              // Si no se puede parsear, ignorar
            }
          } else {
            // Intentar parsear como fecha única o ISO
            try {
              const date = new Date(dates);
              if (!isNaN(date.getTime())) {
                filters.startDate = date.toISOString();
              }
            } catch {
              // Ignorar si no se puede parsear
            }
          }
        }

        // Convertir viajeros a número
        if (travelers) {
          const persons = parseInt(travelers);
          if (!isNaN(persons) && persons > 0) {
            filters.persons = persons;
          }
        }

        // Construir query string
        const params = new URLSearchParams();
        if (origin) {
          params.append("origen", origin);
        }
        if (filters.idCity) {
          params.append("idCity", filters.idCity);
        } else if (destination && isNaN(parseInt(destination))) {
          // Si destination no es un número, es un nombre de ciudad
          params.append("destino", destination);
        }
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);
        if (filters.persons) params.append("persons", filters.persons.toString());
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());

        // Intentar primero con /trips (endpoint público)
        let response;
        const url = `/trips?${params.toString()}`;
        console.log(`🔍 Buscando viajes en: ${url}`);
        console.log(`📋 Filtros aplicados:`, filters);
        
        try {
          response = await api.get<PublicTripsResponse>(url);
        } catch (error: any) {
          // Si falla con 404, intentar con /public/trips
          if (error.response?.status === 404) {
            const publicUrl = `/public/trips?${params.toString()}`;
            console.log(`⚠️ /trips no encontrado, intentando: ${publicUrl}`);
            response = await api.get<PublicTripsResponse>(publicUrl);
          } else {
            throw error;
          }
        }
        
        console.log(`✅ Viajes recibidos del backend:`, response.data);
        console.log(`📊 Total de viajes: ${response.data.data?.length || 0}`);
        if (response.data.data && response.data.data.length > 0) {
          console.log(`🏙️ Ciudades en los resultados:`, response.data.data.map(t => ({ 
            idTrip: t.idTrip, 
            title: t.title, 
            city: t.city?.nameCity, 
            idCity: t.idCity,
            hasCoords: !!(t.latitude && t.longitude),
            routePoints: t.routePoints?.length || 0
          })));
        }
        
        setTrips(response.data);
      } catch (err: any) {
        console.error("Error al cargar viajes:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Error al cargar los viajes"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [origin, destination, dates, travelers, travelType, currentPage, params]);

  // Animaciones de entrada para el navbar y filtros
  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
        }
      );
    }
  }, []);

  // Animación de las tarjetas de viajes cuando aparecen
  useEffect(() => {
    if (trips && trips.data.length > 0 && tripsContainerRef.current && !loading) {
      const cards = tripsContainerRef.current.querySelectorAll("article");
      
      // Resetear estilos antes de animar
      gsap.set(cards, { opacity: 0, y: 50, scale: 0.9 });
      
      // Animación stagger para las tarjetas
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: {
          amount: 0.8,
          from: "start",
        },
        ease: "back.out(1.2)",
      });
    }
  }, [trips, loading]);

  // Animación del header cuando cambia
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power3.out",
        }
      );
    }
  }, [destination, dates, travelers]);

  // Animación de los filtros activos
  useEffect(() => {
    if (filtersRef.current) {
      const filterTags = filtersRef.current.querySelectorAll("span");
      gsap.fromTo(
        filterTags,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
        }
      );
    }
  }, [destination, dates, travelers]);

  return (
    <div className="flex flex-col h-screen bg-[#fdfdfc] text-[#121717] dark:bg-[#1a1a1a] dark:text-gray-100 overflow-hidden">
      <CustomersNav />
      
      <nav ref={navRef} className="sticky top-0 z-40 border-b border-[#ebefef] bg-[#fdfdfc] py-3 shadow-sm dark:border-gray-800 dark:bg-[#1a1a1a] shrink-0">
        <div className="mx-auto flex w-full max-w-full items-center justify-between gap-4 px-6 md:px-20">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {[
              { label: "Presupuesto" },
              { label: "Tipo de viaje" },
              { label: "Duración" },
              { label: "Cancelación gratuita" },
              { label: "Experiencias" },
            ].map((filter, index) => (
              <button
                key={filter.label}
                className="filter-button flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#ebefef] px-5 text-sm font-medium transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                type="button"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1.05,
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
                <span>{filter.label}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            ))}
          </div>
          <button
            className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm font-bold shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            type="button"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1.05,
                y: -2,
                duration: 0.3,
                ease: "back.out(1.7)",
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1,
                y: 0,
                duration: 0.2,
                ease: "power2.out",
              });
            }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </button>
        </div>
      </nav>

      <main className="flex flex-1 overflow-hidden min-h-0">
        <section className="w-full overflow-y-auto bg-[#fdfdfc] px-20 py-8 dark:bg-[#1a1a1a] lg:w-[60%]">
          <div ref={headerRef} className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                Resultados para{" "}
                <span className="text-primary">
                  {destination || "Cualquier lugar"}
                </span>
              </h3>
              {origin && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Saliendo desde <span className="font-semibold text-[#121717] dark:text-white">{origin}</span>
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {travelType
                  ? `Tipo: ${travelType}`
                  : "Explora experiencias premium seleccionadas"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <span>Ordenar por:</span>
              <button
                className="flex items-center gap-1 font-bold text-[#121717] dark:text-white"
                type="button"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1.05,
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
                Recomendados <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={filtersRef} className="mb-8 flex flex-wrap gap-2">
            {[
              { label: "Origen", value: origin || "Cualquiera" },
              { label: "Destino", value: destination || "Cualquier lugar" },
              { label: "Fechas", value: dates || "Cualquier semana" },
              { label: "Viajeros", value: travelers || "Añadir" },
            ].map((filter) => (
              <span
                key={filter.label}
                className="filter-tag rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1.1,
                    backgroundColor: "#f3f4f6",
                    duration: 0.2,
                    ease: "power2.out",
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1,
                    backgroundColor: "white",
                    duration: 0.2,
                    ease: "power2.out",
                  });
                }}
              >
                {filter.label}: {filter.value}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col gap-3">
                  {/* Skeleton de imagen */}
                  <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse">
                    <div className="absolute inset-0 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 bg-size-[200%_100%] animate-shimmer" />
                  </div>
                  {/* Skeleton de contenido */}
                  <div className="px-1 space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
                    <div className="flex gap-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20 animate-pulse" />
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse" />
                    <div className="flex items-end justify-between">
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16 animate-pulse" />
                        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse" />
                      </div>
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-xl bg-primary px-6 py-2 text-white font-bold hover:bg-primary/90"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : trips && trips.data.length > 0 ? (
            <>
              <div ref={tripsContainerRef} className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {trips.data.map((trip) => (
                  <PublicTripCard key={trip.idTrip} trip={trip} />
                ))}
              </div>

              {trips.pagination && trips.pagination.totalPages > 1 && (
                <div className="mb-8 mt-12 flex flex-col items-center gap-4">
                  <p className="text-sm text-gray-500">
                    Mostrando {trips.data.length} de {trips.pagination.total} resultados
                  </p>
                  <div className="h-1 w-64 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${
                          (trips.pagination.page / trips.pagination.totalPages) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    {trips.pagination.page > 1 && (
                      <a
                        href={`/customers/search?${new URLSearchParams({
                          ...(origin && { origen: origin }),
                          ...(destination && { destino: destination }),
                          ...(dates && { fechas: dates }),
                          ...(travelers && { viajeros: travelers }),
                          ...(travelType && { tipo: travelType }),
                          page: (trips.pagination.page - 1).toString(),
                        }).toString()}`}
                        className="pagination-btn rounded-xl border-2 border-[#121717] px-6 py-2 font-bold transition-all hover:bg-[#121717] hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
                        onMouseEnter={(e) => {
                          gsap.to(e.currentTarget, {
                            scale: 1.05,
                            y: -2,
                            duration: 0.3,
                            ease: "back.out(1.7)",
                          });
                        }}
                        onMouseLeave={(e) => {
                          gsap.to(e.currentTarget, {
                            scale: 1,
                            y: 0,
                            duration: 0.2,
                            ease: "power2.out",
                          });
                        }}
                      >
                        Anterior
                      </a>
                    )}
                    {trips.pagination.page < trips.pagination.totalPages && (
                      <a
                        href={`/customers/search?${new URLSearchParams({
                          ...(origin && { origen: origin }),
                          ...(destination && { destino: destination }),
                          ...(dates && { fechas: dates }),
                          ...(travelers && { viajeros: travelers }),
                          ...(travelType && { tipo: travelType }),
                          page: (trips.pagination.page + 1).toString(),
                        }).toString()}`}
                        className="pagination-btn rounded-xl border-2 border-[#121717] px-6 py-2 font-bold transition-all hover:bg-[#121717] hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
                        onMouseEnter={(e) => {
                          gsap.to(e.currentTarget, {
                            scale: 1.05,
                            y: -2,
                            duration: 0.3,
                            ease: "back.out(1.7)",
                          });
                        }}
                        onMouseLeave={(e) => {
                          gsap.to(e.currentTarget, {
                            scale: 1,
                            y: 0,
                            duration: 0.2,
                            ease: "power2.out",
                          });
                        }}
                      >
                        Siguiente
                      </a>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No se encontraron viajes con los filtros seleccionados
                </p>
                <a
                  href="/customers/search"
                  className="rounded-xl bg-primary px-6 py-2 text-white font-bold hover:bg-primary/90"
                >
                  Limpiar filtros
                </a>
              </div>
            </div>
          )}
        </section>

        <aside className="relative hidden w-[40%] border-l border-[#ebefef] dark:border-gray-800 lg:block h-full overflow-hidden">
          {/* Mapa real con marcadores de los viajes */}
          {trips && trips.data.length > 0 ? (
            <TripsMap trips={trips.data} />
          ) : (
            <div className="absolute inset-0 bg-linear-to-b from-[#f1f1ef] to-[#e7ebe8] dark:from-[#1e1e1e] dark:to-[#141414]" />
          )}
        </aside>
      </main>

      <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 lg:hidden">
        <button
          className="flex items-center gap-2 rounded-full bg-[#121717] px-6 py-3.5 font-bold tracking-tight text-white shadow-2xl transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-[#121717]"
          type="button"
        >
          <MapIcon className="h-4 w-4" />
          Ver mapa
        </button>
      </div>
    </div>
  );
}

export default SearchResultsPage;