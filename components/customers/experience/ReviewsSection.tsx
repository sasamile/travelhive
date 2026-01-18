import type { Review } from './data'
import { Star } from 'lucide-react'

type ReviewsSectionProps = {
  rating: string
  total: string
  reviews: Review[]
}

export function ReviewsSection({ rating, total, reviews }: ReviewsSectionProps) {
  return (
    <section className="mt-20 pt-16 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-10">
        <Star className="size-7 text-primary" />
        <h2 className="text-3xl font-extrabold">
          {rating} · {total} reseñas
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10">
        {reviews.map((review) => (
          <div key={review.name} className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="size-12 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url('${review.avatar}')` }}
                aria-label={`Retrato de ${review.name}`}
                role="img"
              />
              <div>
                <h4 className="font-bold">{review.name}</h4>
                <p className="text-xs text-gray-400">{review.location}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
              {review.quote}
            </p>
          </div>
        ))}
      </div>
      <button className="mt-12 px-8 py-3 border border-gray-900 dark:border-white font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        Mostrar las {total} reseñas
      </button>
    </section>
  )
}
