"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "../ui/button";

// Función para traducir mensajes de error del inglés al español
function translateErrorMessage(message: string): string {
  const errorTranslations: Record<string, string> = {
    "Invalid email or password": "Email o contraseña incorrectos",
    "Invalid email or password.": "Email o contraseña incorrectos",
    "Invalid credentials": "Credenciales inválidas",
    "User not found": "Usuario no encontrado",
    "Email already exists": "El email ya está registrado",
    "Password is required": "La contraseña es requerida",
    "Email is required": "El email es requerido",
    "Invalid email format": "Formato de email inválido",
    "Network Error": "Error de conexión. Por favor, intenta nuevamente",
    "Request failed with status code 401": "Email o contraseña incorrectos",
    "Unauthorized": "No autorizado. Verifica tus credenciales",
  };

  // Buscar traducción exacta
  if (errorTranslations[message]) {
    return errorTranslations[message];
  }

  // Buscar traducción por coincidencia parcial (case insensitive)
  const lowerMessage = message.toLowerCase();
  for (const [key, value] of Object.entries(errorTranslations)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Si contiene "invalid email" o "invalid password"
  if (lowerMessage.includes("invalid email") || lowerMessage.includes("invalid password")) {
    return "Email o contraseña incorrectos";
  }

  // Devolver mensaje original si no hay traducción
  return message;
}

function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/api/auth/sign-in/email", {
        email,
        password,
      });

      console.log(response.data);  

      toast.success("¡Bienvenido! Has iniciado sesión correctamente");

      // Pequeño delay para asegurar que la cookie se establezca
      await new Promise(resolve => setTimeout(resolve, 100));

      // Usar la respuesta directa del login para determinar el rol
      const loginData = response.data || response;

      // Determinar el rol del usuario basado en la respuesta
      let redirectPath = "/";
      
      // Obtener información del usuario y agencias
      const user = loginData.user || loginData.data?.user;
      const agencies = loginData.agencies || loginData.data?.agencies || [];
      
      // Verificar si es super admin - tiene prioridad sobre todo
      if (user?.isSuperAdmin === true) {
        redirectPath = "/superadmin";
      } else {
        // Verificar si es jipper (keeper) - tiene rol "jipper" en alguna agencia
        const isJipper = agencies && Array.isArray(agencies) && agencies.some((agency: any) => agency.role === "jipper");
        
        if (isJipper) {
          // Si es jipper, redirigir a /keepers
          redirectPath = "/keepers";
        } else if (user?.isHost === true && (!agencies || !Array.isArray(agencies) || agencies.length === 0)) {
          // Si es anfitrión pero no tiene agencias, redirigir a /anfitrion
          redirectPath = "/anfitrion";
        } else if (agencies && Array.isArray(agencies) && agencies.length > 0) {
          // Si tiene agencias, es un agente/admin/anfitrión con agencia
          redirectPath = "/agent";
        } else {
          // Si no es anfitrión y no tiene agencias, es un customer/viajero
          redirectPath = "/customers";
        }
      }

      // Redirigir usando window.location para forzar recarga completa y evitar loops
      window.location.href = redirectPath;
    } catch (err: any) {
      const rawErrorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Error al iniciar sesión. Verifica tus credenciales.";
      
      const translatedMessage = translateErrorMessage(rawErrorMessage);
      toast.error(translatedMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FieldSet className="space-y-4">
        <FieldGroup className="space-y-2">
          <Field className="flex flex-col gap-1.5">
            <FieldLabel className="ml-1 text-sm font-bold text-[#121717] dark:text-gray-200">
              Correo Electrónico
            </FieldLabel>
            <FieldContent>
              <input
                className="h-12 w-full rounded-xl border border-gray-200 bg-transparent px-4 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:text-white"
                placeholder="hola@ejemplo.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FieldContent>
            <FieldError className="sr-only">
              Este campo es requerido.
            </FieldError>
          </Field>
          <Field className="flex flex-col gap-1.5">
            <div className="ml-1 flex items-center justify-between">
              <FieldLabel className="text-sm font-bold text-[#121717] dark:text-gray-200">
                Contraseña
              </FieldLabel>
              <a
                className="text-xs font-bold text-primary hover:underline"
                href="#"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <FieldContent className="relative">
              <input
                className="h-12 w-full rounded-xl border border-gray-200 bg-transparent px-4 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:text-white"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                type="button"
                aria-pressed={showPassword}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>
      <Button
        className="mt-8 h-12 w-full cursor-pointer rounded-xl bg-primary font-bold tracking-wide text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={loading}
      >
        {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
      </Button>
    </form>
  );
}

export default Login;
