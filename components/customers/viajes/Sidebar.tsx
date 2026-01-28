"use client";

import {
  Compass,
  Heart,
  LogOut,
  MessageCircle,
  Plane,
  User,
} from "lucide-react";

type SidebarProps = {
  activeTab?: "upcoming" | "history" | "favorites";
  onTabChange?: (tab: "upcoming" | "history" | "favorites") => void;
};

export function Sidebar({ activeTab = "upcoming", onTabChange }: SidebarProps) {
  const handleMisViajesClick = () => {
    // Si estamos en favoritos, cambiar a próximos
    // Si estamos en history, mantener en history (o cambiar a upcoming según preferencia)
    if (activeTab === "favorites") {
      onTabChange?.("upcoming");
    } else if (activeTab === "history") {
      // Opcional: cambiar a upcoming, o mantener en history
      onTabChange?.("upcoming");
    }
  };

  const navItems = [
    { 
      label: "Mis Viajes", 
      icon: Compass, 
      isActive: activeTab === "upcoming" || activeTab === "history",
      onClick: handleMisViajesClick
    },
    { 
      label: "Mensajes", 
      icon: MessageCircle,
      isActive: false,
      onClick: () => {
        // TODO: Implementar navegación a mensajes
        console.log("Navegar a mensajes");
      }
    },
    { 
      label: "Favoritos", 
      icon: Heart,
      isActive: activeTab === "favorites",
      onClick: () => onTabChange?.("favorites")
    },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#222] fixed h-screen overflow-y-hidden flex flex-col  top-20">
      <div className="p-8">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
                  item.isActive
                    ? "active-nav-item text-primary bg-primary/10"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Icon className={`size-4 ${item.isActive ? "fill-primary" : ""}`} />
                <p className="text-sm font-medium">{item.label}</p>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
