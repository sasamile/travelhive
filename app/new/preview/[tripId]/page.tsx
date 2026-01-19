"use client";

import { useParams, useRouter } from "next/navigation";
import { Send, Star, Heart, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { GalleryGrid } from "@/components/customers/experience/GalleryGrid";
import { AgentInfo } from "@/components/customers/experience/AgentInfo";
import { Itinerary } from "@/components/customers/experience/Itinerary";
import { MapSection } from "@/components/customers/experience/MapSection";
import { BookingCard } from "@/components/customers/experience/BookingCard";
import { PoliciesSection } from "@/components/customers/experience/PoliciesSection";
import { ReviewsSection } from "@/components/customers/experience/ReviewsSection";
import { TrustBadges } from "@/components/customers/experience/TrustBadges";
import { ExperienceFooter } from "@/components/customers/experience/ExperienceFooter";
import { Breadcrumbs } from "@/components/customers/experience/Breadcrumbs";
import { ActionButton } from "@/components/customers/experience/ActionButton";
import type { GalleryImage, ItineraryDay, InfoItem } from "@/components/customers/experience/data";
import { PlaneLanding, Landmark, Leaf, Sun, ShieldCheck, CalendarX } from "lucide-react";

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const tripIdParam = params.tripId as string;
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  
  // Si el tripId empieza con "temp_", es un ID temporal y no existe en la BD
  const isTempId = tripIdParam?.startsWith("temp_");
  const tripId = isTempId ? null : tripIdParam;

  const [publishing, setPublishing] = useState(false);

  // Cargar datos desde localStorage como fallback
  const [localStorageData, setLocalStorageData] = useState<{
    basicInfo: any | null;
    routePoints: any[] | null;
    itinerary: any[] | null;
    gallery: { galleryImages: string[]; coverImageIndex: number | null } | null;
  }>({ basicInfo: null, routePoints: null, itinerary: null, gallery: null });

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Cargar información básica desde localStorage
    const STORAGE_KEY = "trip_draft_basic_info";
    const basicStored = localStorage.getItem(STORAGE_KEY);
    let basicData = null;
    if (basicStored) {
      try {
        basicData = JSON.parse(basicStored);
      } catch (error) {
        console.error("Error al parsear información básica del localStorage:", error);
      }
    }

    // Cargar puntos de ruta desde localStorage
    const routePointsKey = `${STORAGE_KEY}_routePoints`;
    const routePointsStored = localStorage.getItem(routePointsKey);
    let routePointsData = null;
    if (routePointsStored) {
      try {
        routePointsData = JSON.parse(routePointsStored);
      } catch (error) {
        console.error("Error al parsear puntos de ruta del localStorage:", error);
      }
    }
    
    // Cargar itinerario desde localStorage
    const itineraryKey = tripId ? `trip_itinerary_draft_${tripId}` : "trip_itinerary_draft";
    const itineraryStored = localStorage.getItem(itineraryKey) || localStorage.getItem("trip_itinerary_draft");
    let itineraryData = null;
    if (itineraryStored) {
      try {
        itineraryData = JSON.parse(itineraryStored);
      } catch (error) {
        console.error("Error al parsear itinerario del localStorage:", error);
      }
    }

    // Cargar galería desde localStorage
    const galleryKey = tripId ? `trip_gallery_draft_${tripId}` : "trip_gallery_draft";
    const galleryStored = localStorage.getItem(galleryKey) || localStorage.getItem("trip_gallery_draft");
    let galleryData = null;
    if (galleryStored) {
      try {
        galleryData = JSON.parse(galleryStored);
      } catch (error) {
        console.error("Error al parsear galería del localStorage:", error);
      }
    }

    setLocalStorageData({
      basicInfo: basicData,
      routePoints: Array.isArray(routePointsData) ? routePointsData : null,
      itinerary: Array.isArray(itineraryData) ? itineraryData : null,
      gallery: galleryData,
    });
  }, [tripId]);

  // Usar datos de localStorage
  const itinerary = localStorageData.itinerary;

  // Construir objeto trip desde localStorage
  const tripData = localStorageData.basicInfo ? {
    title: localStorageData.basicInfo.title || "Viaje sin título",
    description: localStorageData.basicInfo.description || "",
    category: localStorageData.basicInfo.category || "Adventure",
    location: localStorageData.basicInfo.location || "",
    destinationRegion: localStorageData.basicInfo.destinationRegion || "",
    latitude: localStorageData.basicInfo.latitude,
    longitude: localStorageData.basicInfo.longitude,
    startDate: localStorageData.basicInfo.startDate,
    endDate: localStorageData.basicInfo.endDate,
    durationDays: localStorageData.basicInfo.durationDays || 0,
    durationNights: localStorageData.basicInfo.durationNights || 0,
    price: localStorageData.basicInfo.price,
    currency: localStorageData.basicInfo.currency,
    maxPersons: localStorageData.basicInfo.maxPersons,
    priceType: localStorageData.basicInfo.priceType,
    cancellationPolicy: localStorageData.basicInfo.cancellationPolicy,
  } : null;

  // Transformar galería al formato esperado
  const galleryImages: GalleryImage[] = useMemo(() => {
    // Usar localStorage
    if (localStorageData.gallery?.galleryImages && localStorageData.gallery.galleryImages.length > 0) {
      const images = localStorageData.gallery.galleryImages.slice(0, 5);
      return images.map((src, idx) => ({
        src,
        alt: `Foto ${idx + 1} del viaje ${tripData?.title || "Viaje"}`,
        className: idx === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1",
      }));
    }
    
    return [];
  }, [localStorageData.gallery, tripData?.title]);

  // Transformar itinerario al formato esperado
  const itineraryDays: ItineraryDay[] = useMemo(() => {
    if (!itinerary || itinerary.length === 0) return [];
    const icons = [PlaneLanding, Landmark, Leaf, Sun];
    return itinerary.map((day: any, idx: number) => ({
      title: `Día ${day.day}: ${day.title}`,
      description: day.subtitle || day.activities?.[0]?.title || `Actividades del día ${day.day}`,
      icon: icons[idx % icons.length] || PlaneLanding,
    }));
  }, [itinerary]);

  // Transformar políticas
  const rules = useMemo(() => {
    return [
      'Edad mínima según política del viaje',
      'Cumplimiento de términos y condiciones',
    ];
  }, []);

  const safety: InfoItem[] = useMemo(() => {
    return [];
  }, []);

  const trustBadges: InfoItem[] = useMemo(() => {
    return [
      {
        icon: ShieldCheck,
        title: "Pago Seguro",
        description: "Tus datos están protegidos por encriptación de grado militar.",
      },
      {
        icon: CalendarX,
        title: "Cancelación Flexible",
        description: tripData?.cancellationPolicy === "flexible"
          ? "Cancela hasta 7 días antes para reembolso completo."
          : tripData?.cancellationPolicy === "moderate"
          ? "Cancela hasta 14 días antes para reembolso del 50%."
          : "Consulta las políticas de cancelación.",
      },
    ];
  }, [tripData?.cancellationPolicy]);

  const handleSaveDraft = async () => {
    toast.success("Borrador guardado exitosamente (solo en localStorage)");
  };

  const handlePublish = async () => {
    toast("Funcionalidad de publicación pendiente de implementar");
  };

  if (!tripData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Cargando preview...</div>
      </div>
    );
  }

  const cancellationPolicyText = tripData?.cancellationPolicy === "flexible"
    ? "Reembolso total por cancelaciones realizadas dentro de las 48 horas posteriores a la reserva, siempre que falten al menos 7 días para el inicio del viaje."
    : tripData?.cancellationPolicy === "moderate"
    ? "Reembolso del 50% por cancelaciones realizadas dentro de las 48 horas posteriores a la reserva, siempre que falten al menos 14 días para el inicio del viaje."
    : tripData?.cancellationPolicy === "strict"
    ? "Sin reembolso por cancelaciones realizadas dentro de los 30 días antes del inicio del viaje."
    : "Política personalizada.";

  // Formatear fechas para mostrar
  const formatDate = (dateString?: string) => {
    if (!dateString) return "A confirmar";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
    } catch {
      return "A confirmar";
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="space-y-2">
          <Breadcrumbs items={[
            { label: "Inicio", href: "/agent" },
            { label: "Experiencias", href: "/agent" },
            { label: tripData.category || "Viaje" },
          ]} />
          <h1 className="text-4xl font-extrabold tracking-tight">
            {tripData.title}
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 font-semibold">
              <Star className="size-4 text-yellow-500" /> Sin reseñas aún
            </span>
            <span className="text-gray-400">•</span>
            <span className="underline font-medium cursor-pointer">
              {tripData.location || tripData.destinationRegion || "Ubicación no especificada"}
            </span>
            {(tripData.startDate || tripData.endDate) && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  {formatDate(tripData.startDate)} - {formatDate(tripData.endDate)}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={publishing}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all disabled:opacity-50 border border-slate-200"
          >
            Guardar como Borrador
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition-all disabled:opacity-50"
          >
            {publishing ? "Publicando..." : (
              <>
                Publicar Viaje
                <Send className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {galleryImages.length > 0 && <GalleryGrid images={galleryImages} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          <AgentInfo />
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Sobre esta experiencia
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg whitespace-pre-line">
              {tripData.description}
            </p>
          </section>
          {itineraryDays.length > 0 && <Itinerary items={itineraryDays} />}
          {(tripData.latitude && tripData.longitude) && <MapSection />}
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            {tripData?.price && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-2xl shadow-gray-200/50 dark:shadow-none">
                <div className="flex justify-between items-baseline mb-8">
                  <div>
                    <span className="text-3xl font-extrabold text-primary">
                      {tripData.currency || "COP"} ${tripData.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm font-medium"> / persona</span>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="grid grid-cols-2 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <div className="p-3 border-r border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Salida
                      </label>
                      <span className="text-sm font-semibold">{formatDate(tripData.startDate)}</span>
                    </div>
                    <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Regreso
                      </label>
                      <span className="text-sm font-semibold">{formatDate(tripData.endDate)}</span>
                    </div>
                    <div className="col-span-2 p-3 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Viajeros
                      </label>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Máx. {tripData.maxPersons || 1} personas</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 mb-4">
                  Reservar Ahora
                </button>
                <p className="text-center text-xs text-gray-400">
                  No se te cobrará nada todavía
                </p>
              </div>
            )}
            <TrustBadges items={trustBadges} />
          </div>
        </div>
      </div>

      <ReviewsSection rating="0.00" total="0" reviews={[]} />
      <PoliciesSection rules={rules} safety={safety} cancellationPolicy={cancellationPolicyText} />
      <ExperienceFooter links={['Privacidad', 'Términos', 'Mapa del sitio', 'Contacto']} />
    </main>
  );
}
