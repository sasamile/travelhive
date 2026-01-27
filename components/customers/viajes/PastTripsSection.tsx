"use client";

import { useState } from 'react'
import type { PastTrip } from './data'
import { BookingDetailsModal } from './BookingDetailsModal'

type PastTripsSectionProps = {
  trips: PastTrip[]
  bookingsData?: Array<any> // Datos completos de las reservas
}

export function PastTripsSection({ trips, bookingsData = [] }: PastTripsSectionProps) {
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTripClick = (trip: PastTrip) => {
    const bookingData = bookingsData.find((b: any) => 
      (b.idBooking || b.id) === trip.id
    );
    if (bookingData) {
      setSelectedBooking(bookingData);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Viajes Pasados
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
          {trips.map((trip) => {
            const bookingData = bookingsData.find((b: any) => 
              (b.idBooking || b.id) === trip.id
            );
            
            return (
              <div
                key={trip.id}
                onClick={() => bookingData && handleTripClick(trip)}
                className={`bg-white dark:bg-[#222] p-4 rounded-xl flex gap-4 shadow-sm border border-gray-50 dark:border-gray-800 ${
                  bookingData ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                }`}
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
                  {bookingData && (
                    <p className="text-xs text-primary mt-2 font-semibold">
                      Ver detalles →
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal de detalles */}
      {selectedBooking && (
        <BookingDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
        />
      )}
    </>
  )
}
