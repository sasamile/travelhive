"use client";

import { ReactNode, RefObject } from "react";
import { Search, Bell } from "lucide-react";

export interface SearchExpedition {
  id: string;
  title: string;
  location: string;
  image: string;
  status: string;
  isActive?: boolean;
  dates?: string;
  duration?: string;
  occupancy?: {
    current: number;
    total: number;
    percentage: number;
  };
  revenue?: string;
  statusColor?: string;
}

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
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  searchInputRef?: RefObject<HTMLDivElement | null>;
  searchResults?: SearchExpedition[];
  showSearchResults?: boolean;
  isSearching?: boolean;
  onResultClick?: (expedition: SearchExpedition) => void;
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
  searchValue = "",
  onSearchChange,
  onSearch,
  searchInputRef,
  searchResults = [],
  showSearchResults = false,
  isSearching = false,
  onResultClick,
}: AgentHeaderProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(searchValue);
    }
    if (e.key === "Escape") {
      onSearchChange?.("");
    }
  };

  const searchInput = (
    <div ref={searchInputRef} className={`relative ${searchWidth}`}>
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400 z-10" />
      <input
        className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50/50 focus:ring-0 focus:border-zinc-300 transition-all"
        placeholder={searchPlaceholder || "Buscar..."}
        type="text"
        value={searchValue}
        onChange={(e) => onSearchChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (searchValue.trim() && searchResults.length > 0) {
            onSearchChange?.(searchValue);
          }
        }}
      />
      
      {/* Dropdown de resultados */}
      {showSearchResults && searchValue.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-sm text-zinc-500">
              Buscando...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((expedition: SearchExpedition) => (
                <button
                  key={expedition.id}
                  onClick={() => onResultClick?.(expedition)}
                  className="w-full px-4 py-3 hover:bg-zinc-50 transition-colors text-left flex items-center gap-3 group"
                >
                  <div
                    className="size-10 rounded-lg bg-zinc-100 bg-cover bg-center shrink-0 border border-zinc-200"
                    style={{ backgroundImage: `url('${expedition.image}')` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors truncate">
                      {expedition.title}
                    </div>
                    <div className="text-xs text-zinc-500 truncate">
                      {expedition.location}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-zinc-500">
              No se encontraron resultados
            </div>
          )}
        </div>
      )}
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
