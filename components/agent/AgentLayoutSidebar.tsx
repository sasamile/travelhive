"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  Compass,
  CalendarDays,
  LineChart,
  Wallet,
  Receipt,
  MoreVertical,
  Tent,
  Shield,
  User,
  Settings,
  LogOut,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  {
    href: "/agent",
    label: "Overview",
    icon: LayoutGrid,
    section: "management",
  },
  {
    href: "/agent/expeditions",
    label: "Expeditions",
    icon: Compass,
    section: "management",
  },
  {
    href: "/agent/bookings",
    label: "Bookings",
    icon: CalendarDays,
    section: "management",
  },
  {
    href: "/agent/insights",
    label: "Insights",
    icon: LineChart,
    section: "management",
  },
  {
    href: "/agent/team",
    label: "Team Members",
    icon: Users,
    section: "management",
  },
  {
    href: "/agent/profile",
    label: "Agency Profile",
    icon: Shield,
    section: "management",
  },
  {
    href: "/agent/payment",
    label: "Payouts",
    icon: Wallet,
    section: "finance",
  },
  {
    href: "/agent/invoices",
    label: "Invoices",
    icon: Receipt,
    section: "finance",
  },
];

interface UserData {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    dniUser?: string;
    phoneUser?: string;
  };
  agencies: Array<{
    idAgency: string;
    role: string;
    agency: {
      idAgency: string;
      nameAgency: string;
      email: string;
      phone: string;
      nit: string;
      rntNumber: string;
      picture: string | null;
      status: string;
      approvalStatus: string;
      rejectionReason: string | null;
      reviewedBy: string;
      reviewedAt: string;
      createdAt: string;
      updatedAt: string;
    };
  }>;
}

export function AgentLayoutSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const managementItems = navigationItems.filter((item) => item.section === "management");
  const financeItems = navigationItems.filter((item) => item.section === "finance");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/auth/me");
        setUserData(response.data);
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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

  // Obtener información del usuario o agencia
  const displayName = userData?.agencies?.[0]?.agency?.nameAgency || userData?.user?.name || "Usuario";
  const displayImage = userData?.agencies?.[0]?.agency?.picture || userData?.user?.image || "";
  const displayEmail = userData?.agencies?.[0]?.agency?.email || userData?.user?.email || "";
  const userRole = userData?.agencies?.[0]?.role === "admin" ? "Administrador" : "Organizador";

  return (
    <aside className="w-fit border-r border-zinc-200 flex flex-col fixed h-full z-50 bg-white">
      <div className="px-6 h-20 flex items-center border-b border-zinc-200">
        <Link href="/agent">
          <div className="font-caveat text-2xl font-bold flex items-center gap-2">
            <Tent className="h-5 w-5" />
            TravelHive
          </div>
        </Link>
      </div>
      <div className="flex-1 px-3 py-6 space-y-8 overflow-y-auto custom-scrollbar">
        <div>
          <p className="px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
            Management
          </p>
          <nav className="space-y-1">
            {managementItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-zinc-100 text-zinc-900 font-medium"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  <Icon className="size-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div>
          <p className="px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
            Finance
          </p>
          <nav className="space-y-1">
            {financeItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-zinc-100 text-zinc-900 font-medium"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  <Icon className="size-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="p-4 border-t border-zinc-200">
        {loading ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="size-8 rounded-full bg-zinc-100 animate-pulse"></div>
            <div className="flex-1 min-w-0">
              <div className="h-3 w-24 bg-zinc-200 rounded animate-pulse mb-2"></div>
              <div className="h-2 w-32 bg-zinc-200 rounded animate-pulse"></div>
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-2 py-2 w-full rounded-lg hover:bg-zinc-50 transition-colors">
                <div
                  className="size-8 rounded-full bg-zinc-100 bg-cover bg-center shrink-0"
                  style={{
                    backgroundImage: displayImage
                      ? `url('${displayImage}')`
                      : undefined,
                  }}
                >
                  {!displayImage && (
                    <div className="w-full h-full rounded-full bg-zinc-200 flex items-center justify-center">
                      <User className="size-4 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold truncate">{displayName}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{userRole}</p>
                </div>
                <MoreVertical className="size-4 text-zinc-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  {displayEmail && (
                    <p className="text-xs text-zinc-500">{displayEmail}</p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/agent/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="size-4" />
                  <span>Mi Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/agent/profile" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="size-4" />
                  <span>Configuración</span>
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
        )}
      </div>
    </aside>
  );
}
