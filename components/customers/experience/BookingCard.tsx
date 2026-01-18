import { BadgeCheck, ChevronDown } from 'lucide-react'

export function BookingCard() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-2xl shadow-gray-200/50 dark:shadow-none">
      <div className="flex justify-between items-baseline mb-8">
        <div>
          <span className="text-3xl font-extrabold text-primary">$2,450</span>
          <span className="text-gray-500 text-sm font-medium"> / persona</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-bold">
          <BadgeCheck className="size-4 text-primary" />
          <span>Todo Incluido</span>
        </div>
      </div>
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-2 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="p-3 border-r border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Salida
            </label>
            <span className="text-sm font-semibold">12 Oct, 2024</span>
          </div>
          <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Regreso
            </label>
            <span className="text-sm font-semibold">19 Oct, 2024</span>
          </div>
          <div className="col-span-2 p-3 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Viajeros
            </label>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">2 Adultos</span>
              <ChevronDown className="size-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 mb-4">
        Reservar Ahora
      </button>
      <p className="text-center text-xs text-gray-400">
        No se te cobrará nada todavía
      </p>
      <div className="mt-8 space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 underline">Precio x 2 personas</span>
          <span className="font-semibold">$4,900</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 underline">Tarifa de gestión</span>
          <span className="font-semibold">$120</span>
        </div>
        <div className="flex justify-between text-lg font-extrabold pt-4 border-t border-gray-100 dark:border-gray-800">
          <span>Total</span>
          <span>$5,020</span>
        </div>
      </div>
    </div>
  )
}
