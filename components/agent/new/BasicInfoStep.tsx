"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTripStore } from "@/store/tripStore";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { DateRange } from "react-day-picker";
import { gsap } from "gsap";
import CitySelector from "./CitySelector";
import DateRangeSection from "./DateRangeSection";
import PriceAndPersonsSection from "./PriceAndPersonsSection";
import PriceTypeAndCategorySection from "./PriceTypeAndCategorySection";
import RoutePointsSection from "./RoutePointsSection";
import DiscountCodesAndPromoterSection from "./DiscountCodesAndPromoterSection";

interface BasicInfoStepProps {
  tripId?: string;
  onTripCreated?: (tripId: string) => void;
  initialData?: {
    idCity?: string;
    title?: string;
    description?: string;
    category?: string;
    location?: string;
    destinationRegion?: string;
    latitude?: number;
    longitude?: number;
    durationDays?: number;
    durationNights?: number;
    price?: number;
    currency?: string;
    maxPersons?: number;
    priceType?: "adults" | "children" | "both";
  };
}

export default function BasicInfoStep({ tripId, onTripCreated, initialData }: BasicInfoStepProps) {
  const tripData = useTripStore((state) => state.tripData);
  const setBasicInfo = useTripStore((state) => state.setBasicInfo);
  const setRoutePoints = useTripStore((state) => state.setRoutePoints);
  const formRef = useRef<HTMLFormElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Función para convertir fechas string a DateRange
  const parseDateRange = (startDateStr?: string, endDateStr?: string): DateRange | undefined => {
    if (!startDateStr || !endDateStr) return undefined;
    const from = new Date(startDateStr);
    const to = new Date(endDateStr);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return undefined;
    return { from, to };
  };

  const [formData, setFormData] = useState({
    idCity: initialData?.idCity || tripData.idCity || "",
    title: initialData?.title || tripData.title || "",
    description: initialData?.description || tripData.description || "",
    category: initialData?.category || tripData.category || "Adventure",
    destinationRegion: initialData?.destinationRegion || tripData.destinationRegion || "",
    latitude: initialData?.latitude || tripData.latitude,
    longitude: initialData?.longitude || tripData.longitude,
    durationDays: initialData?.durationDays || tripData.durationDays || undefined,
    durationNights: initialData?.durationNights || tripData.durationNights || undefined,
    price: initialData?.price || tripData.price || undefined,
    currency: initialData?.currency || tripData.currency || "COP",
    maxPersons: initialData?.maxPersons || tripData.maxPersons || undefined,
    priceType: initialData?.priceType || tripData.priceType || "adults",
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    parseDateRange(tripData.startDate, tripData.endDate)
  );

  // Sincronizar formData con el store
  useEffect(() => {
    const hasStoreData = tripData.title || tripData.idCity || tripData.destinationRegion;
    const isFormEmpty = !formData.title && !formData.idCity && !formData.destinationRegion;
    
    if (hasStoreData && (isFormEmpty || !initialData?.title)) {
      const storeData = {
        idCity: tripData.idCity || "",
        title: tripData.title || "",
        description: tripData.description || "",
        category: tripData.category || "Adventure",
        destinationRegion: tripData.destinationRegion || "",
        latitude: tripData.latitude,
        longitude: tripData.longitude,
        durationDays: tripData.durationDays,
        durationNights: tripData.durationNights,
        price: tripData.price,
        currency: tripData.currency || "COP",
        maxPersons: tripData.maxPersons,
        priceType: tripData.priceType || "adults",
      };
      
      const hasChanges = 
        storeData.idCity !== formData.idCity ||
        storeData.title !== formData.title ||
        storeData.description !== formData.description ||
        storeData.category !== formData.category ||
        storeData.destinationRegion !== formData.destinationRegion ||
        storeData.latitude !== formData.latitude ||
        storeData.longitude !== formData.longitude ||
        storeData.durationDays !== formData.durationDays ||
        storeData.durationNights !== formData.durationNights ||
        storeData.price !== formData.price ||
        storeData.currency !== formData.currency ||
        storeData.maxPersons !== formData.maxPersons ||
        storeData.priceType !== formData.priceType;
      
      if (hasChanges) {
        setFormData(prev => ({
          ...prev,
          idCity: tripData.idCity || prev.idCity || "",
          title: tripData.title || prev.title || "",
          description: tripData.description || prev.description || "",
          category: tripData.category || prev.category || "Adventure",
          destinationRegion: tripData.destinationRegion || prev.destinationRegion || "",
          latitude: tripData.latitude !== undefined ? tripData.latitude : prev.latitude,
          longitude: tripData.longitude !== undefined ? tripData.longitude : prev.longitude,
          durationDays: tripData.durationDays !== undefined ? tripData.durationDays : prev.durationDays,
          durationNights: tripData.durationNights !== undefined ? tripData.durationNights : prev.durationNights,
          price: tripData.price !== undefined ? tripData.price : prev.price,
          currency: tripData.currency || prev.currency || "COP",
          maxPersons: tripData.maxPersons !== undefined ? tripData.maxPersons : prev.maxPersons,
          priceType: tripData.priceType || prev.priceType || "adults",
        }));
      }
    }
  }, [tripData.title, tripData.description, tripData.idCity, tripData.destinationRegion, tripData.latitude, tripData.longitude, tripData.durationDays, tripData.durationNights, tripData.price, tripData.currency, tripData.maxPersons, tripData.priceType, tripData.category, initialData?.title]);

  // Sincronizar dateRange con el store
  useEffect(() => {
    if (tripData.startDate && tripData.endDate) {
      const storeDateRange = parseDateRange(tripData.startDate, tripData.endDate);
      if (storeDateRange?.from && storeDateRange?.to) {
        const currentFrom = dateRange?.from?.toISOString();
        const currentTo = dateRange?.to?.toISOString();
        const storeFrom = storeDateRange.from.toISOString();
        const storeTo = storeDateRange.to.toISOString();
        
        if (currentFrom !== storeFrom || currentTo !== storeTo) {
          setDateRange(storeDateRange);
        }
      }
    } else if (!tripData.startDate && !tripData.endDate && dateRange) {
      setDateRange(undefined);
    }
  }, [tripData.startDate, tripData.endDate]);


  // Guardar en el store cuando cambien los datos
  useEffect(() => {
    setBasicInfo({
      ...formData,
      startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
      endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
    });
  }, [formData, dateRange, setBasicInfo]);

  // Función para calcular días y noches desde DateRange
  const calculateDurationFromRange = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) {
      return { durationDays: undefined, durationNights: undefined };
    }
    const from = new Date(range.from);
    from.setHours(0, 0, 0, 0);
    const to = new Date(range.to);
    to.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const nights = diffDays > 0 ? diffDays - 1 : 0;
    return {
      durationDays: diffDays,
      durationNights: nights,
    };
  };

  // Actualizar duración cuando cambia el dateRange
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const { durationDays, durationNights } = calculateDurationFromRange(dateRange);
      setFormData((prev) => ({
        ...prev,
        durationDays,
        durationNights,
      }));
    }
  }, [dateRange]);

  const handleInputChange = (name: string, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleLocationSelect = useCallback((location: { lat: number; lng: number; region?: string }) => {
    if (formData.latitude === undefined && formData.longitude === undefined) {
      setFormData((prev) => ({
        ...prev,
        latitude: location.lat,
        longitude: location.lng,
        destinationRegion: location.region || prev.destinationRegion,
      }));
    }
  }, [formData.latitude, formData.longitude]);

  // Animaciones GSAP cuando el componente se monta
  useEffect(() => {
    if (!formRef.current) return;

    const ctx = gsap.context(() => {
      // Animación de entrada para cada sección
      const sections = formRef.current?.querySelectorAll('[data-section]');
      if (sections) {
        gsap.fromTo(sections, 
          {
            opacity: 0,
            y: 20,
            scale: 0.95
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.2)"
          }
        );
      }
    }, formRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100 bg-white sticky top-0 z-30 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-caveat font-bold tracking-tight text-slate-900">
          Información Básica
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Detalles principales de tu expedición
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 w-full min-h-0">
        <form ref={formRef} className="space-y-4 sm:space-y-6" onSubmit={(e) => { e.preventDefault(); }}>
          <div data-section className="space-y-2 sm:space-y-3 transform transition-all">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
              Título del Viaje
            </label>
            <input
              className="w-full h-11 sm:h-12 px-3 sm:px-4 border border-neutral-200 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 bg-white"
              placeholder="Ej: Patagonia: La Última Frontera"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
            <p className="text-[10px] sm:text-xs text-slate-500">
              Intenta hacerlo evocativo y descriptivo
            </p>
          </div>

          {/* Grid responsive: 1 columna en móvil, 3 en desktop */}
          <div data-section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 transform transition-all">
            <div>
              <CitySelector
                value={formData.idCity}
                onChange={(idCity) => handleInputChange("idCity", idCity)}
              />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 block">Tipo de Precio</label>
              <div className="relative">
                <select
                  className="w-full h-11 sm:h-12 px-3 sm:px-4 border border-neutral-200 rounded-lg text-sm sm:text-base appearance-none bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                  value={formData.priceType}
                  onChange={(e) => handleInputChange("priceType", e.target.value as "adults" | "children" | "both")}
                >
                  <option value="adults">Solo Adultos</option>
                  <option value="children">Solo Niños</option>
                  <option value="both">Familia (Adultos y Niños)</option>
                </select>
                <span className="absolute right-2 sm:right-3 top-2.5 sm:top-3.5 text-slate-400 pointer-events-none text-xs sm:text-sm">⌄</span>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 block">Categoría</label>
              <div className="relative">
                <select
                  className="w-full h-11 sm:h-12 px-3 sm:px-4 border border-neutral-200 rounded-lg text-sm sm:text-base appearance-none bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                >
                  <option value="Adventure">Aventura</option>
                  <option value="Luxury">Lujo</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Wellness">Bienestar</option>
                  <option value="Wildlife">Vida Silvestre</option>
                </select>
                <span className="absolute right-2 sm:right-3 top-2.5 sm:top-3.5 text-slate-400 pointer-events-none text-xs sm:text-sm">⌄</span>
              </div>
            </div>
          </div>

          <div data-section className="transform transition-all">
            <DateRangeSection
              startDate={tripData.startDate}
              endDate={tripData.endDate}
              durationDays={formData.durationDays}
              durationNights={formData.durationNights}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>

          {/* Grid responsive: 1 columna en móvil, 2 en desktop */}
          <div data-section className="w-full transform transition-all">
            <PriceAndPersonsSection
              price={formData.price}
              currency={formData.currency}
              maxPersons={formData.maxPersons}
              onPriceChange={(price) => handleInputChange("price", price)}
              onCurrencyChange={(currency) => handleInputChange("currency", currency)}
              onMaxPersonsChange={(maxPersons) => handleInputChange("maxPersons", maxPersons)}
            />
          </div>

          <div data-section className="transform transition-all">
            <RoutePointsSection
              routePoints={tripData.routePoints || []}
              onRoutePointsChange={setRoutePoints}
              onLocationSelect={handleLocationSelect}
              onDestinationRegionChange={(region) => handleInputChange("destinationRegion", region)}
              onCoordinatesChange={(lat, lng) => {
                setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
              }}
            />
          </div>

          <div data-section className="space-y-3 transform transition-all">
            <label className="text-sm font-semibold text-slate-700 block">
              Descripción del Viaje
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => handleInputChange("description", value)}
              placeholder="Describe el alma de este viaje..."
              className="w-full"
            />
            <p className="text-xs text-slate-500 text-right">
              Recomendado: 300-500 palabras
            </p>
          </div>

          <div data-section className="transform transition-all border-t border-slate-200 pt-6">
            <DiscountCodesAndPromoterSection />
          </div>
        </form>
      </div>
    </div>
  );
}
