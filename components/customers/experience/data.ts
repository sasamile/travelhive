import type { ComponentType } from 'react'
import {
  CalendarX,
  HeartPulse,
  Landmark,
  Leaf,
  PlaneLanding,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
} from 'lucide-react'

export type BreadcrumbItem = {
  label: string
  href?: string
}

export type GalleryImage = {
  src: string
  alt: string
  className: string
}

export type ItineraryDay = {
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
}

export type Review = {
  name: string
  location: string
  quote: string
  avatar: string
}

export type InfoItem = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

export const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Inicio', href: '#' },
  { label: 'Experiencias', href: '#' },
  { label: 'Sudeste Asiático' },
]

export const galleryImages: GalleryImage[] = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLBMxEvPl6A-xYGbTLr4rcumRwOte85yphPBPATnZaBnc0POKKhPG39xYi2f6iBURH3yURvZYsg0Cb60rjQEzGlShhmqDPHEIiDESbNxVNwxMTw9i_RU94NMmn77JtjmGPZ1xA7FCzaFnQJpTQQrx_7yGJgUZoanIT_U6ZTle_kP_Sad3XQBHJyH03SJrOjUB8tVURdVDbFxvJWjBq9BoTqLy-PGn7Uji9F27Mb9ETipPqlZJyBsgxYflSEDlVQGnUXf37MMrfDbWD',
    alt: 'Vista principal de una villa de lujo en Bali rodeada de jungla',
    className: 'col-span-2 row-span-2',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH1tGhU60164KsVt-663T009sWgFwyUo-XIC29vYwU8p4TCqq8CDLJVTiM3HJkSSguVvan1s9XwC1J_dbNiKUdZPezdp65PB-AgsY74r6fodTnf0UoNlLytOqQDc6mNEOwBkBWs17pcNx5eWoo75GaWrgL1s3IVPTq_ZUBo_4SSGhJgCdwSgt_LZehg5SUuG-H88qcQJrdAkyfEvDyyNFRjkrPiqPrcmxXqUkzFtCl4DRE8Mr6pnNTjYNe8B41EQvOEj2rmRvrZUY2',
    alt: 'Ofrenda tradicional balinesa en primer plano',
    className: 'col-span-1 row-span-1',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBW4slLJxSQj33SwHg8idcms70SGeUuNtDX3W4GlenCBeeGnAQKckC7SdZ86s4_jFEaPHp8SGXbTIuHGMf6B8upr93xApdA4__nibPn9hAPZze3xjdGN1fhZgR7baDNOy_0S_ibABivo_LbZk6reVnP6wFlLODyD2cmrA-MmN6x_RChv7ib2zQ7PzK3n1sISq2ApE4YeMeda5DCaISWEnu7I8tAEBUzOCsTl1IGs3mO6eR6KkmD1GmnxIIZcEk2gbK-s4FwcCI2WagH',
    alt: 'Piscina infinita con vista a terrazas de arroz',
    className: 'col-span-1 row-span-1',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL0UEYNiuqCAmCyjG3i7DGg9RW0Hb9Wy1-mOGM3SQBYtuIni194ilHEl-0wL6nh5WkEHV0vgME-_SBo9ZHAnVMK_fWialE9y4-2t0f0gTBv9yyySuSyh0ovBRafE-6I5vjxBot0qR-bYligqZGfqtk4piPsYjn550ssWjkMtOpC1iy3kmwl846GS5it5E6rhqjoQmL_jfQY_rDXo_NsyhOufwWT35dh711rh9cRbu0MyfBxBfUoHG4CoPWVvqkA8LdKQC62Lr4lLPO',
    alt: 'Mercado local con frutas de colores',
    className: 'col-span-1 row-span-1',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDspnwzbmyX_uh70GYztxjD8xnlu_XiQySm7y0cMQYWrc9ZzjYfkBR2ZvphJ5PStQ3lcer80-_KklTOeTQH1IB8OvfhlxITUCkCSXF2a_u14Ngiw-c1OndnLdhuR2OC250uxig8bYKv4WUVG_SwHGzQh5rH1YqQazUZguwUR4c6r9hnhqTbPBpvTb7nV1spJpFbeFmg5Zsltdfjf5Msuwf4dR8HoYwU7iSQxtnqbUphe3ktk1x0tBAovPSXntcKkGpJykIYEudTIRx7',
    alt: 'Atardecer en el templo Tanah Lot',
    className: 'col-span-1 row-span-1',
  },
]

