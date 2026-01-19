import type { InfoItem } from './data'
import { CheckCircle } from 'lucide-react'

type PoliciesSectionProps = {
  rules: string[]
  safety: InfoItem[]
  cancellationPolicy?: string
}

export function PoliciesSection({ rules, safety, cancellationPolicy }: PoliciesSectionProps) {
  return (
    <section className="mt-20 py-16 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-12">
      <div>
        <h4 className="font-extrabold mb-4 uppercase text-xs tracking-widest text-gray-400">
          Reglas del viaje
        </h4>
        <ul className="space-y-3 text-sm font-medium">
          {rules.map((rule) => (
            <li key={rule} className="flex items-center gap-2">
              <CheckCircle className="size-4 text-gray-400" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-extrabold mb-4 uppercase text-xs tracking-widest text-gray-400">
          Salud y Seguridad
        </h4>
        <ul className="space-y-3 text-sm font-medium">
          {safety.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.title} className="flex items-start gap-2">
                <Icon className="size-4 text-gray-400 mt-0.5" />
                <div>
                  <p>{item.title}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      <div>
        <h4 className="font-extrabold mb-4 uppercase text-xs tracking-widest text-gray-400">
          Política de Cancelación
        </h4>
        <p className="text-sm leading-relaxed text-gray-500">
          {cancellationPolicy || "Reembolso total por cancelaciones realizadas dentro de las 48 horas posteriores a la reserva, siempre que falten al menos 14 días para el inicio del viaje."}
        </p>
        {cancellationPolicy && (
          <button className="mt-4 text-sm font-bold underline hover:text-primary">
            Ver más detalles
          </button>
        )}
      </div>
    </section>
  )
}
