"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import { useTripStore } from '@/store/tripStore';
import { Map as MapComponent, MapMarker, MapControls, MarkerContent, MapRoute, useMap } from '@/components/ui/map';
import type { RoutePoint } from '@/types/trips';

type RoutePointWithCoords = {
  lat: number;
  lng: number;
  name?: string;
  order?: number;
} | {
  latitude: number;
  longitude: number;
  name?: string;
  order?: number;
};

type MapSectionProps = {
  routePoints?: RoutePointWithCoords[];
  destinationRegion?: string | null;
};

function FitRouteBounds({
  coordinates,
}: {
  coordinates: [number, number][];
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!isLoaded || !map) return;
    if (coordinates.length < 2) return;

    // Build bounds from route coordinates
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    for (const [lng, lat] of coordinates) {
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    }

    if (!Number.isFinite(minLng) || !Number.isFinite(minLat)) return;

    try {
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          padding: 60,
          duration: 800,
          maxZoom: 14,
        }
      );
    } catch {
      // ignore
    }
  }, [coordinates, isLoaded, map]);

  return null;
}

export function MapSection({ routePoints: propRoutePoints, destinationRegion: propDestinationRegion }: MapSectionProps = {}) {
  const tripData = useTripStore((state) => state.tripData);
  // Usar props si están disponibles, sino usar el store
  const routePointsRaw = propRoutePoints || tripData.routePoints || [];
  const destinationRegion = propDestinationRegion || tripData.destinationRegion;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [routeColor, setRouteColor] = useState<string>("#16a34a");
  const [routeLineCoordinates, setRouteLineCoordinates] = useState<
    [number, number][]
  >([]);

  // Normalizar routePoints a un formato común
  const routePoints = useMemo(() => {
    const normalized = routePointsRaw
      .map((p: any) => {
        const lat = Number(p.lat ?? p.latitude);
        const lng = Number(p.lng ?? p.longitude);
        return {
          lat,
          lng,
          name: p.name,
          order: p.order,
        };
      })
      .filter((p) => {
        // Validar rangos reales de coordenadas
        if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return false;
        if (p.lat < -90 || p.lat > 90) return false;
        if (p.lng < -180 || p.lng > 180) return false;
        return true;
      })
      .sort((a, b) => {
        const ao = typeof a.order === "number" ? a.order : Number.POSITIVE_INFINITY;
        const bo = typeof b.order === "number" ? b.order : Number.POSITIVE_INFINITY;
        if (ao !== bo) return ao - bo;
        return 0;
      });

    return normalized;
  }, [routePointsRaw]);

  // Si no hay routePoints, no mostrar el mapa
  if (routePoints.length === 0) {
    return (
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Dónde estarás</h2>
          {destinationRegion ? (
            <span className="text-gray-500 font-medium">{destinationRegion}</span>
          ) : null}
        </div>
        <div className="w-full h-[240px] rounded-2xl overflow-hidden relative bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Esta experiencia aún no tiene puntos de ruta configurados.
          </p>
        </div>
      </section>
    );
  }

  // Calcular el centro del mapa basado en los routePoints
  const mapCenter = useMemo(() => {
    if (routePoints.length === 0) {
      return { lat: 4.6097, lng: -74.0817 }; // Bogotá por defecto
    }
    
    const avgLat = routePoints.reduce((sum, p) => sum + p.lat, 0) / routePoints.length;
    const avgLng = routePoints.reduce((sum, p) => sum + p.lng, 0) / routePoints.length;
    
    return { lat: avgLat, lng: avgLng };
  }, [routePoints]);

  // Calcular zoom basado en la dispersión de los puntos
  const mapZoom = useMemo(() => {
    if (routePoints.length === 0) return 10;
    if (routePoints.length === 1) return 12;
    
    // Calcular la distancia máxima entre puntos
    const lats = routePoints.map(p => p.lat);
    const lngs = routePoints.map(p => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    // Ajustar zoom según la dispersión
    if (maxDiff > 1) return 6;
    if (maxDiff > 0.5) return 7;
    if (maxDiff > 0.2) return 8;
    if (maxDiff > 0.1) return 9;
    if (maxDiff > 0.05) return 10;
    if (maxDiff > 0.02) return 11;
    return 12;
  }, [routePoints]);

  const locationName = destinationRegion || routePoints[0]?.name || "Ubicación del viaje";
  const routeCoordinates = routePoints.map((p) => [p.lng, p.lat] as [number, number]);

  // Obtener geometría de ruta (carretera) usando OSRM (fallback: línea simple)
  useEffect(() => {
    if (routeCoordinates.length < 2) {
      setRouteLineCoordinates(routeCoordinates);
      return;
    }

    const controller = new AbortController();
    const run = async () => {
      try {
        // Limitar cantidad de puntos para no romper el servicio
        const coords = routeCoordinates.slice(0, 25);
        const coordStr = coords.map(([lng, lat]) => `${lng},${lat}`).join(";");

        const base =
          process.env.NEXT_PUBLIC_ROUTING_BASE_URL ||
          "https://router.project-osrm.org";
        const url = `${base}/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Routing error: ${res.status}`);
        const data = await res.json();
        const geometry = data?.routes?.[0]?.geometry;
        const line = geometry?.coordinates as [number, number][] | undefined;
        if (Array.isArray(line) && line.length >= 2) {
          setRouteLineCoordinates(line);
        } else {
          setRouteLineCoordinates(routeCoordinates);
        }
      } catch (e) {
        // fallback silencioso
        setRouteLineCoordinates(routeCoordinates);
      }
    };

    run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(routeCoordinates)]);

  // Resolver color primary real (MapLibre no acepta `hsl(var(--primary))`)
  useEffect(() => {
    try {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim();

      if (!raw) return;

      // Normalizar cualquier color CSS moderno (lab/oklch/...) a rgb()/hex via canvas.
      // MapLibre NO acepta lab()/oklch().
      const looksLikeHslTriplet =
        !raw.includes("(") && raw.split(/\s+/).filter(Boolean).length >= 3;
      const cssColor = looksLikeHslTriplet ? `hsl(${raw})` : raw;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Canvas normaliza el color a un formato compatible (normalmente rgb() o #RRGGBB)
      ctx.fillStyle = "#16a34a";
      ctx.fillStyle = cssColor;
      const normalized = String(ctx.fillStyle);

      // Asegurar que no quede en formatos no soportados por MapLibre
      if (normalized.startsWith("lab(") || normalized.startsWith("oklch(")) {
        return;
      }

      if (normalized) setRouteColor(normalized);
    } catch {
      // ignore
    }
  }, []);

  return (
    <section className="space-y-6 pt-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Dónde estarás</h2>
        <span className="text-gray-500 font-medium">{locationName}</span>
      </div>
      <div ref={mapContainerRef} className="w-full h-[400px] rounded-2xl overflow-hidden relative">
        <MapComponent
          center={[mapCenter.lng, mapCenter.lat]}
          zoom={mapZoom}
          dragPan={true}
          scrollZoom={true}
          boxZoom={false}
          doubleClickZoom={true}
          keyboard={false}
          touchZoomRotate={true}
          minZoom={2}
          maxZoom={18}
          styles={{
            light: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
            dark: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
          }}
        >
          <MapControls showZoom={true} position="bottom-right" />

          {/* Ruta (línea) */}
          {routeCoordinates.length >= 2 && (
            <>
              <FitRouteBounds coordinates={routeLineCoordinates} />
              <MapRoute
                coordinates={routeLineCoordinates}
                color={routeColor}
                width={4}
                opacity={0.9}
              />
            </>
          )}
          
          {routePoints.map((point, index) => (
            <MapMarker
              key={`${point.lat}-${point.lng}-${index}`}
              longitude={point.lng}
              latitude={point.lat}
            >
              <MarkerContent>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm shadow-lg border-2 border-white">
                  {typeof point.order === "number" ? point.order : index + 1}
                </div>
              </MarkerContent>
            </MapMarker>
          ))}
        </MapComponent>
      </div>
    </section>
  );
}
