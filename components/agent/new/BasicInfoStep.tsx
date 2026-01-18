"use client";

import { Info } from "lucide-react";

export default function BasicInfoStep() {
  return (
    <div className="max-w-4xl mx-auto px-12 py-12">
      <div className="mb-10">
        <h2 className="font-caveat text-5xl text-indigo-600 mb-2">Basic Info</h2>
        <p className="text-slate-500">
          Let's start with the core details of your expedition. This information will be displayed as the main header of your trip page.
        </p>
      </div>
      <form className="space-y-10">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 block">Trip Title</label>
          <input
            className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
            placeholder="e.g., Patagonia: The Last Frontier"
            type="text"
          />
          <p className="text-xs text-slate-400 italic">Try to make it evocative and descriptive.</p>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">Category</label>
            <div className="relative">
              <select className="w-full h-11 px-4 border border-neutral-200 rounded-xl text-sm appearance-none bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                <option>Adventure</option>
                <option>Luxury</option>
                <option>Cultural</option>
                <option>Wellness</option>
                <option>Wildlife</option>
              </select>
              <span className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">⌄</span>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">Duration</label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  className="w-full h-11 px-4 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Days"
                  type="number"
                />
                <span className="absolute right-3 top-3 text-[10px] font-bold text-slate-400 uppercase">Days</span>
              </div>
              <div className="relative flex-1">
                <input
                  className="w-full h-11 px-4 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Nights"
                  type="number"
                />
                <span className="absolute right-3 top-3 text-[10px] font-bold text-slate-400 uppercase">Nights</span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 block">Primary Destination</label>
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-2 space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">📍</span>
                <input
                  className="w-full h-11 pl-10 pr-4 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Search destination..."
                  type="text"
                />
              </div>
              <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Region</span>
                  <button className="text-[10px] font-bold text-indigo-600 hover:underline">CLEAR</button>
                </div>
                <p className="text-sm font-medium text-slate-700">Magallanes, Chilean Patagonia</p>
              </div>
            </div>
            <div className="col-span-3 h-48 rounded-2xl border border-neutral-100 overflow-hidden relative shadow-inner bg-slate-50">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="size-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg ring-4 ring-indigo-500/20"></div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white px-2 py-1 rounded border border-neutral-200 shadow-sm whitespace-nowrap text-[10px] font-bold">PIN DROPPED</div>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                <button className="size-7 bg-white/90 backdrop-blur rounded shadow-sm border border-neutral-200 flex items-center justify-center hover:bg-white">+</button>
                <button className="size-7 bg-white/90 backdrop-blur rounded shadow-sm border border-neutral-200 flex items-center justify-center hover:bg-white">−</button>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 block">Trip Description</label>
          <textarea
            className="w-full p-4 border border-neutral-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
            placeholder="Describe the soul of this journey..."
            rows={6}
          ></textarea>
          <div className="flex justify-between items-center px-1">
            <div className="flex gap-2">
              <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" type="button">
                <strong>B</strong>
              </button>
              <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" type="button">
                <em>I</em>
              </button>
              <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" type="button">
                •
              </button>
            </div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Recommended: 300-500 words</span>
          </div>
        </div>
      </form>
    </div>
  );
}
