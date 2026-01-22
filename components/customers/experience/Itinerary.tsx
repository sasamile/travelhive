import type { ItineraryDay } from './data'
import { ChevronDown } from 'lucide-react'

type ItineraryProps = {
  items: ItineraryDay[]
}

export function Itinerary({ items }: ItineraryProps) {
  return (
    <section className="space-y-8 pt-4">
      <h2 className="text-2xl font-bold tracking-tight">
        Itinerario del viaje
      </h2>
      <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/20">
        {items.map((day, index) => {
          const Icon = day.icon
          const isFirst = index === 0
          return (
            <div key={day.title} className="relative pl-12">
              <div
                className={`absolute left-0 top-1 size-10 rounded-full flex items-center justify-center ring-8 ring-background-light dark:ring-background-dark z-10 ${
                  isFirst
                    ? 'bg-primary text-white'
                    : 'bg-primary/20 text-primary'
                }`}
              >
                <Icon className="size-5" />
              </div>
              <h4 className="font-bold text-lg">{day.title}</h4>
              <p className="text-gray-500 text-sm mt-1">{day.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
