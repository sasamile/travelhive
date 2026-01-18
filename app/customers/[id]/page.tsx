import { Heart, Share2, Star } from 'lucide-react'
import { ActionButton } from '@/components/customers/experience/ActionButton'
import { AgentInfo } from '@/components/customers/experience/AgentInfo'
import { Breadcrumbs } from '@/components/customers/experience/Breadcrumbs'
import { BookingCard } from '@/components/customers/experience/BookingCard'
import { ExperienceFooter } from '@/components/customers/experience/ExperienceFooter'
import { GalleryGrid } from '@/components/customers/experience/GalleryGrid'
import { Itinerary } from '@/components/customers/experience/Itinerary'
import { MapSection } from '@/components/customers/experience/MapSection'
import { PoliciesSection } from '@/components/customers/experience/PoliciesSection'
import { ReviewsSection } from '@/components/customers/experience/ReviewsSection'
import { TrustBadges } from '@/components/customers/experience/TrustBadges'
import {
  breadcrumbs,
  footerLinks,
  galleryImages,
  itinerary,
  reviews,
  rules,
  safety,
  trustBadges,
} from '@/components/customers/experience/data'

function Page() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="space-y-2">
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="text-4xl font-extrabold tracking-tight">
            Expedición de Lujo: Templos y Arrozales en Bali
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 font-semibold">
              <Star className="size-4 text-yellow-500" /> 4.98 (124 reseñas)
            </span>
            <span className="text-gray-400">•</span>
            <span className="underline font-medium cursor-pointer">
              Ubud, Indonesia
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <ActionButton icon={Share2} label="Compartir" />
          <ActionButton icon={Heart} label="Guardar" />
        </div>
      </div>

      <GalleryGrid images={galleryImages} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          <AgentInfo />
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Sobre esta experiencia
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              Sumérgete en la esencia espiritual y natural de la Isla de los
              Dioses. Este itinerario curado te llevará más allá de los circuitos
              turísticos convencionales, permitiéndote conectar con comunidades
              locales en Ubud, explorar templos milenarios al amanecer y descansar
              en resorts boutique de clase mundial.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              Diseñado para viajeros que buscan autenticidad sin renunciar al
              confort, cada detalle ha sido seleccionado por nuestro equipo local
              para garantizar una experiencia transformadora.
            </p>
          </section>
          <Itinerary items={itinerary} />
          <MapSection />
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            <BookingCard />
            <TrustBadges items={trustBadges} />
          </div>
        </div>
      </div>

      <ReviewsSection rating="4.98" total="124" reviews={reviews} />
      <PoliciesSection rules={rules} safety={safety} />
      <ExperienceFooter links={footerLinks} />
    </main>
  )
}

export default Page