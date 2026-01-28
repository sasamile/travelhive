"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Shield, 
  LogOut
} from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface UserData {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get<UserData>("/auth/me");
        if (response.data?.user) {
          setUserData(response.data);
          // Verificar que sea super admin
          if (!(response.data.user as any).isSuperAdmin) {
            toast.error("No tienes permisos de super administrador");
            router.push("/auth/login");
          }
        }
      } catch (error) {
        console.error("Error al verificar usuario:", error);
        router.push("/auth/login");
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/sign-out");
      localStorage.removeItem("auth_token");
      router.push("/auth/login");
      toast.success("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      localStorage.removeItem("auth_token");
      router.push("/auth/login");
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/superadmin" },
    { icon: Building2, label: "Agencias", href: "/superadmin/agencies" },
    { icon: Users, label: "Hosts", href: "/superadmin/hosts" },
    { icon: Shield, label: "Super Admins", href: "/superadmin/admins" },
  ];

  const userName = userData?.user?.name || "Super Admin";
  const userEmail = userData?.user?.email || "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-screen bg-[#fcfcfd] dark:bg-[#0a0a0b]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 flex flex-col z-50">
        {/* Header */}
        <div className="p-8 pb-4">
          <h1 className="text-3xl font-caveat font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
            TravelHive
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-1">
            Super Admin Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${
                  isActive
                    ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="size-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-3 px-2 py-2">
            {userData?.user?.image ? (
              <img
                src={userData.user.image}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {userInitials}
                </span>
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">
                {userName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {userEmail || "Super Administrador"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all font-medium border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
          >
            <LogOut className="size-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}
