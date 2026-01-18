"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

function AuthLayout({
  children,
  role = "user",
  userRole = () => {},
}: {
  children: React.ReactNode;
  role?: "user" | "host";
  userRole?: React.Dispatch<React.SetStateAction<"user" | "host">>;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname?.includes("/login");

  return (
    <div className="flex-1 flex min-h-screen lg:h-screen lg:overflow-hidden ">
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden lg:sticky lg:top-0 lg:h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          data-alt="Serene mediterranean coast with turquoise water and cliffs"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA7VwJ_Ov8kH2ePqCbB5oEU92-nInJ47Fmr15DyLz_XkgQZRSuAl0_cAAMWVkNiaKo5V9CJBsqPwenDa2ZsfI4YQvzBu_vVgK4FbB8SA6BA6yYkkhY2aSb4STvKZoNZYKbQDuX3YstggcnpokKLbMvSdulG_sq0605Dp8bMLZfOAjgQcWiBqCwcC7yAZ8TzzM-uoNk_Kdnm29fR7BQ-LZf9BTiRVR-mFbxkemFIF9b5eTOuptebaTal7WyzJqSUkE2T1vUKm0EOC2dv')",
          }}
        />
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-12">
          <div className="max-w-md">
            <h1 className="text-white text-5xl font-caveat font-extrabold leading-tight mb-4">
              Descubre refugios extraordinarios.
            </h1>
            <p className="text-white/90 text-lg font-light leading-relaxed">
              Accede a una selección exclusiva de destinos diseñados para el
              viajero más exigente.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20  mt-8 overflow-y-auto custom-scrollbar lg:h-screen">
        <div className="w-full max-w-[480px] space-y-8">
          <div className="flex flex-col gap-2">
            <h2 className="font-caveat text-[#121717] dark:text-white text-4xl font-bold text-center leading-tight tracking-[-0.033em]">
              Bienvenido a TravelHive
            </h2>
            <p className="text-[#657f81] text-center dark:text-gray-400 text-base font-normal">
              Explora el mundo con nosotros. Por favor, ingresa tus datos.
            </p>
          </div>

          {!isLoginPage && (
            <div className="flex justify-center mb-4 w-full">
              <Tabs
                className="w-full"
                value={role}
                onValueChange={(value) => userRole(value as "user" | "host")}
              >
                <TabsList className=" max-w-full w-full">
                  <TabsTrigger className="flex-1" value="user">
                    Viajero
                  </TabsTrigger>
                  <TabsTrigger className="flex-1" value="host">
                    Anfitrión
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Google Auth Button, cambia endpoint y texto según página y rol */}
          <div className="flex flex-col gap-3">
            <Button
              className="flex items-center justify-center gap-3 w-full h-12 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[#121717] dark:text-white text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              asChild
            >
              <a
                href={
                  pathname?.includes("/register")
                    ? `/api/auth/google/register?role=${role}`
                    : `/api/auth/google/login?role=${role}`
                }
              >
                <Image src="/google.svg" alt="Google" width={20} height={20} />
                <span className="truncate">
                  {pathname?.includes("/register")
                    ? "Registrarse con Google"
                    : "Continuar con Google"}
                </span>
              </a>
            </Button>
          </div>

          <div className="relative flex  items-center">
            <div className="grow border-t border-gray-200 dark:border-gray-700" />
            <span className="shrink mx-4 text-[#657f81] text-xs font-medium uppercase tracking-widest">
              o usa tu correo
            </span>
            <div className="grow border-t border-gray-200 dark:border-gray-700" />
          </div>
          {children}
          <p className="text-center text-[#657f81] text-sm">
            ¿No tienes una cuenta?{" "}
            {pathname?.includes("/register") ? (
              <a
                className="text-primary font-bold hover:underline"
                href={`/auth/login`}
              >
                Inicia sesión
              </a>
            ) : (
              <a
                className="text-primary font-bold hover:underline"
                href={`/auth/register`}
              >
                Regístrate gratis
              </a>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
