"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Plus,
  MoreVertical,
  ArrowRight,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Edit,
  Archive,
  FileText,
  Eye,
  EyeOff,
  CheckCircle,
  MapPin,
  Clock,
  Sparkles,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  BarChart3,
} from "lucide-react";
import { AgentHeader } from "@/components/agent/AgentHeader";
import NewTripModal from "@/components/agent/NewTripModal";
import TripStatsModal from "@/components/agent/TripStatsModal";
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
import { gsap } from "gsap";

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
  startDate?: string;
  endDate?: string;
  expeditions?: Array<{
    startDate?: string;
    endDate?: string;
    capacityAvailable?: number;
    capacity?: number;
  }>;
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
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedExpeditionId, setSelectedExpeditionId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [searchResults, setSearchResults] = useState<Expedition[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTripId, setEditTripId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expeditionToDelete, setExpeditionToDelete] = useState<{ tripId: string; expeditionId: string; title: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Refs para animaciones GSAP
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Calcular información real basada en los datos
  const getRealInsights = () => {
    const activeExpeditions = expeditions.filter(
      (exp) => exp.status === "PUBLISHED" || exp.status === "ACTIVO" || exp.status === "PUBLICADO"
    );
    
    const lowOccupancy = activeExpeditions.filter(
      (exp) => exp.occupancy.percentage < 50 && exp.occupancy.current < exp.occupancy.total
    );
    
    const highOccupancy = activeExpeditions.filter(
      (exp) => exp.occupancy.percentage >= 80
    );
    
    const upcomingDeadlines = activeExpeditions.filter((exp) => {
      // Simular fechas próximas (en producción vendría del backend)
      return exp.occupancy.current > 0;
    });

    return {
      lowOccupancyCount: lowOccupancy.length,
      highOccupancyCount: highOccupancy.length,
      upcomingDeadlinesCount: upcomingDeadlines.length,
      totalRevenue: activeExpeditions.reduce((sum, exp) => {
        const revenue = parseFloat(exp.revenue.replace(/[^0-9.]/g, "")) || 0;
        return sum + revenue;
      }, 0),
    };
  };

  const insights = getRealInsights();



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
        return undefined;
      default:
        return undefined;
    }
  };

  useEffect(() => {
    const fetchExpeditions = async () => {
      const status = getStatusFromTab(activeTab);
      const params: any = {
        page,
        limit,
      };
      
      if (status) {
        params.status = status;
      }
      
      if (debouncedSearchQuery.trim()) {
        params.search = debouncedSearchQuery.trim();
      }

      try {
        setLoading(true);

        const response = await api.get<ExpeditionsResponse>("/agencies/trips", { params });
        
        if (response.data) {
          let trips = response.data.data || [];
          let totalCount = response.data.total || 0;
          
          // Calcular el estado correcto para cada expedición
          trips = trips.map((trip: Expedition) => {
            const calculatedStatus = calculateExpeditionStatus(trip);
            return {
              ...trip,
              status: calculatedStatus,
            };
          });
          
          if (activeTab === "inactive") {
            trips = trips.filter(
              (trip) => trip.isActive === false || trip.status === "DESACTIVADO" || trip.status === "INACTIVO" || trip.status === "INACTIVE"
            );
            totalCount = trips.length;
          } else if (activeTab === "completed") {
            trips = trips.filter(
              (trip) => trip.status === "COMPLETADAS" || trip.status === "COMPLETADO" || trip.status === "COMPLETED"
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
        toast.error(error.response?.data?.message || "Error al cargar las expediciones");
        setExpeditions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExpeditions();
  }, [activeTab, page, debouncedSearchQuery]);

  // Animaciones GSAP al cargar
  useEffect(() => {
    if (loading || expeditions.length === 0) return;

    const ctx = gsap.context(() => {
      // Animación de entrada para las filas de la tabla
      gsap.fromTo(
        ".expedition-card",
        {
          opacity: 0,
          x: -20,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        }
      );

      // Animación para las action cards (con delay para efecto de scroll)
      setTimeout(() => {
        gsap.fromTo(
          ".action-card",
          {
            opacity: 0,
            x: -20,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
          }
        );
      }, 300);

      // Animación para los tabs
      gsap.fromTo(
        ".tab-button",
        {
          opacity: 0,
          y: -10,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading, expeditions, activeTab]);

  // Animación al cambiar de tab
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".expedition-card",
        {
          opacity: 0,
          x: -20,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [activeTab]);

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
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

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

  // Función para calcular el estado correcto basado en ocupación y fechas
  const calculateExpeditionStatus = (expedition: Expedition): string => {
    const now = new Date();
    const originalStatus = expedition.status?.toUpperCase() || "";
    
    // Obtener fecha de fin (puede venir de diferentes lugares)
    let endDate: Date | null = null;
    if (expedition.endDate) {
      endDate = new Date(expedition.endDate);
    } else if (expedition.expeditions && expedition.expeditions.length > 0) {
      const firstExpedition = expedition.expeditions[0];
      if (firstExpedition.endDate) {
        endDate = new Date(firstExpedition.endDate);
      }
    }
    
    // Si la fecha de fin ya pasó, la expedición está completada
    if (endDate && endDate < now) {
      return "COMPLETADAS";
    }
    
    // Si está en "LISTA DE ESPERA" pero está llena (100% ocupación), cambiar a "LLENO"
    if (
      (originalStatus === "LISTA DE ESPERA" || 
       originalStatus === "WAITING_LIST" || 
       originalStatus === "EN ESPERA") &&
      expedition.occupancy.percentage >= 100
    ) {
      return "LLENO";
    }
    
    // Si está llena pero no está en lista de espera, mantener el estado original
    // pero podríamos cambiarlo a "LLENO" si es necesario
    if (expedition.occupancy.percentage >= 100 && 
        originalStatus !== "COMPLETADAS" && 
        originalStatus !== "COMPLETADO" &&
        originalStatus !== "LLENO") {
      // Solo cambiar a LLENO si no está completada
      if (!endDate || endDate >= now) {
        return "LLENO";
      }
    }
    
    // Mantener el estado original en otros casos
    return expedition.status;
  };

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
    const isCompleted = expedition.status === "COMPLETADAS" || 
                       expedition.status === "COMPLETADO" ||
                       expedition.status === "COMPLETED";
    const isFull = expedition.status === "LLENO";
    
    if (isInactive) return "inactive";
    if (isDraft) return "drafts";
    if (isArchived) return "archived";
    if (isCompleted) return "completed";
    if (isFull) return "active"; // Las llenas se muestran en activas
    if (isPublished) return "active";
    return "active";
  };

  const handleSearchResultClick = (expedition: { id: string; status: string; isActive?: boolean }) => {
    const targetTab = getTabFromExpedition(expedition);
    setActiveTab(targetTab);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const refetchExpeditions = async () => {
    try {
      setLoading(true);
      const status = getStatusFromTab(activeTab);
      const params: any = {
        page,
        limit,
      };
      
      if (status) {
        params.status = status;
      }
      
      if (debouncedSearchQuery.trim()) {
        params.search = debouncedSearchQuery.trim();
      }

      const response = await api.get<ExpeditionsResponse>("/agencies/trips", { params });
      
      if (response.data) {
        let trips = response.data.data || [];
        let totalCount = response.data.total || 0;
        
        // Calcular el estado correcto para cada expedición
        trips = trips.map((trip: Expedition) => {
          const calculatedStatus = calculateExpeditionStatus(trip);
          return {
            ...trip,
            status: calculatedStatus,
          };
        });
        
        if (activeTab === "inactive") {
          trips = trips.filter(
            (trip) => trip.isActive === false || trip.status === "DESACTIVADO" || trip.status === "INACTIVO" || trip.status === "INACTIVE"
          );
          totalCount = trips.length;
        } else if (activeTab === "completed") {
          trips = trips.filter(
            (trip) => trip.status === "COMPLETADAS" || trip.status === "COMPLETADO" || trip.status === "COMPLETED"
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

  const handleChangeStatus = async (tripId: string, newStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    if (!tripId) {
      toast.error("ID de viaje no válido");
      return;
    }

    try {
      setUpdatingId(tripId);
      setOpenMenuId(null);
      
      console.log(`Cambiando estado del viaje ${tripId} a ${newStatus}`);
      
      const currentExpedition = expeditions.find(exp => exp.id === tripId);
      const isCurrentlyInactive = currentExpedition?.isActive === false || 
                                   currentExpedition?.status === "DESACTIVADO" ||
                                   currentExpedition?.status === "INACTIVO";
      
      const response = await api.put(`/agencies/trips/${tripId}/status`, { status: newStatus });
      console.log("Respuesta de cambio de estado:", response.data);
      
      if (newStatus === "PUBLISHED" && isCurrentlyInactive) {
        try {
          await api.put(`/agencies/trips/${tripId}/active`, { isActive: true });
        } catch (activeError: any) {
          console.warn("No se pudo activar automáticamente la expedición:", activeError);
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
      await refetchExpeditions();
    } catch (error: any) {
      console.error("Error completo al cambiar estado:", error);
      console.error("Status:", error.response?.status);
      console.error("URL:", error.config?.url);
      console.error("Mensaje:", error.response?.data?.message || error.message);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message ||
                          "Error al cambiar el estado de la expedición";
      toast.error(errorMessage);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (tripId: string, currentActive: boolean) => {
    if (!tripId) {
      toast.error("ID de viaje no válido");
      return;
    }

    try {
      setUpdatingId(tripId);
      setOpenMenuId(null);
      
      const newActiveState = !currentActive;
      console.log(`Cambiando estado activo del viaje ${tripId} a ${newActiveState}`);
      
      const response = await api.put(`/agencies/trips/${tripId}/active`, { isActive: newActiveState });
      console.log("Respuesta de cambio de estado activo:", response.data);
      
      toast.success(`Expedición ${newActiveState ? "activada" : "desactivada"} exitosamente`);
      await refetchExpeditions();
    } catch (error: any) {
      console.error("Error completo al cambiar estado activo:", error);
      console.error("Status:", error.response?.status);
      console.error("URL:", error.config?.url);
      console.error("Mensaje:", error.response?.data?.message || error.message);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message ||
                          "Error al cambiar el estado de la expedición";
      toast.error(errorMessage);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteExpedition = async () => {
    if (!expeditionToDelete) return;

    try {
      setDeletingId(expeditionToDelete.expeditionId);
      
      await api.delete(`/agencies/trips/${expeditionToDelete.tripId}/expeditions/${expeditionToDelete.expeditionId}`);
      
      toast.success("Expedición eliminada exitosamente");
      setIsDeleteModalOpen(false);
      setExpeditionToDelete(null);
      await refetchExpeditions();
    } catch (error: any) {
      console.error("Error al eliminar expedición:", error);
      const errorMessage = error.response?.data?.message || "Error al eliminar la expedición";
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const tabs = [
    { id: "active", label: "Activas", count: counts.active },
    { id: "drafts", label: "Borradores", count: counts.drafts },
    { id: "inactive", label: "Desactivados", count: counts.inactive },
    { id: "completed", label: "Completadas", count: counts.completed },
    { id: "archived", label: "Archivadas", count: counts.archived },
  ];

  return (
    <main className="flex flex-col min-h-screen bg-lineal-to-br from-zinc-50 via-white to-zinc-50" ref={containerRef}>
      <AgentHeader
        titleWithSearch
        showSearch
        searchPlaceholder="Buscar expediciones..."
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
        }}
        searchInputRef={searchInputRef}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        isSearching={isSearching}
        onResultClick={handleSearchResultClick}
        actions={
          <>
            <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors rounded-lg hover:bg-zinc-100">
              <Settings className="size-5" />
            </button>
            <button 
              onClick={() => {
                setEditTripId(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <Plus className="size-4" />
              Nueva Expedición
            </button>
          </>
        }
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 mb-2">Expediciones</h1>
            <p className="text-zinc-500 text-sm">Gestiona y monitorea todas tus expediciones</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div ref={tabsRef} className="flex items-center gap-1 border-b border-zinc-200/60">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "tab-button px-4 py-3 text-sm font-medium relative transition-all duration-300",
                activeTab === tab.id
                  ? "text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Expeditions Table */}
        <div ref={cardsRef} className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="animate-pulse flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-zinc-200 shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-zinc-200 rounded"></div>
                      <div className="h-3 w-32 bg-zinc-200 rounded"></div>
                    </div>
                    <div className="h-3 w-24 bg-zinc-200 rounded"></div>
                    <div className="h-3 w-20 bg-zinc-200 rounded"></div>
                    <div className="h-3 w-16 bg-zinc-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : expeditions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="size-16 rounded-full bg-zinc-100 flex items-center justify-center">
                  <MapPin className="size-8 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">No hay expediciones en esta categoría</p>
                  <p className="text-xs text-zinc-500 mt-1">Crea una nueva expedición para comenzar</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/50">
                    <th className="px-6 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Expedición
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Duración
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Ocupación
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">
                      Ingresos
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {expeditions.map((expedition, index) => {
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
                    const isCompleted = expedition.status === "COMPLETADAS" || 
                                       expedition.status === "COMPLETADO" || 
                                       expedition.status === "COMPLETED";
                    const isFull = expedition.status === "LLENO";
                    const isWaitingList = expedition.status === "LISTA DE ESPERA" || 
                                          expedition.status === "WAITING_LIST" || 
                                          expedition.status === "EN ESPERA";
                    const isActive = expedition.isActive !== false && !isInactive;

                    return (
                      <tr
                        key={expedition.id}
                        className="expedition-card hover:bg-zinc-50/50 transition-colors group"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Expedición */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <div
                                className="size-12 rounded-lg bg-zinc-100 bg-cover bg-center border border-zinc-200 shadow-sm"
                                style={{ backgroundImage: `url('${expedition.image}')` }}
                              />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-zinc-900 truncate">
                                {expedition.title}
                              </h3>
                            </div>
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm",
                            isPublished
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isDraft
                              ? "bg-slate-50 text-slate-700 border-slate-200"
                              : isInactive
                              ? "bg-red-50 text-red-700 border-red-200"
                              : isArchived
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : isCompleted
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : isFull
                              ? "bg-orange-50 text-orange-700 border-orange-200"
                              : isWaitingList
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-zinc-50 text-zinc-700 border-zinc-200"
                          )}>
                            {isPublished && <span className="text-xs">●</span>}
                            {expedition.status}
                          </span>
                        </td>

                        {/* Ubicación */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="truncate">{expedition.location}</span>
                          </div>
                        </td>

                        {/* Fechas */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                            <Calendar className="size-3.5 shrink-0" />
                            <span>{expedition.dates}</span>
                          </div>
                        </td>

                        {/* Duración */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                            <Clock className="size-3.5 shrink-0" />
                            <span>{expedition.duration}</span>
                          </div>
                        </td>

                        {/* Ocupación */}
                        <td className="px-6 py-4">
                          <div className="min-w-[120px]">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-zinc-500">
                                {expedition.occupancy.current}/{expedition.occupancy.total}
                              </span>
                              <span className="text-xs font-medium text-zinc-600">
                                {expedition.occupancy.percentage}%
                              </span>
                            </div>
                            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  expedition.occupancy.percentage === 100 
                                    ? "bg-amber-500" 
                                    : expedition.occupancy.percentage >= 80
                                    ? "bg-emerald-500"
                                    : expedition.occupancy.percentage >= 50
                                    ? "bg-indigo-500"
                                    : "bg-zinc-400"
                                )}
                                style={{ width: `${expedition.occupancy.percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Ingresos */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <DollarSign className="size-4 text-zinc-500" />
                            <span className="text-sm font-semibold text-zinc-900">{expedition.revenue}</span>
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end">
                            <DropdownMenu
                              open={openMenuId === expedition.id}
                              onOpenChange={(open) => {
                                setOpenMenuId(open ? expedition.id : null);
                              }}
                            >
                              <DropdownMenuTrigger asChild>
                                <button 
                                  className="text-zinc-900 transition-colors  group-hover:opacity-100 outline-none p-1.5 rounded-lg hover:bg-zinc-100"
                                  disabled={updatingId === expedition.id}
                                >
                                  <MoreVertical className="size-5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent 
                                align="end" 
                                className="w-56"
                              >
                                {!isPublished && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleChangeStatus(expedition.id, "PUBLISHED");
                                    }}
                                    disabled={updatingId === expedition.id}
                                    className="flex items-center gap-3 cursor-pointer"
                                  >
                                    <CheckCircle className="size-4 text-green-600 shrink-0" />
                                    <span className="font-medium">Publicar</span>
                                  </DropdownMenuItem>
                                )}
                                {!isDraft && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleChangeStatus(expedition.id, "DRAFT");
                                    }}
                                    disabled={updatingId === expedition.id}
                                    className="flex items-center gap-3 cursor-pointer"
                                  >
                                    <FileText className="size-4 text-zinc-500 shrink-0" />
                                    <span className="font-medium">Mover a Borradores</span>
                                  </DropdownMenuItem>
                                )}
                                {!isArchived && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleChangeStatus(expedition.id, "ARCHIVED");
                                    }}
                                    disabled={updatingId === expedition.id}
                                    className="flex items-center gap-3 cursor-pointer"
                                  >
                                    <Archive className="size-4 text-amber-600 shrink-0" />
                                    <span className="font-medium">Archivar</span>
                                  </DropdownMenuItem>
                                )}
                                
                                {(!isPublished || !isDraft || !isArchived) && (
                                  <DropdownMenuSeparator />
                                )}
                                
                                {isActive ? (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleToggleActive(expedition.id, true);
                                    }}
                                    disabled={updatingId === expedition.id}
                                    className="flex items-center gap-3 cursor-pointer"
                                  >
                                    <EyeOff className="size-4 text-zinc-500 shrink-0" />
                                    <span className="font-medium">Desactivar</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleToggleActive(expedition.id, false);
                                    }}
                                    disabled={updatingId === expedition.id}
                                    className="flex items-center gap-3 cursor-pointer"
                                  >
                                    <Eye className="size-4 text-green-600 shrink-0" />
                                    <span className="font-medium">Activar</span>
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    
                                    try {
                                      // Obtener el trip completo para acceder a las expediciones
                                      const tripResponse = await api.get(`/agencies/trips/${expedition.id}`);
                                      const trip = tripResponse.data?.data || tripResponse.data;
                                      
                                      // Obtener el idExpedition de la primera expedición si existe
                                      let expeditionId: string | null = null;
                                      if (trip && trip.expeditions && trip.expeditions.length > 0) {
                                        expeditionId = trip.expeditions[0].idExpedition;
                                        console.log("Abriendo estadísticas para expeditionId:", expeditionId);
                                      } else {
                                        console.log("Abriendo estadísticas para tripId:", expedition.id);
                                      }
                                      
                                      setSelectedTripId(expedition.id);
                                      setSelectedExpeditionId(expeditionId);
                                      setStatsModalOpen(true);
                                    } catch (error: any) {
                                      console.error("Error al obtener expediciones:", error);
                                      // Si falla, aún así abrir el modal con solo tripId
                                      setSelectedTripId(expedition.id);
                                      setSelectedExpeditionId(null);
                                      setStatsModalOpen(true);
                                    }
                                  }}
                                  className="flex items-center gap-3 cursor-pointer"
                                >
                                  <BarChart3 className="size-4 text-purple-600 shrink-0" />
                                  <span className="font-medium">Ver Estadísticas</span>
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    setEditTripId(expedition.id);
                                    setIsModalOpen(true);
                                  }}
                                  className="flex items-center gap-3 cursor-pointer"
                                >
                                  <Edit className="size-4 text-indigo-600 shrink-0" />
                                  <span className="font-medium">Editar</span>
                                </DropdownMenuItem>
                                
                                {(() => {
                                  const isFull = expedition.occupancy?.percentage >= 100;
                                  const hasOccupancy = (expedition.occupancy?.current || 0) > 0;
                                  const canDelete = !isFull && !hasOccupancy;
                                  
                                  if (!canDelete) {
                                    return null;
                                  }
                                  
                                  return (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={async () => {
                                          setOpenMenuId(null);
                                          try {
                                            const tripResponse = await api.get(`/agencies/trips/${expedition.id}`);
                                            const trip = tripResponse.data?.data || tripResponse.data;
                                            
                                            if (trip && trip.expeditions && trip.expeditions.length > 0) {
                                              const firstExpedition = trip.expeditions[0];
                                              
                                              if (trip.expeditions.length > 1) {
                                                toast.error(`Este viaje tiene ${trip.expeditions.length} expediciones. Por ahora solo se puede eliminar la primera.`);
                                              }
                                              
                                              setExpeditionToDelete({
                                                tripId: expedition.id,
                                                expeditionId: firstExpedition.idExpedition,
                                                title: expedition.title,
                                              });
                                              setIsDeleteModalOpen(true);
                                            } else {
                                              toast.error("Este viaje no tiene expediciones para eliminar");
                                            }
                                          } catch (error: any) {
                                            console.error("Error al obtener expediciones:", error);
                                            toast.error("Error al cargar las expediciones del viaje");
                                          }
                                        }}
                                        className="flex items-center gap-3 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                      >
                                        <Trash2 className="size-4 text-red-600 shrink-0" />
                                        <span className="font-medium">Eliminar Expedición</span>
                                      </DropdownMenuItem>
                                    </>
                                  );
                                })()}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        {!loading && expeditions.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
            <span className="text-xs text-zinc-500">
              Mostrando {expeditions.length} de {total} expediciones
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 text-xs font-medium border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= total || loading}
                className="px-4 py-2 text-xs font-medium border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

   
      </div>

      <NewTripModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditTripId(null);
        }}
        editTripId={editTripId}
      />
      
      {selectedTripId && (
        <TripStatsModal
          isOpen={statsModalOpen}
          onClose={() => {
            setStatsModalOpen(false);
            setSelectedTripId(null);
            setSelectedExpeditionId(null);
          }}
          tripId={selectedTripId}
          expeditionId={selectedExpeditionId}
        />
      )}

      {/* Modal de confirmación para eliminar expedición */}
      {isDeleteModalOpen && expeditionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => {
              if (!deletingId) {
                setIsDeleteModalOpen(false);
                setExpeditionToDelete(null);
              }
            }}
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="size-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">Confirmar Eliminación</h3>
              </div>
              <button
                onClick={() => {
                  if (!deletingId) {
                    setIsDeleteModalOpen(false);
                    setExpeditionToDelete(null);
                  }
                }}
                disabled={!!deletingId}
                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-zinc-600">
                ¿Estás seguro de que deseas eliminar la expedición <span className="font-semibold text-zinc-900">{expeditionToDelete.title}</span>?
              </p>
              <p className="text-xs text-zinc-500">
                Esta acción no se puede deshacer. Solo se pueden eliminar expediciones sin reservas (PENDING o CONFIRMED).
              </p>

              <div className="flex gap-3 pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    if (!deletingId) {
                      setIsDeleteModalOpen(false);
                      setExpeditionToDelete(null);
                    }
                  }}
                  disabled={!!deletingId}
                  className="flex-1 px-4 py-3 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteExpedition}
                  disabled={!!deletingId}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deletingId ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar Expedición'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
