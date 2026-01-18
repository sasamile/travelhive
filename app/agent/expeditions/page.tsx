"use client";

import { useState } from "react";
import {
  Settings,
  Plus,
  MoreVertical,
  ArrowRight,
  Sparkles,
  Megaphone,
  Copy,
} from "lucide-react";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { cn } from "@/lib/utils";

const expeditions = [
  {
    id: 1,
    title: "Patagonia Ridge Expedition",
    location: "Torres del Paine, Chile",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNQlZmNlXCoFYCgxaIwkGQDHG3WkSJUgO3nqGqLWQQy6dv7vUSPfardBI3SUSoxy28DTa_PVctA6EZYLVy5RHHMjXl3dEL8QvA8Po62oFIuBU_T9x8Km_ME6l0I5GoGHTnPfZ47OVHVeXsyvGw1sRGIgPTeIxi_1DTSRSJrQvqHX9rQg4p9wfZUuFuhLPNb-kZdRRYPU-ZqENaGCoAT-LHhW2XnmHIQ7rreBjMcxDrfxf9tP_JCG5t2Pay6qprLArc3u4hSgLQLVU",
    dates: "Nov 12 — Nov 24",
    duration: "12 Days",
    occupancy: { current: 11, total: 12, percentage: 92 },
    revenue: "$42,850.00",
    status: "ACTIVA",
    statusColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    id: 2,
    title: "Aegean Blue Voyage",
    location: "Cyclades, Greece",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcuB5ZWUWZ9QRR-VdvxM8X9CX-U8aDygjxyLlPILJLy8jba2JektMROw2tyg772fJigQfaVgIeq8nLm5eZKfUGw3yKTDPZXXENWtgRGWz6kbaFsM5DygUXBO-yPsHstmXjOPRG7R9IsNwyYm623obNuetABezndK-sWOuLc3rtueW_qm5D6AINlQNn5JzcQokEGH7LLiS7TKARquYqfRWkNIRnvC_pmVkuBFG5Z6Sb4hXHQgvpxHa3xm3edrz7pFAHv0kvMpjdESM",
    dates: "Dec 01 — Dec 08",
    duration: "7 Days",
    occupancy: { current: 9, total: 20, percentage: 45 },
    revenue: "$18,400.00",
    status: "PROGRAMADA",
    statusColor: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  {
    id: 3,
    title: "Kyoto Zen Retreat",
    location: "Kyoto, Japan",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHxLALOFeeGZm357ljJjXiwXeXHl7QlbJfA7FKyLUzi1Ic6ECciGZonYda5t3VR_nm4islhPQlFStIQvdWbRe9C_Dm2H98t7-tvy0nHsah0MWT1zWtMheCZQEsBT3gzTkJCZZjllOk4_dly2Et6jtDHTiZkxZT6Rpo6fRH1SHaiDz_BxuAqW6FRKuKTwyXB5vKYHfuwrkLcOytrUwbiR_xZJJf5Q03pZjetRf6bN-5UG6weC3qYBEv2tZX-mwvQwfVTMF4NAQaGBA",
    dates: "Jan 12 — Jan 18",
    duration: "6 Days",
    occupancy: { current: 8, total: 8, percentage: 100 },
    revenue: "$24,200.00",
    status: "LISTA DE ESPERA",
    statusColor: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    id: 4,
    title: "Dolomites Adventure",
    location: "South Tyrol, Italy",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbg8x_hoD7hxwCgUFuEu_AmifqxQ27eWbZNviSzWl5thkNaCqKapslti4LsMqcsi-yMQqO8D8jykwd4OsKwWpCc4hrxCgk-xy1R52YO9h520f7KW8teP07YWKeB9jW_dEVMabfNFK39nN5ygj0KocXhJ1ZCTbotxSTtubKOkADZ5WaFHHiam-BBjoQ0SlCn2dVqjQfzuigE76bPHI3igtcow534CY5VpWzJh9r9bbxeteU8yQp-zu9HzWnbp2xX3_8F6NUur2qoWo",
    dates: "Feb 04 — Feb 11",
    duration: "7 Days",
    occupancy: { current: 14, total: 15, percentage: 93 },
    revenue: "$57,300.00",
    status: "ACTIVA",
    statusColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
];

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
  const [activeTab, setActiveTab] = useState("active");

  return (
    <main className="flex flex-col min-h-screen">
      <AgentHeader
        titleWithSearch
        showSearch
        searchPlaceholder="Buscar expediciones..."
        searchWidth="w-72"
        actions={
          <>
            <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
              <Settings className="size-5" />
            </button>
            <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm">
              <Plus className="size-4" />
              Crear Expedición
            </button>
          </>
        }
      />

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
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
              Activas <span className="ml-1 text-zinc-400 font-normal">14</span>
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
              Borradores <span className="ml-1 text-zinc-400 font-normal">3</span>
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
              Completadas <span className="ml-1 text-zinc-400 font-normal">82</span>
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
              Archivadas <span className="ml-1 text-zinc-400 font-normal">12</span>
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
                {expeditions.map((expedition) => (
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
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border", expedition.statusColor)}>
                        {expedition.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-zinc-400 hover:text-indigo-600 transition-colors">
                        <MoreVertical className="size-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Mostrando 4 de 14 expediciones activas</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors disabled:opacity-50" disabled>
                  Anterior
                </button>
                <button className="px-3 py-1 text-xs border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors">Siguiente</button>
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
