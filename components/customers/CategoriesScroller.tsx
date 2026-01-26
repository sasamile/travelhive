"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import api from "@/lib/axios";
import { PublicTripsResponse } from "@/types/trips";

function CategoriesScroller() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Obtener viajes para extraer categorías únicas
        // Intentar primero con /trips (endpoint público)
        const response = await api.get<PublicTripsResponse>(
          "/trips?limit=100"
        );
        
        // Extraer categorías únicas de los viajes
        const uniqueCategories = Array.from(
          new Set(
            response.data.data
              .map((trip) => trip.category)
              .filter((cat) => cat && cat.trim() !== "")
          )
        ) as string[];

        setCategories(uniqueCategories.slice(0, 6)); // Limitar a 6 categorías
      } catch (error: any) {
        console.error("Error al cargar categorías:", error);
        // Si falla, intentar con /public/trips como alternativa
        if (error.response?.status === 404) {
          try {
            const altResponse = await api.get<PublicTripsResponse>(
              "/public/trips?limit=100"
            );
            
            const uniqueCategories = Array.from(
              new Set(
                altResponse.data.data
                  .map((trip) => trip.category)
                  .filter((cat) => cat && cat.trim() !== "")
              )
            ) as string[];

            setCategories(uniqueCategories.slice(0, 6));
          } catch (altError) {
            console.error("Error con endpoint alternativo:", altError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category: string) => {
    // Redirigir a búsqueda con filtro de categoría
    router.push(`/customers/search?categoria=${encodeURIComponent(category)}`);
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-20 w-20 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className="group flex min-w-[100px] flex-col items-center gap-2"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-transparent bg-white shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-all group-hover:border-primary dark:bg-gray-800">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
          <span className="text-xs font-bold text-center">{category}</span>
        </button>
      ))}
    </div>
  );
}

export default CategoriesScroller;
