"use client";

import {
  ArrowRight,
  CalendarRange,
  Check,
  Lock,
  Minus,
  MoreVertical,
  Plus,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { AgentHeader } from "@/components/agent/AgentHeader";
import NewTripModal from "@/components/agent/NewTripModal";

function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="flex flex-col min-h-screen">
      <AgentHeader
        showSearch
        searchPlaceholder="Buscar viajes o análisis..."
        showNotifications
        actions={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <Plus className="size-4" />
            Crear Viaje
          </button>
        }
      />

          <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-caveat text-4xl font-bold text-zinc-900">
                  Bienvenido, Blackwood
                </h2>
                <p className="text-text-muted mt-1">
                  Esto es lo que está sucediendo con tus expediciones hoy.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-shadcn border border-border-muted">
                <CalendarRange className="size-4" aria-hidden="true" />
                Oct 12 — Oct 18, 2023
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white border border-border-muted rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-caveat text-2xl font-bold">
                      Comenzando
                    </h3>
                    <p className="text-xs text-text-muted">
                      Completa estos pasos para desbloquear el acceso completo a las funciones
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-caveat text-2xl text-primary font-bold">
                      75%
                    </span>
                    <p className="text-[10px] text-text-muted uppercase tracking-tighter">
                      Progreso
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-zinc-100 -z-10 hidden md:block"></div>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                      <Check className="size-4" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium">Perfil</span>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                      <Check className="size-4" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium">Fotos</span>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                      <Check className="size-4" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium">Primer Viaje</span>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="size-8 rounded-full bg-white border-2 border-dashed border-zinc-200 text-zinc-300 flex items-center justify-center">
                      <Lock className="size-4" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium text-zinc-400">
                      Pagos
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 border border-border-muted rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="size-5 text-primary" aria-hidden="true" />
                    <h3 className="font-caveat text-xl font-bold">
                      Resumen Rápido
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-600">
                    Tienes <span className="font-bold text-zinc-900">12 nuevas reservas</span> esta semana.
                    Tu experiencia más popular es Patagonia Ridge con{" "}
                    <span className="font-bold text-zinc-900">47 reservas</span> este mes.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border-muted">
                  <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    Ver detalles{" "}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-border-muted p-6 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-medium text-text-muted">
                      Ingresos Totales
                    </p>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold">
                    +12.4%
                  </span>
                </div>
                <h4 className="text-2xl font-semibold tracking-tight">
                  $142.850.00
                </h4>
                    <p className="text-[10px] text-text-muted mt-4">
                      vs. $127.100,00 el mes pasado
                    </p>
              </div>
              <div className="bg-white border border-border-muted p-6 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-medium text-text-muted">
                      Reservas del Mes
                    </p>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">
                    +18%
                  </span>
                </div>
                <h4 className="text-2xl font-semibold tracking-tight">127</h4>
                    <p className="text-[10px] text-text-muted mt-4">
                      vs. 108 reservas el mes pasado
                    </p>
              </div>
              <div className="bg-white border border-border-muted p-6 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-medium text-text-muted">
                      Calificación Promedio
                    </p>
                  <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold">
                    Excelente
                  </span>
                </div>
                <h4 className="text-2xl font-semibold tracking-tight">
                  4.8
                </h4>
                    <p className="text-[10px] text-text-muted mt-4">
                      Basado en 234 reseñas
                    </p>
              </div>
            </div>

            <div className="grid grid-cols-1  gap-8">
              <div className="xl:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-caveat text-2xl font-bold">
                    Expediciones Activas
                  </h3>
                  <button className="text-zinc-500 text-xs font-medium hover:text-zinc-900">
                    Ver Todas
                  </button>
                </div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="p-4 bg-white border border-border-muted rounded-xl hover:border-zinc-300 transition-all cursor-pointer group shadow-sm">
                    <div className="flex gap-4">
                      <div
                        className="size-16 rounded-lg bg-zinc-100 bg-cover bg-center shrink-0"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCNQlZmNlXCoFYCgxaIwkGQDHG3WkSJUgO3nqGqLWQQy6dv7vUSPfardBI3SUSoxy28DTa_PVctA6EZYLVy5RHHMjXl3dEL8QvA8Po62oFIuBU_T9x8Km_ME6l0I5GoGHTnPfZ47OVHVeXsyvGw1sRGIgPTeIxi_1DTSRSJrQvqHX9rQg4p9wfZUuFuhLPNb-kZdRRYPU-ZqENaGCoAT-LHhW2XnmHIQ7rreBjMcxDrfxf9tP_JCG5t2Pay6qprLArc3u4hSgLQLVU')",
                        }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h5 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                            Patagonia Ridge Expedition
                          </h5>
                          <span className="text-[10px] font-bold text-emerald-600">
                            ACTIVO
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                          Torres del Paine, Chile
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex -space-x-1.5">
                            <div className="size-5 rounded-full border border-white bg-zinc-200"></div>
                            <div className="size-5 rounded-full border border-white bg-zinc-300"></div>
                            <div className="size-5 rounded-full border border-white bg-zinc-400"></div>
                          </div>
                          <span className="text-[10px] font-medium text-zinc-500">
                            92% Reservado
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-border-muted rounded-xl hover:border-zinc-300 transition-all cursor-pointer group shadow-sm">
                    <div className="flex gap-4">
                      <div
                        className="size-16 rounded-lg bg-zinc-100 bg-cover bg-center shrink-0"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAcuB5ZWUWZ9QRR-VdvxM8X9CX-U8aDygjxyLlPILJLy8jba2JektMROw2tyg772fJigQfaVgIeq8nLm5eZKfUGw3yKTDPZXXENWtgRGWz6kbaFsM5DygUXBO-yPsHstmXjOPRG7R9IsNwyYm623obNuetABezndK-sWOuLc3rtueW_qm5D6AINlQNn5JzcQokEGH7LLiS7TKARquYqfRWkNIRnvC_pmVkuBFG5Z6Sb4hXHQgvpxHa3xm3edrz7pFAHv0kvMpjdESM')",
                        }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h5 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                            Aegean Blue Voyage
                          </h5>
                          <span className="text-[10px] font-bold text-primary">
                            PROGRAMADO
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                          Cyclades, Greece
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex -space-x-1.5">
                            <div className="size-5 rounded-full border border-white bg-zinc-200"></div>
                            <div className="size-5 rounded-full border border-white bg-zinc-300"></div>
                          </div>
                          <span className="text-[10px] font-medium text-zinc-500">
                            45% Reservado
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-border-muted rounded-xl hover:border-zinc-300 transition-all cursor-pointer group shadow-sm">
                    <div className="flex gap-4">
                      <div
                        className="size-16 rounded-lg bg-zinc-100 bg-cover bg-center shrink-0"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBHxLALOFeeGZm357ljJjXiwXeXHl7QlbJfA7FKyLUzi1Ic6ECciGZonYda5t3VR_nm4islhPQlFStIQvdWbRe9C_Dm2H98t7-tvy0nHsah0MWT1zWtMheCZQEsBT3gzTkJCZZjllOk4_dly2Et6jtDHTiZkxZT6Rpo6fRH1SHaiDz_BxuAqW6FRKuKTwyXB5vKYHfuwrkLcOytrUwbiR_xZJJf5Q03pZjetRf6bN-5UG6weC3qYBEv2tZX-mwvQwfVTMF4NAQaGBA')",
                        }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h5 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                            Kyoto Zen Retreat
                          </h5>
                          <span className="text-[10px] font-bold text-amber-600">
                            LISTA DE ESPERA
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                          Kyoto, Japan
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex -space-x-1.5">
                            <div className="size-5 rounded-full border border-white bg-zinc-200"></div>
                            <div className="size-5 rounded-full border border-white bg-zinc-300"></div>
                            <div className="size-5 rounded-full border border-white bg-zinc-400"></div>
                          </div>
                          <span className="text-[10px] font-medium text-zinc-500">
                            100% Completo
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

      {/* Modal de creación de viaje */}
      <NewTripModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}

export default Page;
