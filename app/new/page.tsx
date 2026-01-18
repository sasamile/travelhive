"use client";

import { useState } from "react";
import { Eye, Cloud, Send, ChevronRight, Tent } from "lucide-react";
import StepperSidebar from "@/components/agent/new/StepperSidebar";
import BasicInfoStep from "@/components/agent/new/BasicInfoStep";
import ItineraryStep from "@/components/agent/new/ItineraryStep";
import PricingStep from "@/components/agent/new/PricingStep";
import TermsStep from "@/components/agent/new/TermsStep";
import GalleryStep from "@/components/agent/new/GalleryStep";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = ["basic", "itinerary", "pricing", "terms", "gallery"];
const stepLabels = {
  basic: "Basic Info",
  itinerary: "Trip Planning",
  pricing: "Pricing & Tiers",
  terms: "Terms & Conditions",
  gallery: "Media Gallery",
};

export default function NewTripPage() {
  const [currentStep, setCurrentStep] = useState("basic");

  // Calcular porcentaje de completitud basado en el paso actual
  const getCompletion = () => {
    const stepIndex = steps.indexOf(currentStep);
    return Math.round(((stepIndex + 1) / steps.length) * 100);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "basic":
        return <BasicInfoStep />;
      case "itinerary":
        return <ItineraryStep />;
      case "pricing":
        return <PricingStep />;
      case "terms":
        return <TermsStep />;
      case "gallery":
        return <GalleryStep />;
      default:
        return <BasicInfoStep />;
    }
  };

  const getNextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      return steps[currentIndex + 1];
    }
    return null;
  };

  const handleNext = () => {
    const next = getNextStep();
    if (next) {
      setCurrentStep(next);
    }
  };

  return (
    <div className="bg-white text-slate-900 font-sans antialiased overflow-hidden h-screen">
      <header className="h-14 flex items-center justify-between border-b border-neutral-100 px-6 bg-white/80 backdrop-blur-md z-50">
      <Link href="/agent">
          <div className="font-caveat text-2xl font-bold flex items-center gap-2">
            <Tent className="h-5 w-5" />
            TravelHive
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-neutral-100 pr-4">
            <button className="p-2 text-slate-500 hover:bg-neutral-50 rounded-full transition-colors">
              <Eye className="size-4" />
            </button>
          </div>
          <Button className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white transition-all bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95">
            Publish Trip
            <Send className="size-4" />
          </Button>
        </div>
      </header>
      <main className="flex h-[calc(100vh-56px)] overflow-hidden">
        <StepperSidebar currentStep={currentStep} onStepChange={setCurrentStep} completion={getCompletion()} />
        <section className="flex-1 bg-white overflow-y-auto">
          {renderStepContent()}
          {currentStep === "basic" && (
            <div className="max-w-4xl mx-auto px-12 pb-12">
              <div className="pt-8 flex items-center justify-end gap-4 border-t border-neutral-100">
                <button className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors" type="button">
                  Save Draft
                </button>
                <button
                  onClick={handleNext}
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                  type="button"
                >
                  Next: {stepLabels[getNextStep() as keyof typeof stepLabels]}
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
