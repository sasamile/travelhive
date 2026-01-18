import { Sidebar } from '@/components/customers/viajes/Sidebar'
import { TripsHeader } from '@/components/customers/viajes/TripsHeader'
import { TripsSearch } from '@/components/customers/viajes/TripsSearch'
import { UpcomingTripsSection } from '@/components/customers/viajes/UpcomingTripsSection'
import { PastTripsSection } from '@/components/customers/viajes/PastTripsSection'
import { pastTrips, upcomingTrips } from '@/components/customers/viajes/data'

function MyViajes() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#4a4a4a] dark:text-gray-200">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 max-w-5xl mx-auto px-10 py-12 ml-64     ">
          <TripsHeader />
          <TripsSearch />
          <UpcomingTripsSection trips={upcomingTrips} />
          <PastTripsSection trips={pastTrips} />
        </main>
      </div>
    </div>
  )
}

export default MyViajes