import type { HighlightCard } from './data'
import { ChevronRight } from 'lucide-react'

type HighlightsSectionProps = {
  cards: HighlightCard[]
}

export function HighlightsSection({ cards }: HighlightsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className={`rounded-xl p-8 border ${card.accentClassName}`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${card.iconClassName}`}
              >
                <Icon className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                <p
                  className={`text-sm leading-relaxed ${card.descriptionClassName}`}
                >
                  {card.description}
                </p>
                {card.actionLabel ? (
                  <button className="mt-4 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-2">
                    {card.actionLabel} <ChevronRight className="size-3" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
