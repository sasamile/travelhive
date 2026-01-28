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
  X
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
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="size-3" />
            Aprobada
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="size-3" />
            Pendiente
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="size-3" />
            Rechazada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Gestionar Agencias</h1>
            <p className="text-zinc-600">Aprobar o rechazar solicitudes de agencias</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-zinc-200">
            <div className="text-sm text-zinc-500 mb-1">Total</div>
            <div className="text-2xl font-bold text-zinc-900">{counts.all}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-zinc-200">
            <div className="text-sm text-zinc-500 mb-1">Pendientes</div>
            <div className="text-2xl font-bold text-amber-600">{counts.pending}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-zinc-200">
            <div className="text-sm text-zinc-500 mb-1">Aprobadas</div>
            <div className="text-2xl font-bold text-emerald-600">{counts.approved}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-zinc-200">
            <div className="text-sm text-zinc-500 mb-1">Rechazadas</div>
            <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, email o NIT..."
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {status === "ALL" ? "Todas" : status === "PENDING" ? "Pendientes" : status === "APPROVED" ? "Aprobadas" : "Rechazadas"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredAgencies.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-zinc-200">
            <Building2 className="size-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-600">No se encontraron agencias</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Agencia</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Contacto</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase">NIT / RNT</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-zinc-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredAgencies.map((agency) => (
                    <tr key={agency.idAgency} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {agency.picture ? (
                            <img
                              src={agency.picture}
                              alt={agency.nameAgency}
                              className="size-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="size-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                              <Building2 className="size-5 text-indigo-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-zinc-900">{agency.nameAgency}</div>
                            <div className="text-sm text-zinc-500">{agency.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-900">{agency.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-900">{agency.nit}</div>
                        <div className="text-xs text-zinc-500">{agency.rntNumber}</div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(agency.approvalStatus)}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-900">
                          {format(new Date(agency.createdAt), "d MMM yyyy", { locale: es })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {agency.approvalStatus === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(agency.idAgency)}
                                disabled={processingId === agency.idAgency}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Aprobar"
                              >
                                {processingId === agency.idAgency ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="size-4" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAgency(agency);
                                  setIsRejectModalOpen(true);
                                }}
                                disabled={processingId === agency.idAgency}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Rechazar"
                              >
                                <XCircle className="size-4" />
                              </button>
                            </>
                          )}
                          {agency.rejectionReason && (
                            <button
                              onClick={() => {
                                setSelectedAgency(agency);
                                setIsRejectModalOpen(true);
                              }}
                              className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                              title="Ver razón de rechazo"
                            >
                              <Eye className="size-4" />
                            </button>
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
              <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between">
                <div className="text-sm text-zinc-600">
                  Página {pagination.page} de {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-zinc-200 rounded-lg text-sm font-semibold hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 border border-zinc-200 rounded-lg text-sm font-semibold hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && selectedAgency && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900">Rechazar Agencia</h3>
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectionReason("");
                  setSelectedAgency(null);
                }}
                className="p-1 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            <div>
              <p className="text-sm text-zinc-600 mb-2">
                Agencia: <span className="font-semibold">{selectedAgency.nameAgency}</span>
              </p>
              {selectedAgency.rejectionReason && (
                <div className="mb-4 p-3 bg-zinc-50 rounded-lg">
                  <p className="text-xs text-zinc-500 mb-1">Razón actual:</p>
                  <p className="text-sm text-zinc-900">{selectedAgency.rejectionReason}</p>
                </div>
              )}
              <label className="block text-sm font-semibold text-zinc-900 mb-2">
                Razón de rechazo
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ingresa la razón por la cual rechazas esta agencia..."
                className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectionReason("");
                  setSelectedAgency(null);
                }}
                className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processingId === selectedAgency.idAgency}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === selectedAgency.idAgency ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Rechazando...
                  </span>
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
