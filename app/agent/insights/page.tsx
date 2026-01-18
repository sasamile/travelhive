"use client";

import {
  Calendar,
  Download,
  DollarSign,
  Users,
  MousePointerClick,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import { AgentHeader } from "@/components/agent/AgentHeader";

export default function InsightsPage() {
  return (
    <>
      <main className="flex flex-col min-h-screen">
        <AgentHeader
          title="Análisis e Insights de Negocio"
          rightContent={
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
                <Calendar className="size-4" />
                May 2023 — Oct 2023
              </div>
              <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
                <Download className="size-5" />
              </button>
            </div>
          }
        />

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="size-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <DollarSign className="size-5" />
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-bold">+8.2%</span>
              </div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Avg. Booking Value</p>
              <h4 className="text-3xl font-bold tracking-tight mt-1 group-hover:text-indigo-600 transition-colors">$1,240.50</h4>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 w-[70%]"></div>
                </div>
                <span className="text-[10px] text-zinc-500">70% target</span>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="size-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Users className="size-5" />
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-bold">+15.4%</span>
              </div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Customer LTV</p>
              <h4 className="text-3xl font-bold tracking-tight mt-1 group-hover:text-indigo-600 transition-colors">$4,820.00</h4>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 w-[85%]"></div>
                </div>
                <span className="text-[10px] text-zinc-500">85% retention</span>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="size-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <MousePointerClick className="size-5" />
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-1 rounded-full font-bold">Stable</span>
              </div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Conversion Rate</p>
              <h4 className="text-3xl font-bold tracking-tight mt-1 group-hover:text-indigo-600 transition-colors">4.28%</h4>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 w-[42%]"></div>
                </div>
                <span className="text-[10px] text-zinc-500">Top 10% Industry</span>
              </div>
            </div>
          </div>

          {/* Revenue Growth Chart */}
          <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-caveat text-3xl font-bold">Revenue Growth</h3>
                <p className="text-sm text-zinc-500">Monthly performance across all expeditions.</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-600"></span>
                  <span className="text-xs font-medium text-zinc-500">Current Year</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-zinc-200"></span>
                  <span className="text-xs font-medium text-zinc-500">Last Year</span>
                </div>
              </div>
            </div>
            <div className="h-72 w-full relative">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100">
                <defs>
                  <linearGradient id="indigoGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2"></stop>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M0,80 Q100,75 200,85 T400,70 T600,75 T800,60 T1000,65" fill="none" stroke="#E4E4E7" strokeDasharray="4" strokeWidth="2"></path>
                <path className="chart-gradient-indigo" d="M0,70 Q100,60 200,80 T400,50 T600,55 T800,30 T1000,40 L1000,100 L0,100 Z"></path>
                <path d="M0,70 Q100,60 200,80 T400,50 T600,55 T800,30 T1000,40" fill="none" stroke="#6366f1" strokeWidth="3"></path>
              </svg>
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-zinc-50 w-full h-px"></div>
                <div className="border-t border-zinc-50 w-full h-px"></div>
                <div className="border-t border-zinc-50 w-full h-px"></div>
                <div className="border-t border-zinc-50 w-full h-px"></div>
              </div>
            </div>
            <div className="flex justify-between mt-6 text-[11px] font-medium text-zinc-400 uppercase tracking-widest px-2">
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Performing Destinations */}
            <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-caveat text-3xl font-bold">Top Performing Destinations</h3>
                <span className="text-xs text-zinc-500">By Bookings</span>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Patagonia, Chile</span>
                    <span className="text-indigo-600 font-bold">142 Bookings</span>
                  </div>
                  <div className="h-2 bg-zinc-50 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: "95%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Kyoto, Japan</span>
                    <span className="text-indigo-600 font-bold">98 Bookings</span>
                  </div>
                  <div className="h-2 bg-zinc-50 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: "65%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Cyclades, Greece</span>
                    <span className="text-indigo-600 font-bold">84 Bookings</span>
                  </div>
                  <div className="h-2 bg-zinc-50 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: "55%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Swiss Alps, Switzerland</span>
                    <span className="text-indigo-600 font-bold">72 Bookings</span>
                  </div>
                  <div className="h-2 bg-zinc-50 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: "48%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Optimization Checklist */}
            <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
              <h3 className="font-caveat text-3xl font-bold mb-6">Optimization Checklist</h3>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-xl border border-zinc-50 bg-zinc-50/30">
                  <div className="shrink-0">
                    <CheckCircle2 className="size-5 text-indigo-600 font-bold" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold">Pricing Strategy Optimized</h5>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Dynamic pricing successfully applied to 80% of active expeditions based on demand surges.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl border border-zinc-50">
                  <div className="shrink-0">
                    <div className="size-5 rounded-full border-2 border-indigo-600/30 flex items-center justify-center">
                      <div className="size-1 bg-indigo-600 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold">Underperforming: Morocco Tour</h5>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Booking rate is 12% lower than average. Consider refreshing the gallery or launching a flash sale.</p>
                    <button className="text-[10px] font-bold text-indigo-600 mt-3 flex items-center gap-1 hover:text-indigo-700 transition-colors">
                      LAUNCH PROMO <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl border border-zinc-50">
                  <div className="shrink-0">
                    <Circle className="size-5 text-zinc-300" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-zinc-500">Email Campaign Retargeting</h5>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">240 users abandoned carts last week. Automate follow-up emails with a 5% discount code.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .chart-gradient-indigo {
          fill: url(#indigoGradient);
        }
      `}</style>
    </>
  );
}
