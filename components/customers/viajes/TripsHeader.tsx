export function TripsHeader() {
  return (
    <header className="flex flex-wrap justify-between items-end gap-6 mb-8">
      <div className="flex flex-col gap-2">
        <p className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Mis Viajes
        </p>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Gestiona tus próximas aventuras y revive tus experiencias pasadas por
          el mundo.
        </p>
      </div>
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <button className="px-6 py-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm text-sm font-bold text-primary">
          Próximos
        </button>
        <button className="px-6 py-2 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-700">
          Historial
        </button>
      </div>
    </header>
  )
}
