import { create } from "zustand";
import { persist } from "zustand/middleware";

// Tipos para el store del trip
export interface RoutePoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

export interface Activity {
  type: string;
  title: string;
  description?: string;
  time?: string;
  imageData?: string;
  latitude?: number;
  longitude?: number;
  poiId?: string;
  order?: number;
}

export interface Day {
  day: number;
  title: string;
  subtitle?: string;
  activities: Activity[];
  order: number;
}

export interface DiscountCode {
  code: string;
  percentage: number;
  maxUses?: number | null;
  perUserLimit?: number | null;
}

export interface TripFormData {
  // Basic Info
  idCity?: string;
  title: string;
  description: string;
  category: string;
  destinationRegion: string;
  latitude?: number;
  longitude?: number;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  durationNights?: number;
  price?: number;
  currency: string;
  priceType: "adults" | "children" | "both";
  maxPersons?: number;
  routePoints: RoutePoint[];
  
  // Itinerary
  itinerary: Day[];
  
  // Gallery
  galleryImages: string[]; // Base64 strings
  coverImageIndex: number | null;
  
  // Discount Codes & Promoter (opcionales)
  discountCodes?: DiscountCode[];
  promoterCode?: string;
  promoterName?: string;
  
  // Metadata
  status?: "DRAFT" | "PUBLISHED";
}

interface TripStore {
  tripData: TripFormData;
  
  // Actions para Basic Info
  setBasicInfo: (data: Partial<TripFormData>) => void;
  setRoutePoints: (points: RoutePoint[]) => void;
  
  // Actions para Itinerary
  setItinerary: (days: Day[]) => void;
  
  // Actions para Gallery
  setGalleryImages: (images: string[]) => void;
  setCoverImageIndex: (index: number | null) => void;
  
  // Actions para Discount Codes & Promoter
  setDiscountCodes: (codes: DiscountCode[]) => void;
  setPromoter: (code?: string, name?: string) => void;
  
  // Utilidades
  resetTrip: () => void;
  getTripData: () => TripFormData;
}

const initialState: TripFormData = {
  title: "",
  description: "",
  category: "Adventure",
  destinationRegion: "",
  currency: "COP",
  priceType: "adults",
  routePoints: [],
  itinerary: [],
  galleryImages: [],
  coverImageIndex: null,
  status: "DRAFT",
};

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      tripData: initialState,

      setBasicInfo: (data) =>
        set((state) => ({
          tripData: { ...state.tripData, ...data },
        })),

      setRoutePoints: (points) =>
        set((state) => ({
          tripData: { ...state.tripData, routePoints: points },
        })),

      setItinerary: (days) =>
        set((state) => ({
          tripData: { ...state.tripData, itinerary: days },
        })),

      setGalleryImages: (images) =>
        set((state) => ({
          tripData: { ...state.tripData, galleryImages: images },
        })),

      setCoverImageIndex: (index) =>
        set((state) => ({
          tripData: { ...state.tripData, coverImageIndex: index },
        })),

      setDiscountCodes: (codes) =>
        set((state) => ({
          tripData: { ...state.tripData, discountCodes: codes },
        })),

      setPromoter: (code, name) =>
        set((state) => ({
          tripData: { 
            ...state.tripData, 
            promoterCode: code || undefined,
            promoterName: name || undefined,
          },
        })),

      resetTrip: () =>
        set({
          tripData: initialState,
        }),

      getTripData: () => get().tripData,
    }),
    {
      name: "trip-form-storage",
      // Opcional: serializar solo ciertos campos
    }
  )
);
