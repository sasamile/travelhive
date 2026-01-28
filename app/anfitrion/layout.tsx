"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import {
  LayoutGrid,
  Compass,
  BarChart3,
  Wallet,
  Settings,
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Tent,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

interface UserData {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    phoneUser?: string;
    city?: string;
    department?: string;
  };
}

export default function AnfitrionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadUserData = async () => {
      try {
        const userResponse = await api.get<UserData>("/auth/me");
        if (userResponse?.data) {
          setUserData(userResponse.data);
        }
      } catch (error: any) {
        console.error("Error al cargar datos del usuario:", error);
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          router.push("/auth/login");
        }
      }
    };

    loadUserData();
  }, [router]);

  const userName = userData?.user?.name?.split(" ")?.[0] || "Usuario";
  const userImage = userData?.user?.image || null;
  const userEmail = userData?.user?.email || "";

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/sign-out");
      localStorage.removeItem("auth_token");
      toast.success("Sesión cerrada exitosamente");
      router.push("/auth/login");
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
      // Aún así redirigir al login
      localStorage.removeItem("auth_token");
      router.push("/auth/login");
    }
  };

  const navItems = [
    { href: "/anfitrion", label: "Panel", icon: LayoutGrid },
    { href: "/anfitrion/experiencias", label: "Experiencias", icon: Compass },
    { href: "/anfitrion/rendimiento", label: "Rendimiento", icon: BarChart3 },
    { href: "/anfitrion/pagos", label: "Pagos", icon: Wallet },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 flex flex-col justify-between py-8 bg-white">
        <div>
          <Link href="/anfitrion" className="flex items-center px-8 gap-2 mb-12 border-b border-zinc-200 pb-[19px]">
            <Tent className="size-5" />
            <h2 className="text-xl font-bold tracking-tight font-caveat">TravelHive</h2>
          </Link>
          <nav className="space-y-1 px-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-zinc-50 text-primary font-semibold"
                      : "text-zinc-500 hover:bg-zinc-50"
                  }`}
                >
                  <Icon className={`size-5 ${isActive ? "" : "text-zinc-400"}`} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-zinc-200 flex items-center justify-between px-10 bg-white/80 backdrop-blur-sm z-10">
          <div className="flex-1 max-w-lg">
            <div className="relative group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
              <input
                className="w-full pl-8 pr-4 py-2 bg-transparent border-none text-sm focus:ring-0 placeholder:text-zinc-400"
                placeholder="Buscar experiencias, reservas..."
                type="text"
              />
            </div>
          </div>
            <div className="flex items-center gap-6">
            <button className="relative text-zinc-500 p-2">
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 size-2 bg-indigo-600 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-zinc-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div
                      className="size-9 rounded-full bg-cover bg-center ring-2 ring-zinc-50 flex items-center justify-center"
                      style={{
                        backgroundImage: userImage ? `url(${userImage})` : undefined,
                        backgroundColor: userImage ? undefined : "rgb(99, 102, 241)",
                      }}
                    >
                      {!userImage && (
                        <span className="text-white text-xs font-bold">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="hidden xl:block text-left">
                      <p className="text-xs font-bold">{userName}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">Super Creador</p>
                    </div>
                    <ChevronDown className="size-4 text-zinc-400 hidden xl:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userData?.user?.name || userName}</p>
                      {userEmail && (
                        <p className="text-xs text-zinc-500">{userEmail}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/customers/profile"
                      className="flex items-center gap-2 cursor-pointer w-full"
                    >
                      <User className="size-4" />
                      <span>Editar Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="size-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}
