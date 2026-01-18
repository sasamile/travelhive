import type { GalleryImage } from './data'
import { Grid3x3 } from 'lucide-react'

type GalleryGridProps = {
  images: GalleryImage[]
}

export function GalleryGrid({ images }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[500px] mb-12 rounded-xl overflow-hidden relative">
      {images.map((image) => (
        <div
          key={image.src}
          className={`${image.className} bg-cover bg-center hover:opacity-95 transition-opacity cursor-pointer`}
          style={{ backgroundImage: `url('${image.src}')` }}
          aria-label={image.alt}
          role="img"
        />
      ))}
      <button className="absolute bottom-6 right-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform">
        <Grid3x3 className="size-4" /> Mostrar todas las fotos
      </button>
    </div>
  )
}
