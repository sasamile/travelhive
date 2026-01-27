"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronRight, Info, Tag, Image, Sparkles } from "lucide-react";
import { gsap } from "gsap";
import toast from "react-hot-toast";
import { useTripStore } from "@/store/tripStore";
import StepperSidebar from "@/components/agent/new/StepperSidebar";
import BasicInfoStep from "@/components/agent/new/BasicInfoStep";
import ItineraryStep from "@/components/agent/new/ItineraryStep";
import GalleryStep from "@/components/agent/new/GalleryStep";
import { cn } from "@/lib/utils";

const steps = ["basic", "itinerary", "gallery"];
const stepLabels = {
  basic: "Información Básica",
  itinerary: "Planificación del Viaje",
  gallery: "Galería de Medios",
};

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTripId?: string | null;
}

export default function NewTripModal({ isOpen, onClose, editTripId }: NewTripModalProps) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);
  
  const [currentStep, setCurrentStep] = useState("basic");
  const [tripId, setTripId] = useState<string | null>(editTripId || null);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [loadingTripData, setLoadingTripData] = useState(!!editTripId);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const tripData = useTripStore((state) => state.tripData);
  const setBasicInfo = useTripStore((state) => state.setBasicInfo);
  const setRoutePoints = useTripStore((state) => state.setRoutePoints);
  const setItinerary = useTripStore((state) => state.setItinerary);
  const setGalleryImages = useTripStore((state) => state.setGalleryImages);
  const setCoverImageIndex = useTripStore((state) => state.setCoverImageIndex);
  const setDiscountCodes = useTripStore((state) => state.setDiscountCodes);
  const setPromoter = useTripStore((state) => state.setPromoter);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      // Guardar el valor actual del overflow
      const originalStyle = window.getComputedStyle(document.body).overflow;
      // Bloquear el scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restaurar el scroll cuando el modal se cierre
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Animación de entrada
  useEffect(() => {
    if (!isOpen) return;

    const ctx = gsap.context(() => {
      // Resetear posiciones iniciales
      gsap.set(backdropRef.current, { opacity: 0 });
      gsap.set(modalRef.current, { 
        scale: 0.8, 
        opacity: 0,
        y: 50,
        rotationX: -15
      });
      gsap.set(sidebarRef.current, { x: -100, opacity: 0 });
      gsap.set(stepContentRef.current, { x: 30, opacity: 0 });

      // Timeline de entrada
      const tl = gsap.timeline();
      
      // Backdrop fade in
      tl.to(backdropRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      });

      // Modal entrada con efecto 3D
      tl.to(modalRef.current, {
        scale: 1,
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.6,
        ease: "back.out(1.4)",
      }, "-=0.2");

      // Sidebar slide in
      tl.to(sidebarRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out"
      }, "-=0.4");

      // Contenido slide in
      tl.to(stepContentRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out"
      }, "-=0.3");

      // Animación de brillo/glow en el modal
      tl.to(modalRef.current, {
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.1)",
        duration: 0.3,
        ease: "power2.out"
      }, "-=0.2");

    }, modalRef);

    return () => ctx.revert();
  }, [isOpen]);

  // Animación de salida
  const handleClose = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsAnimating(false);
          onClose();
        }
      });

      // Contenido fade out
      tl.to([stepContentRef.current, sidebarRef.current], {
        opacity: 0,
        x: (i) => i === 0 ? 30 : -30,
        duration: 0.3,
        ease: "power2.in"
      });

      // Modal salida con efecto 3D
      tl.to(modalRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 30,
        rotationX: 10,
        duration: 0.4,
        ease: "power2.in"
      }, "-=0.2");

      // Backdrop fade out
      tl.to(backdropRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      }, "-=0.2");

    }, modalRef);
  }, [isAnimating, onClose]);

  // Animación de transición entre pasos
  useEffect(() => {
    if (!isOpen || !stepContentRef.current) return;

    const ctx = gsap.context(() => {
      setIsAnimating(true);
      
      const tl = gsap.timeline({
        onComplete: () => setIsAnimating(false)
      });

      // Salida del contenido anterior
      tl.to(stepContentRef.current, {
        x: -30,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in"
      });

      // Entrada del nuevo contenido
      tl.set(stepContentRef.current, { x: 30 });
      tl.to(stepContentRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.35,
        ease: "back.out(1.2)"
      });

      // Efecto de brillo en el sidebar para el paso activo
      const activeStepIndex = steps.indexOf(currentStep);
      const stepButtons = sidebarRef.current?.querySelectorAll('[data-step]');
      if (stepButtons) {
        stepButtons.forEach((btn, idx) => {
          if (idx === activeStepIndex) {
            gsap.to(btn, {
              scale: 1.05,
              duration: 0.3,
              ease: "back.out(2)",
              yoyo: true,
              repeat: 1
            });
          }
        });
      }

    }, stepContentRef);

    return () => ctx.revert();
  }, [currentStep, isOpen]);

  // Cargar datos del trip si estamos editando
  useEffect(() => {
    const loadTripData = async () => {
      if (!editTripId || !isOpen) return;
      
      try {
        setLoadingTripData(true);
        const api = (await import("@/lib/axios")).default;
        const response = await api.get(`/agencies/trips/${editTripId}`);
        const trip = response.data?.data || response.data;
        
        if (!trip) {
          toast.error("Viaje no encontrado. Puede que haya sido eliminado.");
          handleClose();
          return;
        }
        
        if (trip) {
          const categoryMap: Record<string, string> = {
            ADVENTURE: "Adventure",
            LUXURY: "Luxury",
            CULTURAL: "Cultural",
            WELLNESS: "Wellness",
            WILDLIFE: "Wildlife",
          };
          const normalizedCategory = categoryMap[trip.category] || trip.category || "Adventure";
          
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
          
          setBasicInfo(basicInfoData);
          
          if (trip.routePoints && Array.isArray(trip.routePoints) && trip.routePoints.length > 0) {
            const routePoints = trip.routePoints.map((rp: any, idx: number) => ({
              id: rp.id || `point-${idx}`,
              name: rp.name || "",
              lat: rp.latitude || 0,
              lng: rp.longitude || 0,
              order: rp.order || idx + 1,
            }));
            setRoutePoints(routePoints);
          }
          
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
            setItinerary(itinerary);
          }
          
          const galleryData = trip.galleryImages || [];
          if (Array.isArray(galleryData) && galleryData.length > 0) {
            const imageUrls = galleryData
              .map((item: any) => typeof item === 'string' ? item : (item.imageUrl || ''))
              .filter((url: any) => typeof url === 'string' && url.length > 0);
            
            if (imageUrls.length > 0) {
              setGalleryImages(imageUrls);
              setCoverImageIndex(trip.coverImageIndex ?? 0);
            }
          }

          // Cargar códigos de descuento (opcional)
          if (trip.discountCodes && Array.isArray(trip.discountCodes) && trip.discountCodes.length > 0) {
            setDiscountCodes(trip.discountCodes);
          } else {
            setDiscountCodes([]);
          }

          // Cargar promoter (opcional)
          if (trip.promoterCode) {
            setPromoter(trip.promoterCode, trip.promoterName);
          } else {
            setPromoter(undefined, undefined);
          }
        }
      } catch (error: any) {
        console.error("Error al cargar datos del trip:", error);
        if (error.response?.status === 404) {
          toast.error("Viaje no encontrado. Puede que haya sido eliminado o no tengas permisos para verlo.");
        } else {
          toast.error(error.response?.data?.message || "Error al cargar los datos del viaje para editar");
        }
        // Cerrar el modal si no se puede cargar el trip
        handleClose();
      } finally {
        setLoadingTripData(false);
      }
    };

    loadTripData();
  }, [editTripId, isOpen, setBasicInfo, setRoutePoints, setItinerary, setGalleryImages, setCoverImageIndex, setDiscountCodes, setPromoter]);

  // Validar si el paso actual está completo (sin mostrar errores, solo para deshabilitar botón)
  const isStepComplete = (): boolean => {
    if (currentStep === "basic") {
      // Validar información básica
      if (!tripData.idCity || tripData.idCity.trim() === "") {
        return false;
      }
      if (!tripData.title || tripData.title.trim() === "") {
        return false;
      }
      // Validar descripción - puede ser HTML, así que verificamos si tiene contenido real
      const descriptionText = tripData.description 
        ? tripData.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
        : "";
      if (!descriptionText || descriptionText === "") {
        return false;
      }
      if (!tripData.startDate || !tripData.endDate) {
        return false;
      }
      if (tripData.durationDays === undefined || tripData.durationDays === null || tripData.durationDays <= 0) {
        return false;
      }
      if (tripData.durationNights === undefined || tripData.durationNights === null || tripData.durationNights < 0) {
        return false;
      }
      if (tripData.price === undefined || tripData.price === null || tripData.price <= 0) {
        return false;
      }
      if (tripData.maxPersons === undefined || tripData.maxPersons === null || tripData.maxPersons <= 0) {
        return false;
      }
      return true;
    }

    if (currentStep === "itinerary") {
      // Validar itinerario
      const itinerary = tripData.itinerary || [];
      if (!Array.isArray(itinerary) || itinerary.length === 0) {
        return false;
      }
      // Validar que cada día tenga al menos una actividad
      const hasEmptyDays = itinerary.some(day => !day.activities || day.activities.length === 0);
      if (hasEmptyDays) {
        return false;
      }
      return true;
    }

    if (currentStep === "gallery") {
      // Validar galería
      const galleryImages = tripData.galleryImages || [];
      if (!Array.isArray(galleryImages) || galleryImages.length === 0) {
        return false;
      }
      return true;
    }

    return true;
  };

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
    if (isAnimating) return;

    // El botón ya está deshabilitado si no está completo, así que solo avanzar
    const next = getNextStep();
    if (next) {
      setCurrentStep(next);
    } else if (currentStep === "gallery") {
      const previewId = editTripId || tripId || `temp_${Date.now()}`;
      handleClose();
      // OPTIMIZACIÓN: Usar router.push con prefetch deshabilitado para navegación más rápida
      router.push(`/preview/${previewId}`, { scroll: false });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center p-0 sm:p-4 overflow-hidden"
      onWheel={(e) => {
        // Prevenir scroll cuando se hace scroll sobre el backdrop
        e.stopPropagation();
      }}
      onTouchMove={(e) => {
        // Prevenir scroll táctil sobre el backdrop
        e.stopPropagation();
      }}
    >
      {/* Backdrop con blur animado */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={handleClose}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      />

      {/* Modal principal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-none sm:rounded-xl shadow-2xl w-full h-full sm:h-[85vh] sm:max-h-[750px] sm:max-w-5xl flex flex-col sm:flex-row overflow-hidden"
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px"
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 p-2 sm:p-1.5 rounded-full bg-white/90 backdrop-blur-sm text-slate-400 hover:text-slate-900 hover:bg-white shadow-lg transition-all hover:scale-110 hover:rotate-90"
          aria-label="Cerrar"
        >
          <X className="size-5 sm:size-4" />
        </button>

        {/* Sidebar - Oculto en móvil, visible en desktop */}
        <div ref={sidebarRef} className="hidden sm:flex w-56 border-r border-neutral-100 bg-white flex-col shrink-0">
          <StepperSidebar 
            currentStep={currentStep} 
            onStepChange={setCurrentStep} 
            completion={getCompletion()} 
            isEditing={!!editTripId}
          />
        </div>

        {/* Stepper móvil - Solo visible en móvil */}
        <div className="sm:hidden border-b border-neutral-100 bg-white">
          <StepperSidebar 
            currentStep={currentStep} 
            onStepChange={setCurrentStep} 
            completion={getCompletion()} 
            isMobile={true}
            isEditing={!!editTripId}
          />
        </div>

        {/* Contenido principal */}
        <section className="flex-1 bg-white overflow-hidden relative flex flex-col">
          {loadingTripData ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
                <p className="text-slate-500">Cargando datos del viaje...</p>
              </div>
            </div>
          ) : (
            <>
              <div ref={stepContentRef} className="flex-1 overflow-y-auto">
                {renderStepContent()}
              </div>
              
              {/* Botones de navegación fijos */}
              <div className="sticky bottom-0 bg-white border-t border-neutral-100 z-30 shadow-sm">
                <div className="px-4 sm:px-6 py-3">
                  <div className={cn(
                    "flex items-center gap-2 sm:gap-4",
                    steps.indexOf(currentStep) === 0 ? 'justify-end' : 'justify-between'
                  )}>
                    {steps.indexOf(currentStep) > 0 && (
                      <button
                        onClick={() => {
                          if (isAnimating) return;
                          const currentIndex = steps.indexOf(currentStep);
                          setCurrentStep(steps[currentIndex - 1]);
                        }}
                        disabled={isAnimating}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                      >
                        ← Atrás
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      disabled={isCreatingTrip || isAnimating || !isStepComplete()}
                      className="px-4 sm:px-6 py-2.5 sm:py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
                    >
                      {isCreatingTrip ? (
                        "Creando..."
                      ) : getNextStep() ? (
                        <>
                          Siguiente
                          <ChevronRight className="size-3.5 sm:size-4" />
                        </>
                      ) : (
                        "✓ Finalizar"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
