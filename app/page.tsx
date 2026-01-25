"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

interface UserData {
  user?: {
    id: string;
    email: string;
    name?: string;
    emailVerified?: boolean;
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

function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Intentar obtener la sesión del usuario
        const response = await api.get<UserData>("/auth/me");
        
        if (response.data?.user) {
          // Usuario autenticado - redirigir según su rol
          const hasAgencies = response.data.agencies && response.data.agencies.length > 0;
          
          if (hasAgencies) {
            // Si tiene agencias, es un agente/anfitrión
            router.replace("/agent");
          } else {
            // Si no tiene agencias, es un viajero/customer
            router.replace("/customers");
          }
        } else {
          // Usuario no autenticado - mantener en la página principal
          setLoading(false);
        }
      } catch (error) {
        // Si hay error (usuario no autenticado o error de red), mantener en la página principal
        setLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // Mostrar contenido mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Contenido de la página principal (para usuarios no autenticados)
  return <div>page</div>;
}

export default HomePage;