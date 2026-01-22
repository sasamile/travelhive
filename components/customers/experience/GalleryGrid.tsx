"use client";

import { useState } from 'react';
import type { GalleryImage } from './data'
import { Grid3x3, X } from 'lucide-react'

type GalleryGridProps = {
  images: GalleryImage[]
  allImages?: string[] // Todas las imágenes en base64 o URLs
}

export function GalleryGrid({ images, allImages }: GalleryGridProps) {
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Determinar el layout según la cantidad de imágenes
  const getGridClasses = () => {
    if (images.length === 0) return '';
    if (images.length === 1) {
      return 'grid-cols-1 h-[400px] md:h-[500px]';
    }
    if (images.length === 2) {
      return 'grid-cols-2 h-[400px] md:h-[500px]';
    }
    // 3 o más imágenes: layout original
    return 'grid-cols-2 md:grid-cols-4 grid-rows-2 h-[400px] md:h-[500px]';
  };

  const getImageClasses = (index: number) => {
    if (images.length === 1) {
      return 'col-span-1 row-span-1';
    }
    if (images.length === 2) {
      return 'col-span-1 row-span-1';
    }
    // Para 3+ imágenes, usar las clases originales
    return images[index]?.className || 'col-span-1 row-span-1';
  };

  const displayImages = allImages && allImages.length > images.length ? allImages : images.map(img => img.src);

  return (
    <>
      <div className={`grid ${getGridClasses()} gap-3 mb-12 rounded-xl overflow-hidden relative`}>
        {images.map((image, index) => (
          <div
            key={image.src}
            className={`${getImageClasses(index)} bg-cover bg-center hover:opacity-95 transition-opacity cursor-pointer`}
            style={{ backgroundImage: `url('${image.src}')` }}
            onClick={() => {
              setSelectedImageIndex(index);
              setShowFullGallery(true);
            }}
            aria-label={image.alt}
            role="img"
          />
        ))}
        {displayImages.length > images.length && (
          <button 
            onClick={() => setShowFullGallery(true)}
            className="absolute bottom-6 right-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform z-10"
          >
            <Grid3x3 className="size-4" /> Mostrar todas las fotos ({displayImages.length})
          </button>
        )}
      </div>

      {/* Modal de galería completa */}
      {showFullGallery && displayImages && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setShowFullGallery(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="size-6" />
          </button>
          <div className="max-w-7xl w-full h-full flex items-center justify-center">
            <img
              src={displayImages[selectedImageIndex]}
              alt={`Imagen ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          {displayImages.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : displayImages.length - 1))}
                className="absolute left-4 text-white hover:text-gray-300 transition-colors text-2xl font-bold"
              >
                ‹
              </button>
              <button
                onClick={() => setSelectedImageIndex(prev => (prev < displayImages.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 text-white hover:text-gray-300 transition-colors text-2xl font-bold"
              >
                ›
              </button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                {selectedImageIndex + 1} / {displayImages.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
