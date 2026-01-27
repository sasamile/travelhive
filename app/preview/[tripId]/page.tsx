"use client";

import { useParams, useRouter } from "next/navigation";
import { Send, Star, Heart, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef } from "react";
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
import { useTripStore } from "@/store/tripStore";
import api from "@/lib/axios";

// Función auxiliar para convertir base64 a File
function base64ToFile(base64String: string, index: number): File {
  // Separar el data URL del contenido base64
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Formato base64 inválido");
  }

  const contentType = matches[1];
  const base64Data = matches[2];
  
  // Convertir base64 a blob
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: contentType });

  // Crear File desde Blob
  const extension = contentType.split("/")[1] || "jpg";
  const fileName = `image-${index}.${extension}`;
  return new File([blob], fileName, { type: contentType });
}

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const tripIdParam = params.tripId as string;
  const tripData = useTripStore((state) => state.tripData);
  const resetTrip = useTripStore((state) => state.resetTrip);
  const setBasicInfo = useTripStore((state) => state.setBasicInfo);
  const setRoutePoints = useTripStore((state) => state.setRoutePoints);
  const setItinerary = useTripStore((state) => state.setItinerary);
  const setGalleryImages = useTripStore((state) => state.setGalleryImages);
  const setCoverImageIndex = useTripStore((state) => state.setCoverImageIndex);
  
  const [publishing, setPublishing] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState<any>(null);
  const [loadingAgency, setLoadingAgency] = useState(true);
  const [showFullItinerary, setShowFullItinerary] = useState(false);
  // OPTIMIZACIÓN: Inicializar loadingTrip como false para viajes temporales
  const isTempTrip = tripIdParam?.startsWith("temp_");
  const [loadingTrip, setLoadingTrip] = useState(!isTempTrip); // Solo cargar si no es temporal
  const [isEditing, setIsEditing] = useState(false);
  const hasLoadedFromBackend = useRef(false); // Rastrear si ya se cargaron datos del backend
  
  // Detectar si estamos editando (tripId no es temporal)
  useEffect(() => {
    const isEditMode = !!(tripIdParam && !tripIdParam.startsWith("temp_"));
    setIsEditing(isEditMode);
    // Resetear el flag cuando cambie el tripId
    hasLoadedFromBackend.current = false;
    // OPTIMIZACIÓN: No establecer loadingTrip para viajes temporales
    if (!isTempTrip && isEditMode) {
      setLoadingTrip(true);
    } else {
      setLoadingTrip(false);
    }
  }, [tripIdParam, isTempTrip]);

  // Cargar información de la agencia logueada
  useEffect(() => {
    const fetchAgencyInfo = async () => {
      try {
        setLoadingAgency(true);
        const response = await api.get("/auth/me");
        if (response.data?.agencies && response.data.agencies.length > 0) {
          setAgencyInfo(response.data.agencies[0].agency);
        }
      } catch (error) {
        console.error("Error al cargar información de la agencia:", error);
      } finally {
        setLoadingAgency(false);
      }
    };

    fetchAgencyInfo();
  }, []);

  // Redirigir al dashboard del agente si estamos editando pero no hay datos
  // IMPORTANTE: Este useEffect debe estar ANTES de cualquier return condicional
  // No redirigir si estamos en proceso de publicación
  useEffect(() => {
    if (isEditing && (!tripData || !tripData.title) && !loadingTrip && !publishing) {
      // Redirigir al dashboard del agente donde pueden abrir el modal de edición
      router.push(`/agent/expeditions`);
    }
  }, [isEditing, tripData, loadingTrip, tripIdParam, router, publishing]);

  // Cargar datos del trip si estamos editando
  // IMPORTANTE: Solo cargar del backend si el store está vacío Y no se han cargado antes
  // Si el usuario hizo cambios, usar los datos del store (más recientes)
  // OPTIMIZACIÓN: No cargar nada si es un viaje temporal (temp_)
  useEffect(() => {
    const loadTripData = async () => {
      // OPTIMIZACIÓN: Si es un viaje temporal, no cargar del backend
      if (tripIdParam && tripIdParam.startsWith("temp_")) {
        console.log("📦 Preview: Viaje temporal detectado, usando datos del store directamente");
        setLoadingTrip(false);
        return;
      }
      
      if (!isEditing || !tripIdParam) return;
      
      // Obtener los datos actuales del store directamente (sin depender de tripData)
      const currentTripData = useTripStore.getState().tripData;
      
      // Verificar si ya hay datos en el store (el usuario hizo cambios)
      // Si hay datos significativos en el store, no cargar del backend
      const hasStoreData = currentTripData && currentTripData.title && currentTripData.title.trim() !== "";
      
      if (hasStoreData) {
        console.log("✅ Preview: Usando datos del store (cambios del usuario):", currentTripData);
        setLoadingTrip(false);
        return; // No cargar del backend, usar los datos del store
      }
      
      // Si ya se cargaron datos del backend antes, no volver a cargar
      if (hasLoadedFromBackend.current) {
        console.log("⏭️ Preview: Ya se cargaron datos del backend anteriormente, omitiendo");
        setLoadingTrip(false);
        return;
      }
      
      try {
        setLoadingTrip(true);
        hasLoadedFromBackend.current = true; // Marcar que se están cargando datos
        console.log("📦 Preview: Cargando datos del backend (store vacío)");
        const response = await api.get(`/agencies/trips/${tripIdParam}`);
        // Los datos vienen en response.data.data según el formato del backend
        const trip = response.data?.data || response.data;
        
        if (trip) {
          console.log("📦 Preview: Cargando datos del trip:", trip);
          
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
          setBasicInfo({
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
          });
          
          // Route Points - el backend devuelve routePoints directamente con id
          if (trip.routePoints && Array.isArray(trip.routePoints) && trip.routePoints.length > 0) {
            const routePoints = trip.routePoints.map((rp: any, idx: number) => ({
              id: rp.id || `point-${idx}`,
              name: rp.name || "",
              lat: rp.latitude || 0,
              lng: rp.longitude || 0,
              order: rp.order || idx + 1,
            }));
            console.log("🗺️ Preview: Guardando routePoints:", routePoints);
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
            console.log("📅 Preview: Guardando itinerary:", itinerary);
            setItinerary(itinerary);
          }
          
          // Gallery Images - el backend devuelve objetos con imageUrl
          const galleryData = trip.galleryImages || [];
          if (Array.isArray(galleryData) && galleryData.length > 0) {
            console.log("🖼️ Preview: Cargando imágenes de galería:", galleryData.length);
            // Extraer las URLs directamente - no convertir a base64 para evitar problemas de CORS
            const imageUrls = galleryData
              .map((item: any) => {
                // Si es un objeto con imageUrl, usar imageUrl; si es string, usar directamente
                return typeof item === 'string' ? item : (item.imageUrl || '');
              })
              .filter((url: any) => typeof url === 'string' && url.length > 0);
            
            console.log("🖼️ Preview: Guardando galleryImages (URLs):", imageUrls.length);
            if (imageUrls.length > 0) {
              setGalleryImages(imageUrls);
              setCoverImageIndex(trip.coverImageIndex ?? 0);
            }
          }
          
          console.log("✅ Preview: Datos cargados en el store");
        }
      } catch (error: any) {
        console.error("Error al cargar datos del trip en preview:", error);
        console.error("Response completa:", error.response?.data);
        toast.error("Error al cargar los datos del viaje");
        // Si no se puede cargar, redirigir al dashboard del agente
        router.push("/agent/expeditions");
      } finally {
        setLoadingTrip(false);
      }
    };

    loadTripData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, tripIdParam]); // Solo depender de isEditing y tripIdParam para evitar loops

  // Usar datos del store de Zustand
  const itinerary = tripData.itinerary;

  // Transformar galería al formato esperado
  const galleryImages: GalleryImage[] = useMemo(() => {
    // Usar datos del store
    if (tripData.galleryImages && tripData.galleryImages.length > 0) {
      const images = tripData.galleryImages.slice(0, 5);
      return images.map((src, idx) => ({
        src,
        alt: `Foto ${idx + 1} del viaje ${tripData?.title || "Viaje"}`,
        className: idx === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1",
      }));
    }
    
    return [];
  }, [tripData.galleryImages, tripData?.title]);

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
        description: "Consulta las políticas de cancelación.",
      },
    ];
  }, []);

  const handleSaveDraft = async () => {
    setPublishing(true);
    try {
      await createTrip("DRAFT");
      toast.success("Borrador guardado exitosamente");
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el borrador");
    } finally {
      setPublishing(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await createTrip("PUBLISHED");
      toast.success(isEditing ? "¡Viaje actualizado exitosamente!" : "¡Viaje publicado exitosamente!");
      // Redirigir primero, luego resetear el store después de un pequeño delay
      // para evitar que el useEffect detecte que no hay datos y redirija a /new?edit=
      router.push("/agent/expeditions");
      // Resetear el store después de la redirección
      setTimeout(() => {
        resetTrip();
      }, 100);
    } catch (error: any) {
      console.error("Error en handlePublish:", error);
      toast.error(error.message || (isEditing ? "Error al actualizar el viaje" : "Error al publicar el viaje"));
    } finally {
      setPublishing(false);
    }
  };

  // Función para crear el viaje en el backend
  const createTrip = async (status: "DRAFT" | "PUBLISHED") => {
    if (!tripData.title || !tripData.description) {
      throw new Error("Por favor completa todos los campos requeridos");
    }

    // Validar campos requeridos
    if (!tripData.idCity) {
      throw new Error("Por favor selecciona una ciudad");
    }
    if (tripData.durationDays === undefined || tripData.durationDays === null) {
      throw new Error("Por favor ingresa la duración en días");
    }
    if (tripData.durationNights === undefined || tripData.durationNights === null) {
      throw new Error("Por favor ingresa la duración en noches");
    }

    // Crear FormData para enviar al endpoint
    const formData = new FormData();

    // Basic Info - campos requeridos
    formData.append("idCity", tripData.idCity);
    formData.append("title", tripData.title);
    formData.append("description", tripData.description || "");
    
    // Convertir category al formato esperado por el backend
    const categoryMap: Record<string, string> = {
      adventure: "ADVENTURE",
      luxury: "LUXURY",
      cultural: "CULTURAL",
      wellness: "WELLNESS",
      wildlife: "WILDLIFE",
      // También manejar valores ya en mayúsculas
      ADVENTURE: "ADVENTURE",
      LUXURY: "LUXURY",
      CULTURAL: "CULTURAL",
      WELLNESS: "WELLNESS",
      WILDLIFE: "WILDLIFE",
    };
    const categoryValue = tripData.category || "Adventure";
    const normalizedCategory = categoryMap[categoryValue.toLowerCase()] || categoryMap[categoryValue] || "ADVENTURE";
    formData.append("category", normalizedCategory);
    
    formData.append("destinationRegion", tripData.destinationRegion || "");
    
    if (tripData.latitude !== undefined) {
      formData.append("latitude", String(tripData.latitude));
    }
    if (tripData.longitude !== undefined) {
      formData.append("longitude", String(tripData.longitude));
    }
    
    if (tripData.startDate) {
      formData.append("startDate", tripData.startDate);
    }
    if (tripData.endDate) {
      formData.append("endDate", tripData.endDate);
    }
    
    // durationDays y durationNights son requeridos
    formData.append("durationDays", String(tripData.durationDays || 0));
    formData.append("durationNights", String(tripData.durationNights || 0));
    
    if (tripData.price !== undefined) {
      formData.append("price", String(tripData.price));
    }
    // Convertir currency al formato esperado por el backend
    const currencyMap: Record<string, string> = {
      cop: "COP",
      usd: "USD",
      eur: "EUR",
      // También manejar valores ya en mayúsculas
      COP: "COP",
      USD: "USD",
      EUR: "EUR",
    };
    const currencyValue = tripData.currency || "COP";
    const normalizedCurrency = currencyMap[currencyValue.toUpperCase()] || "COP";
    formData.append("currency", normalizedCurrency);
    
    // Convertir priceType al formato esperado por el backend
    const priceTypeMap: Record<string, string> = {
      adults: "ADULTS",
      children: "CHILDREN",
      both: "BOTH",
    };
    formData.append("priceType", priceTypeMap[tripData.priceType] || "ADULTS");
    
    if (tripData.maxPersons !== undefined) {
      formData.append("maxPersons", String(tripData.maxPersons));
    }
    
    if (tripData.coverImageIndex !== null) {
      formData.append("coverImageIndex", String(tripData.coverImageIndex));
    }
    
    formData.append("status", status);
    // isActive: true por defecto cuando se publica o guarda como borrador
    formData.append("isActive", status === "PUBLISHED" ? "true" : "true");

    // Discount Codes (opcional - JSON string)
    // Enviar como string JSON dentro del form-data, compatible con los ejemplos de CURL
    if (tripData.discountCodes !== undefined && tripData.discountCodes.length > 0) {
      // Filtrar códigos válidos (con código no vacío)
      const discountCodesArray = tripData.discountCodes
        .filter((code) => code.code && code.code.trim() !== "")
        .map((code) => ({
          code: code.code.trim(),
          percentage: code.percentage,
          maxUses: code.maxUses ?? null,
          perUserLimit: code.perUserLimit ?? null,
        }));
      
      // Solo enviar si hay códigos válidos
      if (discountCodesArray.length > 0) {
        formData.append("discountCodes", JSON.stringify(discountCodesArray));
      } else if (isEditing) {
        // Si estamos editando y todos los códigos fueron eliminados, enviar array vacío para eliminar todos
        formData.append("discountCodes", JSON.stringify([]));
      }
    } else if (isEditing && tripData.discountCodes !== undefined && tripData.discountCodes.length === 0) {
      // Si estamos editando y el array está explícitamente vacío, enviar array vacío para eliminar todos
      formData.append("discountCodes", JSON.stringify([]));
    }
    // Si es creación nueva y no hay códigos, no enviar el campo (opcional)

    // Promoter (opcional)
    // Solo enviar si hay un código definido o si estamos editando y queremos eliminarlo explícitamente
    if (tripData.promoterCode !== undefined) {
      if (tripData.promoterCode && tripData.promoterCode.trim() !== "") {
        formData.append("promoterCode", tripData.promoterCode.trim());
        if (tripData.promoterName && tripData.promoterName.trim() !== "") {
          formData.append("promoterName", tripData.promoterName.trim());
        }
      } else if (isEditing) {
        // Si estamos editando y el código está vacío, enviar string vacío para eliminar promoter
        // Compatible con: curl -F "promoterCode="
        formData.append("promoterCode", "");
      }
    }
    // Si es creación nueva y no hay promoter, no enviar el campo (opcional)

    // Route Points (JSON string)
    if (tripData.routePoints && tripData.routePoints.length > 0) {
      const routePointsArray = tripData.routePoints.map((point) => ({
        name: point.name,
        latitude: point.lat,
        longitude: point.lng,
        order: point.order,
      }));
      formData.append("routePoints", JSON.stringify(routePointsArray));
    }

    // Itinerary (JSON string)
    if (tripData.itinerary && tripData.itinerary.length > 0) {
      const itineraryArray = tripData.itinerary.map((day) => ({
        day: day.day,
        title: day.title,
        subtitle: day.subtitle || "",
        order: day.order,
        activities: day.activities.map((activity) => {
          // Mapear el tipo de actividad al formato esperado por el backend
          const activityTypeMap: Record<string, string> = {
            activity: "ACTIVITY",
            accommodation: "ACCOMMODATION",
            transport: "TRANSPORT",
            meal: "MEAL",
            poi: "POI",
            // También manejar valores ya en mayúsculas
            ACTIVITY: "ACTIVITY",
            ACCOMMODATION: "ACCOMMODATION",
            TRANSPORT: "TRANSPORT",
            MEAL: "MEAL",
            POI: "POI",
          };
          const activityType = activity.type || "activity";
          const normalizedActivityType = activityTypeMap[activityType.toLowerCase()] || activityTypeMap[activityType] || "ACTIVITY";
          
          return {
            type: normalizedActivityType,
            title: activity.title,
            description: activity.description || "",
            time: activity.time || "",
            order: activity.order || 0,
            latitude: activity.latitude,
            longitude: activity.longitude,
            poiId: activity.poiId,
          };
        }),
      }));
      formData.append("itinerary", JSON.stringify(itineraryArray));
    }

    // Gallery Images (convertir base64 a File, o mantener URLs si ya son URLs)
    // IMPORTANTE: Solo enviar imágenes nuevas (base64). Si todas son URLs existentes, no enviar nada
    // para que el backend no borre las imágenes existentes.
    if (tripData.galleryImages && tripData.galleryImages.length > 0) {
      let hasNewImages = false;
      tripData.galleryImages.forEach((image, index) => {
        try {
          // Si es una URL (empieza con http:// o https://), no convertir ni enviar
          if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
            // Si estamos editando, las URLs ya están en el backend, no necesitamos enviarlas de nuevo
            // Solo enviar si son nuevas imágenes (base64)
            console.log(`Imagen ${index} es una URL, omitiendo en el envío (ya existe en el backend)`);
            return;
          }
          // Si es base64, es una imagen nueva, convertir a File y enviar
          hasNewImages = true;
          const file = base64ToFile(image, index);
          formData.append("galleryImages", file);
        } catch (error) {
          console.error(`Error convirtiendo imagen ${index}:`, error);
        }
      });
      
      // Si estamos editando y no hay imágenes nuevas, no enviar el campo galleryImages
      // para que el backend no borre las imágenes existentes
      if (isEditing && !hasNewImages) {
        console.log("⚠️ Modo edición: No hay imágenes nuevas, omitiendo campo galleryImages para preservar las existentes");
      }
    } else if (isEditing) {
      // Si estamos editando y no hay imágenes en el array, no enviar nada
      // para que el backend no borre las imágenes existentes
      console.log("⚠️ Modo edición: No hay imágenes en el array, omitiendo campo galleryImages para preservar las existentes");
    }

    // Log para debugging - mostrar todo el payload
    console.log("=== PAYLOAD COMPLETO DEL VIAJE ===");
    console.log("Datos del store (tripData):", JSON.stringify(tripData, null, 2));
    
    // Crear un objeto con todos los valores del FormData para mostrarlo
    const payloadPreview: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        payloadPreview[key] = {
          type: "File",
          name: value.name,
          size: value.size,
          mimeType: value.type,
        };
      } else {
        // Intentar parsear JSON si es posible
        if (key === "routePoints" || key === "itinerary") {
          try {
            payloadPreview[key] = JSON.parse(value as string);
          } catch {
            payloadPreview[key] = value;
          }
        } else {
          payloadPreview[key] = value;
        }
      }
    }
    
    console.log("Payload que se enviará al backend:", JSON.stringify(payloadPreview, null, 2));
    console.log("===================================");

    // Enviar al endpoint (POST para crear, PATCH para actualizar)
    try {
      if (isEditing && tripIdParam) {
        // Actualizar trip existente
        console.log(`🔄 Actualizando viaje con ID: ${tripIdParam}`);
        console.log(`📡 Endpoint: PATCH /agencies/trips/${tripIdParam}`);
        const response = await api.patch(`/agencies/trips/${tripIdParam}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("✅ Respuesta del servidor:", response.data);
        return response.data;
      } else {
        // Crear nuevo trip
        console.log("🆕 Creando nuevo viaje");
        const response = await api.post("/agencies/trips", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("✅ Respuesta del servidor:", response.data);
        return response.data;
      }
    } catch (error: any) {
      // Log detallado del error
      console.error(isEditing ? "❌ Error al actualizar viaje:" : "❌ Error al crear viaje:", error);
      if (error.response) {
        console.error("📋 Response data:", error.response.data);
        console.error("📊 Response status:", error.response.status);
        console.error("📝 Response headers:", error.response.headers);
        const errorMessage = error.response.data?.message || error.response.data?.error || `Error del servidor: ${error.response.status}`;
        console.error("💬 Mensaje de error:", errorMessage);
        throw new Error(errorMessage);
      }
      if (error.request) {
        console.error("⚠️ No se recibió respuesta del servidor:", error.request);
        throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
      }
      throw error;
    }
  };

  // Mostrar loading solo si estamos editando y realmente cargando datos del backend
  // OPTIMIZACIÓN: No mostrar loading para viajes temporales (temp_)
  // isTempTrip ya está definido arriba en la línea 67
  if (loadingTrip && isEditing && !isTempTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Cargando datos del viaje...</div>
      </div>
    );
  }

  // OPTIMIZACIÓN: Para viajes temporales, dar un poco más de tiempo antes de mostrar error
  if (!tripData || !tripData.title) {
    // Si es un viaje temporal y no hay datos aún, esperar un momento (puede estar sincronizando)
    if (isTempTrip) {
      // Dar tiempo para que el store se sincronice
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-slate-500">Preparando vista previa...</div>
        </div>
      );
    }
    
    // Si estamos editando, mostrar loading mientras redirige
    if (isEditing) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-slate-500">Cargando formulario de edición...</div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">No hay datos del viaje. Por favor completa el formulario primero.</div>
      </div>
    );
  }

  const cancellationPolicyText = "Política personalizada.";

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
              {tripData.destinationRegion || "Ubicación no especificada"}
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
            {publishing ? "Guardando..." : "Guardar como Borrador"}
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition-all disabled:opacity-50"
          >
            {publishing ? (isEditing ? "Actualizando..." : "Publicando...") : (
              <>
                {isEditing ? "Actualizar Viaje" : "Publicar Viaje"}
                <Send className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {galleryImages.length > 0 && (
        <GalleryGrid 
          images={galleryImages} 
          allImages={tripData.galleryImages || []}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          {agencyInfo && (
            <div className="flex items-center justify-between pb-8 border-b border-gray-100 dark:border-gray-800">
              <div className="flex gap-4">
                <div
                  className="size-16 rounded-full bg-cover bg-center border-2 border-primary/10"
                  style={{
                    backgroundImage: agencyInfo.picture 
                      ? `url('${agencyInfo.picture}')`
                      : "url('https://ui-avatars.com/api/?name=" + encodeURIComponent(agencyInfo.nameAgency || 'Agencia') + "&background=4f46e5&color=fff')"
                  }}
                  aria-label={`Logo de ${agencyInfo.nameAgency}`}
                  role="img"
                />
                <div>
                  <h3 className="text-xl font-bold">Agencia: {agencyInfo.nameAgency}</h3>
                  <p className="text-gray-500 text-sm">
                    {agencyInfo.email}
                  </p>
                </div>
              </div>
              <button className="px-6 py-2.5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors text-sm">
                Contactar Agencia
              </button>
            </div>
          )}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Sobre esta experiencia
            </h2>
            <div 
              className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg prose max-w-none"
              dangerouslySetInnerHTML={{ __html: tripData.description || "" }}
            />
          </section>
          {itineraryDays.length > 0 && (
            <div>
              {!showFullItinerary ? (
                <Itinerary items={itineraryDays} />
              ) : (
                <section className="space-y-8 pt-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Itinerario completo</h2>
                    <button
                      onClick={() => setShowFullItinerary(false)}
                      className="text-primary font-bold hover:underline text-sm"
                    >
                      Ver resumen
                    </button>
                  </div>
                  <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/20">
                    {tripData.itinerary?.map((day: any, dayIndex: number) => {
                      const dayIcon = itineraryDays[dayIndex]?.icon || PlaneLanding;
                      const Icon = dayIcon;
                      const isFirst = dayIndex === 0;
                      
                      return (
                        <div key={day.day} className="relative pl-12 pb-8">
                          {/* Icono del día */}
                          <div
                            className={`absolute left-0 top-1 size-10 rounded-full flex items-center justify-center ring-8 ring-background-light dark:ring-background-dark z-10 ${
                              isFirst
                                ? 'bg-primary text-white'
                                : 'bg-primary/20 text-primary'
                            }`}
                          >
                            <Icon className="size-5" />
                          </div>
                          
                          {/* Contenido del día */}
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-bold text-lg">Día {day.day}: {day.title}</h3>
                              {day.subtitle && (
                                <p className="text-gray-500 text-sm mt-1">{day.subtitle}</p>
                              )}
                            </div>
                            
                            {/* Actividades del día */}
                            {day.activities && day.activities.length > 0 && (
                              <div className="space-y-3 mt-4 ml-4 pl-4 border-l-2 border-gray-100">
                                {day.activities.map((activity: any, idx: number) => (
                                  <div key={idx} className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      {activity.time && (
                                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                          {activity.time}
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-semibold text-base">{activity.title}</h4>
                                    {activity.description && (
                                      <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
              {!showFullItinerary && (
                <button
                  onClick={() => setShowFullItinerary(true)}
                  className="text-primary font-bold hover:underline flex items-center gap-2 mt-4"
                >
                  Ver itinerario completo
                </button>
              )}
            </div>
          )}
          {(tripData.routePoints && tripData.routePoints.length > 0) && <MapSection />}
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
