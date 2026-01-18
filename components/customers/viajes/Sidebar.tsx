import {
  Compass,
  Heart,
  LogOut,
  MessageCircle,
  Plane,
  User,
} from "lucide-react";

const navItems = [
  { label: "Mis Viajes", icon: Compass, isActive: true },
  { label: "Mensajes", icon: MessageCircle },
  { label: "Favoritos", icon: Heart },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#222] fixed h-screen overflow-y-hidden flex flex-col  top-20">
      <div className="p-8">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.isActive
                    ? "active-nav-item text-primary"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="size-4" />
                <p className="text-sm font-medium">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
