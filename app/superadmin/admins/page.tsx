"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  Plus,
  Loader2,
  CheckCircle2,
  X,
  Mail,
  User,
  Lock,
  Search,
  Edit,
  Delete,
  Info
} from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SuperAdmin {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

export default function SuperAdminsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<SuperAdmin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      // Aquí deberías tener un endpoint para obtener los super admins
      // Por ahora, simulamos con datos vacíos
      setAdmins([]);
    } catch (error: any) {
      console.error("Error al cargar admins:", error);
      toast.error(error.response?.data?.message || "Error al cargar los administradores");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/admin/super-admin", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      toast.success("Super administrador creado exitosamente");
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "" });
      loadAdmins();
    } catch (error: any) {
      console.error("Error al crear super admin:", error);
      toast.error(error.response?.data?.message || "Error al crear el super administrador");
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-5xl font-caveat text-slate-900 dark:text-white mb-2">Super Administradores</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Gestiona los super administradores del sistema con privilegios elevados.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-indigo-600 hover:bg-indigo-600/90 text-white px-6 py-3.5 rounded-full shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-1 active:scale-95"
          >
            <Plus className="size-5 mr-2" />
            <span className="font-semibold">Crear Super Admin</span>
          </button>
        </header>

        {/* Info Card */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl p-8 shadow-sm">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl"></div>
          <div className="relative flex items-start gap-6">
            <div className="shrink-0 bg-indigo-100 dark:bg-indigo-900/40 p-4 rounded-2xl text-indigo-600">
              <Info className="size-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-4">Información Importante</h3>
              <div className="grid md:grid-cols-2 gap-y-4 gap-x-12">
                <div className="flex items-start">
                  <CheckCircle2 className="size-5 text-indigo-600 mr-3 shrink-0 mt-1" />
                  <p className="text-slate-600 dark:text-slate-400">Solo los super administradores pueden crear otros super administradores.</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="size-5 text-indigo-600 mr-3 shrink-0 mt-1" />
                  <p className="text-slate-600 dark:text-slate-400">Los super administradores tienen acceso completo al sistema.</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="size-5 text-indigo-600 mr-3 shrink-0 mt-1" />
                  <p className="text-slate-600 dark:text-slate-400">Pueden aprobar o rechazar solicitudes de agencias y hosts.</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="size-5 text-indigo-600 mr-3 shrink-0 mt-1" />
                  <p className="text-slate-600 dark:text-slate-400">Tienen visibilidad total de todas las métricas y estadísticas del sistema.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">Administradores Activos</h4>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar administrador..."
                  className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 w-64 dark:text-white"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Administrador</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de Creación</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No hay administradores registrados aún
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold">
                            {admin.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{admin.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Root Access</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-600 dark:text-slate-400">{admin.email}</td>
                      <td className="px-6 py-5 text-slate-600 dark:text-slate-400">
                        {format(new Date(admin.createdAt), "d MMM yyyy", { locale: es })}
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">
                          Activo
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                            <Edit className="size-5" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <Delete className="size-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredAdmins.length > 0 && (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex justify-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Mostrando {filteredAdmins.length} administrador{filteredAdmins.length !== 1 ? 'es' : ''} del sistema
              </p>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="size-5 text-indigo-600" />
                  Crear Super Administrador
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({ name: "", email: "", password: "" });
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="size-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <User className="size-4" />
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre completo"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Mail className="size-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Lock className="size-4" />
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all"
                    required
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    La contraseña debe tener al menos 6 caracteres
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setFormData({ name: "", email: "", password: "" });
                    }}
                    className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" />
                        Crear
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
