import {
  ArrowRight,
  Bell,
  CalendarDays,
  CalendarRange,
  Check,
  Compass,
  LayoutGrid,
  LineChart,
  Lock,
  Minus,
  MoreVertical,
  Plus,
  Receipt,
  Search,
  Sparkles,
  Wallet,
} from "lucide-react";

function Page() {
  return (
    <div className="min-h-screen bg-white text-[#09090b] font-sans">
      <div className="flex min-h-screen bg-white">
        <aside className="w-64 border-r border-border-muted flex flex-col fixed h-full z-50 bg-white">
          <div className="px-6 h-20 flex items-center border-b border-border-muted">
            <div className="flex items-center gap-2">
              <LayoutGrid className="size-6 text-primary" aria-hidden="true" />
              <h1 className="font-caveat text-3xl font-bold tracking-tight">
                TravelHive
              </h1>
            </div>
          </div>
          <div className="flex-1 px-3 py-6 space-y-8">
            <div>
              <p className="px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                Management
              </p>
              <nav className="space-y-1">
                <a
                  className="flex items-center gap-3 px-3 py-2 rounded-shadcn sidebar-item-active"
                  href="#"
                >
                  <LayoutGrid className="size-4" aria-hidden="true" />
                  <span className="text-sm">Overview</span>
                </a>
                <a
                  className="flex items-center gap-3 px-3 py-2 rounded-shadcn text-text-muted hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                  href="#"
                >
                  <Compass className="size-4" aria-hidden="true" />
                  <span className="text-sm">Expeditions</span>
                </a>
                <a
                  className="flex items-center gap-3 px-3 py-2 rounded-shadcn text-text-muted hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                  href="#"
                >
                  <CalendarDays className="size-4" aria-hidden="true" />
                  <span className="text-sm">Bookings</span>
                </a>
                <a
                  className="flex items-center gap-3 px-3 py-2 rounded-shadcn text-text-muted hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                  href="#"
                >
                  <LineChart className="size-4" aria-hidden="true" />
                  <span className="text-sm">Insights</span>
                </a>
              </nav>
            </div>
            <div>
              <p className="px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                Finance
              </p>
              <nav className="space-y-1">
                <a
                  className="flex items-center gap-3 px-3 py-2 rounded-shadcn text-text-muted hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                  href="#"
                >
                  <Wallet className="size-4" aria-hidden="true" />
                  <span className="text-sm">Payouts</span>
                </a>
                <a
                  className="flex items-center gap-3 px-3 py-2 rounded-shadcn text-text-muted hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                  href="#"
                >
                  <Receipt className="size-4" aria-hidden="true" />
                  <span className="text-sm">Invoices</span>
                </a>
              </nav>
            </div>
          </div>
          <div className="p-4 border-t border-border-muted">
            <div className="flex items-center gap-3 px-2 py-2">
              <div
                className="size-8 rounded-full bg-zinc-100 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDVu4P17kGngFH4P-jDwrluD8ZL0_Z1SlOXIpaI9xejb4_C5Mokby2M0iFQbuoP9Q2O-nRAaWWgEyempidAkiPDyN6yp-V2-wsL5pK0eOkCrWtEsIItxay8shb6TjGrOb5G1h0TnhyFbEudyHG1W91PNZhWwlAzOWbkX_XqPOUhZPLx9Upu6--p9O4ZF8UjU1s1bJiQlQdCDA5buP3h_VgBGLxqmcOtCcc2F8SEvrRp3f7BTXw2XmspzDjJPf0TFNUBik_i77orcX4')",
                }}
              ></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">Blackwood Co.</p>
                <p className="text-[10px] text-text-muted truncate">
                  Premium Organizer
                </p>
              </div>
              <MoreVertical className="size-4 text-zinc-400" aria-hidden="true" />
            </div>
          </div>
        </aside>

        <main className="flex-1 ml-64 flex flex-col">
          <header className="h-20 border-b border-border-muted flex items-center justify-between px-8 sticky top-0 bg-white/80 backdrop-blur-sm z-40">
            <div className="relative w-96">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <input
                className="w-full pl-10 pr-4 py-2 text-sm border border-border-muted rounded-shadcn bg-zinc-50/50 focus:ring-0 focus:border-zinc-300 transition-all"
                placeholder="Search trips or analytics..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors relative">
                <Bell className="size-4" aria-hidden="true" />
                <span className="absolute top-2 right-2 size-1.5 bg-primary rounded-full"></span>
              </button>
              <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-shadcn text-sm font-medium hover:bg-zinc-800 transition-colors">
                <Plus className="size-4" aria-hidden="true" />
                Create Expedition
              </button>
            </div>
          </header>

          <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-caveat text-4xl font-bold text-zinc-900">
                  Welcome, Blackwood
                </h2>
                <p className="text-text-muted mt-1">
                  Here is what is happening with your expeditions today.
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
                      Getting Started
                    </h3>
                    <p className="text-xs text-text-muted">
                      Complete these steps to unlock full feature access
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-caveat text-2xl text-primary font-bold">
                      75%
                    </span>
                    <p className="text-[10px] text-text-muted uppercase tracking-tighter">
                      Progress
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-zinc-100 -z-10 hidden md:block"></div>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                      <Check className="size-4" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium">Profile</span>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                      <Check className="size-4" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium">Photos</span>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                      <Check className="size-4" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium">First Trip</span>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="size-8 rounded-full bg-white border-2 border-dashed border-zinc-200 text-zinc-300 flex items-center justify-center">
                      <Lock className="size-4" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium text-zinc-400">
                      Payments
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 border border-border-muted rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="size-5 text-primary" aria-hidden="true" />
                    <h3 className="font-caveat text-xl font-bold">
                      Quick Insights
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-600">
                    Booking trends are up{" "}
                    <span className="font-bold text-zinc-900">22%</span> for Q4
                    expeditions. We suggest opening 2 more slots for the
                    Patagonia Ridge.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border-muted">
                  <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    Apply suggestion{" "}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-border-muted p-6 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-medium text-text-muted">
                    Total Revenue
                  </p>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold">
                    +12.4%
                  </span>
                </div>
                <h4 className="text-2xl font-semibold tracking-tight">
                  $142,850.00
                </h4>
                <p className="text-[10px] text-text-muted mt-4">
                  vs. $127,100.00 last month
                </p>
              </div>
              <div className="bg-white border border-border-muted p-6 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-medium text-text-muted">
                    Avg Occupancy
                  </p>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">
                    Stable
                  </span>
                </div>
                <h4 className="text-2xl font-semibold tracking-tight">88.2%</h4>
                <p className="text-[10px] text-text-muted mt-4">
                  Average across 14 locations
                </p>
              </div>
              <div className="bg-white border border-border-muted p-6 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-medium text-text-muted">
                    Response Time
                  </p>
                  <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold">
                    -2m
                  </span>
                </div>
                <h4 className="text-2xl font-semibold tracking-tight">
                  14 mins
                </h4>
                <p className="text-[10px] text-text-muted mt-4">
                  Top 5% of all creators
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              <div className="xl:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-caveat text-2xl font-bold">
                    Active Expeditions
                  </h3>
                  <button className="text-zinc-500 text-xs font-medium hover:text-zinc-900">
                    View All
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
                            ACTIVE
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
                            92% Booked
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
                            SCHEDULED
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
                            45% Booked
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
                            WAITLIST
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
                            100% Full
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-3 h-[500px] bg-zinc-50 rounded-xl border border-border-muted overflow-hidden relative map-terrain shadow-inner">
                <div className="absolute top-[35%] left-[25%] group cursor-pointer">
                  <div className="size-3 bg-primary rounded-full ring-4 ring-primary/20"></div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                    Patagonia · $42k Revenue
                  </div>
                </div>
                <div className="absolute top-[42%] left-[48%] group cursor-pointer">
                  <div className="size-3 bg-primary rounded-full ring-4 ring-primary/20"></div>
                </div>
                <div className="absolute top-[38%] left-[75%] group cursor-pointer">
                  <div className="size-3 bg-primary rounded-full ring-4 ring-primary/20"></div>
                </div>
                <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-white p-1 rounded-shadcn border border-border-muted shadow-sm">
                  <button className="size-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 rounded">
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                  <div className="h-px bg-border-muted mx-1"></div>
                  <button className="size-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 rounded">
                    <Minus className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-4 rounded-xl border border-border-muted shadow-sm max-w-[180px]">
                  <h6 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    Live Fleet
                  </h6>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-600">Active</span>
                      <span className="font-bold">8</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-600">Pending</span>
                      <span className="font-bold">4</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-600">Archived</span>
                      <span className="font-bold">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Page;
