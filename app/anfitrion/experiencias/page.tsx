"use client";

import { useState, useEffect, useRef } from "react";
import {
  MoreVertical,
  Edit,
  Archive,
  Eye,
  EyeOff,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Loader2,
  Search,
  X,
  BarChart3,
  Compass,
  Trash2,
} from "lucide-react";
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
import CreateExperienceModal from "@/components/anfitrion/CreateExperienceModal";
import ExperienceStatsModal from "@/components/anfitrion/ExperienceStatsModal";
import { Plus } from "lucide-react";

interface Experience {
  id: string;
  idTrip: string;
  type: string;
  title: string;
  description: string;
  category: string;
  location: string;
  city?: {
    idCity: string;
    nameCity: string;
  };
  host?: {
    id: string;
    name: string;
    image: string | null;
  };
  dates: string;
  duration: string;
  price: number;
  currency: string;
  priceType: string;
  coverImage: string | null;
  galleryImages?: Array<{ id: string; imageUrl: string; order: number }>;
  status: string;
  statusColor: string;
  occupancy: {
    current: number;
    total: number;
    percentage: number;
  };
  revenue: string;
  revenueRaw: number;
  stats: {
    totalBookings: number;
    totalReviews: number;
    totalFavorites: number;
    averageRating: number | null;
  };
  discountCodes?: Array<{
    code: string;
    percentage: number;
    maxUses?: number | null;
    perUserLimit?: number | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ExperiencesResponse {
  data: Experience[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  counts?: {
    published: number;
    draft: number;
    archived: number;
  };
}

export default function ExperienciasPage() {
  const [activeTab, setActiveTab] = useState("published");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    published: 0,
    draft: 0,
    archived: 0,
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editExperienceId, setEditExperienceId] = useState<string | null>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const getStatusFromTab = (tab: string): string | undefined => {
    switch (tab) {
      case "published":
        return "PUBLISHED";
      case "drafts":
        return "DRAFT";
      case "archived":
        return "ARCHIVED";
      default:
        return undefined;
    }
  };

  useEffect(() => {
    const fetchExperiences = async () => {
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

        const response = await api.get<ExperiencesResponse>("/experiences", { params });

        if (response.data) {
          setExperiences(response.data.data || []);
          setTotal(response.data.pagination?.total || 0);

          if (response.data.counts) {
            setCounts({
              published: response.data.counts.published || 0,
              draft: response.data.counts.draft || 0,
              archived: response.data.counts.archived || 0,
            });
          }
        }
      } catch (error: any) {
        console.error("Error al cargar experiencias:", error);
        toast.error("Error al cargar las experiencias");
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [activeTab, page, debouncedSearchQuery]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const refetchExperiences = async () => {
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
      const response = await api.get<ExperiencesResponse>("/experiences", { params });

      if (response.data) {
        setExperiences(response.data.data || []);
        setTotal(response.data.pagination?.total || 0);

        if (response.data.counts) {
          setCounts({
            published: response.data.counts.published || 0,
            draft: response.data.counts.draft || 0,
            archived: response.data.counts.archived || 0,
          });
        }
      }
    } catch (error: any) {
      console.error("Error al cargar experiencias:", error);
      toast.error("Error al cargar las experiencias");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (experienceId: string, newStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    if (!experienceId) {
      toast.error("ID de experiencia no válido");
      return;
    }

    try {
      setUpdatingId(experienceId);
      setOpenMenuId(null);

      const response = await api.put(`/experiences/${experienceId}/status`, { status: newStatus });

      const statusLabels: Record<string, string> = {
        DRAFT: "Borrador",
        PUBLISHED: "Publicada",
        ARCHIVED: "Archivada",
      };

      toast.success(`Experiencia ${statusLabels[newStatus]?.toLowerCase()} exitosamente`);
      await refetchExperiences();
    } catch (error: any) {
      console.error("Error al cambiar estado:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Error al cambiar el estado de la experiencia";
      toast.error(errorMessage);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteExperience = async () => {
    if (!experienceToDelete) return;

    try {
      setDeletingId(experienceToDelete);
      await api.delete(`/experiences/${experienceToDelete}`);
      toast.success("Experiencia eliminada exitosamente");
      setDeleteConfirmOpen(false);
      setExperienceToDelete(null);
      await refetchExperiences();
    } catch (error: any) {
      console.error("Error al eliminar experiencia:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Error al eliminar la experiencia";
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (value: number, currency: string = "COP") => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency === "COP" ? "COP" : currency === "EUR" ? "EUR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const tabs = [
    { id: "published", label: "Publicadas" },
    { id: "drafts", label: "Borradores" },
    { id: "archived", label: "Archivadas" },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-caveat font-bold text-zinc-900 mb-2">Experiencias</h1>
            <p className="text-zinc-500 text-sm">Gestiona y monitorea todas tus experiencias</p>
          </div>
          <button
            onClick={() => {
              setEditExperienceId(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-primary hover:bg-zinc-800 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all"
          >
            <Plus className="size-4" />
            Nueva Experiencia
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar experiencias por título..."
            className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="size-4 text-zinc-400" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-zinc-200/60">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-3 text-sm font-medium relative transition-all duration-300",
                activeTab === tab.id ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Experiences Table */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/50">
                    <th className="px-6 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Experiencia
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
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-lg bg-zinc-200 shrink-0"></div>
                          <div className="min-w-0 space-y-2">
                            <div className="h-4 w-48 bg-zinc-200 rounded"></div>
                            <div className="h-3 w-24 bg-zinc-200 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-20 bg-zinc-200 rounded-full"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="h-4 w-32 bg-zinc-200 rounded"></div>
                          <div className="h-3 w-24 bg-zinc-200 rounded"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-28 bg-zinc-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-zinc-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="h-4 w-16 bg-zinc-200 rounded"></div>
                          <div className="h-1.5 w-full bg-zinc-200 rounded-full"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="space-y-1">
                          <div className="h-4 w-20 bg-zinc-200 rounded ml-auto"></div>
                          <div className="h-3 w-16 bg-zinc-200 rounded ml-auto"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-8 w-8 bg-zinc-200 rounded-lg ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : experiences.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="size-16 rounded-full bg-zinc-100 flex items-center justify-center">
                  <Compass className="size-8 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">No hay experiencias en esta categoría</p>
                  <p className="text-xs text-zinc-500 mt-1">Crea una nueva experiencia para comenzar</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/50">
                    <th className="px-6 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Experiencia
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
                  {experiences.map((experience) => {
                    const isPublished = experience.status === "PUBLISHED";
                    const isDraft = experience.status === "DRAFT";
                    const isArchived = experience.status === "ARCHIVED";

                    return (
                      <tr
                        key={experience.id}
                        className="hover:bg-zinc-50/50 transition-colors group"
                      >
                        {/* Experiencia */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <div
                                className="size-12 rounded-lg bg-zinc-100 bg-cover bg-center border border-zinc-200 shadow-sm"
                                style={{
                                  backgroundImage: experience.coverImage ? `url('${experience.coverImage}')` : undefined,
                                  backgroundColor: experience.coverImage ? undefined : "#f4f4f5",
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-zinc-900 truncate">{experience.title}</h3>
                              <p className="text-xs text-zinc-500 truncate">{experience.category}</p>
                            </div>
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm",
                              isPublished
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isDraft
                                ? "bg-slate-50 text-slate-700 border-slate-200"
                                : isArchived
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-zinc-50 text-zinc-700 border-zinc-200"
                            )}
                          >
                            {isPublished && <span className="text-xs">●</span>}
                            {experience.status}
                          </span>
                        </td>

                        {/* Ubicación */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="truncate">{experience.location}</span>
                          </div>
                          {experience.city && (
                            <p className="text-xs text-zinc-400 mt-0.5">{experience.city.nameCity}</p>
                          )}
                        </td>

                        {/* Fechas */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                            <Calendar className="size-3.5 shrink-0" />
                            <span>{experience.dates}</span>
                          </div>
                        </td>

                        {/* Duración */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                            <Clock className="size-3.5 shrink-0" />
                            <span>{experience.duration}</span>
                          </div>
                        </td>

                        {/* Ocupación */}
                        <td className="px-6 py-4">
                          <div className="min-w-[120px]">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-zinc-500">
                                {experience.occupancy.current}/{experience.occupancy.total}
                              </span>
                              <span className="text-xs text-zinc-500">{experience.occupancy.percentage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  experience.occupancy.percentage >= 80
                                    ? "bg-emerald-500"
                                    : experience.occupancy.percentage >= 50
                                    ? "bg-primary"
                                    : "bg-zinc-300"
                                )}
                                style={{ width: `${experience.occupancy.percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Ingresos */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-zinc-900">
                              {experience.revenue || formatCurrency(experience.revenueRaw || 0, experience.currency)}
                            </span>
                            {experience.stats.totalBookings > 0 && (
                              <span className="text-xs text-zinc-500">
                                {experience.stats.totalBookings} reservas
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900"
                                onClick={() => setOpenMenuId(experience.id)}
                              >
                                <MoreVertical className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditExperienceId(experience.id);
                                  setIsModalOpen(true);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Edit className="size-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedExperienceId(experience.id);
                                  setStatsModalOpen(true);
                                }}
                                className="flex items-center gap-2"
                              >
                                <BarChart3 className="size-4" />
                                Estadísticas
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {isDraft && (
                                <DropdownMenuItem
                                  onClick={() => handleChangeStatus(experience.id, "PUBLISHED")}
                                  disabled={updatingId === experience.id}
                                  className="flex items-center gap-2 text-emerald-600"
                                >
                                  {updatingId === experience.id ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    <Eye className="size-4" />
                                  )}
                                  Publicar
                                </DropdownMenuItem>
                              )}
                              {isPublished && (
                                <DropdownMenuItem
                                  onClick={() => handleChangeStatus(experience.id, "DRAFT")}
                                  disabled={updatingId === experience.id}
                                  className="flex items-center gap-2"
                                >
                                  {updatingId === experience.id ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    <EyeOff className="size-4" />
                                  )}
                                  Despublicar
                                </DropdownMenuItem>
                              )}
                              {!isArchived && (
                                <DropdownMenuItem
                                  onClick={() => handleChangeStatus(experience.id, "ARCHIVED")}
                                  disabled={updatingId === experience.id}
                                  className="flex items-center gap-2 text-amber-600"
                                >
                                  {updatingId === experience.id ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    <Archive className="size-4" />
                                  )}
                                  Archivar
                                </DropdownMenuItem>
                              )}
                              {isArchived && (
                                <DropdownMenuItem
                                  onClick={() => handleChangeStatus(experience.id, "PUBLISHED")}
                                  disabled={updatingId === experience.id}
                                  className="flex items-center gap-2 text-emerald-600"
                                >
                                  {updatingId === experience.id ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    <Eye className="size-4" />
                                  )}
                                  Restaurar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setExperienceToDelete(experience.id);
                                  setDeleteConfirmOpen(true);
                                  setOpenMenuId(null);
                                }}
                                disabled={deletingId === experience.id}
                                className="flex items-center gap-2 text-red-600"
                              >
                                {deletingId === experience.id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Trash2 className="size-4" />
                                )}
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && experiences.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total} experiencias
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={cn(
                    "px-3 py-1.5 text-sm border rounded-lg transition-colors",
                    page === 1
                      ? "border-zinc-200 text-zinc-400 cursor-not-allowed"
                      : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  Anterior
                </button>
                <span className="text-sm text-zinc-600">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={cn(
                    "px-3 py-1.5 text-sm border rounded-lg transition-colors",
                    page === totalPages
                      ? "border-zinc-200 text-zinc-400 cursor-not-allowed"
                      : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <CreateExperienceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditExperienceId(null);
        }}
        onSuccess={() => {
          refetchExperiences();
          setEditExperienceId(null);
        }}
        editExperienceId={editExperienceId}
      />

      {/* Stats Modal */}
      {selectedExperienceId && (
        <ExperienceStatsModal
          isOpen={statsModalOpen}
          onClose={() => {
            setStatsModalOpen(false);
            setSelectedExperienceId(null);
          }}
          experienceId={selectedExperienceId}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setDeleteConfirmOpen(false);
              setExperienceToDelete(null);
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="size-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Eliminar Experiencia</h3>
                <p className="text-sm text-zinc-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-zinc-700 mb-6">
              ¿Estás seguro de que deseas eliminar esta experiencia? Todos los datos asociados se perderán permanentemente.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setExperienceToDelete(null);
                }}
                disabled={deletingId !== null}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteExperience}
                disabled={deletingId !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
