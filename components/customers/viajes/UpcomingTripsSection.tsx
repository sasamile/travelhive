import type { Trip } from './data'
import { TripCard } from './TripCard'

type UpcomingTripsSectionProps = {
  trips: Trip[]
  bookingsData?: Array<any> // Datos completos de las reservas
}

export function UpcomingTripsSection({ trips, bookingsData = [] }: UpcomingTripsSectionProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Próximas Escapadas
        </h2>
        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
          {trips.length} ACTIVOS
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {trips.map((trip, index) => {
          // Buscar los datos completos de la reserva correspondiente
          const bookingData = bookingsData.find((b: any) => 
            (b.idBooking || b.id) === trip.id
          ) || bookingsData[index];
          
          return (
            <TripCard 
              key={trip.id} 
              trip={trip} 
              bookingData={bookingData}
            />
          );
        })}
      </div>
    </section>
  )
}
