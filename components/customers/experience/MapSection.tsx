"use client";

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useTripStore } from '@/store/tripStore';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

// Extender window para incluir google (usar la misma declaración que BasicInfoStep.tsx)
declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement | null, opts?: any) => any;
        Marker: new (opts?: any) => any;
        DirectionsService: new () => any;
        DirectionsRenderer: new (opts?: any) => any;
        Polyline: new (opts?: any) => any;
        LatLng: new (lat: number, lng: number) => any;
        LatLngBounds: new () => any;
        Geocoder: new () => any;
        TravelMode: { DRIVING: string };
        DirectionsStatus: { OK: string };
        GeocoderStatus: { OK: string };
        places: {
          AutocompleteService: new () => any;
          PlacesService: new (attrContainer: HTMLDivElement | any) => any;
          PlacesServiceStatus: { OK: string };
        };
        SymbolPath: {
          CIRCLE: any;
        };
      };
    };
    gm_authFailure?: () => void;
  }
}

export function MapSection() {
  const tripData = useTripStore((state) => state.tripData);
  const routePoints = tripData.routePoints || [];
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Si no hay routePoints, no mostrar el mapa
  if (routePoints.length === 0) {
    return null;
  }

  // Calcular el centro del mapa basado en los routePoints
  const center = routePoints.length > 0
    ? {
        lat: routePoints.reduce((sum, p) => sum + p.lat, 0) / routePoints.length,
        lng: routePoints.reduce((sum, p) => sum + p.lng, 0) / routePoints.length,
      }
    : { lat: 4.6097, lng: -74.0817 }; // Bogotá por defecto

  const locationName = tripData.destinationRegion || routePoints[0]?.name || "Ubicación del viaje";

  // Cargar Google Maps API
  useEffect(() => {
    if (typeof window === 'undefined' || !GOOGLE_MAPS_API_KEY || !mapRef.current) {
      return;
    }

    // Verificar si ya está cargado
    if (window.google?.maps) {
      initializeMap();
      return;
    }

    // Verificar si el script ya existe
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      // Esperar a que se cargue si ya existe
      const checkGoogle = setInterval(() => {
        if (window.google?.maps) {
          initializeMap();
          clearInterval(checkGoogle);
        }
      }, 100);
      return () => clearInterval(checkGoogle);
    }

    // Cargar el script de Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&language=es&region=CO`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google?.maps) {
        initializeMap();
      } else {
        setMapError('Google Maps se cargó pero no está disponible');
      }
    };
    
    script.onerror = () => {
      setMapError('Error al cargar Google Maps API - Verifica tu API key');
    };

    document.head.appendChild(script);

    return () => {
      // Limpiar al desmontar
      if (mapInstanceRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setMap(null);
        }
      }
    };
  }, [routePoints.length]); // Re-inicializar si cambian los routePoints

  // Inicializar el mapa
  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: routePoints.length === 1 ? 10 : 8,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Agregar marcadores
    routePoints.forEach((point, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map: map,
        label: {
          text: String(point.order || index + 1),
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: '#4f46e5',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: point.name || `Punto ${index + 1}`,
      });
      markersRef.current.push(marker);
    });

    // Dibujar rutas entre puntos si hay más de uno
    if (routePoints.length > 1) {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true, // No mostrar marcadores adicionales
        preserveViewport: true,
      });
      directionsRendererRef.current = directionsRenderer;

      // Crear waypoints (todos los puntos excepto el primero y el último)
      const waypoints = routePoints.slice(1, -1).map(point => ({
        location: { lat: point.lat, lng: point.lng },
        stopover: true,
      }));

      const travelMode = (window.google.maps as any).TravelMode?.DRIVING || 'DRIVING';
      directionsService.route(
        {
          origin: { lat: routePoints[0].lat, lng: routePoints[0].lng },
          destination: { lat: routePoints[routePoints.length - 1].lat, lng: routePoints[routePoints.length - 1].lng },
          waypoints: waypoints,
          travelMode: travelMode,
        },
        (result: any, status: any) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
          } else {
            // Si falla, dibujar una línea recta simple
            const polyline = new window.google.maps.Polyline({
              path: routePoints.map(p => ({ lat: p.lat, lng: p.lng })),
              geodesic: true,
              strokeColor: '#4f46e5',
              strokeOpacity: 0.8,
              strokeWeight: 3,
            });
            polyline.setMap(map);
          }
        }
      );
    }

    setIsLoaded(true);
  };

  return (
    <section className="space-y-6 pt-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Dónde estarás</h2>
        <span className="text-gray-500 font-medium">{locationName}</span>
      </div>
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden relative">
        {mapError ? (
          <div className="w-full h-full flex items-center justify-center text-red-500 p-4 text-center">
            <div>
              <p className="font-semibold mb-2">Error al cargar el mapa</p>
              <p className="text-sm">{mapError}</p>
            </div>
          </div>
        ) : (
          <div ref={mapRef} className="w-full h-full" />
        )}
        {!isLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <p className="text-gray-500">Cargando mapa...</p>
          </div>
        )}
      </div>
    </section>
  )
}
