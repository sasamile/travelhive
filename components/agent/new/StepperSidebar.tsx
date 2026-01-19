"use client";

import { Info, Tag, DollarSign, Shield, Image, HelpCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const steps: Step[] = [
  { id: "basic", label: "Información Básica", icon: Info },
  { id: "itinerary", label: "Planificación del Viaje", icon: Tag },
  { id: "gallery", label: "Galería de Medios", icon: Image },
];

interface StepperSidebarProps {
  currentStep: string;
  onStepChange: (step: string) => void;
  completion: number;
}

export default function StepperSidebar({ currentStep, onStepChange, completion }: StepperSidebarProps) {
  return (
    <aside className="w-72 border-r border-neutral-100 bg-white flex flex-col">
      <div className="p-6 space-y-8">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Progreso del Borrador</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs font-medium text-slate-600">Completitud</span>
              <span className="text-xs font-bold text-indigo-600">{completion}%</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${completion}%` }}></div>
            </div>
          </div>
        </div>
        <nav className="space-y-1">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => onStepChange(step.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors group",
                  isActive
                    ? "bg-indigo-50/50 text-indigo-600 border border-indigo-100"
                    : "text-slate-500 hover:bg-neutral-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("text-lg", isActive && "text-indigo-600")} />
                  <span className={cn("text-sm", isActive ? "font-semibold" : "font-medium")}>{step.label}</span>
                </div>
                {!isActive && (
                  <ChevronRight className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-neutral-100">
        <div className="p-3 rounded-xl bg-neutral-50 flex items-center gap-3 border border-neutral-100">
          <div className="size-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
            <HelpCircle className="text-slate-400 text-lg" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">Guía de Creación</p>
            <p className="text-[10px] text-slate-500">¿Necesitas ayuda con esta sección?</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
