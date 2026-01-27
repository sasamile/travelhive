export function TripsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="group flex flex-col md:flex-row items-stretch bg-white dark:bg-[#222] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] animate-pulse"
        >
          {/* Imagen skeleton */}
          <div className="md:w-72 h-48 md:h-auto bg-gray-200 dark:bg-gray-700" />
          
          {/* Contenido skeleton */}
          <div className="flex-1 p-8 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
            
            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            
            <div className="flex items-center gap-4">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            
            <div className="mt-auto flex gap-3">
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
