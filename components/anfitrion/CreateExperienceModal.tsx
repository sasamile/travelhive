"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, CheckCircle, MapPin, Calendar, DollarSign, Image as ImageIcon, Loader2, Plus, Trash2, Tag } from "lucide-react";
import { gsap } from "gsap";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import CitySelector from "@/components/agent/new/CitySelector";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { MemoizedInteractiveMapComponent } from "@/components/agent/new/InteractiveMapComponent";

interface DiscountCode {
  code: string;
  percentage: number;
  maxUses?: number | null;
  perUserLimit?: number | null;
}

interface CreateExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editExperienceId?: string | null;
}

const steps = [
  { id: "basic", label: "Información Básica", icon: MapPin, number: 1 },
  { id: "location", label: "Ubicación y Fechas", icon: Calendar, number: 2 },
  { id: "pricing", label: "Precio y Capacidad", icon: DollarSign, number: 3 },
  { id: "gallery", label: "Galería", icon: ImageIcon, number: 4 },
];

interface FormData {
  idCity: string;
  title: string;
  description: string;
  category: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  startDate: string;
  endDate: string;
  durationDays: number;
  durationNights: number;
  price: number;
  currency: string;
  priceType: string;
  maxPersons: number;
  routePoints: Array<{ name: string; latitude: number; longitude: number; order: number }>;
  galleryImages: File[];
  discountCodes: DiscountCode[];
}

// Función para calcular días y noches desde un rango de fechas
const calculateDuration = (startDate: Date | null, endDate: Date | null): { days: number; nights: number } => {
  if (!startDate || !endDate) {
    return { days: 1, nights: 0 };
  }

  // Calcular diferencia en milisegundos
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  // Convertir a días (redondear hacia arriba para incluir el día completo)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
  
  // Las noches son días - 1 (si hay al menos 1 día)
  const nights = Math.max(0, diffDays - 1);
  
  return { days: diffDays, nights };
};

