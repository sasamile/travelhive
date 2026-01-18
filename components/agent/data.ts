import type { ComponentType } from 'react'
import {
  Calendar,
  CreditCard,
  LayoutDashboard,
  Lightbulb,
  MessageCircle,
  Plus,
  TicketCheck,
  UserPlus,
} from 'lucide-react'

export type StatCard = {
  title: string
  value: string
  trend: string
  icon: ComponentType<{ className?: string }>
  iconClassName: string
}

export type TripRow = {
  title: string
  location: string
  image: string
  status: string
  statusClassName: string
  price: string
  date: string
}

export type NavItem = {
  label: string
  icon: ComponentType<{ className?: string }>
  isActive?: boolean
  badge?: string
}

export type HighlightCard = {
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  accentClassName: string
  iconClassName: string
  descriptionClassName: string
  actionLabel?: string
}

export const navItems: NavItem[] = [
  { label: 'Panel de control', icon: LayoutDashboard, isActive: true },
  { label: 'Crear nuevo viaje', icon: Plus },
  { label: 'Mensajes', icon: MessageCircle, badge: '14' },
  { label: 'Reservas', icon: Calendar },
]

export const statCards: StatCard[] = [
  {
    title: 'Total reservas',
    value: '128',
    trend: '+12%',
    icon: TicketCheck,
    iconClassName: 'text-primary bg-primary/10',
  },
  {
    title: 'Ingresos mensuales',
    value: '€45,200',
    trend: '+8%',
    icon: CreditCard,
    iconClassName: 'text-primary bg-primary/10',
  },
  {
    title: 'Mensajes nuevos',
    value: '14',
    trend: '+5%',
    icon: UserPlus,
    iconClassName: 'text-accent-peach bg-accent-peach/10',
  },
]

export const activeTrips: TripRow[] = [
  {
    title: 'Safari de Lujo',
    location: 'Kenia, África',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDdXK8sNCKoKJu-lfR7UaIYQiu0AM9WopL_S8op4lJeHZWTKElQbqn1zcgmH4Q7BRRcidsHqNESTIB9R1BRRuMj5p7pDRj4SXmGAgnyWjSd-SPa8qhc30zN7YauwYIMjbJVMbl0CmjkBC6aTIcZ22OxOdwFHq4JILY3QVtUunqRCpDzX0qXNSpuRV6KI3H3xBVzclfeyTC_z-ZRd73u81FTJtGcMdNKtPZjkh-hbZYjyX4BsepY2n7w5VfzmyPe8pM8OqhwVAWtiAIV',
    status: 'Activo',
    statusClassName:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    price: '€4,500',
    date: '12 Oct, 2023',
  },
  {
    title: 'Escapada Santorini',
    location: 'Grecia, Europa',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDy8fPYDnR6T0A6yw2lszzy47rFp26WIxWgzqQJVg8puXXiMPI5uofnaD5FwpF3lkrrVRWpmdxNqB_feyNZCmEoR7CiJhyZyDizvg6FGkdZ92LrvHgs8AWIvGX2iJSgHwJXFl_6it_Nfx3ftK9DZhytcNAyFy3-UuoVBN2XOYDKqNaI6SAfZTiKVIDYQp7cSKqHD617UgDK3ddypwzM9Kke09H5_O3MyFEUN4LR1LR_LjvLuTT3nyr5d7RykVysKcz0NJw6iMRHxDBy',
    status: 'Pendiente',
    statusClassName:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    price: '€3,200',
    date: '08 Oct, 2023',
  },
  {
    title: 'Romance en París',
    location: 'Francia, Europa',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmz44ZjxlwT9GFtgwnWkvTGZDhNSzKT_MFictklXjBJ-BUNGR3JsFg3guGQb2VsCPC4f1NCqZ-27TEVCv5l2OnBv3VgzKPVQNfmd7tf_pzAmU6ZMTWJbsWSUdzixYOt_T06dEHHJykJhNegwJ4fIsxRKk7NXV6BJhaX3XEZpwIbr4-3M9gYCtUvIiUgHgi3veXNMB2Lu7rVX6jzokoXwf_9E1s2dA-glSFboJD84_5hryWl2tVyxR94cILRiR0nzjPzJ_zubf16Lfc',
    status: 'Activo',
    statusClassName:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    price: '€2,800',
    date: '01 Oct, 2023',
  },
]

export const highlights: HighlightCard[] = [
  {
    title: 'Consejo del Día',
    description:
      'Añadir itinerarios detallados con fotos de alta calidad aumenta la tasa de reserva en un 40%. Considera actualizar tus descripciones de "Safari de Lujo".',
    icon: Lightbulb,
    accentClassName: 'bg-primary/5 dark:bg-primary/10 border-primary/10',
    iconClassName: 'bg-primary text-white',
    descriptionClassName: 'text-[#3c6f72]',
  },
  {
    title: 'Comunidad de Agentes',
    description:
      'Únete al próximo webinar sobre "Turismo Sostenible en 2024" este jueves a las 10:00 AM.',
    icon: UserPlus,
    accentClassName: 'bg-accent-peach/5 dark:bg-accent-peach/10 border-accent-peach/10',
    iconClassName: 'bg-accent-peach text-white',
    descriptionClassName: 'text-accent-peach',
    actionLabel: 'Inscribirme ahora',
  },
]
