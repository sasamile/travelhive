"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CategoriesScroller from "@/components/customers/CategoriesScroller";
import CustomersFooter from "@/components/customers/CustomersFooter";
import CustomersNav from "@/components/customers/CustomersNav";
import InspirationGrid from "@/components/customers/InspirationGrid";
import SearchBar from "@/components/customers/SearchBar";
import { PublicTripCard } from "@/components/customers/PublicTripCard";
import { PublicTripsResponse } from "@/types/trips";
import { ChevronRight } from "lucide-react";
import api from "@/lib/axios";

interface UserData {
  user?: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    dniUser?: string;
    phoneUser?: string;
  };
  agencies?: Array<{
    idAgency: string;
    role: string;
    agency: {
      idAgency: string;
      nameAgency: string;
    };
  }>;
}

function CustomersPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<PublicTripsResponse | null>(null);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [experiences, setExperiences] = useState<PublicTripsResponse | null>(null);
  const [experiencesLoading, setExperiencesLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get<UserData>("/auth/me");
        setUserData(response.data);
      } catch (error) {
        // Usuario no autenticado o error - no hacer nada, la página es pública
        console.log("Usuario no autenticado o error al cargar sesión");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        // Obtener viajes publicados usando el nuevo endpoint /trips/all
        const response = await api.get<PublicTripsResponse>("/trips/all?limit=12");
        console.log("✅ Viajes cargados exitosamente:", response.data);
        setTrips(response.data);
      } catch (error: any) {
        console.error("❌ Error al cargar viajes:", error);
        console.error("URL intentada:", error.config?.url);
        console.error("Status:", error.response?.status);
      } finally {
        setTripsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        // Obtener experiencias publicadas usando el nuevo endpoint /experiences/all
        const response = await api.get<PublicTripsResponse>("/experiences/all?limit=12");
        console.log("✅ Experiencias cargadas exitosamente:", response.data);
        setExperiences(response.data);
      } catch (error: any) {
        console.error("❌ Error al cargar experiencias:", error);
        console.error("URL intentada:", error.config?.url);
        console.error("Status:", error.response?.status);
      } finally {
        setExperiencesLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  return (
    <div
      className={` bg-[#fdfdfc] text-[#4a4a4a] dark:bg-[#1a1a1a] dark:text-gray-200`}
    >
      <CustomersNav />
      <main className="mx-auto w-full max-w-[1280px] px-6 pb-20 pt-12 md:px-12">
        <div className="flex flex-col items-center">
          <SearchBar />
        </div>


        {/* Sección de viajes disponibles */}
        <div className="mb-10 mt-24">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#121717] dark:text-white md:text-4xl">
                Viajes disponibles
              </h2>
              <p className="mt-2 text-lg text-gray-500">
                Explora experiencias únicas de nuestras agencias
              </p>
            </div>
            <Link
              href="/customers/search"
              className="flex items-center gap-1 text-sm font-bold text-primary hover:underline"
            >
              Ver todos
              <ChevronRight className="text-sm" />
            </Link>
          </div>

          {tripsLoading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-4/3 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : trips && trips.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {trips.data.map((trip) => (
                <PublicTripCard key={trip.idTrip} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No hay viajes disponibles en este momento
              </p>
            </div>
          )}
        </div>

        {/* Sección de experiencias disponibles */}
        <div className="mb-10 mt-24">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#121717] dark:text-white md:text-4xl">
                Experiencias disponibles
              </h2>
              <p className="mt-2 text-lg text-gray-500">
                Descubre experiencias únicas creadas por anfitriones locales
              </p>
            </div>
            <Link
              href="/customers/search"
              className="flex items-center gap-1 text-sm font-bold text-primary hover:underline"
            >
              Ver todas
              <ChevronRight className="text-sm" />
            </Link>
          </div>

          {experiencesLoading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-4/3 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : experiences && experiences.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {experiences.data.map((experience) => (
                <PublicTripCard key={experience.idTrip} trip={experience} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No hay experiencias disponibles en este momento
              </p>
            </div>
          )}
        </div>

        <div className="mb-8 mt-24 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Categorías destacadas</h2>
          <button className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
            Ver todo
            <ChevronRight className="text-sm" />
          </button>
        </div>

        <CategoriesScroller />
      </main>

      <CustomersFooter />
    </div>
  );
}

export default CustomersPage;
