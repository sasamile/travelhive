type TripsHeaderProps = {
  activeTab?: "upcoming" | "history";
  onTabChange?: (tab: "upcoming" | "history") => void;
  upcomingCount?: number;
  historyCount?: number;
};

export function TripsHeader({ 
  activeTab = "upcoming", 
  onTabChange,
  upcomingCount = 0,
  historyCount = 0,
}: TripsHeaderProps) {
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
      {onTabChange && (
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button 
            onClick={() => onTabChange("upcoming")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${
              activeTab === "upcoming"
                ? "bg-white dark:bg-gray-700 shadow-sm text-primary"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Próximos
            {upcomingCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                {upcomingCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => onTabChange("history")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${
              activeTab === "history"
                ? "bg-white dark:bg-gray-700 shadow-sm text-primary"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Historial
            {historyCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      )}
    </header>
  )
}
