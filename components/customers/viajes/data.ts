export type TripStatus = {
  label: string
  className: string
}

export type Trip = {
  id: string
  title: string
  price: string
  image: string
  imageAlt: string
  dateRange: string
  location: string
  status: TripStatus
  primaryAction: string
  secondaryAction: string
}

export type PastTrip = {
  id: string
  title: string
  date: string
  location: string
  image: string
  imageAlt: string
}

export const upcomingTrips: Trip[] = [
  {
    id: 'paris',
    title: 'Escapada Romántica en París',
    price: '$2,450.00',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuArUJKsb2XsUaZiTfsKTCUGZMPN_VPO5boYxEFMPJ_HSKK9IORcE5TIKn-AUrXZMk3OU3CArErHSWCVWP74rGV4tq0xIf9eu0k99OJsycOPHKiuKzlUy0tClfHemkYYPzT_GAVoXIYXYOxG0RYGjZyeg34YCgAbDlr0KrFDRSuaPB6S3SHkk7ICAAhKEDrcw8miM5_8KYZYj97kio2rpTcx3bY70wpPpi_kocD6zQudi-kW-Qeb7QJTXItx7nrK_8pA27hcHzj9ZyYY',
    imageAlt: 'Torre Eiffel al atardecer en Paris',
    dateRange: '12 - 18 Oct 2024',
    location: 'París, Francia',
    status: {
      label: 'Confirmado',
      className:
        'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800',
    },
    primaryAction: 'Ver Detalles',
    secondaryAction: 'Modificar',
  },
  {
    id: 'positano',
    title: 'Costa Amalfitana: El Retiro de Verano',
    price: '$3,120.00',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCqzaxZOfPB9mVr6jBRGgmJ-QAPfBhI8zEosG3C5_ivGo9gAIfm043mQUToXS0Co3ylA8g7Y4U9Fv2LuiBd6HgnN95zHhi5cC30VmRRaZ83P3bn8v8TbcAgUiTqIOqPJm8A7E_trEJhztsEDjca-WSJV5YdjxDviNAPUXvOun1OimysW-GZbQbb1TPVb67LAqU5CkMtbZbGUK3E8lvk-Mgjyne6Cf8GkmNO4Rxpp4SWY2acv-fdNWj9lzozAv5RX47bAsHV1ojg_BIH',
    imageAlt: 'Playa soleada en Positano, Italia',
    dateRange: '22 - 30 Jun 2025',
    location: 'Positano, Italia',
    status: {
      label: 'Pendiente',
      className:
        'bg-orange-50 dark:bg-orange-900/20 text-accent-terracotta border border-orange-100 dark:border-orange-800',
    },
    primaryAction: 'Ver Detalles',
    secondaryAction: 'Cancelar',
  },
]

export const pastTrips: PastTrip[] = [
  {
    id: 'tokyo',
    title: 'Tour por Tokio',
    date: 'Feb 2023',
    location: 'Japón',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC2qz6gYCTOotR1nSIVuImhho0Fz5piJ0AXgzH8hO-noa_0xa_DVEZFc0gteSb6NTs-OjlpHzqCVev4iuFNd2aX41sxxHPGt_L2Mes7DzTi-jZozdGtJ8V1cgWDZ6x4telZMaHGJwz9dJO-CoqqbJZGruxgaFE2Vc1EQ_HH9KqC3Pi-wu1dmrlh1XQPILg8_eIYbBZcjEJ4FVDZHHDx6RdrZe9H8p_6A-sH-IhYBKp_er6clLVlEh9AtYXknwZ6I1rRPAQpvQ6XDDvV',
    imageAlt: 'Skyline nocturno de Tokio',
  },
  {
    id: 'santorini',
    title: 'Sol en Santorini',
    date: 'Sep 2022',
    location: 'Grecia',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCbHxeNYFjyfoRzlZNjPB5C86yS09NduJejOOiOQ0YB5-1jsoABmvmt8wlQDDB5SgI5dGy8H01Rv156pIe-Ph9UJGNssr2qQ0PMkG8hFBUSSEhkfQiiC7L9B86cDh0lhuv1voOwnpSaBIrjhM1HkpepYgAQnT8-NxQnLPAveU6fwQYhOaBcugU2C95rFquJ_Bo8ggf3SjrnVvhK017bhawgyDGM2JSEqxa1G5eYthNPaXHiIDlSw073QncVRW2MG1P9I1Z0IaEA-cfR',
    imageAlt: 'Casas blancas de Santorini',
  },
]
