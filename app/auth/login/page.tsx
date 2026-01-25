"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import Login from "@/components/auth/Login";
import api from "@/lib/axios";
import toast from "react-hot-toast";

function LoginPage() {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Usar la URL completa del frontend para el callback
      // Detectar automáticamente la URL del frontend (puerto 3001)
      const frontendURL = typeof window !== "undefined" 
        ? `${window.location.protocol}//${window.location.host}` 
        : "http://localhost:3001";
      const callbackURL = `${frontendURL}/customers`;
      
      const response = await api.post("/api/auth/sign-in/social", {
        provider: "google",
        callbackURL,
      });

      // La respuesta contiene la URL de autorización de Google
      if (response.data?.url) {
        // Redirigir al usuario a Google OAuth
        // Better Auth manejará automáticamente:
        // - Si el usuario NO existe: lo crea (registro)
        // - Si el usuario YA existe: inicia sesión (login)
        // Luego redirige al callbackURL especificado
        window.location.href = response.data.url;
      } else {
        toast.error("Error al obtener la URL de autorización de Google");
        setGoogleLoading(false);
      }
    } catch (err: any) {
      const rawErrorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Error al iniciar sesión con Google";
      
      toast.error(rawErrorMessage);
      setGoogleLoading(false);
    }
  };

  return (
    <div>
      <AuthLayout 
        className="justify-center"
        onGoogleClick={handleGoogleSignIn}
        googleLoading={googleLoading}
      >
       <Login />
      </AuthLayout>
    </div>
  );
}

export default LoginPage;