export const itinerary: ItineraryDay[] = [
  {
    title: 'Día 1: Llegada y Armonía en Ubud',
    description:
      'Traslado privado al hotel y ceremonia de bienvenida tradicional Balinesa.',
    icon: PlaneLanding,
  },
  {
    title: 'Día 2: Templos Sagrados y Selva',
    description:
      'Visita a Tirta Empul al amanecer seguida de un taller de meditación privada.',
    icon: Landmark,
  },
  {
    title: 'Día 3: Terrazas de Arroz y Gastronomía',
    description:
      'Trekking suave por Tegalalang y clase magistral de cocina local orgánica.',
    icon: Leaf,
  },
  {
    title: 'Día 4: Atardecer en la Costa',
    description:
      'Traslado a Uluwatu para disfrutar de las mejores vistas del Índico y cena de gala.',
    icon: Sun,
  },
]

export const reviews: Review[] = [
  {
    name: 'Marco Tulio',
    location: 'Madrid, España • Septiembre 2023',
    quote:
      '"Una experiencia verdaderamente mágica. Elena organizó todo a la perfección. La visita privada al templo fue el punto culminante de nuestro año."',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBaFsAxR7QvpoDoRyDLK6ps3SZvaYbVhJx-J5Hq4FSbRRrlyWV0sUAoqsxy0xRJitpnnrkZERlIz9XrjLY4WkzhWLguKcFF503lh1SUOFR93YWR2DJSdDpQvFGTJt4ZWdEtfjH4LiRmQroCmZgYJr8lI6BUhBWsEtpXrmwTR-RsBbu4XQc3Xa-cxtVmxAvLqo0q9oCUvD73IDyMyaFsdVCeGiI4RhfU87PSGx3Yopf6UYbQOXDSEPXvtuMJ83tLLOFkR9kIoPT-l_OF',
  },
  {
    name: 'Sofía Vergara',
    location: 'Bogotá, Colombia • Agosto 2023',
    quote:
      '"Superó todas nuestras expectativas. El equilibrio entre aventura y relajación es perfecto. Los hoteles boutique seleccionados eran de ensueño."',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDr4AVdK4yO3wv9I4nhwXrZatgPHsVpO4JR0r0lf1Z7E74QKZcXRtP5qVN8mZNq8epN3Zse-2zsBH8Znm8VgcIQ6T2WYi0rcgubEyZlX88ar6xUuvGGkfPcK6HO4S7ts4L6Wh1Q9DGBWBgWihWf96jBgh0kygik3OBDbtyeYRpTFAZZTT_NHbbr-9BVHFgO62GaAva_B5paqfpL5gWigIIrv-aO3TFdHTRHGG0cGiKIso1IFGGdGC8urcQYfieO0bTNqVb_afBRbGGh',
  },
]

export const rules = [
  'Ropa respetuosa en templos',
  'No se permite fumar en transporte',
  'Edad mínima: 12 años',
]

export const safety: InfoItem[] = [
  {
    icon: HeartPulse,
    title: 'Seguro médico incluido',
    description: 'Cobertura completa durante toda la experiencia.',
  },
  {
    icon: Stethoscope,
    title: 'Guía certificado en primeros auxilios',
    description: 'Equipo preparado para atender cualquier situación.',
  },
  {
    icon: Sparkles,
    title: 'Protocolos de higiene reforzados',
    description: 'Medidas estrictas para tu tranquilidad.',
  },
]

export const trustBadges: InfoItem[] = [
  {
    icon: ShieldCheck,
    title: 'Pago Seguro',
    description:
      'Tus datos están protegidos por encriptación de grado militar.',
  },
  {
    icon: CalendarX,
    title: 'Cancelación Flexible',
    description: 'Cancela hasta 7 días antes para reembolso completo.',
  },
]

export const footerLinks = ['Privacidad', 'Términos', 'Mapa del sitio', 'Contacto']
