"use client";

import Image from "next/image";
import Link from "next/link";
import { Compass, Globe, Menu, Tent, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

function CustomersNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get<UserData>("/auth/me");
        setUserData(response.data);
      } catch (error) {
        // Usuario no autenticado - no hacer nada
        console.log("Usuario no autenticado");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/sign-out");
      localStorage.removeItem("auth_token");
      router.push("/auth/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Aún así redirigir al login
      localStorage.removeItem("auth_token");
      router.push("/auth/login");
    }
  };

  return (
    <div className="sticky top-0 z-50 border-b border-gray-100 bg-[#fdfdfc]/90 backdrop-blur-md dark:border-gray-800 dark:bg-[#1a1a1a]/90">
      <div className="mx-auto flex w-full max-w-full  items-center justify-between px-6 py-4 md:px-20">
        <div className="font-caveat text-2xl font-bold flex items-center gap-2">
          <Tent className="h-5 w-5" />
          TravelHive
        </div>

        <div className="flex items-center gap-6">
          <Link
            className="hidden text-sm font-semibold transition-colors hover:text-primary md:block"
            href="/auth/register"
          >
            Hazte anfitrión
          </Link>
          <button className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
            <Globe className="h-5 w-5" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
            >
              <Menu className="ml-1 h-5 w-5" />
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                {userData?.user?.image ? (
                  <Image
                    src={userData.user.image}
                    alt={userData.user.name || "Avatar del usuario"}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-white text-xs font-bold">
                    {userData?.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
            </button>
            {isMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900"
                role="menu"
              >
                <Link
                  className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-[#121717] hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
                  href="/customers/profile"
                  role="menuitem"
                >
                  <User className="h-4 w-4" />
                  Perfil
                </Link>
                <Link
                  className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-[#121717] hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
                  href="/customers/trips"
                  role="menuitem"
                >
                  Mis viajes
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 font-medium text-[#121717] hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
                  type="button"
                  role="menuitem"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomersNav;
