import type { TripRow } from './data'
import { Eye, MoreVertical, Pencil } from 'lucide-react'

type ActiveTripsTableProps = {
  trips: TripRow[]
}

export function ActiveTripsTable({ trips }: ActiveTripsTableProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Tus Viajes Activos
        </h2>
        <a className="text-primary font-bold text-sm hover:underline" href="#">
          Ver todos los viajes
        </a>
      </div>
      <div className="bg-white dark:bg-[#242424] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#1f1f1f] text-[#657f81] text-xs font-bold uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-5">Viaje &amp; Destino</th>
                <th className="px-6 py-5">Estado</th>
                <th className="px-6 py-5">Precio</th>
                <th className="px-6 py-5">Fecha Publicación</th>
                <th className="px-6 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {trips.map((trip) => (
                <tr
                  key={trip.title}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div
                        className="size-14 rounded-xl bg-cover bg-center shrink-0"
                        style={{ backgroundImage: `url("${trip.image}")` }}
                        aria-label={trip.title}
                        role="img"
                      />
                      <div>
                        <p className="font-bold text-[#121717] dark:text-white">
                          {trip.title}
                        </p>
                        <p className="text-xs text-[#657f81]">
                          {trip.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${trip.statusClassName}`}
                    >
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold">{trip.price}</td>
                  <td className="px-6 py-5 text-sm text-[#657f81]">
                    {trip.date}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-[#657f81] hover:text-primary transition-colors">
                        <Pencil className="size-4" />
                      </button>
                      <button className="p-2 text-[#657f81] hover:text-primary transition-colors">
                        <Eye className="size-4" />
                      </button>
                      <button className="p-2 text-[#657f81] hover:text-red-400 transition-colors">
                        <MoreVertical className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
