"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Plus,
  MoreVertical,
  ArrowRight,
  Sparkles,
  Megaphone,
  Copy,
  Edit,
  Archive,
  FileText,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Expedition {
  id: string;
  title: string;
  location: string;
  image: string;
  dates: string;
  duration: string;
  occupancy: {
    current: number;
    total: number;
    percentage: number;
  };
  revenue: string;
  status: string;
  statusColor: string;
  isActive?: boolean;
}

interface ExpeditionsResponse {
  data: Expedition[];
  total: number;
  page: number;
  limit: number;
  counts: {
    active: number;
    drafts: number;
    completed: number;
    archived: number;
    inactive?: number;
  };
}

const actionCards = [
  {
    icon: Sparkles,
    title: "Optimizar Precios",
    description: "Ajusta las tarifas según las tendencias de demanda actuales para Q1 2024.",
    action: "Ejecutar Análisis",
  },
  {
    icon: Megaphone,
    title: "Llenar Cupos Restantes",
    description: "3 expediciones tienen 1 cupo disponible. Enviar notificación a lista de espera.",
    action: "Ver Listas de Espera",
  },
  {
    icon: Copy,
    title: "Duplicar Éxito Anterior",
    description: "Crea una nueva versión del exitoso 'Aegean Voyage'.",
    action: "Duplicar Viaje",
  },
];

