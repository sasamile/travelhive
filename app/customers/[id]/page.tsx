"use client";

import { useEffect, useState, useMemo, useRef, Suspense, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import CustomersNav from "@/components/customers/CustomersNav";
import { Heart, Share2, Star } from 'lucide-react';
import { ActionButton } from '@/components/customers/experience/ActionButton';
import { AgentInfo } from '@/components/customers/experience/AgentInfo';
import { BookingCard } from '@/components/customers/experience/BookingCard';
import { ExperienceFooter } from '@/components/customers/experience/ExperienceFooter';
import { GalleryGrid } from '@/components/customers/experience/GalleryGrid';
import { Itinerary } from '@/components/customers/experience/Itinerary';
import { MapSection } from '@/components/customers/experience/MapSection';
import { PoliciesSection } from '@/components/customers/experience/PoliciesSection';
import { ReviewsSection } from '@/components/customers/experience/ReviewsSection';
import toast from 'react-hot-toast';
import { TrustBadges } from '@/components/customers/experience/TrustBadges';
import { PublicTrip } from '@/types/trips';
import api from '@/lib/axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlaneLanding, Landmark, Leaf, Sun, ShieldCheck, CalendarX } from 'lucide-react';
import type { GalleryImage, ItineraryDay, InfoItem } from '@/components/customers/experience/data';

function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse ${className}`}
    />
  );
}

function TripDetailSkeleton() {
  return (
    <div className="bg-[#fdfdfc] text-[#121717] dark:bg-[#1a1a1a] dark:text-gray-100 min-h-screen">
      <CustomersNav />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="space-y-3 w-full">
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>
            <div className="h-10 w-3/4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-4 w-56 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="h-10 w-32 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-10 w-28 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-12">
          <div className="md:col-span-2 aspect-4/3 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            <div className="aspect-4/3 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="aspect-4/3 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <SkeletonLine className="w-48" />
                  <SkeletonLine className="w-32 h-3" />
                </div>
              </div>
            </div>

            <section className="space-y-4">
              <div className="h-7 w-56 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="space-y-3">
                <SkeletonLine className="w-full" />
                <SkeletonLine className="w-11/12" />
                <SkeletonLine className="w-10/12" />
                <SkeletonLine className="w-9/12" />
              </div>
            </section>

            <section className="space-y-6 pt-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="h-7 w-48 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
              </div>
              <div className="w-full h-[400px] rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 p-8 bg-white dark:bg-gray-900">
                <div className="space-y-3 mb-8">
                  <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  <div className="h-5 w-28 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                </div>
                <div className="h-28 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 animate-pulse mb-8" />
                <div className="h-12 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse mb-4" />
                <div className="h-3 w-44 mx-auto rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
              </div>
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
                <div className="space-y-3">
                  <SkeletonLine className="w-40" />
                  <SkeletonLine className="w-56 h-3" />
                  <SkeletonLine className="w-52 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tripId = params.id as string;
  const [trip, setTrip] = useState<PublicTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [reviewsStats, setReviewsStats] = useState<{ averageRating: number; totalReviews: number } | null>(null);
  const promoterCode = searchParams.get('promoter');
  const viewRegistered = useRef(false); // Para evitar registrar múltiples veces

  // Verificar si el viaje está en favoritos
  useEffect(() => {
    const checkFavorite = async () => {
      if (!tripId) return;
      
      try {
        // Intentar obtener favoritos y verificar si este trip está en la lista
        const favoritesResponse = await api.get("/favorites/trips");
        const favorites = favoritesResponse.data?.data || [];
        const isFav = favorites.some((fav: any) => fav.idTrip === tripId);
        setIsFavorite(isFav);
      } catch (err: any) {
        // Si falla, asumir que no está en favoritos
        setIsFavorite(false);
      }
    };

    if (tripId) {
      checkFavorite();
    }
  }, [tripId]);

  // Función para cargar estadísticas de reseñas
  const loadReviewsStats = useCallback(async () => {
    if (!tripId) return;

    try {
      const reviewsResponse = await api.get(`/reviews/trips/${tripId}?page=1&limit=1`);
      const stats = reviewsResponse.data?.stats;
      if (stats) {
        setReviewsStats(prevStats => {
          // Solo actualizar si realmente cambió
          if (prevStats && 
              prevStats.averageRating === stats.averageRating &&
              prevStats.totalReviews === stats.totalReviews) {
            return prevStats;
          }
          return {
            averageRating: stats.averageRating || 0,
            totalReviews: stats.totalReviews || 0,
          };
        });
      } else {
        setReviewsStats(null);
      }
    } catch (err: any) {
      // Si falla, dejar stats en null
      setReviewsStats(null);
    }
  }, [tripId]);

  // Cargar estadísticas de reseñas inicialmente
  useEffect(() => {
    if (tripId) {
      loadReviewsStats();
    }
  }, [tripId, loadReviewsStats]);

  // Función para actualizar estadísticas cuando se crean/actualizan reseñas
  const handleReviewsUpdate = useCallback(async () => {
    await loadReviewsStats();
  }, [loadReviewsStats]);

  // Registrar vista de promoter si existe en la URL
  useEffect(() => {
    const registerPromoterView = async () => {
      if (!tripId || !promoterCode || viewRegistered.current) {
        return;
      }

      try {
        viewRegistered.current = true;
        const response = await api.post(`/trips/${tripId}/view`, {}, {
          params: { promoter: promoterCode }
        });
        console.log('Vista de promoter registrada:', response.data);
      } catch (err: any) {
        // No mostrar error al usuario, solo loguear
        console.warn('Error al registrar vista de promoter:', err?.response?.data?.message || err?.message);
        // Si falla, permitir intentar de nuevo en la próxima carga
        viewRegistered.current = false;
      }
    };

    // Registrar vista después de un pequeño delay para no bloquear la carga del viaje
    if (promoterCode) {
      const timer = setTimeout(() => {
        registerPromoterView();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tripId, promoterCode]);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Intentar primero con /trips/{id}
        let response;
        try {
          response = await api.get<{ data: PublicTrip }>(`/trips/${tripId}`);
        } catch (err: any) {
          // Si falla con 404, intentar con /public/trips/{id}
          if (err.response?.status === 404) {
            response = await api.get<{ data: PublicTrip }>(`/public/trips/${tripId}`);
          } else {
            throw err;
          }
        }
        
        const tripData = response.data?.data || response.data;
        if (tripData) {
          setTrip(tripData as PublicTrip);
        } else {
          setError('Viaje no encontrado');
        }
      } catch (err: any) {
        console.error('Error al cargar el viaje:', err);
        setError(err.response?.data?.message || 'Error al cargar el viaje');
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchTrip();
    }
  }, [tripId]);

  // Transformar galería al formato esperado
  const galleryImages: GalleryImage[] = useMemo(() => {
    if (!trip?.galleryImages || trip.galleryImages.length === 0) return [];
    
    const images = trip.galleryImages.slice(0, 5);
    return images.map((img, idx) => ({
      src: img.imageUrl,
      alt: `Foto ${idx + 1} del viaje ${trip.title}`,
      className: idx === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1",
    }));
  }, [trip?.galleryImages, trip?.title]);

  // Transformar itinerario al formato esperado
  const itineraryDays: ItineraryDay[] = useMemo(() => {
    if (!trip?.itineraryDays || trip.itineraryDays.length === 0) return [];
    
    const icons = [PlaneLanding, Landmark, Leaf, Sun];
    return trip.itineraryDays.map((day, idx) => ({
      title: `Día ${day.day}: ${day.title}`,
      description: day.subtitle || day.activities?.[0]?.title || `Actividades del día ${day.day}`,
      icon: icons[idx % icons.length] || PlaneLanding,
    }));
  }, [trip?.itineraryDays]);

  // Formatear fechas
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "A confirmar";
    try {
      return format(new Date(dateString), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return "A confirmar";
    }
  };

  // Obtener precio desde expeditions o price
  const priceFrom = trip?.expeditions?.[0]?.priceAdult || trip?.price;
  const currency = trip?.expeditions?.[0]?.currency || trip?.currency || "COP";

  // Ubicación para mostrar
  const location = trip?.destinationRegion 
    ? `${trip.destinationRegion}${trip.city?.nameCity ? ` • ${trip.city.nameCity}` : ''}`
    : trip?.city?.nameCity || "Ubicación no especificada";

  // Toggle favorito
  const handleToggleFavorite = async () => {
    if (!tripId || togglingFavorite) return;

    try {
      setTogglingFavorite(true);
      const response = await api.post(`/favorites/trips/${tripId}`);
      
      const newFavoriteState = response.data?.data?.isFavorite || false;
      setIsFavorite(newFavoriteState);
      
      toast.success(
        newFavoriteState 
          ? "Agregado a favoritos" 
          : "Removido de favoritos"
      );
    } catch (err: any) {
      console.error("Error al toggle favorito:", err);
      toast.error(err?.response?.data?.message || "No se pudo actualizar favoritos");
    } finally {
      setTogglingFavorite(false);
    }
  };

  if (loading) {
    return <TripDetailSkeleton />;
  }

  if (error || !trip) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-500">{error || 'Viaje no encontrado'}</div>
        </div>
      </main>
    );
  }

  return (
    <div className="bg-[#fdfdfc] text-[#121717] dark:bg-[#1a1a1a] dark:text-gray-100 min-h-screen">
      <CustomersNav />
      <main className="max-w-332 mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-caveat font-bold tracking-tight">
            {trip.title}
          </h1>
          <div className="flex items-center gap-4 text-sm">
            {reviewsStats && reviewsStats.totalReviews > 0 ? (
              <span className="flex items-center gap-1 font-semibold">
                <Star className="size-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold">{reviewsStats.averageRating.toFixed(1)}</span>
                <a href="#reviews" className="hover:underline text-gray-600 dark:text-gray-400">
                  ({reviewsStats.totalReviews} {reviewsStats.totalReviews === 1 ? 'reseña' : 'reseñas'})
                </a>
              </span>
            ) : (
              <span className="flex items-center gap-1 font-semibold text-gray-500">
                <Star className="size-4 text-gray-400" />
                <a href="#reviews" className="hover:underline">
                  Sin reseñas aún
                </a>
              </span>
            )}
            <span className="text-gray-400">•</span>
            <span className="underline font-medium cursor-pointer">
              {location}
            </span>
            {(trip.startDate || trip.endDate) && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 text-xs">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <ActionButton icon={Share2} label="Compartir" />
          <button
            onClick={handleToggleFavorite}
            disabled={togglingFavorite}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all font-semibold text-sm ${
              isFavorite
                ? "border-pink-300 dark:border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            } ${togglingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Heart className={`size-4 ${isFavorite ? "fill-pink-500 dark:fill-pink-400 text-pink-500 dark:text-pink-400" : ""}`} />
            {isFavorite ? "Guardado" : "Guardar"}
          </button>
        </div>
      </div>

      {galleryImages.length > 0 && (
        <GalleryGrid 
          images={galleryImages} 
          allImages={trip.galleryImages.map(img => img.imageUrl)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          <AgentInfo 
            agencyName={trip.agency?.nameAgency}
            agencyPicture={trip.agency?.picture}
          />
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Sobre esta experiencia
            </h2>
            <div 
              className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg prose max-w-none"
              dangerouslySetInnerHTML={{ __html: trip.description || "" }}
            />
          </section>
          {itineraryDays.length > 0 && <Itinerary items={itineraryDays} />}
          {trip.routePoints && trip.routePoints.length > 0 && (
            <MapSection 
              routePoints={trip.routePoints.map(rp => ({
                latitude: rp.latitude,
                longitude: rp.longitude,
                name: rp.name,
                order: rp.order,
              }))}
              destinationRegion={trip.destinationRegion}
            />
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            <BookingCard 
              idTrip={trip.idTrip}
              expeditions={trip.expeditions}
              priceFallback={priceFrom}
              currencyFallback={currency}
              startDateFallback={trip.startDate}
              endDateFallback={trip.endDate}
              maxPersons={trip.maxPersons}
              promoterCode={promoterCode || undefined}
            />
            <TrustBadges items={[
              {
                icon: ShieldCheck,
                title: "Pago Seguro",
                description: "Tus datos están protegidos por encriptación de grado militar.",
              },
              {
                icon: CalendarX,
                title: "Cancelación Flexible",
                description: "Consulta las políticas de cancelación.",
              },
            ]} />
          </div>
        </div>
      </div>

      <div id="reviews">
        <ReviewsSection tripId={trip.idTrip} onReviewsUpdate={handleReviewsUpdate} />
      </div>
      <PoliciesSection rules={[]} safety={[]} />
      <ExperienceFooter links={['Privacidad', 'Términos', 'Mapa del sitio', 'Contacto']} />
      </main>
    </div>
  );
}

function Page() {
  return (
    <Suspense fallback={<TripDetailSkeleton />}>
      <PageContent />
    </Suspense>
  );
}

export default Page;
