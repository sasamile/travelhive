import type { InfoItem } from './data'

type TrustBadgesProps = {
  items: InfoItem[]
}

export function TrustBadges({ items }: TrustBadgesProps) {
  return (
    <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 border border-primary/10 space-y-4">
      {items.map((badge) => {
        const Icon = badge.icon
        return (
          <div key={badge.title} className="flex gap-4">
            <Icon className="size-5 text-primary" />
            <div>
              <p className="text-sm font-bold">{badge.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {badge.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
