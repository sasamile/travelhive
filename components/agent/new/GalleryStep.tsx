"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface GalleryStepProps {
  tripId?: string;
}

const STORAGE_KEY_GALLERY = "trip_gallery_draft";

export default function GalleryStep({ tripId }: GalleryStepProps) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const [galleryImages, setGalleryImages] = useState<string[]>([]); // Base64 o URLs
  const [coverImageIndex, setCoverImageIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Cargar galería guardada del localStorage
  useEffect(() => {
    const key = tripId ? `${STORAGE_KEY_GALLERY}_${tripId}` : STORAGE_KEY_GALLERY;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setGalleryImages(data.galleryImages || []);
        setCoverImageIndex(data.coverImageIndex ?? null);
      } catch (error) {
        console.error("Error al cargar galería del localStorage:", error);
      }
    }
  }, [tripId]);

  // Guardar en localStorage automáticamente
  useEffect(() => {
    const data = {
      galleryImages,
      coverImageIndex,
    };
    
    // Guardar en ambas claves para asegurar persistencia
    const keyWithTripId = tripId ? `${STORAGE_KEY_GALLERY}_${tripId}` : null;
    const keyBase = STORAGE_KEY_GALLERY;
    
    if (keyWithTripId) {
      localStorage.setItem(keyWithTripId, JSON.stringify(data));
    }
    localStorage.setItem(keyBase, JSON.stringify(data));
  }, [galleryImages, coverImageIndex, tripId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} no es una imagen válida`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} es mayor a 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setGalleryImages((prev) => [...prev, base64String]);
        // Si es la primera imagen, marcarla como cover
        if (galleryImages.length === 0 && coverImageIndex === null) {
          setCoverImageIndex(0);
        }
      };
      reader.onerror = () => {
        toast.error(`Error al cargar ${file.name}`);
      };
      reader.readAsDataURL(file);
    });

    toast.success(`${validFiles.length} imagen(es) cargada(s)`);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
    if (coverImageIndex === index) {
      setCoverImageIndex(galleryImages.length > 1 ? 0 : null);
    } else if (coverImageIndex !== null && coverImageIndex > index) {
      setCoverImageIndex(coverImageIndex - 1);
    }
    toast.success("Imagen eliminada");
  };

  const setAsCover = (index: number) => {
    setCoverImageIndex(index);
    toast.success("Imagen de portada actualizada");
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
      <div className="px-8 py-6 border-b border-neutral-100 bg-white/90 backdrop-blur sticky top-0 z-20">
        <h2 className="font-caveat text-4xl text-slate-900">Galería de Medios</h2>
        <p className="text-sm text-slate-500 mt-1">Gestiona fotos del viaje para tus clientes.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
        <div className="mb-12">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50 hover:bg-white hover:border-indigo-400 transition-all cursor-pointer"
          >
            <div className="size-16 rounded-full bg-white shadow-sm border border-neutral-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="size-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Subir Fotos</h3>
            <p className="text-sm text-slate-500 mt-1">
              Arrastra y suelta imágenes, o <span className="text-indigo-600 font-medium">busca archivos</span>
            </p>
            <p className="text-xs text-slate-400 mt-4">JPG, PNG, WEBP (Máx. 10MB por archivo)</p>
          </button>
        </div>
        {galleryImages.length > 0 && (
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Fotos del Viaje <span className="text-sm font-normal text-slate-400 ml-2">({galleryImages.length} foto{galleryImages.length !== 1 ? "s" : ""})</span>
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className={`group relative aspect-square rounded-2xl overflow-hidden border border-neutral-100 ${
                    coverImageIndex === index ? "ring-4 ring-indigo-500/10 shadow-lg" : "hover:shadow-xl"
                  } transition-all`}
                >
                  <img
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={image}
                  />
                  {coverImageIndex === index && (
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-4">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-indigo-600 px-2 py-0.5 rounded shadow-sm">
                        Foto de Portada
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {coverImageIndex !== index && (
                      <button
                        onClick={() => setAsCover(index)}
                        className="size-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center text-slate-600 shadow-sm hover:text-indigo-600"
                        title="Marcar como portada"
                      >
                        <Star className="size-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(index)}
                      className="size-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center text-red-500 shadow-sm hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
