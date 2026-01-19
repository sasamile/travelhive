"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { Map, MapMarker, MapPopup } from "@/components/ui/map";
import type MapLibreGL from "maplibre-gl";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

// Componente de mapa interactivo con MapLibre
function InteractiveMapComponent({
  routePoints,
  onMapClick,
  onMapReady,
}: {
  routePoints: Array<{ id: string; name: string; lat: number; lng: number; order: number }>;
  onMapClick: (lat: number, lng: number) => void;
  onMapReady?: (mapInstance: MapLibreGL.Map) => void;
}) {
  const mapRef = useRef<MapLibreGL.Map | null>(null);
  const routeLayerRef = useRef<string | null>(null);
  const onMapClickRef = useRef(onMapClick); // Ref para mantener la versión más reciente de onMapClick
  const clickHandlerRef = useRef<((e: MapLibreGL.MapMouseEvent) => void) | null>(null);

  // Actualizar ref cuando onMapClick cambia
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  const [center, setCenter] = useState<[number, number]>([-74.0817, 4.6097]); // Bogotá por defecto [lng, lat]
  const [zoom, setZoom] = useState(6);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null); // [lng, lat] de la ubicación del usuario

  // Detectar ubicación del usuario al cargar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);
          // Si no hay puntos de ruta, centrar en la ubicación del usuario
          if (routePoints.length === 0) {
            setCenter([longitude, latitude]);
            setZoom(10);
          }
        },
        (error) => {
          console.log("No se pudo obtener la ubicación del usuario:", error);
          // Mantener Bogotá por defecto
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000 // 5 minutos
        }
      );
    }
  }, []);

  useEffect(() => {
    if (routePoints.length === 0) {
      // Si hay ubicación del usuario, usarla; si no, Bogotá
      if (userLocation) {
        setCenter(userLocation);
      } else {
        setCenter([-74.0817, 4.6097]); // Bogotá por defecto [lng, lat]
      }
      setZoom(10);
      return;
    }

    // Calcular centro basado en todos los puntos
    const lats = routePoints.map((p) => p.lat);
    const lngs = routePoints.map((p) => p.lng);
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

    setCenter([avgLng, avgLat]); // [lng, lat] para MapLibre

    // Ajustar zoom según el número de puntos y su dispersión
    if (routePoints.length === 1) {
      setZoom(13); // Zoom más cercano para un solo punto
    } else {
      const latRange = Math.max(...lats) - Math.min(...lats);
      const lngRange = Math.max(...lngs) - Math.min(...lngs);
      const maxRange = Math.max(latRange, lngRange);

      // Calcular zoom dinámicamente
      if (maxRange > 5) setZoom(5);
      else if (maxRange > 2) setZoom(6);
      else if (maxRange > 1) setZoom(7);
      else if (maxRange > 0.5) setZoom(8);
      else if (maxRange > 0.2) setZoom(9);
      else if (maxRange > 0.1) setZoom(10);
      else setZoom(12);
    }
  }, [routePoints, userLocation]);

  const handleMapLoad = useCallback((map: MapLibreGL.Map | null) => {
    if (!map) return; // Verificar que map no sea null

    // Remover listener anterior si existe
    if (mapRef.current && clickHandlerRef.current) {
      try {
        mapRef.current.off('click', clickHandlerRef.current);
      } catch (error) {
        // Ignorar errores si el mapa ya fue removido
      }
    }

    mapRef.current = map;
    onMapReady?.(map); // Notificar al padre que el mapa está listo

    // Agregar listener de click usando el ref para siempre tener la versión más reciente
    const handleClick = (e: MapLibreGL.MapMouseEvent) => {
      const { lat, lng } = e.lngLat;
      onMapClickRef.current(lat, lng); // Usar el ref en lugar de la prop directamente
    };

    // Guardar referencia al handler para poder removerlo después
    clickHandlerRef.current = handleClick;

    // Si el mapa ya está cargado, agregar el listener directamente
    if (map.loaded && map.loaded()) {
      map.on('click', handleClick);
    } else {
      // Si no está cargado, esperar al evento 'load'
      map.once('load', () => {
        if (map && clickHandlerRef.current) {
          map.on('click', clickHandlerRef.current);
        }
      });
    }
  }, [onMapReady]);

  // Limpiar listener cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (mapRef.current && clickHandlerRef.current) {
        try {
          mapRef.current.off('click', clickHandlerRef.current);
        } catch (error) {
          // Ignorar errores si el mapa ya fue removido
        }
      }
    };
  }, []);

  // Agregar/actualizar polyline de ruta usando routing por carretera (OSRM)
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Esperar a que el mapa esté completamente cargado antes de actualizar la ruta
    const updateRoute = () => {
      if (!mapRef.current) return;
      const currentMap = mapRef.current;

      if (routePoints.length < 2) {
        // Remover layer si existe cuando hay menos de 2 puntos
        if (routeLayerRef.current) {
          try {
            if (currentMap.getLayer(routeLayerRef.current)) {
              currentMap.removeLayer(routeLayerRef.current);
            }
            if (currentMap.getSource(routeLayerRef.current)) {
              currentMap.removeSource(routeLayerRef.current);
            }
          } catch (error) {
            // Ignorar errores si el layer ya fue removido
          }
          routeLayerRef.current = null;
        }
        return;
      }

      const sortedPoints = [...routePoints].sort((a, b) => a.order - b.order);
      const coordinates = sortedPoints.map((p) => [p.lng, p.lat] as [number, number]);

      const sourceId = "route-source";
      const layerId = "route-layer";

      // Función para agregar línea recta como fallback
      const addStraightLineRoute = () => {
        // Remover layer anterior si existe
        try {
          if (currentMap.getLayer(layerId)) {
            currentMap.removeLayer(layerId);
          }
          if (currentMap.getSource(sourceId)) {
            currentMap.removeSource(sourceId);
          }
        } catch (error) {
          // Ignorar errores
        }

        currentMap.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates,
            },
          },
        });

        currentMap.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#4f46e5",
            "line-width": 3,
            "line-opacity": 0.7,
          },
        });

        routeLayerRef.current = layerId;
      };

      // Obtener ruta por carretera usando OSRM
      const fetchRoute = async () => {
        try {
          // Formato para OSRM: lng,lat;lng,lat;lng,lat
          const coordsString = coordinates.map(([lng, lat]) => `${lng},${lat}`).join(';');
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`
          );

          if (!response.ok) {
            throw new Error('Error al obtener la ruta');
          }

          const data = await response.json();

          if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            // Si falla el routing, usar línea recta como fallback
            console.warn('No se pudo obtener ruta por carretera, usando línea recta');
            addStraightLineRoute();
            return;
          }

          const routeGeometry = data.routes[0].geometry;

          // Remover layer anterior si existe
          try {
            if (currentMap.getLayer(layerId)) {
              currentMap.removeLayer(layerId);
            }
            if (currentMap.getSource(sourceId)) {
              currentMap.removeSource(sourceId);
            }
          } catch (error) {
            // Ignorar errores
          }

          // Agregar fuente y layer de ruta con la geometría de la ruta por carretera
          currentMap.addSource(sourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: routeGeometry,
            },
          });

          currentMap.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#4f46e5",
              "line-width": 4,
              "line-opacity": 0.8,
            },
          });

          routeLayerRef.current = layerId;
        } catch (error) {
          console.error('Error al obtener ruta por carretera:', error);
          // Fallback a línea recta si falla el routing
          addStraightLineRoute();
        }
      };

      fetchRoute();
    };

    // Esperar a que el mapa esté completamente cargado
    if (!map.loaded() || !map.isStyleLoaded()) {
      const checkLoad = () => {
        if (mapRef.current && mapRef.current.loaded() && mapRef.current.isStyleLoaded()) {
          updateRoute();
        } else if (mapRef.current) {
          setTimeout(checkLoad, 100);
        }
      };
      checkLoad();
    } else {
      updateRoute();
    }

    return () => {
      // Cleanup: remover layer al desmontar
      if (routeLayerRef.current && mapRef.current) {
        try {
          const currentMap = mapRef.current;
          if (currentMap.getLayer(routeLayerRef.current)) {
            currentMap.removeLayer(routeLayerRef.current);
          }
          if (currentMap.getSource(routeLayerRef.current)) {
            currentMap.removeSource(routeLayerRef.current);
          }
        } catch (error) {
          // Ignorar errores de cleanup
        }
      }
    };
  }, [routePoints]); // Ejecutar cuando routePoints cambie

  // Usar un estilo simple de OpenStreetMap que funciona mejor
  const osmStyle = {
    version: 8,
    sources: {
      "osm": {
        type: "raster",
        tiles: [
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        ],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors"
      }
    },
    layers: [
      {
        id: "osm-tiles",
        type: "raster",
        source: "osm",
        minzoom: 0,
        maxzoom: 19
      }
    ],
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"
  };

  return (
    <div className="w-full h-full relative" style={{ width: '100%', height: '320px' }}>
      <Map
        ref={handleMapLoad}
        styles={{ light: osmStyle as any, dark: osmStyle as any }}
        theme="light"
        center={center}
        zoom={zoom}
      >
        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <MapMarker
            longitude={userLocation[0]}
            latitude={userLocation[1]}
          >
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-lg animate-pulse"></div>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-green-500 text-white text-[10px] px-2 py-0.5 rounded shadow-md">
                Tu ubicación
              </div>
            </div>
          </MapMarker>
        )}

        {routePoints.map((point) => (
          <MapMarker
            key={point.id}
            longitude={point.lng}
            latitude={point.lat}
          >
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                {point.order}
              </div>
            </div>
          </MapMarker>
        ))}
      </Map>
    </div>
  );
}

// Memoizar el componente del mapa para evitar re-renders innecesarios
const MemoizedInteractiveMapComponent = memo(InteractiveMapComponent, (prevProps, nextProps) => {
  // Solo re-renderizar si routePoints cambia en contenido (no solo referencia)
  if (prevProps.routePoints.length !== nextProps.routePoints.length) {
    return false; // Las props son diferentes, re-renderizar
  }

  // Comparar si los puntos cambiaron en contenido
  const pointsChanged = prevProps.routePoints.some((prevPoint, index) => {
    const nextPoint = nextProps.routePoints[index];
    return !nextPoint ||
      prevPoint.id !== nextPoint.id ||
      prevPoint.lat !== nextPoint.lat ||
      prevPoint.lng !== nextPoint.lng;
  });

  return !pointsChanged; // Retornar true si son iguales (no re-renderizar), false si son diferentes (re-renderizar)
});

interface BasicInfoStepProps {
  tripId?: string;
  onTripCreated?: (tripId: string) => void;
  initialData?: {
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

const STORAGE_KEY = "trip_draft_basic_info";

export default function BasicInfoStep({ tripId, onTripCreated, initialData }: BasicInfoStepProps) {

  // Cargar datos del localStorage al inicio
  const loadFromStorage = () => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Si hay initialData, tiene prioridad sobre localStorage
        if (initialData && initialData.title) {
          return null; // No usar localStorage si hay datos iniciales
        }
        return parsed;
      }
    } catch (error) {
      console.error("Error al cargar datos del localStorage:", error);
    }
    return null;
  };

  const storageData = loadFromStorage();

  // Función para convertir fechas string a DateRange
  const parseDateRange = (startDateStr?: string, endDateStr?: string): DateRange | undefined => {
    if (!startDateStr || !endDateStr) return undefined;
    const from = new Date(startDateStr);
    const to = new Date(endDateStr);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return undefined;
    return { from, to };
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    parseDateRange(storageData?.startDate, storageData?.endDate)
  );

  const [formData, setFormData] = useState({
    title: initialData?.title || storageData?.title || "",
    description: initialData?.description || storageData?.description || "",
    category: initialData?.category || storageData?.category || "Adventure",
    location: initialData?.location || storageData?.location || "",
    destinationRegion: initialData?.destinationRegion || storageData?.destinationRegion || "",
    latitude: initialData?.latitude || storageData?.latitude,
    longitude: initialData?.longitude || storageData?.longitude,
    durationDays: initialData?.durationDays || storageData?.durationDays || undefined,
    durationNights: initialData?.durationNights || storageData?.durationNights || undefined,
    price: initialData?.price || storageData?.price || undefined,
    currency: initialData?.currency || storageData?.currency || "COP",
    maxPersons: initialData?.maxPersons || storageData?.maxPersons || undefined,
    priceType: initialData?.priceType || storageData?.priceType || "adults",
  });

  const [mounted, setMounted] = useState(false);
  const [mapZoom, setMapZoom] = useState(10);

  // Marcar componente como montado para evitar errores de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const mapInstanceRef = useRef<MapLibreGL.Map | null>(null);
  const duplicateCheckRef = useRef<boolean>(false);
  const pointAddedRef = useRef<boolean>(false);
  const lastActionRef = useRef<'map' | 'search' | null>(null);

  // Inicializar routePoints vacío para evitar problemas de hidratación
  const [routePoints, setRoutePoints] = useState<Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    order: number;
  }>>([]);

  // Cargar puntos de ruta desde localStorage SOLO en el cliente después del mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    let loadedPoints: Array<{ id: string; name: string; lat: number; lng: number; order: number }> = [];

    // Si hay initialData, usarlo primero
    if (initialData?.latitude && initialData?.longitude) {
      loadedPoints = [{
        id: "1",
        name: initialData.destinationRegion || initialData.location || "Destino 1",
        lat: initialData.latitude,
        lng: initialData.longitude,
        order: 1
      }];
    } else {
      // Intentar cargar del localStorage
      try {
        const stored = localStorage.getItem(`${STORAGE_KEY}_routePoints`);
        if (stored) {
          const parsed = JSON.parse(stored);
          loadedPoints = Array.isArray(parsed) ? parsed : [];
        }
      } catch (error) {
        console.error("Error al cargar puntos de ruta del localStorage:", error);
      }
    }

    // Solo actualizar si hay puntos para cargar
    if (loadedPoints.length > 0) {
      setRoutePoints(loadedPoints);
    }
  }, []); // Solo ejecutar una vez al montar

  // Guardar en localStorage automáticamente cuando cambien los datos
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Guardar formData
    try {
      const dataToSave = {
        ...formData,
        startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
        endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
    }
  }, [formData, dateRange]);

  // Guardar puntos de ruta en localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(`${STORAGE_KEY}_routePoints`, JSON.stringify(routePoints));
    } catch (error) {
      console.error("Error al guardar puntos de ruta en localStorage:", error);
    }
  }, [routePoints]);


  const handleInputChange = (name: string, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Función para calcular días y noches desde DateRange
  const calculateDurationFromRange = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) {
      return { durationDays: undefined, durationNights: undefined };
    }
    // Normalizar las fechas a medianoche para comparación precisa
    const from = new Date(range.from);
    from.setHours(0, 0, 0, 0);
    const to = new Date(range.to);
    to.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 porque incluye ambos días (inicio y fin)
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

  const handleLocationSelect = useCallback((location: { lat: number; lng: number; region?: string }, isFromMap?: boolean) => {
    // Resetear los flags
    duplicateCheckRef.current = false;
    pointAddedRef.current = false;
    lastActionRef.current = isFromMap ? 'map' : 'search';

    // Usar el setter function para acceder al estado actual sin depender de routePoints
    setRoutePoints((prev) => {
      // Verificar si el punto ya existe (evitar duplicados)
      const tolerance = 0.0001; // Aproximadamente 11 metros
      const isDuplicate = prev.some((point) =>
        Math.abs(point.lat - location.lat) < tolerance &&
        Math.abs(point.lng - location.lng) < tolerance
      );

      if (isDuplicate) {
        // Guardar el flag en el ref para usar después del render
        duplicateCheckRef.current = true;
        return prev; // Retornar el estado anterior sin cambios
      }

      const newPoint = {
        id: Date.now().toString(),
        name: location.region || `Destino ${prev.length + 1}`,
        lat: location.lat,
        lng: location.lng,
        order: prev.length + 1,
      };

      // Actualizar el primer punto como destino principal para compatibilidad
      if (prev.length === 0) {
        setFormData((formPrev) => ({
          ...formPrev,
          latitude: location.lat,
          longitude: location.lng,
          destinationRegion: location.region || formPrev.destinationRegion,
        }));
      }

      // Marcar que el punto se agregó exitosamente
      pointAddedRef.current = true;
      return [...prev, newPoint];
    });

    // Mostrar los toasts FUERA del callback de setState usando setTimeout para evitar setState durante render
    // Solo manejar toast para búsqueda aquí, el mapa maneja su propio mensaje
    if (!isFromMap) {
      setTimeout(() => {
        if (duplicateCheckRef.current) {
          toast.error("Este punto ya está en tu ruta");
        } else if (pointAddedRef.current) {
          toast.success("Punto agregado");
        }
      }, 0);
    }

    if (!isFromMap) {
      setMapZoom(12);
    }
    setShowSearchResults(false);
  }, []);

  const handleRemovePoint = (pointId: string) => {
    setRoutePoints((prev) => {
      const filtered = prev.filter((p) => p.id !== pointId);
      // Reordenar
      return filtered.map((p, idx) => ({ ...p, order: idx + 1 }));
    });
  };

  const handleEditPoint = (pointId: string, newName: string) => {
    setRoutePoints((prev) =>
      prev.map((p) => (p.id === pointId ? { ...p, name: newName } : p))
    );
  };

  // Flag para prevenir múltiples ejecuciones simultáneas
  const isProcessingClickRef = useRef<boolean>(false);

  // Función para obtener coordenadas desde click en el mapa usando reverse geocoding
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    // Prevenir múltiples ejecuciones simultáneas
    if (isProcessingClickRef.current) {
      return;
    }

    isProcessingClickRef.current = true;

    try {
      // Usar reverse geocoding para obtener el nombre del lugar
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=es&zoom=18`
      );
      const data = await response.json();
      const locationName = data.display_name || data.address?.city || data.address?.town || `Punto nuevo`;

      handleLocationSelect({ lat, lng, region: locationName }, true);

      // Mostrar toast DESPUÉS de que handleLocationSelect haya procesado (verificado con refs)
      // Usar un único setTimeout para asegurar que solo se ejecute una vez
      setTimeout(() => {
        if (duplicateCheckRef.current) {
          toast.error("Este punto ya está en tu ruta");
        } else if (pointAddedRef.current && lastActionRef.current === 'map') {
          toast.success("Punto agregado al mapa");
        }
        isProcessingClickRef.current = false;
      }, 10);
    } catch (error) {
      // Si falla el reverse geocoding, agregar el punto de todas formas
      handleLocationSelect({ lat, lng, region: `Punto nuevo` }, true);

      // Mostrar toast DESPUÉS de que handleLocationSelect haya procesado
      setTimeout(() => {
        if (duplicateCheckRef.current) {
          toast.error("Este punto ya está en tu ruta");
        } else if (pointAddedRef.current && lastActionRef.current === 'map') {
          toast.success("Punto agregado (sin nombre de ubicación)");
        }
        isProcessingClickRef.current = false;
      }, 10);
    }
  }, [handleLocationSelect]);

  // Búsqueda de ubicación usando Nominatim (OpenStreetMap) limitada a Colombia con mejor priorización
  const handleSearchLocation = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Usar debounce más corto para mejor respuesta
      await new Promise(resolve => setTimeout(resolve, 200));

      // Limitar búsqueda a Colombia con viewbox y bounded para priorizar resultados dentro del área
      // viewbox format: min_lon,min_lat,max_lon,max_lat
      // Colombia: aproximadamente -79.5,-4.3,-66.8,12.5
      const colombiaViewbox = "-79.5,-4.3,-66.8,12.5";

      // Agregar "Colombia" al query si no lo tiene para mejorar resultados
      const enhancedQuery = query.toLowerCase().includes('colombia')
        ? query
        : `${query} Colombia`;

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enhancedQuery)}&limit=10&accept-language=es&addressdetails=1&countrycodes=co&viewbox=${colombiaViewbox}&bounded=1&dedupe=1&extratags=1`;

      // Crear un AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TravelHive/1.0 (https://travelhive.com)',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // No mostrar error al usuario para errores HTTP, solo silenciosamente no mostrar resultados
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      // Filtrar y priorizar resultados con mejor relevancia
      const filteredResults = data
        .filter((result: any) => {
          // Asegurar que el resultado está realmente en Colombia
          const address = result.address || {};
          return address.country === 'Colombia' || address.country_code === 'co';
        })
        .sort((a: any, b: any) => {
          // Priorizar por importancia (mayor importancia primero)
          const importanceA = a.importance || 0;
          const importanceB = b.importance || 0;

          // También priorizar ciudades/municipios sobre calles
          const typeA = a.type || '';
          const typeB = b.type || '';
          const cityTypes = ['city', 'town', 'village', 'municipality'];
          const isACity = cityTypes.some(t => typeA.includes(t));
          const isBCity = cityTypes.some(t => typeB.includes(t));

          if (isACity && !isBCity) return -1;
          if (!isACity && isBCity) return 1;

          return importanceB - importanceA;
        })
        .slice(0, 8); // Limitar a 8 resultados

      setSearchResults(filteredResults);
      setShowSearchResults(filteredResults.length > 0);
    } catch (error: any) {
      // Manejar diferentes tipos de errores
      if (error.name === 'AbortError') {
        console.error("Búsqueda cancelada por timeout");
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        console.error("Error de red al buscar ubicación. Verifica tu conexión a internet.");
        // Opcional: mostrar un mensaje más amigable al usuario
        // toast.error("No se pudo conectar con el servicio de búsqueda. Verifica tu conexión.");
      } else {
        console.error("Error en búsqueda:", error);
      }
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    handleLocationSelect({ lat, lng, region: result.display_name });
    // Limpiar el campo de búsqueda
    handleInputChange("location", "");

    // Centrar el mapa en la ubicación seleccionada
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [lng, lat],
        zoom: routePoints.length === 0 ? 13 : mapInstanceRef.current.getZoom(),
        duration: 1000
      });
    }
  };

  const handleMapReady = useCallback((map: MapLibreGL.Map) => {
    mapInstanceRef.current = map;
  }, []);



  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
      <div className="px-8 py-6 border-b border-neutral-100 bg-white/90 backdrop-blur sticky top-0 z-20">
        <h2 className="text-3xl font-caveat font-bold tracking-tight text-slate-900">Información Básica</h2>
        <p className="text-sm text-slate-500 mt-1">
          Comencemos con los detalles principales de tu expedición. Esta información se mostrará como encabezado principal de la página de tu viaje.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-12   w-full">
        <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); }}>
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

        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 block">Fechas del Viaje</label>
          {mounted && (
            <>
              <div className="w-full">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from || new Date()}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="w-full rounded-lg border shadow-sm"
                />
              </div>
              {((formData.durationDays !== undefined && formData.durationDays > 0) || (formData.durationNights !== undefined && formData.durationNights >= 0)) && (
                <div className="text-xs text-slate-500 mt-3 text-center">
                  Duración: {formData.durationDays || 0} {formData.durationDays === 1 ? "día" : "días"}, {formData.durationNights || 0} {formData.durationNights === 1 ? "noche" : "noches"}
                </div>
              )}
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">Precio</label>
            <div className="relative">
              <input
                className="w-full h-11 px-4 pr-20 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={formData.price === undefined ? "" : formData.price}
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange("price", value === "" ? undefined : parseFloat(value) || undefined);
                }}
              />
              <select
                className="absolute right-3 top-2.5 h-6 px-2 border border-transparent bg-transparent text-sm text-slate-500 focus:outline-none"
                value={formData.currency || "COP"}
                onChange={(e) => handleInputChange("currency", e.target.value)}
              >
                <option value="COP">COP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">Cantidad de Personas</label>
            <input
              className="w-full h-11 px-4 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              type="number"
              min="1"
              placeholder="0"
              value={formData.maxPersons === undefined ? "" : formData.maxPersons}
              onChange={(e) => {
                const value = e.target.value;
                handleInputChange("maxPersons", value === "" ? undefined : parseInt(value) || undefined);
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">Tipo de Precio</label>
            <div className="relative">
              <select
                className="w-full h-11 px-4 border border-neutral-200 rounded-xl text-sm appearance-none bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                value={formData.priceType || "adults"}
                onChange={(e) => handleInputChange("priceType", e.target.value as "adults" | "children" | "both")}
              >
                <option value="adults">Solo Adultos</option>
                <option value="both">Adultos y Niños</option>
              </select>
              <span className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">⌄</span>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">Categoría</label>
            <div className="relative">
              <select
                className="w-full h-11 px-4 border border-neutral-200 rounded-xl text-sm appearance-none bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
              >
                <option value="Adventure">Aventura</option>
                <option value="Luxury">Lujo</option>
                <option value="Cultural">Cultural</option>
                <option value="Wellness">Bienestar</option>
                <option value="Wildlife">Vida Silvestre</option>
              </select>
              <span className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">⌄</span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 block">Ruta del Viaje</label>
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-2 space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">📍</span>
                <input
                  className="w-full h-11 pl-10 pr-4 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Buscar y agregar destino..."
                  type="text"
                  value={formData.location}
                  onChange={(e) => {
                    handleInputChange("location", e.target.value);
                    handleSearchLocation(e.target.value);
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowSearchResults(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSearchResults(false), 200);
                  }}
                />
                {isSearching && (
                  <div className="absolute right-3 top-2.5">
                    <div className="size-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors text-sm"
                        onClick={() => handleSelectSearchResult(result)}
                      >
                        <p className="font-medium text-slate-900">{result.display_name}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Lista de puntos de la ruta */}
              {routePoints.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {routePoints.sort((a, b) => a.order - b.order).map((point, idx) => (
                    <div
                      key={point.id}
                      className="p-3 bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                          {point.order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={point.name}
                            onChange={(e) => handleEditPoint(point.id, e.target.value)}
                            className="w-full text-sm font-medium text-slate-900 bg-transparent border-none p-0 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"
                            placeholder="Nombre del destino"
                          />
                          <p className="text-xs text-slate-500 mt-1 font-mono">
                            {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePoint(point.id)}
                          className="shrink-0 p-1 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Eliminar punto"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {routePoints.length === 0 && (
                <div className="p-4 bg-neutral-50 border border-dashed border-neutral-200 rounded-xl text-center">
                  <p className="text-sm text-slate-500">
                    Busca destinos o haz clic en el mapa para agregar puntos a tu ruta
                  </p>
                </div>
              )}
            </div>

            <div className="col-span-3 h-80 rounded-2xl border border-neutral-200 overflow-hidden relative shadow-sm bg-slate-100" style={{ height: '320px' }}>
              {/* Mapa interactivo con MapLibre */}
              <MemoizedInteractiveMapComponent
                routePoints={routePoints}
                onMapClick={handleMapClick}
                onMapReady={handleMapReady}
              />
            </div>
          </div>
        </div>
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
