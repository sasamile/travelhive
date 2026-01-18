import type { ComponentType } from 'react'

type ActionButtonProps = {
  icon: ComponentType<{ className?: string }>
  label: string
}

export function ActionButton({ icon: Icon, label }: ActionButtonProps) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold text-sm">
      <Icon className="size-4" /> {label}
    </button>
  )
}
