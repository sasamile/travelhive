"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, Cloud, Send, ChevronRight, Tent } from "lucide-react";
import StepperSidebar from "@/components/agent/new/StepperSidebar";
import BasicInfoStep from "@/components/agent/new/BasicInfoStep";
import ItineraryStep from "@/components/agent/new/ItineraryStep";
import GalleryStep from "@/components/agent/new/GalleryStep";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import toast from "react-hot-toast";

const steps = ["basic", "itinerary", "gallery"];
const stepLabels = {
  basic: "Información Básica",
  itinerary: "Planificación del Viaje",
  gallery: "Galería de Medios",
};

export default function NewTripPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState("basic");
  const [tripId, setTripId] = useState<string | null>(null);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [itineraryCheck, setItineraryCheck] = useState(0); // Estado para forzar re-render cuando cambie el itinerario
  
  // Verificar si hay itinerario para deshabilitar botón
  const hasItinerary = () => {
    if (currentStep !== "itinerary") return true;
    
    if (typeof window === "undefined") return false;
    
    // Buscar en ambas claves posibles (con y sin tripId)
    const baseKey = "trip_itinerary_draft";
    const keyWithTripId = tripId ? `${baseKey}_${tripId}` : null;
    
    // Intentar primero con tripId si existe
    if (keyWithTripId) {
      const stored = localStorage.getItem(keyWithTripId);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (Array.isArray(data) && data.length > 0) return true;
        } catch {
          // Continuar a buscar en la clave base
        }
      }
    }
    
    // Buscar en la clave base
    const stored = localStorage.getItem(baseKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return Array.isArray(data) && data.length > 0;
      } catch {
        return false;
      }
    }
    
    return false;
  };

  // Escuchar cambios en localStorage para el itinerario cuando estemos en ese paso
  useEffect(() => {
    if (currentStep !== "itinerary" || typeof window === "undefined") return;

    // Verificar periódicamente si hay cambios en el localStorage
    const checkInterval = setInterval(() => {
      setItineraryCheck((prev) => prev + 1);
    }, 300); // Verificar cada 300ms

    // También escuchar eventos de storage (cuando se modifica desde otra pestaña)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes("trip_itinerary_draft")) {
        setItineraryCheck((prev) => prev + 1);
      }
    };

    // Escuchar eventos personalizados (cuando se modifica desde la misma pestaña)
    const handleCustomStorageChange = () => {
      setItineraryCheck((prev) => prev + 1);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("itineraryUpdated", handleCustomStorageChange);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("itineraryUpdated", handleCustomStorageChange);
    };
  }, [currentStep, tripId]);

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
      const baseKey = "trip_itinerary_draft";
      const keyWithTripId = tripId ? `${baseKey}_${tripId}` : null;
      
      let itineraryStored = null;
      
      // Buscar primero con tripId si existe
      if (keyWithTripId && typeof window !== "undefined") {
        itineraryStored = localStorage.getItem(keyWithTripId);
      }
      
      // Si no se encontró, buscar en la clave base
      if (!itineraryStored && typeof window !== "undefined") {
        itineraryStored = localStorage.getItem(baseKey);
      }
      
      if (!itineraryStored) {
        toast.error("Debes agregar al menos un día al itinerario antes de continuar");
        return;
      }
      
      try {
        const itineraryData = JSON.parse(itineraryStored);
        if (!Array.isArray(itineraryData) || itineraryData.length === 0) {
          toast.error("Debes agregar al menos un día al itinerario antes de continuar");
          return;
        }
      } catch (error) {
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
      if (tripId) {
        router.push(`/new/preview/${tripId}`);
      } else {
        // Si no hay tripId, crear uno temporal solo para la preview
        // Esto no guarda nada en la base de datos, solo genera un ID para la URL
        const tempId = `temp_${Date.now()}`;
        router.push(`/new/preview/${tempId}`);
      }
    }
  };

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
                  data-itinerary-check={itineraryCheck} // Forzar re-render cuando cambie
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
