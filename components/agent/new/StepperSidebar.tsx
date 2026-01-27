"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Tag, Image, HelpCircle, ChevronRight, Sparkles, X, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

type Step = {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  guide: {
    title: string;
    tips: string[];
  };
};

const steps: Step[] = [
  { 
    id: "basic", 
    label: "Información Básica", 
    shortLabel: "Información Básica",
    icon: Info,
    guide: {
      title: "Información Básica",
      tips: [
        "Completa el título de forma evocativa y descriptiva",
        "Selecciona la ciudad principal del viaje",
        "Define las fechas y duración con precisión",
        "Establece el precio y número máximo de personas",
        "Elige la categoría que mejor describa tu viaje"
      ]
    }
  },
  { 
    id: "itinerary", 
    label: "Planificación del Viaje", 
    shortLabel: "Planificación",
    icon: Tag,
    guide: {
      title: "Planificación del Viaje",
      tips: [
        "Agrega al menos un día al itinerario",
        "Incluye actividades detalladas con horarios",
        "Marca puntos de interés en el mapa",
        "Describe cada actividad de forma clara",
        "Organiza las actividades por orden cronológico"
      ]
    }
  },
  { 
    id: "gallery", 
    label: "Galería de Medios", 
    shortLabel: "Galería",
    icon: Image,
    guide: {
      title: "Galería de Medios",
      tips: [
        "Sube al menos 3 imágenes de alta calidad",
        "Selecciona una imagen de portada atractiva",
        "Incluye fotos de los lugares principales",
        "Asegúrate de que las imágenes sean claras",
        "Las imágenes ayudan a vender tu viaje"
      ]
    }
  },
];

interface StepperSidebarProps {
  currentStep: string;
  onStepChange: (step: string) => void;
  completion: number;
  isMobile?: boolean;
  isEditing?: boolean;
}

export default function StepperSidebar({ currentStep, onStepChange, completion, isMobile = false, isEditing = false }: StepperSidebarProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [guideOpen, setGuideOpen] = useState(false);

  const currentStepData = steps.find(s => s.id === currentStep);

  // Animación de la barra de progreso
  useEffect(() => {
    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, {
        width: `${completion}%`,
        duration: 0.6,
        ease: "power2.out"
      });
    }
  }, [completion]);

  // Animación de los pasos cuando cambian
  useEffect(() => {
    const activeIndex = steps.findIndex(s => s.id === currentStep);
    stepRefs.current.forEach((ref, idx) => {
      if (ref) {
        if (idx === activeIndex) {
          gsap.to(ref, {
            scale: 1.02,
            duration: 0.3,
            ease: "back.out(1.7)"
          });
        } else {
          gsap.to(ref, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          });
        }
      }
    });
  }, [currentStep]);

  if (isMobile) {
    // Versión móvil: horizontal tabs
    return (
      <div className="px-4 py-3 border-b border-neutral-100 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="font-caveat text-base font-bold flex items-center gap-2 text-slate-800">
            <Sparkles className="h-3.5 w-3.5 text-slate-600" />
            <span>{isEditing ? "Editar Expedición" : "Nuevo Viaje"}</span>
          </div>
          <span className="text-xs font-bold text-slate-600">{completion}%</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => onStepChange(step.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{step.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <aside className="w-full border-r border-neutral-100 bg-white flex flex-col">
      <div className="px-4 py-4 border-b border-neutral-100">
        <div className="font-caveat text-lg font-bold flex items-center gap-2 text-slate-800">
          <Sparkles className="h-4 w-4 text-slate-600" />
          <span>{isEditing ? "Editar Expedición" : "Nuevo Viaje"}</span>
        </div>
      </div>
      <div className="px-4 py-6 space-y-6 flex-1">
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Progreso
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-medium text-slate-600">Completitud</span>
              <span className="text-[10px] font-bold text-slate-700">
                {completion}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div 
                ref={progressBarRef}
                className="h-full bg-slate-600 rounded-full transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>
        <nav className="space-y-1.5">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const stepIndex = steps.findIndex(s => s.id === step.id);
            const isCompleted = stepIndex < steps.findIndex(s => s.id === currentStep);
            
            return (
              <button
                key={step.id}
                ref={el => { stepRefs.current[index] = el; }}
                data-step={step.id}
                onClick={() => onStepChange(step.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group whitespace-nowrap",
                  isActive
                    ? "bg-slate-100 text-slate-900 border border-slate-200"
                    : isCompleted
                    ? "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    : "text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                )}
              >
                <div className="flex items-center gap-2.5 relative z-10 min-w-0 flex-1">
                  <div className={cn(
                    "p-1.5 rounded-md transition-all shrink-0",
                    isActive 
                      ? "bg-slate-200 text-slate-700" 
                      : isCompleted
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-100 text-slate-400"
                  )}>
                    <Icon className="text-sm" />
                  </div>
                  <span className={cn(
                    "text-xs transition-all font-medium truncate",
                    isActive ? "font-semibold" : ""
                  )}>
                    {step.shortLabel}
                  </span>
                </div>
                {!isActive && (
                  <ChevronRight className={cn(
                    "text-xs transition-all relative z-10 shrink-0 ml-2",
                    isCompleted ? "text-emerald-500" : "text-slate-400 opacity-0 group-hover:opacity-100"
                  )} />
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-3 border-t border-neutral-100">
        <Popover open={guideOpen} onOpenChange={setGuideOpen}>
          <PopoverTrigger asChild>
            <button className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-2.5 group">
              <div className="size-6 rounded-md bg-white flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                <Lightbulb className="text-slate-600 text-xs" />
              </div>
              <span className="text-xs font-medium text-slate-700">Guía Rápida</span>
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[calc(100vw-2rem)] sm:w-64 p-3 z-200 bg-white border border-slate-200 shadow-lg max-h-[50vh] overflow-y-auto" 
            align="start" 
            side="bottom" 
            sideOffset={8}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-slate-200">
                <h4 className="text-xs font-semibold text-slate-800">
                  {currentStepData?.guide.title}
                </h4>
                <button
                  onClick={() => setGuideOpen(false)}
                  className="p-0.5 hover:bg-slate-100 rounded transition-colors -mr-1"
                >
                  <X className="h-3 w-3 text-slate-400" />
                </button>
              </div>
              <div className="space-y-1.5">
                {currentStepData?.guide.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[10px] font-semibold text-slate-500 shrink-0 mt-0.5">•</span>
                    <p className="text-[10px] text-slate-600 leading-relaxed flex-1">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  );
}
