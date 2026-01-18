import type { StatCard } from './data'

type StatsGridProps = {
  cards: StatCard[]
}

export function StatsGrid({ cards }: StatsGridProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="bg-white dark:bg-[#242424] p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#657f81] text-sm font-bold uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`size-10 rounded-lg flex items-center justify-center ${card.iconClassName}`}
              >
                <Icon className="size-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">{card.value}</span>
              <span className="text-sm font-bold text-green-500">
                {card.trend}
              </span>
            </div>
          </div>
        )
      })}
    </section>
  )
}
