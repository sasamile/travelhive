"use client";

import { useEffect, useState } from "react";
import CategoriesScroller from "@/components/customers/CategoriesScroller";
import CustomersFooter from "@/components/customers/CustomersFooter";
import CustomersNav from "@/components/customers/CustomersNav";
import InspirationGrid from "@/components/customers/InspirationGrid";
import SearchBar from "@/components/customers/SearchBar";
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

  return (
    <div
      className={` bg-[#fdfdfc] text-[#4a4a4a] dark:bg-[#1a1a1a] dark:text-gray-200`}
    >

      <main className="mx-auto w-full max-w-[1280px] px-6 pb-20 pt-12 md:px-12">
        <div className="flex flex-col items-center">
          <SearchBar />
        </div>

        <div className="mb-10 mt-24 text-center md:text-left">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#121717] dark:text-white md:text-4xl">
            Inspiración para tu próximo viaje
          </h2>
          <p className="mt-2 text-lg text-gray-500">
            Descubre experiencias exclusivas diseñadas para ti
          </p>
        </div>

        <InspirationGrid />

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
