import { MapPin } from 'lucide-react'

export function MapSection() {
  return (
    <section className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dónde estarás</h2>
        <span className="text-gray-500 font-medium">Ubud, Bali, Indonesia</span>
      </div>
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden relative group">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBgjXA2z5T8lASrrRN3JxxaYH4xhB8Pxdu64f1H72SXFIc6w9YboVN1OXc4rFO2v2M2cKrzpROnW7-_7l3eItupyEoZX6J-lGfmFtexI29ermqv7CAxo9z8NJG_B4Xo10hf5yDtsBHAhtPYzgfNELP26WyLxGSuAtNhJHjcaXA6ppe6y1dwdBMyAhIOCbY1IP7tgOzl2-66mGZrizMhSUSiatcbJ4g38yaqPj2sxXuhKYkfh_Z0PXNKXYa0NqC8jHPbovCT9_H0brnV')",
          }}
          aria-label="Mapa ilustrativo de Bali, Indonesia"
          role="img"
        >
          <div className="absolute inset-0 bg-primary/5 mix-blend-multiply" />
        </div>
        <div className="absolute top-1/2 left-1/3 size-8 bg-primary text-white rounded-full flex items-center justify-center shadow-xl animate-bounce">
          <MapPin className="size-4" />
        </div>
        <div className="absolute bottom-1/4 right-1/2 size-4 bg-primary/40 rounded-full border-2 border-white" />
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            Punto de inicio
          </p>
          <p className="font-bold text-sm">
            Aeropuerto Internacional Ngurah Rai (DPS)
          </p>
        </div>
      </div>
    </section>
  )
}
