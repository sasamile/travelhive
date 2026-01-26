// Tipos para el endpoint /public/trips

export interface RoutePoint {
  id: string;
  idTrip: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

export interface GalleryImage {
  id: string;
  idTrip: string;
  imageUrl: string;
  order: number;
}

export interface Activity {
  id: string;
  idDay: string;
  type: string;
  title: string;
  description: string | null;
  time: string | null;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  poiId: string | null;
  order: number;
}

export interface ItineraryDay {
  id: string;
  idTrip: string;
  day: number;
  title: string;
  subtitle: string | null;
  order: number;
  activities: Activity[];
}

export interface City {
  idCity: string;
  nameCity: string;
}

export interface Agency {
  idAgency: string;
  nameAgency: string;
  picture: string | null;
}

export interface Expedition {
  idExpedition: string;
  idTrip: string;
  startDate: string;
  endDate: string;
  capacityTotal: number;
  capacityAvailable: number;
  priceAdult: number | null;
  priceChild: number | null;
  currency: string | null;
  status: string;
}

export interface PublicTrip {
  idTrip: string;
  idAgency: string;
  idCity: string;
  title: string;
  description: string | null;
  category: string;
  destinationRegion: string | null;
  latitude: number | null;
  longitude: number | null;
  startDate: string | null;
  endDate: string | null;
  durationDays: number | null;
  durationNights: number | null;
  price: number | null;
  currency: string | null;
  priceType: string | null;
  maxPersons: number | null;
  coverImage: string | null;
  coverImageIndex: number | null;
  status: string;
  isActive: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  routePoints: RoutePoint[];
  galleryImages: GalleryImage[];
  itineraryDays: ItineraryDay[];
  city: City;
  agency: Agency;
  expeditions: Expedition[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PublicTripsResponse {
  data: PublicTrip[];
  pagination: Pagination;
}

export interface TripFilters {
  idCity?: string;
  startDate?: string; // ISO format
  endDate?: string; // ISO format
  persons?: number;
  page?: number;
  limit?: number;
}
