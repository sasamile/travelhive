import { Search, SlidersHorizontal } from 'lucide-react'

export function TripsSearch() {
  return (
    <div className="mb-10 flex gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
        <input
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20"
          placeholder="Buscar destino o reserva..."
          type="text"
        />
      </div>
      <button className="px-5 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2 font-medium text-sm">
        <SlidersHorizontal className="size-4" />
        Filtros
      </button>
    </div>
  )
}
