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
  Phone
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
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="size-3" />
            Aprobado
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
            Rechazado
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
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Gestionar Hosts</h1>
            <p className="text-zinc-600">Aprobar o rechazar solicitudes de hosts</p>
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
            <div className="text-sm text-zinc-500 mb-1">Aprobados</div>
            <div className="text-2xl font-bold text-emerald-600">{counts.approved}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-zinc-200">
            <div className="text-sm text-zinc-500 mb-1">Rechazados</div>
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
              placeholder="Buscar por nombre, email o DNI..."
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
                {status === "ALL" ? "Todos" : status === "PENDING" ? "Pendientes" : status === "APPROVED" ? "Aprobados" : "Rechazados"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredHosts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-zinc-200">
            <Users className="size-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-600">No se encontraron hosts</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Host</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Contacto</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Ubicación</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Experiencias</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-zinc-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredHosts.map((host) => (
                    <tr key={host.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {host.image ? (
                            <img
                              src={host.image}
                              alt={host.name}
                              className="size-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="size-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <Users className="size-5 text-indigo-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-zinc-900">{host.name}</div>
                            <div className="text-sm text-zinc-500 flex items-center gap-1">
                              <Mail className="size-3" />
                              {host.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {host.phone ? (
                          <div className="text-sm text-zinc-900 flex items-center gap-1">
                            <Phone className="size-3" />
                            {host.phone}
                          </div>
                        ) : (
                          <span className="text-sm text-zinc-400">No proporcionado</span>
                        )}
                        {host.dni && (
                          <div className="text-xs text-zinc-500 mt-1">DNI: {host.dni}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {host.city ? (
                          <div className="text-sm text-zinc-900">
                            {host.city}
                            {host.department && `, ${host.department}`}
                          </div>
                        ) : (
                          <span className="text-sm text-zinc-400">No especificada</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-zinc-900">
                          {host.experiencesCount || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(host.approvalStatus)}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-900">
                          {format(new Date(host.createdAt), "d MMM yyyy", { locale: es })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {host.approvalStatus === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(host.id)}
                                disabled={processingId === host.id}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Aprobar"
                              >
                                {processingId === host.id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="size-4" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedHost(host);
                                  setIsRejectModalOpen(true);
                                }}
                                disabled={processingId === host.id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Rechazar"
                              >
                                <XCircle className="size-4" />
                              </button>
                            </>
                          )}
                          {host.rejectionReason && (
                            <button
                              onClick={() => {
                                setSelectedHost(host);
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
      {isRejectModalOpen && selectedHost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900">Rechazar Host</h3>
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectionReason("");
                  setSelectedHost(null);
                }}
                className="p-1 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            <div>
              <p className="text-sm text-zinc-600 mb-2">
                Host: <span className="font-semibold">{selectedHost.name}</span>
              </p>
              {selectedHost.rejectionReason && (
                <div className="mb-4 p-3 bg-zinc-50 rounded-lg">
                  <p className="text-xs text-zinc-500 mb-1">Razón actual:</p>
                  <p className="text-sm text-zinc-900">{selectedHost.rejectionReason}</p>
                </div>
              )}
              <label className="block text-sm font-semibold text-zinc-900 mb-2">
                Razón de rechazo
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ingresa la razón por la cual rechazas este host..."
                className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectionReason("");
                  setSelectedHost(null);
                }}
                className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processingId === selectedHost.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === selectedHost.id ? (
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