export default function ExpeditionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    active: 0,
    drafts: 0,
    completed: 0,
    archived: 0,
    inactive: 0,
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [searchResults, setSearchResults] = useState<Expedition[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>(null);

  // Mapear tab a status del backend (el backend espera los valores del tab directamente)
  // Nota: Para "inactive" no hay parámetro de status, se cargan todas y se filtran en frontend
  const getStatusFromTab = (tab: string): string | undefined => {
    switch (tab) {
      case "active":
        return "active";
      case "drafts":
        return "drafts";
      case "completed":
        return "completed";
      case "archived":
        return "archived";
      case "inactive":
        // No hay parámetro de status para inactive, se filtrará en frontend
        return undefined;
      default:
        return undefined;
    }
  };

  // Cargar expediciones desde el backend
  useEffect(() => {
    const fetchExpeditions = async () => {
      const status = getStatusFromTab(activeTab);
      const params: any = {
        page,
        limit,
      };
      
      // Agregar parámetro de status solo si no es "inactive"
      // Para "inactive" cargamos todas las trips y filtramos en frontend
      if (status) {
        params.status = status;
      }
      
      // Agregar parámetro de búsqueda si hay un término de búsqueda (usar debounced)
      if (debouncedSearchQuery.trim()) {
        params.search = debouncedSearchQuery.trim();
      }

      try {
        setLoading(true);

        const response = await api.get<ExpeditionsResponse>("/agencies/trips", { params });
        
        if (response.data) {
          let trips = response.data.data || [];
          let totalCount = response.data.total || 0;
          
          // Si es el tab "inactive", filtrar trips desactivados en el frontend
          if (activeTab === "inactive") {
            trips = trips.filter(
              (trip) => trip.isActive === false || trip.status === "DESACTIVADO" || trip.status === "INACTIVO" || trip.status === "INACTIVE"
            );
            totalCount = trips.length;
          }
          
          setExpeditions(trips);
          setTotal(totalCount);
          
          if (response.data.counts) {
            setCounts({
              active: response.data.counts.active || 0,
              drafts: response.data.counts.drafts || 0,
              completed: response.data.counts.completed || 0,
              archived: response.data.counts.archived || 0,
              inactive: activeTab === "inactive" ? totalCount : (response.data.counts.inactive || 0),
            });
          }
        }
      } catch (error: any) {
        console.error("Error al cargar expediciones:", error);
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);
          console.error("Request params:", params);
        }
        toast.error(error.response?.data?.message || "Error al cargar las expediciones");
        setExpeditions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExpeditions();
  }, [activeTab, page, debouncedSearchQuery]);

  // Búsqueda en tiempo real para mostrar resultados en el dropdown
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      try {
        setIsSearching(true);
        const params: any = {
          page: 1,
          limit: 10,
          search: searchQuery.trim(),
        };

        const response = await api.get<ExpeditionsResponse>("/agencies/trips", { params });
        
        if (response.data && response.data.data) {
          setSearchResults(response.data.data);
          setShowSearchResults(true);
        } else {
          setSearchResults([]);
          setShowSearchResults(false);
        }
      } catch (error) {
        console.error("Error en búsqueda:", error);
        setSearchResults([]);
        setShowSearchResults(false);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300); // Búsqueda más rápida para el dropdown

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Debounce para la búsqueda principal (esperar 500ms después de que el usuario deje de escribir)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Resetear página cuando cambia la búsqueda
    }, 500);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Función para determinar el tab correcto según el estado de la expedición
  const getTabFromExpedition = (expedition: { status: string; isActive?: boolean }): string => {
    const isPublished = expedition.status === "PUBLISHED" || 
                       expedition.status === "PUBLICADO" || 
                       expedition.status === "ACTIVO";
    const isDraft = expedition.status === "DRAFT" || 
                   expedition.status === "BORRADOR";
    const isArchived = expedition.status === "ARCHIVED" || 
                      expedition.status === "ARCHIVADO";
    const isInactive = expedition.isActive === false || 
                     expedition.status === "DESACTIVADO" || 
                     expedition.status === "INACTIVO" || 
                     expedition.status === "INACTIVE";
    
    if (isInactive) return "inactive";
    if (isDraft) return "drafts";
    if (isArchived) return "archived";
    if (isPublished) return "active";
    return "active"; // Por defecto
  };

  // Manejar clic en resultado de búsqueda
  const handleSearchResultClick = (expedition: { id: string; status: string; isActive?: boolean }) => {
    const targetTab = getTabFromExpedition(expedition);
    setActiveTab(targetTab);
    setSearchQuery("");
    setShowSearchResults(false);
    // Scroll a la expedición si es necesario (opcional)
  };

  // Resetear página cuando cambia el tab
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // Función para recargar expediciones
  const refetchExpeditions = async () => {
    try {
      setLoading(true);
      const status = getStatusFromTab(activeTab);
      const params: any = {
        page,
        limit,
      };
      
      // Agregar parámetro de status solo si no es "inactive"
      if (status) {
        params.status = status;
      }
      
      // Agregar parámetro de búsqueda si hay un término de búsqueda (usar debounced)
      if (debouncedSearchQuery.trim()) {
        params.search = debouncedSearchQuery.trim();
      }

      const response = await api.get<ExpeditionsResponse>("/agencies/trips", { params });
      
      if (response.data) {
        let trips = response.data.data || [];
        let totalCount = response.data.total || 0;
        
        // Si es el tab "inactive", filtrar trips desactivados en el frontend
        if (activeTab === "inactive") {
          trips = trips.filter(
            (trip) => trip.isActive === false || trip.status === "DESACTIVADO" || trip.status === "INACTIVO" || trip.status === "INACTIVE"
          );
          totalCount = trips.length;
        }
        
        setExpeditions(trips);
        setTotal(totalCount);
        
        if (response.data.counts) {
          setCounts({
            active: response.data.counts.active || 0,
            drafts: response.data.counts.drafts || 0,
            completed: response.data.counts.completed || 0,
            archived: response.data.counts.archived || 0,
            inactive: activeTab === "inactive" ? totalCount : (response.data.counts.inactive || 0),
          });
        }
      }
    } catch (error: any) {
      console.error("Error al cargar expediciones:", error);
      toast.error("Error al cargar las expediciones");
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado del trip
  const handleChangeStatus = async (tripId: string, newStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    try {
      setUpdatingId(tripId);
      setOpenMenuId(null);
      
      // Buscar la expedición actual para verificar si está desactivada
      const currentExpedition = expeditions.find(exp => exp.id === tripId);
      const isCurrentlyInactive = currentExpedition?.isActive === false || 
                                   currentExpedition?.status === "DESACTIVADO" ||
                                   currentExpedition?.status === "INACTIVO";
      
      // Cambiar el estado
      await api.put(`/agencies/trips/${tripId}/status`, { status: newStatus });
      
      // Si se está publicando y está desactivada, activarla automáticamente
      if (newStatus === "PUBLISHED" && isCurrentlyInactive) {
        console.log(`✅ Activando automáticamente la expedición ${tripId} al publicarla`);
        try {
          await api.put(`/agencies/trips/${tripId}/active`, { isActive: true });
        } catch (activeError: any) {
          console.warn("No se pudo activar automáticamente la expedición:", activeError);
          // No mostrar error al usuario, solo loguear
        }
      }
      
      const statusLabels: Record<string, string> = {
        DRAFT: "Borrador",
        PUBLISHED: "Publicado",
        ARCHIVED: "Archivado",
      };
      
      const message = newStatus === "PUBLISHED" && isCurrentlyInactive
        ? "Expedición publicada y activada exitosamente"
        : `Expedición ${statusLabels[newStatus]?.toLowerCase()} exitosamente`;
      
      toast.success(message);
      
      // Recargar expediciones
      await refetchExpeditions();
    } catch (error: any) {
      console.error("Error al cambiar estado:", error);
      toast.error(error.response?.data?.message || "Error al cambiar el estado de la expedición");
    } finally {
      setUpdatingId(null);
    }
  };

  // Activar/Desactivar trip
  const handleToggleActive = async (tripId: string, currentActive: boolean) => {
    try {
      setUpdatingId(tripId);
      setOpenMenuId(null);
      
      // Determinar el nuevo estado: si está activo, desactivar (false), si está inactivo, activar (true)
      const newActiveState = !currentActive;
      
      console.log(`🔄 Cambiando estado activo del trip ${tripId}: ${currentActive} -> ${newActiveState}`);
      
      // Enviar PUT request al endpoint con el nuevo estado
      await api.put(`/agencies/trips/${tripId}/active`, { isActive: newActiveState });
      
      toast.success(`Expedición ${newActiveState ? "activada" : "desactivada"} exitosamente`);
      
      // Recargar expediciones para reflejar el cambio
      await refetchExpeditions();
    } catch (error: any) {
      console.error("Error al cambiar estado activo:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      toast.error(error.response?.data?.message || "Error al cambiar el estado de la expedición");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="flex flex-col min-h-screen">
      <AgentHeader
        titleWithSearch
        showSearch
        searchPlaceholder="Buscar por nombre de viaje..."
        searchWidth="w-72"
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          if (value.trim()) {
            setShowSearchResults(true);
          } else {
            setShowSearchResults(false);
          }
        }}
        onSearch={(value) => {
          setSearchQuery(value);
          // El debounce se encargará de resetear la página
        }}
        searchInputRef={searchInputRef}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        isSearching={isSearching}
        onResultClick={handleSearchResultClick}
        actions={
          <>
            <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
              <Settings className="size-5" />
            </button>
            <button 
              onClick={() => router.push("/new")}
              className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <Plus className="size-4" />
              Crear Expedición
            </button>
          </>
        }
      />

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Título */}
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 font-caveat">Tus Viajes</h1>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-zinc-200">
            <button
              onClick={() => setActiveTab("active")}
              className={cn(
                "px-1 py-4 text-sm font-medium border-b-2 transition-all",
                activeTab === "active"
                  ? "border-zinc-900 text-zinc-900"
                  : "text-zinc-500 border-transparent hover:text-zinc-900"
              )}
            >
              Activas
            </button>
            <button
              onClick={() => setActiveTab("drafts")}
              className={cn(
                "px-1 py-4 text-sm font-medium border-b-2 transition-all",
                activeTab === "drafts"
                  ? "border-zinc-900 text-zinc-900"
                  : "text-zinc-500 border-transparent hover:text-zinc-900"
              )}
            >
              Borradores
            </button>
            <button
              onClick={() => setActiveTab("inactive")}
              className={cn(
                "px-1 py-4 text-sm font-medium border-b-2 transition-all",
                activeTab === "inactive"
                  ? "border-zinc-900 text-zinc-900"
                  : "text-zinc-500 border-transparent hover:text-zinc-900"
              )}
            >
              Desactivados
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={cn(
                "px-1 py-4 text-sm font-medium border-b-2 transition-all",
                activeTab === "completed"
                  ? "border-zinc-900 text-zinc-900"
                  : "text-zinc-500 border-transparent hover:text-zinc-900"
              )}
            >
              Completadas
            </button>
            <button
              onClick={() => setActiveTab("archived")}
              className={cn(
                "px-1 py-4 text-sm font-medium border-b-2 transition-all",
                activeTab === "archived"
                  ? "border-zinc-900 text-zinc-900"
                  : "text-zinc-500 border-transparent hover:text-zinc-900"
              )}
            >
              Archivadas
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Expedición</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Fechas</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ocupación</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ingresos</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loading ? (
                  // Skeletons de carga
                  Array.from({ length: 3  }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-lg bg-zinc-200 shrink-0"></div>
                          <div className="flex flex-col gap-2">
                            <div className="h-4 w-48 bg-zinc-200 rounded"></div>
                            <div className="h-3 w-32 bg-zinc-200 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="h-3 w-24 bg-zinc-200 rounded"></div>
                          <div className="h-2 w-16 bg-zinc-200 rounded"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="h-3 w-20 bg-zinc-200 rounded"></div>
                            <div className="h-3 w-8 bg-zinc-200 rounded"></div>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-100 rounded-full">
                            <div className="h-full w-1/2 bg-zinc-200 rounded-full"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-zinc-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 w-20 bg-zinc-200 rounded-full"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-5 w-5 bg-zinc-200 rounded ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : expeditions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-sm text-zinc-500">No hay expediciones en esta categoría</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expeditions.map((expedition) => (
                    <tr key={expedition.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="size-12 rounded-lg bg-zinc-100 bg-cover bg-center shrink-0 border border-zinc-200"
                            style={{ backgroundImage: `url('${expedition.image}')` }}
                          ></div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-zinc-900">{expedition.title}</span>
                            <span className="text-xs text-zinc-500">{expedition.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-zinc-900">{expedition.dates}</span>
                          <span className="text-[10px] text-zinc-500">{expedition.duration}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-medium text-zinc-900">
                              {expedition.occupancy.current}/{expedition.occupancy.total} Cupos
                            </span>
                            <span className="text-[10px] text-zinc-500">{expedition.occupancy.percentage}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                expedition.occupancy.percentage === 100 ? "bg-amber-500" : "bg-indigo-600"
                              )}
                              style={{ width: `${expedition.occupancy.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-zinc-900">{expedition.revenue}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border-2 shadow-sm transition-all",
                          expedition.status === "PUBLISHED" || expedition.status === "ACTIVO" || expedition.status === "PUBLICADO"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-emerald-100"
                            : expedition.status === "DRAFT" || expedition.status === "BORRADOR"
                            ? "bg-slate-50 text-slate-700 border-slate-300 shadow-slate-100"
                            : expedition.status === "DESACTIVADO" || expedition.status === "INACTIVO" || expedition.status === "INACTIVE"
                            ? "bg-red-50 text-red-700 border-red-300 shadow-red-100"
                            : expedition.status === "ARCHIVED" || expedition.status === "ARCHIVADO"
                            ? "bg-amber-50 text-amber-700 border-amber-300 shadow-amber-100"
                            : expedition.status === "COMPLETED" || expedition.status === "COMPLETADO"
                            ? "bg-blue-50 text-blue-700 border-blue-300 shadow-blue-100"
                            : expedition.statusColor || "bg-zinc-50 text-zinc-700 border-zinc-300 shadow-zinc-100"
                        )}>
                          {(expedition.status === "PUBLISHED" || expedition.status === "ACTIVO" || expedition.status === "PUBLICADO") && (
                            <span className="text-xs">✓</span>
                          )}
                          {(expedition.status === "DESACTIVADO" || expedition.status === "INACTIVO" || expedition.status === "INACTIVE") && (
                            <span className="text-xs">●</span>
                          )}
                          {expedition.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <DropdownMenu
                          open={openMenuId === expedition.id}
                          onOpenChange={(open) => {
                            setOpenMenuId(open ? expedition.id : null);
                          }}
                        >
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="text-zinc-400 hover:text-indigo-600 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100 outline-none"
                              disabled={updatingId === expedition.id}
                            >
                              <MoreVertical className="size-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="end" 
                            className="w-56"
                          >
                            {/* Helper para verificar estados */}
                            {(() => {
                              const isPublished = expedition.status === "PUBLISHED" || 
                                                   expedition.status === "PUBLICADO" || 
                                                   expedition.status === "ACTIVO";
                              const isDraft = expedition.status === "DRAFT" || 
                                             expedition.status === "BORRADOR";
                              const isArchived = expedition.status === "ARCHIVED" || 
                                                expedition.status === "ARCHIVADO";
                              const isInactive = expedition.isActive === false || 
                                                expedition.status === "DESACTIVADO" || 
                                                expedition.status === "INACTIVO" || 
                                                expedition.status === "INACTIVE";
                              const isActive = expedition.isActive !== false && !isInactive;
                              
                              return (
                                <>
                                  {/* Cambiar estado - Solo mostrar si NO está en ese estado */}
                                  {!isPublished && (
                                    <DropdownMenuItem
                                      onClick={() => handleChangeStatus(expedition.id, "PUBLISHED")}
                                      disabled={updatingId === expedition.id}
                                      className="flex items-center gap-3 cursor-pointer"
                                    >
                                      <CheckCircle className="size-4 text-green-600 shrink-0" />
                                      <span className="font-medium">Publicar</span>
                                    </DropdownMenuItem>
                                  )}
                                  {!isDraft && (
                                    <DropdownMenuItem
                                      onClick={() => handleChangeStatus(expedition.id, "DRAFT")}
                                      disabled={updatingId === expedition.id}
                                      className="flex items-center gap-3 cursor-pointer"
                                    >
                                      <FileText className="size-4 text-zinc-500 shrink-0" />
                                      <span className="font-medium">Mover a Borradores</span>
                                    </DropdownMenuItem>
                                  )}
                                  {!isArchived && (
                                    <DropdownMenuItem
                                      onClick={() => handleChangeStatus(expedition.id, "ARCHIVED")}
                                      disabled={updatingId === expedition.id}
                                      className="flex items-center gap-3 cursor-pointer"
                                    >
                                      <Archive className="size-4 text-amber-600 shrink-0" />
                                      <span className="font-medium">Archivar</span>
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {/* Separador solo si hay opciones de estado */}
                                  {(!isPublished || !isDraft || !isArchived) && (
                                    <DropdownMenuSeparator />
                                  )}
                                  
                                  {/* Activar/Desactivar - Solo mostrar la opción opuesta al estado actual */}
                                  {isActive ? (
                                    <DropdownMenuItem
                                      onClick={() => handleToggleActive(expedition.id, true)}
                                      disabled={updatingId === expedition.id}
                                      className="flex items-center gap-3 cursor-pointer"
                                    >
                                      <EyeOff className="size-4 text-zinc-500 shrink-0" />
                                      <span className="font-medium">Desactivar</span>
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => handleToggleActive(expedition.id, false)}
                                      disabled={updatingId === expedition.id}
                                      className="flex items-center gap-3 cursor-pointer"
                                    >
                                      <Eye className="size-4 text-green-600 shrink-0" />
                                      <span className="font-medium">Activar</span>
                                    </DropdownMenuItem>
                                  )}
                                </>
                              );
                            })()}
                            
                            {/* Editar */}
                            <DropdownMenuItem
                              onClick={() => {
                                setOpenMenuId(null);
                                router.push(`/new?edit=${expedition.id}`);
                              }}
                              className="flex items-center gap-3 cursor-pointer"
                            >
                              <Edit className="size-4 text-indigo-600 shrink-0" />
                              <span className="font-medium">Editar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Mostrando {expeditions.length} de {total} expediciones
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="px-3 py-1 text-xs border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * limit >= total || loading}
                  className="px-3 py-1 text-xs border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-3 gap-6">
            {actionCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="p-6 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col justify-between group cursor-pointer hover:border-zinc-300 transition-all">
                  <div>
                    <Icon className="size-5 text-indigo-600 mb-3" />
                    <h4 className="text-sm font-semibold mb-1">{card.title}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">{card.description}</p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 mt-4 flex items-center gap-1">
                    {card.action} <ArrowRight className="size-3" />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
    </main>
  );
}