export default function CreateExperienceModal({ isOpen, onClose, onSuccess, editExperienceId }: CreateExperienceModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [existingImages, setExistingImages] = useState<Array<{ id: string; imageUrl: string; order: number }>>([]);
  const mapRef = useRef<any>(null);
  
  const [formData, setFormData] = useState<FormData>({
    idCity: "",
    title: "",
    description: "",
    category: "CULTURAL",
    location: "",
    latitude: null,
    longitude: null,
    startDate: "",
    endDate: "",
    durationDays: 1,
    durationNights: 0,
    price: 0,
    currency: "COP",
    priceType: "BOTH",
    maxPersons: 20,
    routePoints: [],
    galleryImages: [],
    discountCodes: [],
  });

  // Montar componente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar datos de la experiencia si estamos editando
  useEffect(() => {
    const loadExperienceData = async () => {
      if (!editExperienceId || !isOpen) {
        // Si no estamos editando, resetear el formulario
        if (!editExperienceId && isOpen) {
          setCurrentStep(0);
          setDateRange(undefined);
          setExistingImages([]);
          setFormData({
            idCity: "",
            title: "",
            description: "",
            category: "CULTURAL",
            location: "",
            latitude: null,
            longitude: null,
            startDate: "",
            endDate: "",
            durationDays: 1,
            durationNights: 0,
            price: 0,
            currency: "COP",
            priceType: "BOTH",
            maxPersons: 20,
            routePoints: [],
            galleryImages: [],
            discountCodes: [],
          });
        }
        return;
      }

      try {
        setLoadingData(true);
        setCurrentStep(0); // Resetear al primer paso al editar
        const response = await api.get(`/experiences/${editExperienceId}`);
        const experience = response.data?.data || response.data;

        if (!experience) {
          toast.error("Experiencia no encontrada");
          onClose();
          return;
        }

        console.log("📦 Datos de experiencia cargados:", {
          discountCodes: experience.discountCodes,
          galleryImages: experience.galleryImages,
          routePoints: experience.routePoints,
        });

        // Función helper para convertir Decimal a número
        const convertDecimalToNumber = (value: any): number | null => {
          if (value === null || value === undefined) return null;
          if (typeof value === 'number') return value;
          
          // Si es string, parsear directamente
          if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? null : parsed;
          }
          
          // Si es un objeto Decimal (de Prisma)
          if (value && typeof value === 'object') {
            // Intentar usar toString() y luego parsear (método más confiable)
            try {
              const str = value.toString();
              const parsed = parseFloat(str);
              if (!isNaN(parsed)) return parsed;
            } catch (e) {
              // Si toString() falla, intentar otros métodos
            }
            
            // Si tiene método toNumber
            if ('toNumber' in value && typeof value.toNumber === 'function') {
              try {
                return value.toNumber();
              } catch (e) {
                // Continuar con otros métodos
              }
            }
            
            // Si tiene estructura Decimal de Prisma {s, e, d}
            if ('s' in value && 'e' in value && 'd' in value && Array.isArray(value.d)) {
              try {
                // Construir string desde los dígitos y parsear
                const sign = value.s === -1 ? '-' : '';
                const digits = value.d.join('');
                const exponent = value.e || 0;
                // Ajustar la posición del punto decimal
                const adjustedExponent = exponent - digits.length + 1;
                let numStr = sign + digits;
                if (adjustedExponent !== 0) {
                  numStr = sign + digits + 'e' + adjustedExponent;
                }
                const parsed = parseFloat(numStr);
                return isNaN(parsed) ? null : parsed;
              } catch (e) {
                console.warn('Error al convertir Decimal con estructura {s,e,d}:', e);
              }
            }
            
            // Último recurso: intentar Number()
            const num = Number(value);
            return isNaN(num) ? null : num;
          }
          
          return null;
        };

        // Procesar routePoints para convertir Decimal a números
        const processedRoutePoints = (experience.routePoints || []).map((point: any) => ({
          name: point.name || "",
          latitude: convertDecimalToNumber(point.latitude),
          longitude: convertDecimalToNumber(point.longitude),
          order: point.order || 0,
        })).filter((point: any) => point.latitude !== null && point.longitude !== null);

        // Procesar códigos de descuento
        const processedDiscountCodes = (experience.discountCodes || []).map((code: any) => {
          console.log("🔍 Procesando código de descuento:", code);
          return {
            code: code.code || "",
            percentage: code.percentage || 0,
            maxUses: code.maxUses !== undefined && code.maxUses !== null ? code.maxUses : null,
            perUserLimit: code.perUserLimit !== undefined && code.perUserLimit !== null ? code.perUserLimit : null,
          };
        });
        
        console.log("✅ Códigos de descuento procesados:", processedDiscountCodes);

        // Guardar imágenes existentes para mostrarlas
        const existingGalleryImages = (experience.galleryImages || []).map((img: any) => ({
          id: img.id || "",
          imageUrl: img.imageUrl || "",
          order: img.order || 0,
        })).sort((a: any, b: any) => a.order - b.order);
        
        setExistingImages(existingGalleryImages);
        console.log("🖼️ Imágenes existentes:", existingGalleryImages);

        // Llenar el formulario con los datos existentes
        setFormData({
          idCity: experience.idCity || experience.city?.idCity || "",
          title: experience.title || "",
          description: experience.description || "",
          category: experience.category || "CULTURAL",
          location: experience.location || "",
          latitude: convertDecimalToNumber(experience.latitude),
          longitude: convertDecimalToNumber(experience.longitude),
          startDate: experience.startDate || "",
          endDate: experience.endDate || "",
          durationDays: experience.durationDays || 1,
          durationNights: experience.durationNights || 0,
          price: experience.price || 0,
          currency: experience.currency || "COP",
          priceType: experience.priceType || "BOTH",
          maxPersons: experience.maxPersons || 20,
          routePoints: processedRoutePoints,
          galleryImages: [], // Las imágenes existentes no se pueden cargar como File, se manejan diferente
          discountCodes: processedDiscountCodes,
        });
        
        console.log("📝 FormData actualizado:", {
          discountCodes: processedDiscountCodes,
          routePoints: processedRoutePoints,
          discountCodesLength: processedDiscountCodes.length,
        });

        // Forzar actualización del estado después de un pequeño delay para asegurar que se renderice
        setTimeout(() => {
          console.log("🔍 Estado después de actualizar:", {
            formDataDiscountCodes: formData.discountCodes,
            processedDiscountCodes: processedDiscountCodes,
          });
        }, 100);

        // Configurar el rango de fechas
        if (experience.startDate && experience.endDate) {
          setDateRange({
            from: new Date(experience.startDate),
            to: new Date(experience.endDate),
          });
        }
      } catch (error: any) {
        console.error("Error al cargar experiencia:", error);
        toast.error(error?.response?.data?.message || "Error al cargar la experiencia");
      } finally {
        setLoadingData(false);
      }
    };

    loadExperienceData();
  }, [editExperienceId, isOpen, onClose]);

  // Animaciones
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (modalRef.current && backdropRef.current) {
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.9, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" }
        );
      }
    } else {
      document.body.style.overflow = "";
      setCurrentStep(0);
      setDateRange(undefined);
      setFormData({
        idCity: "",
        title: "",
        description: "",
        category: "CULTURAL",
        location: "",
        latitude: null,
        longitude: null,
        startDate: "",
        endDate: "",
        durationDays: 1,
        durationNights: 0,
        price: 0,
        currency: "COP",
        priceType: "BOTH",
        maxPersons: 20,
        routePoints: [],
        galleryImages: [],
        discountCodes: [],
      });
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Calcular días y noches cuando cambia el rango de fechas
  useEffect(() => {
    const from = dateRange?.from;
    const to = dateRange?.to;
    if (from && to) {
      const { days, nights } = calculateDuration(from, to);
      setFormData((prev) => ({
        ...prev,
        durationDays: days,
        durationNights: nights,
        startDate: from.toISOString(),
        endDate: to.toISOString(),
      }));
    }
  }, [dateRange]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, galleryImages: files }));
  };

  // Manejar clic en el mapa
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: prev.location || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    }));
  }, []);

  // Manejar cuando el mapa está listo
  const handleMapReady = useCallback((map: any) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.idCity && formData.title && formData.description);
      case 1:
        return !!(formData.location && formData.latitude && formData.longitude && formData.startDate && formData.endDate);
      case 2:
        return !!(formData.price > 0 && formData.maxPersons > 0);
      case 3:
        return formData.galleryImages.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      
      // Campos básicos
      formDataToSend.append("idCity", formData.idCity);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("latitude", String(formData.latitude || 0));
      formDataToSend.append("longitude", String(formData.longitude || 0));
      
      // Las fechas ya están en formato ISO desde el useEffect
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      
      formDataToSend.append("durationDays", String(formData.durationDays));
      formDataToSend.append("durationNights", String(formData.durationNights));
      formDataToSend.append("price", String(formData.price));
      formDataToSend.append("currency", formData.currency);
      formDataToSend.append("priceType", formData.priceType);
      formDataToSend.append("maxPersons", String(formData.maxPersons));
      // Las experiencias se crean automáticamente con status=PUBLISHED según la documentación
      // No necesitamos enviar status, el backend lo maneja automáticamente

      // Route points
      if (formData.routePoints.length > 0) {
        formDataToSend.append("routePoints", JSON.stringify(formData.routePoints));
      } else {
        // Crear un route point por defecto con la ubicación principal
        formDataToSend.append("routePoints", JSON.stringify([{
          name: formData.location,
          latitude: formData.latitude || 0,
          longitude: formData.longitude || 0,
          order: 0,
        }]));
      }

      // Gallery images - IMPORTANTE: enviar cada archivo individualmente con el mismo nombre de campo
      console.log("📸 Enviando imágenes:", formData.galleryImages.length);
      formData.galleryImages.forEach((file, index) => {
        console.log(`  - Imagen ${index + 1}:`, file.name, file.type, file.size, "bytes");
        // Usar el mismo nombre de campo para múltiples archivos (el backend lo espera así)
        formDataToSend.append("galleryImages", file);
      });

      // Discount codes
      // Filtrar códigos válidos (con code y percentage > 0)
      const validCodes = formData.discountCodes.filter(
        (code) => code.code && code.code.trim() && code.percentage > 0
      );
      
      // Si estamos editando, siempre enviar discountCodes (incluso si está vacío para eliminarlos)
      // Si estamos creando, solo enviar si hay códigos válidos
      if (editExperienceId || validCodes.length > 0) {
        formDataToSend.append("discountCodes", JSON.stringify(validCodes));
      }

      // Verificar que FormData tenga las imágenes antes de enviar
      const formDataEntries = Array.from(formDataToSend.entries());
      const imageEntries = formDataEntries.filter(([key]) => key === "galleryImages");
      console.log("✅ FormData preparado:", {
        totalFields: formDataEntries.length,
        imageFields: imageEntries.length,
        imageNames: imageEntries.map(([, value]) => value instanceof File ? value.name : "no-file"),
      });

      // El interceptor de axios manejará automáticamente el Content-Type para FormData
      let response;
      if (editExperienceId) {
        // Actualizar experiencia existente
        response = await api.patch(`/experiences/${editExperienceId}`, formDataToSend);
      } else {
        // Crear nueva experiencia
        response = await api.post("/experiences", formDataToSend);
      }

      toast.success(editExperienceId ? "¡Experiencia actualizada exitosamente!" : "¡Experiencia creada exitosamente!");
      setExistingImages([]); // Limpiar imágenes existentes después de guardar
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error al crear experiencia:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Error al crear la experiencia";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Preparar route points para el mapa (solo si hay coordenadas)
  const mapRoutePoints = formData.latitude && formData.longitude
    ? [{
        id: "main-location",
        name: formData.location || "Ubicación",
        lat: formData.latitude,
        lng: formData.longitude,
        order: 0,
      }]
    : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        ref={backdropRef}
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-zinc-200 relative z-10"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-zinc-200 bg-zinc-50/30">
          <div>
            <h3 className="font-caveat text-4xl font-bold text-zinc-900 leading-none">
              {editExperienceId ? "Editar Experiencia" : "Crear Nueva Experiencia"}
            </h3>
            <p className="text-xs text-zinc-500 mt-2 font-medium uppercase tracking-widest">
              {editExperienceId ? "Actualiza los detalles de tu experiencia" : "Comparte tu experiencia única con el mundo"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-900"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-8 py-6 bg-white border-b border-zinc-200">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            {/* Progress line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-100 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />

            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "relative z-10 flex flex-col items-center gap-2 group cursor-pointer transition-all",
                    isActive ? "stepper-active" : isCompleted ? "stepper-completed" : "stepper-pending"
                  )}
                  onClick={() => {
                    if (index <= currentStep || isCompleted) {
                      setCurrentStep(index);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "step-icon size-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all bg-white relative z-10",
                      isActive && "shadow-sm ring-4 ring-indigo-50"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="size-5" />
                    ) : (
                      <Icon className="size-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold tracking-wide uppercase text-center",
                      isActive && "font-bold"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {loadingData && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          )}
          {!loadingData && (
            <>
              {/* Step 1: Información Básica */}
              {currentStep === 0 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h4 className="text-lg font-bold text-zinc-900 mb-2">Información Básica</h4>
                <p className="text-sm text-zinc-500">Comienza con los detalles esenciales de tu experiencia</p>
              </div>

              <div className="space-y-4">
                <div>
                  <CitySelector
                    value={formData.idCity}
                    onChange={(idCity) => handleInputChange("idCity", idCity)}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-700 block mb-2">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ej: Tour por la Ciudad de Bogotá"
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-700 block mb-2">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe tu experiencia de manera atractiva..."
                    rows={5}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-700 block mb-2">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  >
                    <option value="CULTURAL">Cultural</option>
                    <option value="ADVENTURE">Aventura</option>
                    <option value="LUXURY">Lujo</option>
                    <option value="NATURE">Naturaleza</option>
                    <option value="FOOD">Gastronomía</option>
                    <option value="SPORTS">Deportes</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Ubicación y Fechas */}
          {currentStep === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h4 className="text-lg font-bold text-zinc-900 mb-2">Ubicación y Fechas</h4>
                <p className="text-sm text-zinc-500">Define dónde y cuándo se realizará tu experiencia</p>
              </div>

              <div className="space-y-6">
                {/* Mapa interactivo */}
                <div>
                  <label className="text-sm font-semibold text-zinc-700 block mb-2">
                    Selecciona la ubicación en el mapa <span className="text-red-500">*</span>
                  </label>
                  <div className="h-64 rounded-lg border border-zinc-200 overflow-hidden">
                    {mounted && (
                      <MemoizedInteractiveMapComponent
                        routePoints={mapRoutePoints}
                        onMapClick={handleMapClick}
                        onMapReady={handleMapReady}
                      />
                    )}
                  </div>
                  {formData.latitude && formData.longitude && (
                    <p className="text-xs text-zinc-500 mt-2">
                      Coordenadas: {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
                    </p>
                  )}
                </div>

                {/* Campo de ubicación (texto) */}
                <div>
                  <label className="text-sm font-semibold text-zinc-700 block mb-2">
                    Dirección/Nombre del lugar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Ej: Plaza de Bolívar, Bogotá"
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  />
                </div>

                {/* Calendario de fechas */}
                <div>
                  <label className="text-sm font-semibold text-zinc-700 block mb-2">
                    Fechas de la experiencia <span className="text-red-500">*</span>
                  </label>
                  {mounted && (
                    <div className="space-y-4">
                      <CalendarComponent
                        mode="range"
                        defaultMonth={dateRange?.from || new Date()}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        className="rounded-lg border shadow-sm"
                      />
                      {(formData.durationDays > 0 || formData.durationNights >= 0) && (
                        <div className="text-sm text-zinc-600 text-center font-medium bg-zinc-50 p-3 rounded-lg">
                          Duración: {formData.durationDays} {formData.durationDays === 1 ? "día" : "días"}, {formData.durationNights} {formData.durationNights === 1 ? "noche" : "noches"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Precio y Capacidad */}
          {currentStep === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h4 className="text-lg font-bold text-zinc-900 mb-2">Precio y Capacidad</h4>
                <p className="text-sm text-zinc-500">Establece el precio y la capacidad máxima de tu experiencia</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-zinc-700 block mb-2">
                      Precio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price || ""}
                      onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                      placeholder="50000"
                      className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-zinc-700 block mb-2">
                      Moneda <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange("currency", e.target.value)}
                      className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                    >
                      <option value="COP">COP - Peso Colombiano</option>
                      <option value="USD">USD - Dólar Estadounidense</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-700 block mb-2">
                    Tipo de Precio <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.priceType}
                    onChange={(e) => handleInputChange("priceType", e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  >
                    <option value="BOTH">Adultos y Niños</option>
                    <option value="ADULTS">Solo Adultos</option>
                    <option value="CHILDREN">Solo Niños</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-700 block mb-2">
                    Capacidad Máxima <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxPersons || ""}
                    onChange={(e) => handleInputChange("maxPersons", parseInt(e.target.value) || 0)}
                    placeholder="20"
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  />
                </div>

                {/* Códigos de Descuento */}
                <div className="pt-6 border-t border-zinc-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Tag className="size-4 text-primary" />
                      <label className="text-sm font-semibold text-zinc-700">
                        Códigos de Descuento (Opcional)
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newCode: DiscountCode = {
                          code: "",
                          percentage: 0,
                          maxUses: null,
                          perUserLimit: null,
                        };
                        handleInputChange("discountCodes", [...formData.discountCodes, newCode]);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Plus className="size-3.5" />
                      Agregar Código
                    </button>
                  </div>

                  {(() => {
                    console.log("🎨 Renderizando códigos de descuento:", {
                      length: formData.discountCodes.length,
                      codes: formData.discountCodes,
                    });
                    return null;
                  })()}
                  {formData.discountCodes.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">
                      No hay códigos de descuento. Haz clic en "Agregar Código" para crear uno.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {formData.discountCodes.map((code, index) => {
                        console.log(`🎨 Renderizando código ${index}:`, code);
                        return (
                        <div
                          key={index}
                          className="p-4 border border-zinc-200 rounded-lg bg-zinc-50/50 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-zinc-600">
                              Código #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const newCodes = formData.discountCodes.filter((_, i) => i !== index);
                                handleInputChange("discountCodes", newCodes);
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">
                                Código *
                              </label>
                              <input
                                type="text"
                                value={code.code || ""}
                                onChange={(e) => {
                                  const updated = [...formData.discountCodes];
                                  updated[index] = { ...updated[index], code: e.target.value.toUpperCase() };
                                  handleInputChange("discountCodes", updated);
                                }}
                                placeholder="Ej: SUMMER2024"
                                className="w-full h-9 px-3 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">
                                Porcentaje de Descuento (%) *
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={code.percentage || 0}
                                onChange={(e) => {
                                  const updated = [...formData.discountCodes];
                                  updated[index] = { ...updated[index], percentage: parseInt(e.target.value) || 0 };
                                  handleInputChange("discountCodes", updated);
                                }}
                                placeholder="15"
                                className="w-full h-9 px-3 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">
                                Usos Máximos (Opcional)
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={code.maxUses || ""}
                                onChange={(e) => {
                                  const updated = [...formData.discountCodes];
                                  updated[index] = { ...updated[index], maxUses: e.target.value ? parseInt(e.target.value) : null };
                                  handleInputChange("discountCodes", updated);
                                }}
                                placeholder="Sin límite"
                                className="w-full h-9 px-3 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">
                                Límite por Usuario (Opcional)
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={code.perUserLimit || ""}
                                onChange={(e) => {
                                  const updated = [...formData.discountCodes];
                                  updated[index] = { ...updated[index], perUserLimit: e.target.value ? parseInt(e.target.value) : null };
                                  handleInputChange("discountCodes", updated);
                                }}
                                placeholder="Sin límite"
                                className="w-full h-9 px-3 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                              />
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Galería */}
          {currentStep === 3 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h4 className="text-lg font-bold text-zinc-900 mb-2">Galería de Imágenes</h4>
                <p className="text-sm text-zinc-500">Sube imágenes atractivas de tu experiencia</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-zinc-700 block mb-2">
                    Imágenes <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="gallery-upload"
                    />
                    <label
                      htmlFor="gallery-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <ImageIcon className="size-12 text-zinc-400" />
                      <div>
                        <span className="text-sm font-semibold text-primary">
                          Haz clic para subir imágenes
                        </span>
                        <p className="text-xs text-zinc-500 mt-1">
                          PNG, JPG hasta 10MB cada una
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Mostrar imágenes existentes */}
                {existingImages.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-zinc-700 mb-3">Imágenes existentes:</p>
                    <div className="grid grid-cols-3 gap-4">
                      {existingImages.map((img, index) => (
                        <div key={img.id || index} className="relative group">
                          <img
                            src={img.imageUrl}
                            alt={`Imagen existente ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-zinc-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                            <span className="text-xs text-white opacity-0 group-hover:opacity-100 bg-black/50 px-2 py-1 rounded">
                              Imagen existente
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                      Las imágenes existentes se mantendrán. Puedes agregar nuevas imágenes arriba.
                    </p>
                  </div>
                )}

                {/* Mostrar nuevas imágenes seleccionadas */}
                {formData.galleryImages.length > 0 && (
                  <div className={existingImages.length > 0 ? "mt-6" : ""}>
                    {existingImages.length > 0 && (
                      <p className="text-sm font-medium text-zinc-700 mb-3">Nuevas imágenes:</p>
                    )}
                    <div className="grid grid-cols-3 gap-4">
                      {formData.galleryImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-zinc-200"
                          />
                          <button
                            onClick={() => {
                              const newImages = formData.galleryImages.filter((_, i) => i !== index);
                              handleInputChange("galleryImages", newImages);
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Cancelar
          </button>
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                Atrás
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isSubmitting || loadingData || !validateStep(currentStep)}
              className={cn(
                "px-6 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2",
                isSubmitting || !validateStep(currentStep)
                  ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-indigo-700"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {editExperienceId ? "Actualizando..." : "Creando..."}
                </>
              ) : currentStep === steps.length - 1 ? (
                editExperienceId ? "Actualizar Experiencia" : "Crear Experiencia"
              ) : (
                "Siguiente"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
