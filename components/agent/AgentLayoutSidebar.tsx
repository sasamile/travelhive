"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Compass,
  CalendarDays,
  LineChart,
  Wallet,
  Receipt,
  MoreVertical,
  Tent,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    href: "/agent",
    label: "Overview",
    icon: LayoutGrid,
    section: "management",
  },
  {
    href: "/agent/expeditions",
    label: "Expeditions",
    icon: Compass,
    section: "management",
  },
  {
    href: "/agent/insights",
    label: "Insights",
    icon: LineChart,
    section: "management",
  },
  {
    href: "/agent/payment",
    label: "Payouts",
    icon: Wallet,
    section: "finance",
  },
  {
    href: "/agent/invoices",
    label: "Invoices",
    icon: Receipt,
    section: "finance",
  },
];

export function AgentLayoutSidebar() {
  const pathname = usePathname();

  const managementItems = navigationItems.filter((item) => item.section === "management");
  const financeItems = navigationItems.filter((item) => item.section === "finance");

  return (
    <aside className="w-64 border-r border-zinc-200 flex flex-col fixed h-full z-50 bg-white">
      <div className="px-6 h-20 flex items-center border-b border-zinc-200">
        <Link href="/agent">
          <div className="font-caveat text-2xl font-bold flex items-center gap-2">
            <Tent className="h-5 w-5" />
            TravelHive
          </div>
        </Link>
      </div>
      <div className="flex-1 px-3 py-6 space-y-8 overflow-y-auto custom-scrollbar">
        <div>
          <p className="px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
            Management
          </p>
          <nav className="space-y-1">
            {managementItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-zinc-100 text-zinc-900 font-medium"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  <Icon className="size-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div>
          <p className="px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
            Finance
          </p>
          <nav className="space-y-1">
            {financeItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-zinc-100 text-zinc-900 font-medium"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  <Icon className="size-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="p-4 border-t border-zinc-200">
        <div className="flex items-center gap-3 px-2 py-2">
          <div
            className="size-8 rounded-full bg-zinc-100 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAB3qkhuKhaoDUVsm_--MsK4XDXr2OgY_zUKmQxnuKv7sgg88AIKt1slj6zjncazbLfZf2ALvWvyvika16fn65rFaNJKKSclgcidI0CpKHRgiSHds2VO3i5SbpktHvq0SqStXvZ1PKFDHyXDe7dkXvjaXdgmxu0ecYOyLpgweBbo3MHbZzBIk9vV7MzZ9bNgQONAHi7JrpBq8UFRWB0BY_xOMH_1xFGN2Sm4Kip8x-nQUgh0MJBs-j7hg-8oXtVe7ojDaZS0Gkh61o')",
            }}
          ></div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">Blackwood Co.</p>
            <p className="text-[10px] text-zinc-500 truncate">Premium Organizer</p>
          </div>
          <MoreVertical className="size-4 text-zinc-400" />
        </div>
      </div>
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
      `}</style>
    </aside>
  );
}
