import { Plus } from 'lucide-react'

export function AgentHeader() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-[#121717] dark:text-white tracking-tight">
          Panel del Agente
        </h1>
        <p className="text-[#657f81] text-lg font-medium">
          Bienvenido de nuevo, Julián. Aquí tienes un resumen de hoy.
        </p>
      </div>
      <button className="bg-primary hover:bg-[#2d5456] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform hover:scale-[1.02] shadow-lg shadow-primary/20">
        <Plus className="size-4" />
        Crear nuevo viaje
      </button>
    </header>
  )
}
