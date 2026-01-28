"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  Eye,
  X,
  Mail,
  Phone,
  Plus,
  Edit,
  MapPin,
  TrendingUp,
  Delete
} from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Host {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  dni: string | null;
  city: string | null;
  department: string | null;
  image: string | null;
  isHost: boolean;
  approvalStatus: string;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  experiencesCount?: number;
}

interface HostsResponse {
  data: Host[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  counts: {
    pending: number;
    approved: number;
    rejected: number;
    all: number;
  };
}

export default function HostsPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, all: 0 });
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadHosts();
  }, [statusFilter, currentPage]);

  const loadHosts = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 20 };
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const response = await api.get<HostsResponse>("/admin/hosts", { params });
      setHosts(response.data.data);
      setPagination(response.data.pagination);
      setCounts(response.data.counts);
    } catch (error: any) {
      console.error("Error al cargar hosts:", error);
      toast.error(error.response?.data?.message || "Error al cargar los hosts");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (hostId: string) => {
    try {
      setProcessingId(hostId);
      await api.post(`/admin/hosts/${hostId}/approve`);
      toast.success("Host aprobado exitosamente");
      loadHosts();
      setSelectedHost(null);
    } catch (error: any) {
      console.error("Error al aprobar host:", error);
      toast.error(error.response?.data?.message || "Error al aprobar el host");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedHost || !rejectionReason.trim()) {
      toast.error("Por favor ingresa una razón de rechazo");
      return;
    }

    try {
      setProcessingId(selectedHost.id);
      await api.post(`/admin/hosts/${selectedHost.id}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      toast.success("Host rechazado exitosamente");
      setIsRejectModalOpen(false);
      setRejectionReason("");
      setSelectedHost(null);
      loadHosts();
    } catch (error: any) {
      console.error("Error al rechazar host:", error);
      toast.error(error.response?.data?.message || "Error al rechazar el host");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredHosts = hosts.filter((host) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      host.name.toLowerCase().includes(query) ||
      host.email.toLowerCase().includes(query) ||
      (host.dni && host.dni.toLowerCase().includes(query))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Aprobado
          </span>
        );
      case "PENDING":
        return (
          <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pendiente
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Rechazado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-[#111827] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-5xl font-caveat text-indigo-600 dark:text-indigo-400 mb-2">Gestionar Hosts</h1>
            <p className="text-slate-500 dark:text-slate-400">Aprobar o rechazar solicitudes de nuevos anfitriones en la plataforma.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
              <Search className="size-4 text-slate-400" />
              <span className="text-sm font-medium">Exportar</span>
            </button>
            <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-indigo-600/20">
              <Plus className="size-4" />
              <span className="text-sm font-semibold">Añadir Host</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
                <div className="flex items-baseline gap-2">
                  <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Registros</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{counts.all.toLocaleString()}</span>
                <span className="text-emerald-500 text-xs font-medium flex items-center gap-0.5">
                  <TrendingUp className="size-3" />
                  12%
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm border-l-4 border-l-amber-400">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Pendientes</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{counts.pending}</span>
                <span className="text-slate-400 text-xs">Por revisar</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-400">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Aprobados</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{counts.approved.toLocaleString()}</span>
                <span className="text-slate-400 text-xs">Activos</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm border-l-4 border-l-red-400">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Rechazados</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{counts.rejected}</span>
                <span className="text-slate-400 text-xs">Inactivos</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, email o DNI..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-600/20 rounded-xl transition-all text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex p-1 bg-slate-50 dark:bg-slate-800 rounded-xl w-full md:w-auto overflow-x-auto">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {status === "ALL" ? "Todos" : status === "PENDING" ? "Pendientes" : status === "APPROVED" ? "Aprobados" : "Rechazados"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4">Host</th>
                    <th className="px-6 py-4">Contacto</th>
                    <th className="px-6 py-4">Ubicación</th>
                    <th className="px-6 py-4 text-center">Experiencias</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Fecha Reg.</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          <div className="h-3 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto"></div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : filteredHosts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
            <Users className="size-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No se encontraron hosts</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4">Host</th>
                    <th className="px-6 py-4">Contacto</th>
                    <th className="px-6 py-4">Ubicación</th>
                    <th className="px-6 py-4 text-center">Experiencias</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Fecha Reg.</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredHosts.map((host) => (
                    <tr key={host.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {host.image ? (
                              <img
                                src={host.image}
                                alt={host.name}
                                className="w-12 h-12 rounded-2xl object-cover bg-indigo-50 dark:bg-indigo-900/20"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                <Users className="size-6 text-indigo-600 dark:text-indigo-400" />
                              </div>
                            )}
                            {host.approvalStatus === "APPROVED" && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="size-[10px] text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{host.name}</p>
                            <p className="text-xs text-slate-400">ID: {host.dni || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          {host.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                              <Phone className="size-3" />
                              <span>{host.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <Mail className="size-3" />
                            <span>{host.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {host.city ? (
                          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                            <MapPin className="size-4 text-indigo-600" />
                            <span>{host.city}{host.department && `, ${host.department}`}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">No especificada</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <MapPin className="size-3 text-slate-400" />
                          <span>{host.experiencesCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">{getStatusBadge(host.approvalStatus)}</td>
                      <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                        {format(new Date(host.createdAt), "d MMM yyyy", { locale: es })}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {host.approvalStatus === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(host.id)}
                                disabled={processingId === host.id}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                              >
                                {processingId === host.id ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="size-3" />
                                    Aprobar
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedHost(host);
                                  setIsRejectModalOpen(true);
                                }}
                                disabled={processingId === host.id}
                                className="bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                              >
                                <XCircle className="size-3" />
                                Rechazar
                              </button>
                            </>
                          )}
                          {host.approvalStatus !== "PENDING" && (
                            <>
                              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-600/5 rounded-lg transition-all" title="Ver Detalles">
                                <Eye className="size-5" />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/5 rounded-lg transition-all" title="Editar">
                                <Edit className="size-5" />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all" title="Eliminar">
                                <Delete className="size-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-slate-50 dark:bg-slate-800/30 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Mostrando <span className="font-semibold">{((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.total)}</span> de <span className="font-semibold">{pagination.total}</span> registros
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-all"
                  >
                    <X className="size-4 rotate-90" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all"
                  >
                    <X className="size-4 -rotate-90" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && selectedHost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Rechazar Host</h3>
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectionReason("");
                  setSelectedHost(null);
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="size-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Host:</p>
                <p className="text-base font-semibold text-slate-900 dark:text-white">{selectedHost.name}</p>
              </div>
              {selectedHost.rejectionReason && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wider">Razón actual:</p>
                  <p className="text-sm text-amber-900 dark:text-amber-300">{selectedHost.rejectionReason}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Razón de rechazo
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ingresa la razón por la cual rechazas este host..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:text-white outline-none resize-none transition-all"
                  rows={4}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectionReason("");
                  setSelectedHost(null);
                }}
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processingId === selectedHost.id}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
              >
                {processingId === selectedHost.id ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Rechazando...
                  </>
                ) : (
                  "Rechazar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
