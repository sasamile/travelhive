"use client";

import { useState, useEffect, useMemo } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface City {
  idCity: string;
  nameCity: string;
}

interface CitySelectorProps {
  value?: string;
  onChange: (idCity: string) => void;
}

export default function CitySelector({ value, onChange }: CitySelectorProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");

  // Cargar ciudades al montar
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const response = await api.get("/cities");
        if (response.data?.data && Array.isArray(response.data.data)) {
          setCities(response.data.data);
        } else if (Array.isArray(response.data)) {
          setCities(response.data);
        }
      } catch (error) {
        console.error("Error al cargar ciudades:", error);
        toast.error("Error al cargar las ciudades");
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // Filtrar ciudades según búsqueda
  const filteredCities = useMemo(() => {
    if (!citySearchQuery) return cities;
    const query = citySearchQuery.toLowerCase();
    return cities.filter(city => 
      city.nameCity.toLowerCase().includes(query)
    );
  }, [cities, citySearchQuery]);

  const selectedCity = cities.find(city => city.idCity === value);

  return (
    <div className="space-y-2 sm:space-y-3">
      <label className="text-xs sm:text-sm font-semibold text-slate-700 block">Ciudad *</label>
      <div className="relative w-full">
        <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen} modal={false}>
          <PopoverTrigger asChild>
            <button
              type="button"
              role="combobox"
              aria-expanded={cityPopoverOpen}
              onClick={(e) => {
                e.preventDefault();
                if (!loadingCities) {
                  setCityPopoverOpen(!cityPopoverOpen);
                }
              }}
              className="w-full h-11 sm:h-12 px-3 sm:px-4 border border-neutral-200 rounded-lg text-sm sm:text-base bg-white hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loadingCities}
            >
              <span className={cn("text-left flex-1", !selectedCity && "text-slate-400")}>
                {selectedCity ? selectedCity.nameCity : "Selecciona una ciudad..."}
              </span>
              {loadingCities ? (
                <div className="size-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
              ) : (
                <ChevronsUpDown className={cn(
                  "ml-2 h-4 w-4 shrink-0 transition-transform",
                  cityPopoverOpen ? "opacity-100 rotate-180" : "opacity-50"
                )} />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[calc(100vw-2rem)] sm:w-(--radix-popover-trigger-width) p-0 z-200 bg-white border border-slate-200 shadow-lg max-h-[60vh]" 
            align="start" 
            sideOffset={4}
            onOpenAutoFocus={(e) => {
              // Prevenir el auto-focus para que el input de búsqueda funcione
              e.preventDefault();
            }}
          >
            <div className="flex items-center border-b border-slate-200 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar ciudad..."
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                autoFocus
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {loadingCities ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  Cargando ciudades...
                </div>
              ) : filteredCities.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  {citySearchQuery ? "No se encontraron ciudades." : "No hay ciudades disponibles."}
                </div>
              ) : (
                <div className="p-1">
                  {filteredCities.map((city) => (
                    <button
                      key={city.idCity}
                      type="button"
                      onClick={() => {
                        onChange(city.idCity);
                        setCityPopoverOpen(false);
                        setCitySearchQuery("");
                      }}
                      className={cn(
                        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 transition-colors",
                        value === city.idCity && "bg-indigo-50 hover:bg-indigo-100"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          value === city.idCity ? "opacity-100 text-indigo-600" : "opacity-0"
                        )}
                      />
                      <span className={cn(value === city.idCity && "font-medium text-indigo-900")}>
                        {city.nameCity}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
