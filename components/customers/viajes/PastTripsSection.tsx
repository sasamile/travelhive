import type { PastTrip } from './data'

type PastTripsSectionProps = {
  trips: PastTrip[]
}

export function PastTripsSection({ trips }: PastTripsSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Viajes Pasados
        </h2>
        <a className="text-sm font-bold text-primary hover:underline" href="#">
          Ver todo el historial
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white dark:bg-[#222] p-4 rounded-xl flex gap-4 shadow-sm border border-gray-50 dark:border-gray-800"
          >
            <div
              className="w-20 h-20 rounded-lg bg-cover bg-center shrink-0"
              style={{ backgroundImage: `url("${trip.image}")` }}
              aria-label={trip.imageAlt}
              role="img"
            />
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Finalizado
              </p>
              <h4 className="font-bold text-gray-900 dark:text-white">
                {trip.title}
              </h4>
              <p className="text-xs text-gray-500">
                {trip.date} • {trip.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
