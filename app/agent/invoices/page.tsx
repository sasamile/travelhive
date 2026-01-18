"use client";

import React from 'react'
import {
  FileDown,
  CreditCard,
  Banknote,
  Clock,
  CalendarDays,
  ArrowUp,
  Download,
} from 'lucide-react'
import { AgentHeader } from "@/components/agent/AgentHeader";

function Page() {
  const invoices = [
    {
      id: 'INV-2023-001',
      issueDate: 'Oct 14, 2023',
      customer: {
        name: 'Elias Halloway',
        initials: 'EH',
      },
      totalAmount: '$2,450.00',
      status: 'paid',
    },
    {
      id: 'INV-2023-002',
      issueDate: 'Oct 12, 2023',
      customer: {
        name: 'Sarah Chen',
        initials: 'SC',
      },
      totalAmount: '$1,890.00',
      status: 'processing',
    },
    {
      id: 'INV-2023-003',
      issueDate: 'Oct 08, 2023',
      customer: {
        name: 'Marcus Rossi',
        initials: 'MR',
      },
      totalAmount: '$3,200.00',
      status: 'overdue',
    },
    {
      id: 'INV-2023-004',
      issueDate: 'Oct 05, 2023',
      customer: {
        name: 'James Wilson',
        initials: 'JW',
      },
      totalAmount: '$1,150.00',
      status: 'paid',
    },
    {
      id: 'INV-2023-005',
      issueDate: 'Oct 01, 2023',
      customer: {
        name: 'Lena Young',
        initials: 'LY',
      },
      totalAmount: '$4,560.00',
      status: 'paid',
    },
  ]

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
      case 'processing':
        return 'bg-amber-50 text-amber-700 border border-amber-100'
      case 'overdue':
        return 'bg-rose-50 text-rose-700 border border-rose-100'
      default:
        return 'bg-zinc-50 text-zinc-700 border border-zinc-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid'
      case 'processing':
        return 'Processing'
      case 'overdue':
        return 'Overdue'
      default:
        return status
    }
  }

  return (
    <>
      <main className="flex flex-col min-h-screen">
        <AgentHeader
          showSearch
          searchPlaceholder="Buscar por N° de Factura o Cliente..."
          actions={
            <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
              <FileDown className="size-4" />
              Exportar CSV
            </button>
          }
        />

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-caveat text-4xl font-bold text-zinc-900">
                Invoices & Billing History
              </h2>
              <p className="text-[#71717A] mt-1 text-sm">
                Review your billing statements and payment status.
              </p>
            </div>
            <div className="flex gap-2">
              <select className="text-xs font-medium text-zinc-500 bg-white px-3 py-2 rounded-[0.5rem] border border-[#F4F4F5] outline-none">
                <option>All Statuses</option>
                <option>Paid</option>
                <option>Overdue</option>
                <option>Processing</option>
              </select>
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-50 px-3 py-2 rounded-[0.5rem] border border-[#F4F4F5]">
                <CalendarDays className="size-3" aria-hidden="true" />
                Last 30 Days
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#F4F4F5] rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-[#F4F4F5]">
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F5]">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-zinc-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#71717A]">
                      {invoice.issueDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                          {invoice.customer.initials}
                        </div>
                        <span className="text-sm font-medium text-zinc-900">
                          {invoice.customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-zinc-900">
                      {invoice.totalAmount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(invoice.status)}`}
                      >
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
                        <Download className="size-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-[#F4F4F5] flex items-center justify-between bg-zinc-50/30">
              <p className="text-xs text-[#71717A]">
                Showing <span className="font-medium text-zinc-900">1-5</span> of{' '}
                <span className="font-medium text-zinc-900">42</span> invoices
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 text-xs border border-[#F4F4F5] rounded-[0.5rem] bg-white text-zinc-500 hover:bg-zinc-50 disabled:opacity-50"
                  disabled
                >
                  Previous
                </button>
                <button className="px-3 py-1 text-xs border border-[#F4F4F5] rounded-[0.5rem] bg-white text-zinc-900 hover:bg-zinc-50">
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#F4F4F5] p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Banknote className="size-5 text-emerald-500" aria-hidden="true" />
                <p className="text-xs font-medium text-[#71717A] uppercase tracking-wider">
                  Total Received
                </p>
              </div>
              <h4 className="text-2xl font-bold tracking-tight text-zinc-900">
                $12,450.00
              </h4>
              <p className="text-[10px]  text-emerald-600 mt-2 flex items-center gap-1">
                <ArrowUp className="size-3" aria-hidden="true" />
                8.2% increase from last month
              </p>
            </div>
            <div className="bg-white border border-[#F4F4F5] p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="size-5 text-rose-500" aria-hidden="true" />
                <p className="text-xs font-medium text-[#71717A] uppercase tracking-wider">
                  Pending/Overdue
                </p>
              </div>
              <h4 className="text-2xl font-bold tracking-tight text-zinc-900">
                $3,200.00
              </h4>
              <p className="text-[10px] text-[#71717A] mt-2">
                1 invoice requires attention
              </p>
            </div>
            <div className="bg-white border border-[#F4F4F5] p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="size-5 text-primary" aria-hidden="true" />
                <p className="text-xs font-medium text-[#71717A] uppercase tracking-wider">
                  Active Payout Method
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-1.5 py-0.5 bg-zinc-100 rounded text-[10px] font-bold text-zinc-600">
                  VISA
                </div>
                <h4 className="text-base font-semibold text-zinc-900">•••• 4242</h4>
              </div>
              <p className="text-[10px] text-primary mt-2 cursor-pointer hover:underline">
                Change payout method
              </p>
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
  )
}

export default Page
