"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTripStore } from "@/store/tripStore";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { DateRange } from "react-day-picker";
import CitySelector from "./CitySelector";
import DateRangeSection from "./DateRangeSection";
import PriceAndPersonsSection from "./PriceAndPersonsSection";
import PriceTypeAndCategorySection from "./PriceTypeAndCategorySection";
import RoutePointsSection from "./RoutePointsSection";

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

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
      <div className="px-8 py-6 border-b border-neutral-100 bg-white/90 backdrop-blur sticky top-0 z-20">
        <h2 className="text-3xl font-caveat font-bold tracking-tight text-slate-900">Información Básica</h2>
        <p className="text-sm text-slate-500 mt-1">
          Comencemos con los detalles principales de tu expedición. Esta información se mostrará como encabezado principal de la página de tu viaje.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-12 w-full">
        <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); }}>
          <CitySelector
            value={formData.idCity}
            onChange={(idCity) => handleInputChange("idCity", idCity)}
          />

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">Título del Viaje</label>
            <input
              className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
              placeholder="Ej: Patagonia: La Última Frontera"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
            <p className="text-xs text-slate-400 italic">Intenta hacerlo evocativo y descriptivo.</p>
          </div>

          <DateRangeSection
            startDate={tripData.startDate}
            endDate={tripData.endDate}
            durationDays={formData.durationDays}
            durationNights={formData.durationNights}
            onDateRangeChange={handleDateRangeChange}
          />

          <PriceAndPersonsSection
            price={formData.price}
            currency={formData.currency}
            maxPersons={formData.maxPersons}
            onPriceChange={(price) => handleInputChange("price", price)}
            onCurrencyChange={(currency) => handleInputChange("currency", currency)}
            onMaxPersonsChange={(maxPersons) => handleInputChange("maxPersons", maxPersons)}
          />

          <PriceTypeAndCategorySection
            priceType={formData.priceType}
            category={formData.category}
            onPriceTypeChange={(priceType) => handleInputChange("priceType", priceType)}
            onCategoryChange={(category) => handleInputChange("category", category)}
          />

          <RoutePointsSection
            routePoints={tripData.routePoints || []}
            onRoutePointsChange={setRoutePoints}
            onLocationSelect={handleLocationSelect}
            onDestinationRegionChange={(region) => handleInputChange("destinationRegion", region)}
            onCoordinatesChange={(lat, lng) => {
              setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
            }}
          />

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">Descripción del Viaje</label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => handleInputChange("description", value)}
              placeholder="Describe el alma de este viaje..."
              className="w-full"
            />
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">
              Recomendado: 300-500 palabras
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
