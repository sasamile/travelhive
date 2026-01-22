"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";

// Usar la variable de entorno NEXT_PUBLIC_GOOGLE_API_KEY
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('⚠️ GOOGLE_MAPS_API_KEY no está configurada. Por favor, agrega NEXT_PUBLIC_GOOGLE_API_KEY en tu archivo .env.local');
}

// Cargar Google Maps dinámicamente
let GoogleMap: any;
let Marker: any;

if (typeof window !== 'undefined') {
  import("@react-google-maps/api").then((mod) => {
    GoogleMap = mod.GoogleMap;
    Marker = mod.Marker;
  });
}

// Tipos simplificados
type LatLngLiteral = { lat: number; lng: number };
type GoogleMapType = any;
type DirectionsServiceType = any;
type DirectionsRendererType = any;
type PolylineType = any;

// Extender window para incluir google
declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement | null, opts?: any) => GoogleMapType;
        Marker: new (opts?: any) => any;
        DirectionsService: new () => DirectionsServiceType;
        DirectionsRenderer: new (opts?: any) => DirectionsRendererType;
        Polyline: new (opts?: any) => PolylineType;
        LatLng: new (lat: number, lng: number) => any;
        LatLngBounds: new () => any;
        Geocoder: new () => any;
        TravelMode: { DRIVING: string };
        DirectionsStatus: { OK: string };
        GeocoderStatus: { OK: string };
        places: {
          AutocompleteService: new () => any;
          PlacesService: new (attrContainer: HTMLDivElement | GoogleMapType) => any;
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

const mapContainerStyle = {
  width: '100%',
  height: '320px'
};

const defaultCenter = {
  lat: 4.6097, // Bogotá
  lng: -74.0817
};

interface InteractiveMapComponentProps {
  routePoints: Array<{ id: string; name: string; lat: number; lng: number; order: number }>;
  onMapClick: (lat: number, lng: number) => void;
  onMapReady?: (map: GoogleMapType) => void;
}

function InteractiveMapComponent({
  routePoints,
  onMapClick,
  onMapReady,
}: InteractiveMapComponentProps) {
  const mapRef = useRef<GoogleMapType | null>(null);
  const directionsServiceRef = useRef<DirectionsServiceType | null>(null);
  const directionsRendererRef = useRef<DirectionsRendererType | null>(null);
  const onMapClickRef = useRef(onMapClick);
  const polylineRef = useRef<PolylineType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [billingError, setBillingError] = useState(false);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // Cargar Google Maps API
  useEffect(() => {
    if (typeof window === 'undefined' || !GOOGLE_MAPS_API_KEY) {
      setIsLoaded(false);
      return;
    }

    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      const checkGoogle = setInterval(() => {
        if (window.google?.maps) {
          setIsLoaded(true);
          clearInterval(checkGoogle);
        }
      }, 100);
      return () => clearInterval(checkGoogle);
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&language=es&region=CO`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google?.maps) {
        setIsLoaded(true);
      } else {
        setIsLoaded(false);
      }
    };
    
    script.onerror = () => {
      console.error('Error al cargar Google Maps API');
      setIsLoaded(false);
    };

    (window as any).gm_authFailure = () => {
      console.error('❌ Error de autenticación de Google Maps');
      setIsLoaded(false);
    };

    document.head.appendChild(script);
  }, []);

  const [center, setCenter] = useState<LatLngLiteral>(defaultCenter);
  const [zoom, setZoom] = useState(6);
  const [userLocation, setUserLocation] = useState<LatLngLiteral | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          if (routePoints.length === 0) {
            setCenter(location);
            setZoom(10);
          }
        },
        () => {},
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000
        }
      );
    }
  }, []);

  useEffect(() => {
    if (routePoints.length === 0) {
      if (userLocation) {
        setCenter(userLocation);
      } else {
        setCenter(defaultCenter);
      }
      setZoom(10);
      return;
    }

    if (typeof window !== 'undefined' && window.google?.maps) {
      const bounds = new window.google.maps.LatLngBounds();
      routePoints.forEach(point => {
        bounds.extend({ lat: point.lat, lng: point.lng });
      });

      const centerPoint = {
        lat: bounds.getCenter().lat(),
        lng: bounds.getCenter().lng()
      };
      setCenter(centerPoint);

      if (mapRef.current && mapRef.current.fitBounds) {
        mapRef.current.fitBounds(bounds);
      }
    }
  }, [routePoints, userLocation]);

  const onLoad = useCallback((map: GoogleMapType) => {
    if (typeof window === 'undefined' || !window.google?.maps) return;

    try {
      mapRef.current = map;
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#4f46e5',
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
      });
      onMapReady?.(map);

      if (map.addListener) {
        map.addListener('click', (e: any) => {
          if (e.latLng) {
            onMapClickRef.current(e.latLng.lat(), e.latLng.lng());
          }
        });
      }
    } catch (error: any) {
      console.error('Error al inicializar el mapa:', error);
    }
  }, [onMapReady]);

  const showFallbackPolyline = useCallback((points: Array<{ lat: number; lng: number }>) => {
    if (!mapRef.current || typeof window === 'undefined' || !window.google?.maps) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (directionsRendererRef.current) {
      try {
        directionsRendererRef.current.setMap(null);
      } catch (error) {
        // Ignorar errores
      }
    }

    const path = points.map(point => ({ lat: point.lat, lng: point.lng }));
    
    try {
      polylineRef.current = new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#4f46e5',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: mapRef.current
      });
    } catch (error) {
      console.warn('Error al crear polyline:', error);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || typeof window === 'undefined' || !window.google?.maps) {
      return;
    }

    const timer = setTimeout(() => {
      if (!mapRef.current) return;

      if (routePoints.length < 2) {
        if (polylineRef.current) {
          polylineRef.current.setMap(null);
          polylineRef.current = null;
        }
        if (directionsRendererRef.current) {
          try {
            directionsRendererRef.current.setMap(null);
          } catch (error) {
            // Ignorar errores
          }
        }
        return;
      }

      const sortedPoints = [...routePoints].sort((a, b) => a.order - b.order);
      const pathPoints = sortedPoints.map(p => ({ lat: p.lat, lng: p.lng }));
      
      if (!directionsServiceRef.current || !directionsRendererRef.current) {
        showFallbackPolyline(pathPoints);
        return;
      }

      const waypoints = sortedPoints.slice(1, -1).map(point => ({
        location: { lat: point.lat, lng: point.lng },
        stopover: true
      }));

      const request = {
        origin: { lat: sortedPoints[0].lat, lng: sortedPoints[0].lng },
        destination: { lat: sortedPoints[sortedPoints.length - 1].lat, lng: sortedPoints[sortedPoints.length - 1].lng },
        waypoints: waypoints.length > 0 ? waypoints : undefined,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      };

      try {
        directionsServiceRef.current.route(request, (result: any, status: string) => {
          if (status === window.google.maps.DirectionsStatus.OK && result && directionsRendererRef.current && mapRef.current) {
            try {
              if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
              }
              if (!directionsRendererRef.current.getMap()) {
                directionsRendererRef.current.setMap(mapRef.current);
              }
              directionsRendererRef.current.setDirections(result);
            } catch (error) {
              showFallbackPolyline(pathPoints);
            }
          } else {
            showFallbackPolyline(pathPoints);
          }
        });
      } catch (error) {
        showFallbackPolyline(pathPoints);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [routePoints, showFallbackPolyline, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const checkBillingError = () => {
      const errorDialogs = document.querySelectorAll('div[role="dialog"], .gm-style-mtc, [class*="error"]');
      errorDialogs.forEach(dialog => {
        const text = dialog.textContent || '';
        if (text.includes('facturación') || text.includes('billing') || text.includes('BillingNotEnabled')) {
          setBillingError(true);
        }
      });

      if (typeof window.google?.maps === 'undefined') {
        setTimeout(() => {
          if (!window.google?.maps) {
            setBillingError(true);
          }
        }, 2000);
      }
    };

    const timer = setTimeout(checkBillingError, 1500);
    const interval = setInterval(checkBillingError, 2000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isLoaded]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-lg border border-amber-200">
        <div className="text-center p-6 max-w-md">
          <div className="text-amber-600 font-semibold mb-2">⚠️ API Key no configurada</div>
          <div className="text-sm text-slate-600 mb-4">
            Por favor, agrega tu Google Maps API Key en el archivo <code className="bg-slate-200 px-1 rounded">.env.local</code>:
          </div>
          <div className="bg-slate-800 text-slate-100 p-3 rounded text-xs font-mono text-left">
            NEXT_PUBLIC_GOOGLE_API_KEY=tu_api_key_aqui
          </div>
        </div>
      </div>
    );
  }

  if (billingError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-amber-50 rounded-lg border-2 border-amber-300">
        <div className="text-center p-6 max-w-lg">
          <div className="text-amber-700 font-bold text-lg mb-3">⚠️ Facturación no habilitada</div>
          <div className="text-sm text-slate-700 mb-4">
            Google Maps requiere que habilites la facturación en Google Cloud Console.
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded || typeof window === 'undefined' || !window.google?.maps || !GoogleMap) {
    return (
      <div className="w-full h-full bg-slate-100 rounded-lg" />
    );
  }

  const SymbolPath = window.google.maps.SymbolPath;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ lightness: 10 }]
          },
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ saturation: 36 }, { color: "#333333" }, { lightness: 40 }]
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ visibility: "on" }, { color: "#ffffff" }, { lightness: 16 }]
          },
          {
            featureType: "all",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "administrative",
            elementType: "geometry.fill",
            stylers: [{ color: "#fefefe" }, { lightness: 20 }]
          },
          {
            featureType: "administrative",
            elementType: "geometry.stroke",
            stylers: [{ color: "#fefefe" }, { lightness: 17 }, { weight: 1.2 }]
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }, { lightness: 20 }]
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }, { lightness: 21 }]
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#dedede" }, { lightness: 21 }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry.fill",
            stylers: [{ color: "#ffffff" }, { lightness: 17 }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#ffffff" }, { lightness: 29 }, { weight: 0.2 }]
          },
          {
            featureType: "road.arterial",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }, { lightness: 18 }]
          },
          {
            featureType: "road.local",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }, { lightness: 16 }]
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#f2f2f2" }, { lightness: 19 }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#c9c9c9" }, { lightness: 17 }]
          }
        ]
      }}
    >
      {userLocation && Marker && (
        <Marker
          position={userLocation}
          icon={{
            path: SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#10b981',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          }}
          title="Tu ubicación"
        />
      )}

      {Marker && routePoints.map((point) => (
        <Marker
          key={point.id}
          position={{ lat: point.lat, lng: point.lng }}
          label={{
            text: String(point.order),
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
          icon={{
            path: SymbolPath.CIRCLE,
            scale: 20,
            fillColor: '#4f46e5',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          }}
          title={point.name}
        />
      ))}
    </GoogleMap>
  );
}

export const MemoizedInteractiveMapComponent = memo(InteractiveMapComponent, (prevProps, nextProps) => {
  if (prevProps.routePoints.length !== nextProps.routePoints.length) {
    return false;
  }

  const pointsChanged = prevProps.routePoints.some((prevPoint, index) => {
    const nextPoint = nextProps.routePoints[index];
    return !nextPoint ||
      prevPoint.id !== nextPoint.id ||
      prevPoint.lat !== nextPoint.lat ||
      prevPoint.lng !== nextPoint.lng;
  });

  return !pointsChanged;
});
