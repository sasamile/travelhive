"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  Eye,
  X,
  Plus,
  Edit,
  MoreVertical,
  Phone
} from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Agency {
  idAgency: string;
  nameAgency: string;
  email: string;
  phone: string;
  nit: string;
  rntNumber: string;
  picture: string | null;
  status: string;
  approvalStatus: string;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AgenciesResponse {
  data: Agency[];
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

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, all: 0 });
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadAgencies();
  }, [statusFilter, currentPage]);

  const loadAgencies = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 20 };
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const response = await api.get<AgenciesResponse>("/admin/agencies", { params });
      setAgencies(response.data.data);
      setPagination(response.data.pagination);
      setCounts(response.data.counts);
    } catch (error: any) {
      console.error("Error al cargar agencias:", error);
      toast.error(error.response?.data?.message || "Error al cargar las agencias");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (agencyId: string) => {
    try {
      setProcessingId(agencyId);
      await api.post(`/admin/agencies/${agencyId}/approve`);
      toast.success("Agencia aprobada exitosamente");
      loadAgencies();
      setSelectedAgency(null);
    } catch (error: any) {
      console.error("Error al aprobar agencia:", error);
      toast.error(error.response?.data?.message || "Error al aprobar la agencia");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedAgency || !rejectionReason.trim()) {
      toast.error("Por favor ingresa una razón de rechazo");
      return;
    }

    try {
      setProcessingId(selectedAgency.idAgency);
      await api.post(`/admin/agencies/${selectedAgency.idAgency}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      toast.success("Agencia rechazada exitosamente");
      setIsRejectModalOpen(false);
      setRejectionReason("");
      setSelectedAgency(null);
      loadAgencies();
    } catch (error: any) {
      console.error("Error al rechazar agencia:", error);
      toast.error(error.response?.data?.message || "Error al rechazar la agencia");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredAgencies = agencies.filter((agency) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      agency.nameAgency.toLowerCase().includes(query) ||
      agency.email.toLowerCase().includes(query) ||
      agency.nit.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Aprobada
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pendiente
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Rechazada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-[#030712] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Gestionar Agencias
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Aprobar o rechazar solicitudes de agencias de viajes asociadas.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2">
                <Plus className="size-4" />
                Invitar Agencia
              </button>
            </div>
          </div>
          {/* Stats Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{counts.all}</p>
                <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
                  <AlertCircle className="size-3 mr-1" />
                  +12% este mes
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{counts.pending}</p>
                <div className="mt-2 text-xs text-slate-400">Acción requerida</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1">Aprobadas</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{counts.approved}</p>
                <div className="mt-2 text-xs text-slate-400">Activas en el sistema</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">Rechazadas</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{counts.rejected}</p>
                <div className="mt-2 text-xs text-slate-400">Solicitudes denegadas</div>
              </div>
            </div>
          )}
        </header>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="relative w-full lg:w-96">
              <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, email o NIT..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 dark:text-white transition-all"
              />
            </div>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full lg:w-auto">
              {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`flex-1 lg:flex-none px-6 py-2 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === status
                      ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {status === "ALL" ? "Todas" : status === "PENDING" ? "Pendientes" : status === "APPROVED" ? "Aprobadas" : "Rechazadas"}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-caveat text-base text-slate-600 dark:text-slate-400">Agencia</th>
                    <th className="px-6 py-4 font-caveat text-base text-slate-600 dark:text-slate-400">Contacto</th>
                    <th className="px-6 py-4 font-caveat text-base text-slate-600 dark:text-slate-400">NIT / RNT</th>
                    <th className="px-6 py-4 font-caveat text-base text-slate-600 dark:text-slate-400">Estado</th>
                    <th className="px-6 py-4 font-caveat text-base text-slate-600 dark:text-slate-400 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-3 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredAgencies.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="size-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No se encontraron agencias</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-caveat text-base text-slate-600 dark:text-slate-400">Agencia</th>
                    <th className="px-6 py-4 font-caveat text-base text-slate-600 dark:text-slate-400">Contacto</th>
                    <th className="px-6 py-4 font-caveat text-base text-slate-600 dark:text-slate-400">NIT / RNT</th>
                    <th className="px-6 py-4 font-caveat text-base text-slate-600 dark:text-slate-400">Estado</th>
                    <th className="px-6 py-4 font-caveat text-base text-slate-600 dark:text-slate-400 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAgencies.map((agency) => (
                    <tr key={agency.idAgency} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {agency.picture ? (
                            <img
                              src={agency.picture}
                              alt={agency.nameAgency}
                              className="w-12 h-12 rounded-xl overflow-hidden shadow-sm object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                              <Building2 className="size-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{agency.nameAgency}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{agency.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Phone className="size-4 opacity-60" />
                          {agency.phone}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{agency.nit}</p>
                          <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">{agency.rntNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">{getStatusBadge(agency.approvalStatus)}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {agency.approvalStatus === "PENDING" && (
                            <button
                              onClick={() => handleApprove(agency.idAgency)}
                              disabled={processingId === agency.idAgency}
                              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-opacity-90 shadow-sm transition-all disabled:opacity-50"
                            >
                              {processingId === agency.idAgency ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                "Revisar"
                              )}
                            </button>
                          )}
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title="Ver Detalles">
                            <Eye className="size-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title="Editar">
                            <Edit className="size-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all" title="Desactivar">
                            <XCircle className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Mostrando <span className="font-semibold text-slate-900 dark:text-white">{((currentPage - 1) * pagination.limit) + 1}-{Math.min(currentPage * pagination.limit, pagination.total)}</span> de <span className="font-semibold text-slate-900 dark:text-white">{pagination.total}</span> agencias
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-medium disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && selectedAgency && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Rechazar Agencia</h3>
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectionReason("");
                  setSelectedAgency(null);
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="size-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Agencia:</p>
                <p className="text-base font-semibold text-slate-900 dark:text-white">{selectedAgency.nameAgency}</p>
              </div>
              {selectedAgency.rejectionReason && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wider">Razón actual:</p>
                  <p className="text-sm text-amber-900 dark:text-amber-300">{selectedAgency.rejectionReason}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Razón de rechazo
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ingresa la razón por la cual rechazas esta agencia..."
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
                  setSelectedAgency(null);
                }}
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processingId === selectedAgency.idAgency}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
              >
                {processingId === selectedAgency.idAgency ? (
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
