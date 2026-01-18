"use client";

import {
  Wallet,
  HelpCircle,
  Settings,
  CheckCircle2,
  Info,
  Filter,
  Download,
  MoreHorizontal,
  Shield,
  Building2,
} from "lucide-react";
import { AgentHeader } from "@/components/agent/AgentHeader";

const payouts = [
  {
    id: "PAY-9218-BXC",
    date: "Oct 14, 2023",
    amount: "$4,250.00",
    bankAccount: "Chase Bank •••• 4291",
    status: "In Progress",
    statusColor: "bg-zinc-100 text-zinc-600",
    statusDot: "bg-zinc-400",
  },
  {
    id: "PAY-8842-AXL",
    date: "Oct 07, 2023",
    amount: "$12,400.00",
    bankAccount: "Chase Bank •••• 4291",
    status: "Processed",
    statusColor: "bg-emerald-50 text-emerald-600",
    statusDot: "bg-emerald-500",
  },
  {
    id: "PAY-8531-ZNM",
    date: "Sep 30, 2023",
    amount: "$8,120.00",
    bankAccount: "Chase Bank •••• 4291",
    status: "Processed",
    statusColor: "bg-emerald-50 text-emerald-600",
    statusDot: "bg-emerald-500",
  },
  {
    id: "PAY-8109-QRD",
    date: "Sep 23, 2023",
    amount: "$15,200.00",
    bankAccount: "Chase Bank •••• 4291",
    status: "Processed",
    statusColor: "bg-emerald-50 text-emerald-600",
    statusDot: "bg-emerald-500",
  },
  {
    id: "PAY-7922-KLS",
    date: "Sep 16, 2023",
    amount: "$9,440.00",
    bankAccount: "Chase Bank •••• 4291",
    status: "Processed",
    statusColor: "bg-emerald-50 text-emerald-600",
    statusDot: "bg-emerald-500",
  },
];

export default function PaymentPage() {
  return (
    <>
      <main className="flex flex-col min-h-screen">
        <AgentHeader
          title="Resumen de Pagos Financieros"
          actions={
            <>
              <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
                <HelpCircle className="size-5" />
              </button>
              <div className="h-6 w-px bg-zinc-200"></div>
              <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
                <Settings className="size-4" />
                Configuración de Pagos
              </button>
            </>
          }
        />

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] col-span-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 mb-1">Available Balance</p>
                <h4 className="text-4xl font-semibold tracking-tight">$24,850.42</h4>
                <div className="flex items-center gap-2 mt-4">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <p className="text-[11px] text-emerald-600 font-medium uppercase tracking-wider">Verified and ready for withdrawal</p>
                </div>
              </div>
              <div>
                <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
                  <Wallet className="size-5" />
                  Withdraw Funds
                </button>
              </div>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl">
              <p className="text-xs font-medium text-zinc-500 mb-1">Next Scheduled Payout</p>
              <h4 className="text-2xl font-semibold tracking-tight text-zinc-800">Oct 24, 2023</h4>
              <p className="text-[11px] text-zinc-500 mt-4 flex items-center gap-1">
                <Info className="size-3" />
                Auto-payout to Chase Bank (•••• 4291)
              </p>
            </div>
          </div>

          {/* Payout History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-caveat text-2xl font-bold">Payout History</h3>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 text-xs font-medium text-zinc-600 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50">
                  <Filter className="size-3" />
                  Filter
                </button>
                <button className="flex items-center gap-2 text-xs font-medium text-zinc-600 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50">
                  <Download className="size-3" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr>
                    <th className="py-4 px-4 font-medium text-zinc-500 border-b border-zinc-200">Payout ID</th>
                    <th className="py-4 px-4 font-medium text-zinc-500 border-b border-zinc-200">Date</th>
                    <th className="py-4 px-4 font-medium text-zinc-500 border-b border-zinc-200">Amount</th>
                    <th className="py-4 px-4 font-medium text-zinc-500 border-b border-zinc-200">Bank Account</th>
                    <th className="py-4 px-4 font-medium text-zinc-500 border-b border-zinc-200">Status</th>
                    <th className="py-4 px-4 font-medium text-zinc-500 border-b border-zinc-200 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-4 border-b border-zinc-200 font-mono text-[11px] text-zinc-500">{payout.id}</td>
                      <td className="py-4 px-4 border-b border-zinc-200 text-zinc-900 font-medium">{payout.date}</td>
                      <td className="py-4 px-4 border-b border-zinc-200 text-zinc-900 font-semibold">{payout.amount}</td>
                      <td className="py-4 px-4 border-b border-zinc-200 text-zinc-500">{payout.bankAccount}</td>
                      <td className="py-4 px-4 border-b border-zinc-200">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${payout.statusColor} text-[10px] font-bold uppercase`}>
                          <span className={`size-1 rounded-full ${payout.statusDot}`}></span>
                          {payout.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-b border-zinc-200 text-right">
                        <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
                          <MoreHorizontal className="size-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50/30 flex items-center justify-between">
                <p className="text-xs text-zinc-500 tracking-tight">Showing 1-5 of 48 payouts</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs border border-zinc-200 bg-white rounded-lg opacity-50 cursor-not-allowed">Previous</button>
                  <button className="px-3 py-1 text-xs border border-zinc-200 bg-white rounded-lg hover:bg-zinc-50">Next</button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-200">
            <div className="flex gap-4">
              <div className="size-10 rounded-full bg-zinc-50 flex items-center justify-center shrink-0">
                <Shield className="size-5 text-zinc-400" />
              </div>
              <div>
                <h5 className="text-sm font-semibold">Secure Transfers</h5>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  All payouts are processed via end-to-end encrypted protocols. Funds typically arrive in your bank account within 2-3 business days.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="size-10 rounded-full bg-zinc-50 flex items-center justify-center shrink-0">
                <Building2 className="size-5 text-zinc-400" />
              </div>
              <div>
                <h5 className="text-sm font-semibold">Bank Information</h5>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  To update your bank account or payout frequency, please visit the Payout Settings. For security, changes require multi-factor authentication.
                </p>
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
      `}</style>
    </>
  );
}
