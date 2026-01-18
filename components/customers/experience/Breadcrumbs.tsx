import type { BreadcrumbItem } from './data'

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <div key={item.label} className="flex items-center gap-2">
            {item.href ? (
              <a className="hover:text-primary" href={item.href}>
                {item.label}
              </a>
            ) : (
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {item.label}
              </span>
            )}
            {!isLast && <span>/</span>}
          </div>
        )
      })}
    </div>
  )
}
