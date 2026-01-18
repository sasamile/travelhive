import type { Trip } from './data'
import { Calendar, MapPin } from 'lucide-react'

type TripCardProps = {
  trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <div className="group flex flex-col md:flex-row items-stretch bg-white dark:bg-[#222] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow duration-300">
      <div className="md:w-72 h-48 md:h-auto overflow-hidden">
        <div
          className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url("${trip.image}")` }}
          aria-label={trip.imageAlt}
          role="img"
        />
      </div>
      <div className="flex-1 p-8 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${trip.status.className}`}
          >
            {trip.status.label}
          </span>
          <p className="text-xl font-bold text-primary">{trip.price}</p>
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          {trip.title}
        </h3>
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 mb-6 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="size-4" />
            <span>{trip.dateRange}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="size-4" />
            <span>{trip.location}</span>
          </div>
        </div>
        <div className="mt-auto flex gap-3">
          <button className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors">
            {trip.primaryAction}
          </button>
          <button className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">
            {trip.secondaryAction}
          </button>
        </div>
      </div>
    </div>
  )
}
