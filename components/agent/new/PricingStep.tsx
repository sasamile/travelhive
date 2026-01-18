"use client";

import { Plus, MoreHorizontal } from "lucide-react";

export default function PricingStep() {
  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-caveat text-5xl text-slate-900 mb-2">Pricing & Tiers</h2>
            <p className="text-slate-500">Define your pricing strategy and package inclusions.</p>
          </div>
          <button className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-full shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            <Plus className="size-4" />
            Add Tier
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="tier-card bg-white border border-neutral-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            <style jsx>{`
              .tier-card {
                transition: all 0.3s ease;
              }
              .tier-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05);
              }
            `}</style>
            <div className="absolute top-0 right-0 p-4">
              <button className="text-slate-300 hover:text-slate-600">
                <MoreHorizontal className="size-5" />
              </button>
            </div>
            <div className="mb-8">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 uppercase tracking-wider mb-4 inline-block">Promotional</span>
              <input
                className="w-full text-2xl font-bold text-slate-900 border-none p-0 focus:ring-0 placeholder:text-slate-300"
                placeholder="Tier Name"
                type="text"
                defaultValue="Early Bird"
              />
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input
                      className="w-full pl-7 border-neutral-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      type="number"
                      defaultValue="2950"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Currency</label>
                  <select className="w-full border-neutral-200 rounded-xl text-sm focus:ring-indigo-500">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Maximum Seats</label>
                <input
                  className="w-full border-neutral-200 rounded-xl text-sm focus:ring-indigo-500"
                  type="number"
                  defaultValue="6"
                />
              </div>
              <div className="pt-6 border-t border-neutral-50">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">What's Included</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-500 text-lg">✓</span>
                    <input
                      className="flex-1 border-none p-0 text-sm text-slate-600 focus:ring-0"
                      type="text"
                      defaultValue="All boutique accommodation"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-500 text-lg">✓</span>
                    <input
                      className="flex-1 border-none p-0 text-sm text-slate-600 focus:ring-0"
                      type="text"
                      defaultValue="Breakfast and daily snacks"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-500 text-lg">✓</span>
                    <input
                      className="flex-1 border-none p-0 text-sm text-slate-600 focus:ring-0"
                      type="text"
                      defaultValue="Private airport transfers"
                    />
                  </div>
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2">
                    <Plus className="size-3" />
                    Add Inclusion
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="tier-card bg-white border border-neutral-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <button className="text-slate-300 hover:text-slate-600">
                <MoreHorizontal className="size-5" />
              </button>
            </div>
            <div className="mb-8">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-wider mb-4 inline-block">Popular Choice</span>
              <input
                className="w-full text-2xl font-bold text-slate-900 border-none p-0 focus:ring-0 placeholder:text-slate-300"
                placeholder="Tier Name"
                type="text"
                defaultValue="Standard Expedition"
              />
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input
                      className="w-full pl-7 border-neutral-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      type="number"
                      defaultValue="3450"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Currency</label>
                  <select className="w-full border-neutral-200 rounded-xl text-sm focus:ring-indigo-500">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Maximum Seats</label>
                <input
                  className="w-full border-neutral-200 rounded-xl text-sm focus:ring-indigo-500"
                  type="number"
                  defaultValue="12"
                />
              </div>
              <div className="pt-6 border-t border-neutral-50">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">What's Included</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-500 text-lg">✓</span>
                    <input
                      className="flex-1 border-none p-0 text-sm text-slate-600 focus:ring-0"
                      type="text"
                      defaultValue="All boutique accommodation"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-500 text-lg">✓</span>
                    <input
                      className="flex-1 border-none p-0 text-sm text-slate-600 focus:ring-0"
                      type="text"
                      defaultValue="Full board (all meals)"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-500 text-lg">✓</span>
                    <input
                      className="flex-1 border-none p-0 text-sm text-slate-600 focus:ring-0"
                      type="text"
                      defaultValue="Professional trekking guides"
                    />
                  </div>
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2">
                    <Plus className="size-3" />
                    Add Inclusion
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button className="border-2 border-dashed border-neutral-100 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all group min-h-[400px]">
            <div className="size-14 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <Plus className="size-6 text-slate-300 group-hover:text-indigo-500" />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-400 group-hover:text-indigo-600">Create Custom Tier</p>
              <p className="text-xs text-slate-400 mt-1">E.g. VIP, Luxury, or Last Minute</p>
            </div>
          </button>
        </div>
        <div className="mt-16 p-8 bg-slate-950 rounded-[2rem] text-white flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center">
              ⭐
            </div>
            <div>
              <h4 className="font-bold text-lg">Smart Pricing Assistant</h4>
              <p className="text-sm text-slate-400">Based on Patagonia's demand, we suggest a price between $3,200 – $3,800.</p>
            </div>
          </div>
          <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-sm font-bold transition-all">
            Apply Suggestion
          </button>
        </div>
      </div>
    </div>
  );
}
