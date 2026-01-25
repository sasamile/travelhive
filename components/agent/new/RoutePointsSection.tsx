"use client";

import { useState, useCallback, useRef } from "react";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import { MemoizedInteractiveMapComponent } from "./InteractiveMapComponent";

interface RoutePoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

interface RoutePointsSectionProps {
  routePoints: RoutePoint[];
  onRoutePointsChange: (points: RoutePoint[]) => void;
  onLocationSelect: (location: { lat: number; lng: number; region?: string }) => void;
  onDestinationRegionChange: (region: string) => void;
  onCoordinatesChange: (lat: number, lng: number) => void;
}

export default function RoutePointsSection({
  routePoints,
  onRoutePointsChange,
  onLocationSelect,
  onDestinationRegionChange,
  onCoordinatesChange,
}: RoutePointsSectionProps) {
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; place_id?: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const mapInstanceRef = useRef<any>(null);
  const duplicateCheckRef = useRef<boolean>(false);
  const pointAddedRef = useRef<boolean>(false);
  const lastActionRef = useRef<'map' | 'search' | null>(null);
  const isProcessingClickRef = useRef<boolean>(false);

  const handleRemovePoint = (pointId: string) => {
    const filtered = routePoints.filter((p) => p.id !== pointId);
    const reordered = filtered.map((p, idx) => ({ ...p, order: idx + 1 }));
    onRoutePointsChange(reordered);
  };

  const handleEditPoint = (pointId: string, newName: string) => {
    const updated = routePoints.map((p) => (p.id === pointId ? { ...p, name: newName } : p));
    onRoutePointsChange(updated);
  };

  const handleLocationSelectInternal = useCallback((location: { lat: number; lng: number; region?: string }, isFromMap?: boolean) => {
    duplicateCheckRef.current = false;
    pointAddedRef.current = false;
    lastActionRef.current = isFromMap ? 'map' : 'search';

    const tolerance = 0.0001;
    const isDuplicate = routePoints.some((point) =>
      Math.abs(point.lat - location.lat) < tolerance &&
      Math.abs(point.lng - location.lng) < tolerance
    );

    if (isDuplicate) {
      duplicateCheckRef.current = true;
      return;
    }

    const newPoint: RoutePoint = {
      id: Date.now().toString(),
      name: location.region || `Destino ${routePoints.length + 1}`,
      lat: location.lat,
      lng: location.lng,
      order: routePoints.length + 1,
    };

    if (routePoints.length === 0) {
      onDestinationRegionChange(location.region || "");
      onCoordinatesChange(location.lat, location.lng);
    }

    pointAddedRef.current = true;
    onRoutePointsChange([...routePoints, newPoint]);
    onLocationSelect(location);

    if (!isFromMap) {
      setTimeout(() => {
        if (duplicateCheckRef.current) {
          toast.error("Este punto ya está en tu ruta");
        } else if (pointAddedRef.current) {
          toast.success("Punto agregado");
        }
      }, 0);
    }

    setShowSearchResults(false);
    setLocationInput("");
  }, [routePoints, onRoutePointsChange, onLocationSelect, onDestinationRegionChange, onCoordinatesChange]);

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    if (isProcessingClickRef.current) return;
    isProcessingClickRef.current = true;

    try {
      if (typeof window !== 'undefined' && window.google?.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat, lng } },
          (results: any, status: string) => {
            let locationName = `Punto nuevo`;
            if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
              locationName = results[0].formatted_address || results[0].address_components[0]?.long_name || `Punto nuevo`;
            } else {
              locationName = `Punto ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            }
            
            handleLocationSelectInternal({ lat, lng, region: locationName }, true);

            setTimeout(() => {
              if (duplicateCheckRef.current) {
                toast.error("Este punto ya está en tu ruta");
              } else if (pointAddedRef.current && lastActionRef.current === 'map') {
                toast.success("Punto agregado al mapa");
              }
              isProcessingClickRef.current = false;
            }, 10);
          }
        );
      } else {
        handleLocationSelectInternal({ lat, lng, region: `Punto nuevo` }, true);
        setTimeout(() => {
          if (duplicateCheckRef.current) {
            toast.error("Este punto ya está en tu ruta");
          } else if (pointAddedRef.current && lastActionRef.current === 'map') {
            toast.success("Punto agregado al mapa");
          }
          isProcessingClickRef.current = false;
        }, 10);
      }
    } catch (error) {
      handleLocationSelectInternal({ lat, lng, region: `Punto nuevo` }, true);
      setTimeout(() => {
        if (duplicateCheckRef.current) {
          toast.error("Este punto ya está en tu ruta");
        } else if (pointAddedRef.current && lastActionRef.current === 'map') {
          toast.success("Punto agregado al mapa");
        }
        isProcessingClickRef.current = false;
      }, 10);
    }
  }, [handleLocationSelectInternal]);

  const handleSearchLocation = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      if (typeof window === 'undefined' || !window.google?.maps?.places) {
        setSearchResults([]);
        setShowSearchResults(false);
        setIsSearching(false);
        return;
      }

      const service = new window.google.maps.places.AutocompleteService();
      const request = {
        input: query,
        componentRestrictions: { country: 'co' },
        types: ['geocode'],
      };

      service.getPlacePredictions(request, (predictions: any, status: string) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const results = predictions.slice(0, 8).map((prediction: any) => ({
            display_name: prediction.description,
            place_id: prediction.place_id,
          }));
          setSearchResults(results);
          setShowSearchResults(results.length > 0);
        } else {
          setSearchResults([]);
          setShowSearchResults(false);
        }
        setIsSearching(false);
      });
    } catch (error: any) {
      console.error("Error en búsqueda:", error);
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (result: { display_name: string; place_id?: string }) => {
    if (typeof window === 'undefined' || !window.google || !result.place_id) {
      toast.error("Error al obtener detalles del lugar");
      return;
    }

    try {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      service.getDetails({
        placeId: result.place_id,
        fields: ['geometry', 'formatted_address', 'address_components']
      }, (place: any, status: string) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const region = place.formatted_address || result.display_name;
          
          handleLocationSelectInternal({ lat, lng, region });

          if (mapInstanceRef.current && mapInstanceRef.current.setCenter) {
            mapInstanceRef.current.setCenter({ lat, lng });
            if (routePoints.length === 0 && mapInstanceRef.current.setZoom) {
              mapInstanceRef.current.setZoom(13);
            }
          }
        } else {
          toast.error("Error al obtener detalles del lugar");
        }
      });
    } catch (error) {
      console.error("Error al obtener detalles del lugar:", error);
      toast.error("Error al obtener detalles del lugar");
    }
  };

  const handleMapReady = useCallback((map: any) => {
    mapInstanceRef.current = map;
  }, []);

  return (
    <div className="space-y-2 sm:space-y-3">
      <label className="text-xs sm:text-sm font-semibold text-slate-700 block">Ruta del Viaje</label>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400">📍</span>
            <input
              className="w-full h-11 sm:h-12 pl-9 sm:pl-10 pr-3 sm:pr-4 border border-neutral-200 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all bg-white"
              placeholder="Buscar y agregar destino..."
              type="text"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
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
                {searchResults.map((result: any, idx: number) => (
                  <button
                    key={result.place_id || idx}
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

          {routePoints.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {routePoints.sort((a, b) => a.order - b.order).map((point) => (
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

        <div className="lg:col-span-3 h-64 sm:h-80 rounded-xl sm:rounded-2xl border border-neutral-200 overflow-hidden relative shadow-sm bg-slate-100" style={{ height: '320px' }}>
          <MemoizedInteractiveMapComponent
            routePoints={routePoints}
            onMapClick={handleMapClick}
            onMapReady={handleMapReady}
          />
        </div>
      </div>
    </div>
  );
}
