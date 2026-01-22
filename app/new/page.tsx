"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Cloud, Send, ChevronRight, Tent } from "lucide-react";
import StepperSidebar from "@/components/agent/new/StepperSidebar";
import BasicInfoStep from "@/components/agent/new/BasicInfoStep";
import ItineraryStep from "@/components/agent/new/ItineraryStep";
import GalleryStep from "@/components/agent/new/GalleryStep";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTripStore } from "@/store/tripStore";
import api from "@/lib/axios";

const steps = ["basic", "itinerary", "gallery"];
const stepLabels = {
  basic: "Información Básica",
  itinerary: "Planificación del Viaje",
  gallery: "Galería de Medios",
};

function NewTripPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editTripId = searchParams.get("edit");
  
  const [currentStep, setCurrentStep] = useState("basic");
  const [tripId, setTripId] = useState<string | null>(editTripId || null);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [loadingTripData, setLoadingTripData] = useState(!!editTripId);
  
  // Usar el store de Zustand
  const tripData = useTripStore((state) => state.tripData);
  const setBasicInfo = useTripStore((state) => state.setBasicInfo);
  const setRoutePoints = useTripStore((state) => state.setRoutePoints);
  const setItinerary = useTripStore((state) => state.setItinerary);
  const setGalleryImages = useTripStore((state) => state.setGalleryImages);
  const setCoverImageIndex = useTripStore((state) => state.setCoverImageIndex);
  
  // Cargar datos del trip si estamos editando
  useEffect(() => {
    const loadTripData = async () => {
      if (!editTripId) return;
      
      try {
        setLoadingTripData(true);
        const response = await api.get(`/agencies/trips/${editTripId}`);
        // Los datos vienen en response.data.data según el formato del backend
        const trip = response.data?.data || response.data;
        
        if (trip) {
          console.log("📦 Cargando datos del trip:", trip);
          
          // Mapear categoría del backend (ADVENTURE) al formato del frontend (Adventure)
          const categoryMap: Record<string, string> = {
            ADVENTURE: "Adventure",
            LUXURY: "Luxury",
            CULTURAL: "Cultural",
            WELLNESS: "Wellness",
            WILDLIFE: "Wildlife",
          };
          const normalizedCategory = categoryMap[trip.category] || trip.category || "Adventure";
          
          // Mapear datos del backend al formato del store
          const basicInfoData = {
            idCity: trip.idCity,
            title: trip.title || "",
            description: trip.description || "",
            category: normalizedCategory,
            destinationRegion: trip.destinationRegion || "",
            latitude: trip.latitude,
            longitude: trip.longitude,
            startDate: trip.startDate,
            endDate: trip.endDate,
            durationDays: trip.durationDays,
            durationNights: trip.durationNights,
            price: trip.price,
            currency: trip.currency || "COP",
            priceType: (trip.priceType || "ADULTS").toLowerCase() as "adults" | "children" | "both",
            maxPersons: trip.maxPersons,
            status: trip.status,
          };
          
          console.log("💾 Guardando basicInfo:", basicInfoData);
          setBasicInfo(basicInfoData);
          
          // Route Points - el backend devuelve routePoints directamente
          if (trip.routePoints && Array.isArray(trip.routePoints) && trip.routePoints.length > 0) {
            const routePoints = trip.routePoints.map((rp: any, idx: number) => ({
              id: rp.id || `point-${idx}`,
              name: rp.name || "",
              lat: rp.latitude || 0,
              lng: rp.longitude || 0,
              order: rp.order || idx + 1,
            }));
            console.log("🗺️ Guardando routePoints:", routePoints);
            setRoutePoints(routePoints);
          }
          
          // Itinerary - el backend devuelve itineraryDays (no itinerary)
          const itineraryData = trip.itineraryDays || trip.itinerary;
          if (itineraryData && Array.isArray(itineraryData) && itineraryData.length > 0) {
            const itinerary = itineraryData.map((day: any) => ({
              day: day.day || 1,
              title: day.title || "",
              subtitle: day.subtitle || "",
              order: day.order || day.day || 1,
              activities: (day.activities || []).map((act: any) => ({
                type: (act.type || "ACTIVITY").toLowerCase(),
                title: act.title || "",
                description: act.description || "",
                time: act.time || "",
                latitude: act.latitude,
                longitude: act.longitude,
                poiId: act.poiId,
                order: act.order || 0,
              })),
            }));
            console.log("📅 Guardando itinerary:", itinerary);
            setItinerary(itinerary);
          }
          
          // Gallery Images - el backend devuelve objetos con imageUrl
          const galleryData = trip.galleryImages || [];
          if (Array.isArray(galleryData) && galleryData.length > 0) {
            console.log("🖼️ Cargando imágenes de galería:", galleryData.length);
            // Extraer las URLs directamente - no convertir a base64 para evitar problemas de CORS
            // El componente GalleryStep puede trabajar con URLs directamente (usa src={image})
            const imageUrls = galleryData
              .map((item: any) => {
                // Si es un objeto con imageUrl, usar imageUrl; si es string, usar directamente
                return typeof item === 'string' ? item : (item.imageUrl || '');
              })
              .filter((url: any) => typeof url === 'string' && url.length > 0);
            
            console.log("🖼️ Guardando galleryImages (URLs):", imageUrls.length, imageUrls);
            if (imageUrls.length > 0) {
              setGalleryImages(imageUrls);
              setCoverImageIndex(trip.coverImageIndex ?? 0);
            }
          }
          
          console.log("✅ Datos cargados en el store");
          
          // Forzar un pequeño delay y luego verificar que los datos se guardaron
          setTimeout(() => {
            const currentTripData = useTripStore.getState().tripData;
            console.log("🔍 Verificando datos en el store después de guardar:", {
              title: currentTripData.title,
              idCity: currentTripData.idCity,
              routePoints: currentTripData.routePoints?.length,
              itinerary: currentTripData.itinerary?.length,
              galleryImages: currentTripData.galleryImages?.length,
            });
          }, 200);
        }
      } catch (error: any) {
        console.error("Error al cargar datos del trip:", error);
        console.error("Response completa:", error.response?.data);
        toast.error("Error al cargar los datos del viaje para editar");
      } finally {
        setLoadingTripData(false);
      }
    };

    loadTripData();
  }, [editTripId, setBasicInfo, setRoutePoints, setItinerary, setGalleryImages, setCoverImageIndex]);
  
  // Verificar si hay itinerario para deshabilitar botón
  const hasItinerary = () => {
    if (currentStep !== "itinerary") return true;
    
    // Validar desde el store de Zustand
    const itinerary = tripData.itinerary || [];
    return Array.isArray(itinerary) && itinerary.length > 0;
  };

  // Calcular porcentaje de completitud basado en el paso actual
  const getCompletion = () => {
    const stepIndex = steps.indexOf(currentStep);
    return Math.round(((stepIndex + 1) / steps.length) * 100);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "basic":
        return <BasicInfoStep tripId={tripId || undefined} onTripCreated={setTripId} />;
      case "itinerary":
        return <ItineraryStep tripId={tripId || undefined} />;
      case "gallery":
        return <GalleryStep tripId={tripId || undefined} />;
      default:
        return <BasicInfoStep tripId={tripId || undefined} onTripCreated={setTripId} />;
    }
  };

  const getNextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      return steps[currentIndex + 1];
    }
    return null;
  };

  const handleNext = async () => {
    // Validar que haya itinerario antes de avanzar desde itinerary
    if (currentStep === "itinerary") {
      const itinerary = tripData.itinerary || [];
      if (!Array.isArray(itinerary) || itinerary.length === 0) {
        toast.error("Debes agregar al menos un día al itinerario antes de continuar");
        return;
      }
    }

    const next = getNextStep();
    if (next) {
      setCurrentStep(next);
    } else if (currentStep === "gallery") {
      // Si estamos en gallery, navegar al preview
      // NO crear el viaje todavía, solo navegar a la preview
      // El viaje se creará cuando se publique o guarde como borrador
      // Si estamos editando, usar el editTripId; si no, usar tripId o crear uno temporal
      const previewId = editTripId || tripId || `temp_${Date.now()}`;
      console.log("🚀 Navegando al preview con ID:", previewId, { editTripId, tripId });
      router.push(`/new/preview/${previewId}`);
    }
  };

  if (loadingTripData) {
    return (
      <div className="bg-white text-slate-900 font-sans antialiased overflow-hidden h-screen flex items-center justify-center">
        <div className="text-slate-500">Cargando datos del viaje para editar...</div>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900 font-sans antialiased overflow-hidden h-screen">
  
      <main className="flex h-screen overflow-hidden">
        <StepperSidebar currentStep={currentStep} onStepChange={setCurrentStep} completion={getCompletion()} />
        <section className="flex-1 bg-white  overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {renderStepContent()}
          </div>
          {/* Botones de navegación fijos en la parte inferior del contenedor */}
          <div className="sticky bottom-0 bg-white border-t border-neutral-100 z-30 shadow-lg">
            <div className="px-8 py-4">
              <div className={`flex items-center gap-4 ${steps.indexOf(currentStep) === 0 ? 'justify-end' : 'justify-between'}`}>
                {steps.indexOf(currentStep) > 0 && (
                  <button
                    onClick={() => {
                      const currentIndex = steps.indexOf(currentStep);
                      setCurrentStep(steps[currentIndex - 1]);
                    }}
                    className="px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-200"
                    type="button"
                  >
                    ← Atrás
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={isCreatingTrip || !hasItinerary()}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/40 transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {isCreatingTrip ? (
                    "Creando viaje..."
                  ) : getNextStep() ? (
                    <>
                      Siguiente
                      <ChevronRight className="size-4" />
                    </>
                  ) : (
                    "✓ Finalizar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function NewTripPage() {
  return (
    <Suspense fallback={
      <div className="bg-white text-slate-900 font-sans antialiased overflow-hidden h-screen flex items-center justify-center">
        <div className="text-slate-500">Cargando...</div>
      </div>
    }>
      <NewTripPageContent />
    </Suspense>
  );
}
