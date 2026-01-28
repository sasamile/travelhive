"use client";

import { useState } from "react";
import { 
  Shield, 
  Plus,
  Loader2,
  CheckCircle2,
  X,
  Mail,
  User,
  Lock
} from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

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
    } catch (error: any) {
      console.error("Error al crear super admin:", error);
      toast.error(error.response?.data?.message || "Error al crear el super administrador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Super Administradores</h1>
            <p className="text-zinc-600">Gestiona los super administradores del sistema</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Plus className="size-4" />
            Crear Super Admin
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Shield className="size-6 text-indigo-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                Información Importante
              </h3>
              <ul className="space-y-2 text-sm text-indigo-800">
                <li>• Solo los super administradores pueden crear otros super administradores</li>
                <li>• Los super administradores tienen acceso completo al sistema</li>
                <li>• Pueden aprobar/rechazar agencias y hosts</li>
                <li>• Pueden ver todas las métricas y estadísticas del sistema</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <Shield className="size-5 text-indigo-600" />
                  Crear Super Administrador
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({ name: "", email: "", password: "" });
                  }}
                  className="p-1 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-900 mb-2 flex items-center gap-2">
                    <User className="size-4" />
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre completo"
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-900 mb-2 flex items-center gap-2">
                    <Mail className="size-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-900 mb-2 flex items-center gap-2">
                    <Lock className="size-4" />
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    required
                  />
                  <p className="text-xs text-zinc-500 mt-1">
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
                    className="flex-1 px-4 py-3 border border-zinc-200 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
