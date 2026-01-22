"use client";

import React from 'react'
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileDown,
  MoreHorizontal,
  ShieldCheck,
} from 'lucide-react'
import { AgentHeader } from "@/components/agent/AgentHeader";

function Page() {
  const bookings = [
    {
      id: '#BK-94821',
      expedition: 'Patagonia Ridge Expedition',
      departure: 'Nov 14, 2023',
      traveler: {
        name: 'Marcus Sterling',
        email: 'm.sterling@example.com',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBJuPJ346wMI-JoJKEjuTrwvCLmUla_-mDkkhsIsnFyoDoaYbw_OZmNrWUN1HYEmW6tSjQK_m6T-ErIu0hW9ymbOruX6CVq1Z4mnHGiuIlBB4oreISGvFYCoTSE_SNDCRN5nAibxZipuFH8C9LjJyXyygLMOB9TtNsnf272uXAB73W9qVR26nG8qh1i8Sehzwh1txc6-TXwxjmmVYSMrhgl2gMWNXBk6a-BkiA13pFjlq5CzzelMZkypVDb5wu8rJH0WL6R6NxEU5s',
      },
      seats: '2/4',
      total: '$4,850.00',
      status: 'confirmed',
    },
    {
      id: '#BK-94805',
      expedition: 'Aegean Blue Voyage',
      departure: 'Dec 02, 2023',
      traveler: {
        name: 'Elena Rodriguez',
        email: 'elena.r@agency.net',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB9-VRDx0FNIJED8ESZdDXXVGn1NqQIYIm7OGifOybJnr3ejcOnkJMl2itQYhaZuchrOyOVZnzYcUePx8r6CyWD104W-cNOoa4H68wLQLT93HZ6tReR_ahYL5DxORofiohmwQ6PkbK0eyKtldk55rcOA6idiXD2sJIn2-I47N501KXQLcaWNgK7iAL7ghuM7IUeGFU0zpGmumG7rWN583hwXZAX-1_YVW8qyiy6-u5O6vdXC_ZEKx2MBQTXOo2PqpvTKVyn_h3PrmI',
      },
      seats: '1/2',
      total: '$2,100.00',
      status: 'pending',
    },
    {
      id: '#BK-94782',
      expedition: 'Kyoto Zen Retreat',
      departure: 'Jan 10, 2024',
      traveler: {
        name: 'David Chen',
        email: 'd.chen@lifestyle.com',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB9eNM2TnMGPvYgEuoYqdLLoBmSRBJjcAaygUdfwqDiJ2Kd4IjMRucaAZXQPLqolzyEte79KPceezntjg9TVvj00VD9e9WEVeBCrpwAPtT6d_qWaRNe6f4aC5CtRtPATgWwQz5RCl92f-xTCZzcbMEEkFycB4W6QP6Zgin3--biCWEThp5viBd6v-QZZMjqapNYRLqOzzVumv8IF-0G8JX4oO8eoIsDOqxE8T4wQMs-2INGmcVf0Xw4fYZQS7VPHw2e3uNCnmIWXys',
      },
      seats: '4/4',
      total: '$12,400.00',
      status: 'confirmed',
    },
    {
      id: '#BK-94770',
      expedition: 'Icelandic Glacier Hike',
      departure: 'Feb 12, 2024',
      traveler: {
        name: 'Sophie Müller',
        email: 'sophie@travels.de',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB39BiG7BKY7FktPCMOOG9XAFT-oYuuQLwOqt2fINhYO9ZHx-sE3hFc_VHt-b3JFojXYCFqgLltIA30yPcz9AsqPyfky-e9PSCH8Oo0l4qZfzqSlS8n98cbgB3p9KBW3L6p4nDP4yinoZgHMU48o4CvY2nWqbKJoINMIfOoECuUaBQDieWVmbXCFaiCKUqwrr3K-5QyEEGouuQQhlk_dKQdFNhMnwpogx5M7AF3PyI33aNl0WdXT3k6aSwpKIWR6GI6XZPiO35P_LE',
      },
      seats: '2/6',
      total: '$3,200.00',
      status: 'canceled',
    },
    {
      id: '#BK-94765',
      expedition: 'Dolomites Summer Trail',
      departure: 'Jul 22, 2024',
      traveler: {
        name: 'Aria Jones',
        email: 'aria.j@adventure.co',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAYpgnPzSe4IstClDKrZgXwC5B-vQnXezIM1eHBJM-YkKXCACcunPC1EKrNsqFTDUAIyAK7x4Y8fLggv4VdLdHpzYu8iCvXou12LCrXBwv3sknPmGCnVKpR4qQauyOsuZjyt5JZ_gosg9Ciqvrdf6xuYbxDOT9OKsxZEi84peq-i-i480sBNf4JdIe1ufCRZau5i5XPrQcWV41C77PQR7JeD5rZv9NgDOF3rNhtmlLQILs4duQ-z6nHDC9zoU0_vGT1N54CjGmmUjc',
      },
      seats: '3/8',
      total: '$5,100.00',
      status: 'pending',
    },
  ]

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-100'
      case 'canceled':
        return 'bg-rose-50 text-rose-700 border border-rose-100'
      default:
        return 'bg-zinc-50 text-zinc-700 border border-zinc-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada'
      case 'pending':
        return 'Pendiente'
      case 'canceled':
        return 'Cancelada'
      default:
        return status
    }
  }

  return (
    <>
      <main className="flex flex-col min-h-screen">
        <AgentHeader
          showSearch
          searchPlaceholder="Buscar por ID de reserva o viajero..."
          showNotifications
          actions={
            <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
              <FileDown className="size-4" />
              Exportar Lista
            </button>
          }
        />

          <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-caveat text-4xl font-bold text-zinc-900">
                  Gestión de Reservas
                </h2>
                <p className="text-[#71717A] mt-1 text-sm">
                  Gestiona eficientemente las reservas individuales y detalles de los viajeros.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <button className="flex items-center gap-2 text-sm font-medium text-zinc-600 bg-white px-3 py-2 rounded-[0.5rem] border border-[#F4F4F5] hover:border-zinc-300 transition-all">
                    <Filter className="size-4 text-zinc-400" aria-hidden="true" />
                    Estado: Todos
                    <ChevronDown className="size-3 text-zinc-400" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 bg-white px-3 py-2 rounded-[0.5rem] border border-[#F4F4F5] hover:border-zinc-300 transition-all">
                  <CalendarDays className="size-4 text-zinc-400" aria-hidden="true" />
                  Oct 01 — Oct 31, 2023
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#F4F4F5] rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#F4F4F5] bg-zinc-50/30">
                      <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        ID de Reserva
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Nombre de Expedición
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Viajero Principal
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider text-center">
                        Asientos
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Monto Total
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F4F5]">
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-zinc-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-zinc-500">
                          {booking.id}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-zinc-900">
                            {booking.expedition}
                          </p>
                          <p className="text-[10px] text-[#71717A]">
                            Salida: {booking.departure}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="size-8 rounded-full bg-zinc-100 bg-cover bg-center border border-[#F4F4F5]"
                              style={{
                                backgroundImage: `url('${booking.traveler.avatar}')`,
                              }}
                            ></div>
                            <div>
                              <p className="text-sm font-medium text-zinc-900">
                                {booking.traveler.name}
                              </p>
                              <p className="text-[10px] text-[#71717A]">
                                {booking.traveler.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-zinc-900">
                            {booking.seats}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-zinc-900">
                            {booking.total}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${getStatusBadgeClass(booking.status)}`}
                          >
                            {getStatusLabel(booking.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-zinc-400 hover:text-zinc-600">
                            <MoreHorizontal className="size-4" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-[#F4F4F5] flex items-center justify-between bg-zinc-50/20">
                <p className="text-xs text-[#71717A] italic">
                  Mostrando 1 a 5 de 42 reservas
                </p>
                <div className="flex items-center gap-1">
                  <button
                    className="p-1 rounded border border-[#F4F4F5] text-zinc-400 hover:bg-white disabled:opacity-50"
                    disabled
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                  </button>
                  <button className="size-7 flex items-center justify-center rounded text-xs font-semibold bg-zinc-900 text-white">
                    1
                  </button>
                  <button className="size-7 flex items-center justify-center rounded text-xs font-medium text-zinc-600 hover:bg-zinc-100">
                    2
                  </button>
                  <button className="size-7 flex items-center justify-center rounded text-xs font-medium text-zinc-600 hover:bg-zinc-100">
                    3
                  </button>
                  <button className="p-1 rounded border border-[#F4F4F5] text-zinc-600 hover:bg-white">
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#F4F4F5] rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-indigo-50 flex items-center justify-center text-primary">
                  <ShieldCheck className="size-6" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-caveat text-xl font-bold">
                    Completa la configuración de tu perfil de pagos
                  </h4>
                  <p className="text-xs text-[#71717A]">
                    Tienes 3 pagos pendientes esperando ser procesados.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-48 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: '75%' }}
                  ></div>
                </div>
                <span className="font-caveat text-xl text-primary font-bold">75%</span>
                <button className="text-xs font-bold text-zinc-900 underline underline-offset-4 decoration-zinc-300 hover:decoration-primary transition-all">
                  Completar Configuración
                </button>
              </div>
            </div>
          </div>
      </main>
    </>
  )
}

export default Page
