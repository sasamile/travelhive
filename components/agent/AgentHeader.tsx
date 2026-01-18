"use client";

import { ReactNode } from "react";
import { Search, Bell } from "lucide-react";

interface AgentHeaderProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  searchWidth?: string;
  actions?: ReactNode;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  showSearch?: boolean;
  showNotifications?: boolean;
  titleWithSearch?: boolean; // Título y búsqueda lado a lado
}

export function AgentHeader({
  title,
  subtitle,
  searchPlaceholder,
  searchWidth = "w-96",
  actions,
  leftContent,
  rightContent,
  showSearch = false,
  showNotifications = false,
  titleWithSearch = false,
}: AgentHeaderProps) {
  const searchInput = (
    <div className={`relative ${searchWidth}`}>
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
      <input
        className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50/50 focus:ring-0 focus:border-zinc-300 transition-all"
        placeholder={searchPlaceholder || "Buscar..."}
        type="text"
      />
    </div>
  );

  const defaultLeftContent = titleWithSearch && title ? (
    <div className="flex items-center gap-6">
      <h2 className="font-caveat text-4xl font-bold text-zinc-900">{title}</h2>
      {showSearch && searchInput}
    </div>
  ) : showSearch ? (
    searchInput
  ) : title ? (
    <div>
      {subtitle ? (
        <div className="flex flex-col">
          <h2 className="font-caveat text-4xl font-bold text-zinc-900">{title}</h2>
          <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
        </div>
      ) : (
        <h2 className="font-caveat text-4xl font-bold text-zinc-900">{title}</h2>
      )}
    </div>
  ) : null;

  const defaultRightContent = (
    <div className="flex items-center gap-4">
      {showNotifications && (
        <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors relative">
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-1.5 bg-primary rounded-full"></span>
        </button>
      )}
      {actions}
    </div>
  );

  return (
    <header className="h-20 border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 bg-white/80 backdrop-blur-sm z-40">
      {leftContent || defaultLeftContent}
      {rightContent || defaultRightContent}
    </header>
  );
}
