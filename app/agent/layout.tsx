"use client";

import { AgentLayoutSidebar } from "@/components/agent/AgentLayoutSidebar";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <AgentLayoutSidebar />
      <div className="flex-1 ml-64">{children}</div>
    </div>
  );
}
