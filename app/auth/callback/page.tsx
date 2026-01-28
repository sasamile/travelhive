"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";

interface UserData {
  user?: {
    id: string;
    name: string;
    email: string;
    isHost?: boolean;
    isSuperAdmin?: boolean;
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

export default function AuthCallbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Obtener información del usuario después del login
        const response = await api.get<UserData>("/auth/me");
        
        if (response.data?.user) {
          const user = response.data.user;
          const agencies = response.data.agencies || [];
          
          let redirectPath = "/";
          
          // Verificar si es super admin - tiene prioridad sobre todo
          if (user.isSuperAdmin === true) {
            redirectPath = "/superadmin";
          } else {
            // Verificar si es jipper (keeper) - tiene rol "jipper" en alguna agencia
            const isJipper = agencies.some((agency) => agency.role === "jipper");
            
            if (isJipper) {
              // Si es jipper, redirigir a /keepers
              redirectPath = "/keepers";
            } else if (user.isHost === true && agencies.length === 0) {
              // Si es anfitrión pero no tiene agencias, redirigir a /anfitrion
              redirectPath = "/anfitrion";
            } else if (agencies.length > 0) {
              // Si tiene agencias, es un agente/admin/anfitrión con agencia
              redirectPath = "/agent";
            } else {
              // Si no es anfitrión y no tiene agencias, es un customer/viajero
              redirectPath = "/customers";
            }
          }

          // Redirigir usando window.location para forzar recarga completa
          window.location.href = redirectPath;
        } else {
          setError("No se pudo obtener la información del usuario");
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error al verificar autenticación:", err);
        setError("Error al verificar la autenticación. Redirigiendo a login...");
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Loader2 className="size-8 animate-spin text-zinc-400 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50">
      <div className="text-center">
        <Loader2 className="size-12 animate-spin text-indigo-600 mx-auto mb-4" />
        <p className="text-zinc-600">Verificando autenticación...</p>
      </div>
    </div>
  );
}
