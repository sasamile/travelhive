"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import CustomersNav from "@/components/customers/CustomersNav";
import { Heart, Share2, Star } from 'lucide-react';
import { ActionButton } from '@/components/customers/experience/ActionButton';
import { AgentInfo } from '@/components/customers/experience/AgentInfo';
import { Breadcrumbs } from '@/components/customers/experience/Breadcrumbs';
import { BookingCard } from '@/components/customers/experience/BookingCard';
import { ExperienceFooter } from '@/components/customers/experience/ExperienceFooter';
import { GalleryGrid } from '@/components/customers/experience/GalleryGrid';
import { Itinerary } from '@/components/customers/experience/Itinerary';
import { MapSection } from '@/components/customers/experience/MapSection';
import { PoliciesSection } from '@/components/customers/experience/PoliciesSection';
import { ReviewsSection } from '@/components/customers/experience/ReviewsSection';
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

function Page() {
  const params = useParams();
  const tripId = params.id as string;
  const [trip, setTrip] = useState<PublicTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="space-y-2">
          <Breadcrumbs items={[
            { label: "Inicio", href: "/customers" },
            { label: "Experiencias", href: "/customers/search" },
            { label: trip.category || "Viaje" },
          ]} />
          <h1 className="text-4xl font-extrabold tracking-tight">
            {trip.title}
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 font-semibold">
              <Star className="size-4 text-yellow-500" /> Sin reseñas aún
            </span>
            <span className="text-gray-400">•</span>
            <span className="underline font-medium cursor-pointer">
              {location}
            </span>
            {(trip.startDate || trip.endDate) && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <ActionButton icon={Share2} label="Compartir" />
          <ActionButton icon={Heart} label="Guardar" />
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

      <ReviewsSection rating="0.00" total="0" reviews={[]} />
      <PoliciesSection rules={[]} safety={[]} />
      <ExperienceFooter links={['Privacidad', 'Términos', 'Mapa del sitio', 'Contacto']} />
      </main>
    </div>
  );
}

export default Page;
