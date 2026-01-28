"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Shield, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me");
        if (response.data?.user) {
          setUserName(response.data.user.name || "Super Admin");
          // Verificar que sea super admin
          if (!response.data.user.isSuperAdmin) {
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
      router.push("/auth/login");
      toast.success("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/superadmin" },
    { icon: Building2, label: "Agencias", href: "/superadmin/agencies" },
    { icon: Users, label: "Hosts", href: "/superadmin/hosts" },
    { icon: Shield, label: "Super Admins", href: "/superadmin/admins" },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-zinc-200 transition-all duration-300 flex flex-col fixed h-screen z-50`}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-zinc-900">Super Admin</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <Icon className="size-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-zinc-200">
          {sidebarOpen && (
            <div className="mb-4 px-4 py-2">
              <p className="text-sm font-semibold text-zinc-900">{userName}</p>
              <p className="text-xs text-zinc-500">Super Administrador</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="size-5 shrink-0" />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {children}
      </div>
    </div>
  );
}
