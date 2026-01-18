"use client";

import { Plus } from "lucide-react";

export default function ItineraryStep() {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
      <div className="px-8 py-6 flex justify-between items-center border-b border-neutral-100 bg-white/90 backdrop-blur sticky top-0 z-20">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Itinerary Narrative</h2>
          <p className="text-sm text-slate-500">Sequence the adventure and define key points.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-neutral-50 rounded-lg border border-neutral-200 transition-colors">
          <Plus className="size-4" />
          Add Day
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 itinerary-line relative">
        <style jsx>{`
          .itinerary-line::before {
            content: '';
            position: absolute;
            left: 20px;
            top: 60px;
            bottom: 0;
            width: 1px;
            background: #e2e8f0;
          }
        `}</style>
        <div className="relative mb-16 pl-14">
          <div className="absolute left-0 top-0 size-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center z-10 shadow-sm">
            <span className="font-caveat text-xl font-bold text-indigo-600">01</span>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-caveat text-3xl text-slate-900">Arrival in Punta Arenas</h3>
                <p className="text-sm font-medium text-slate-400">Gateway to Antarctica</p>
              </div>
              <button className="text-slate-300 hover:text-slate-600">⋯</button>
            </div>
            <div className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group">
              <div className="flex gap-4">
                <div className="w-28 h-28 rounded-xl overflow-hidden shrink-0 border border-neutral-50">
                  <img
                    alt="Hotel"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt4KjPiv3tmVE6vtuBynqB-CdIXK-nvyoQhqBlsX0UFaGkqVkupL4WYw4OCFHyXG9DCu9Jd_bsPc3Mw567N6JmOMdjV5UoxKIW7trLakB6_5dT1aiOfTDhcY8RyvepWCsAVmlUYpRshv1ldGdLZLpMKLgl6-JgzzlR5lKJR655kLQ0bvE-Gkqbot5PYMVE0GrHzI-vGTSjLb7TH_AmPkIspR8bJWLhWvXU0FWCZ9-2jr7p62AD3lIXtEdDwtlgTnITa_HIo4y6CW0"
                  />
                </div>
                <div className="flex-1 py-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 uppercase tracking-tight">Accommodation</span>
                      <span className="text-xs text-slate-400">14:00</span>
                    </div>
                    <h4 className="font-bold text-slate-900">Hotel Cabo de Hornos</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      Historic landmark facing the main square, recently renovated with contemporary Patagonian style.
                    </p>
                  </div>
                  <div className="flex gap-4 mt-3">
                    <button className="text-[11px] font-bold flex items-center gap-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                      📍 LINK POI
                    </button>
                    <button className="text-[11px] font-bold flex items-center gap-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                      🖼️ MEDIA
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full py-4 border-2 border-dashed border-neutral-100 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-indigo-100 hover:bg-indigo-50/30 hover:text-indigo-500 transition-all text-sm font-medium">
              <Plus className="size-4" />
              Add activity to Day 01
            </button>
          </div>
        </div>
        <div className="relative mb-16 pl-14">
          <div className="absolute left-0 top-0 size-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center z-10 shadow-sm">
            <span className="font-caveat text-xl font-bold text-slate-400">02</span>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="font-caveat text-3xl text-slate-900">Torres del Paine Transit</h3>
              <p className="text-sm font-medium text-slate-400">The Great Southern Road</p>
            </div>
            <div className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-neutral-50 flex items-center justify-center">
                  🚌
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Private Overland Transfer</h4>
                  <p className="text-xs text-slate-500">5 hours through the pampas</p>
                </div>
              </div>
              <span className="text-slate-200">⋮⋮</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
