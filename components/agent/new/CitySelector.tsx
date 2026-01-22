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
    <div className="space-y-3">
      <label className="text-sm font-semibold text-slate-700 block">Ciudad *</label>
      <div className="relative w-full">
        <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              role="combobox"
              aria-expanded={cityPopoverOpen}
              className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-sm bg-white hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loadingCities}
            >
              <span className={cn("text-left", !selectedCity && "text-slate-400")}>
                {selectedCity ? selectedCity.nameCity : "Selecciona una ciudad..."}
              </span>
              {loadingCities ? (
                <div className="size-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start" sideOffset={4}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                type="text"
                placeholder="Buscar ciudad..."
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {filteredCities.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No se encontraron ciudades.
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
                        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100",
                        value === city.idCity && "bg-slate-100"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === city.idCity ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {city.nameCity}
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
