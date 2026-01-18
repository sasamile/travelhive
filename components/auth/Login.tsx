"use client";
import { useState } from "react";
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

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-4">
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
        className="mt-8 h-12 w-full rounded-xl bg-primary font-bold tracking-wide text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
        type="submit"
      >
        Iniciar Sesión
      </Button>
    </form>
  );
}

export default Login;
