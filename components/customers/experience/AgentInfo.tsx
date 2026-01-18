export function AgentInfo() {
  return (
    <div className="flex items-center justify-between pb-8 border-b border-gray-100 dark:border-gray-800">
      <div className="flex gap-4">
        <div
          className="size-16 rounded-full bg-cover bg-center border-2 border-primary/10"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBOCqZCRF6eoOxb2PXbUvHLEQK4tK9kYD8jokbSMjHdIGoQ6FdVSIyCEtdUxyINPqMX0NRcEx7Z7nRHGiMHIo1a7dhayXtcBiRQg6zanM36gt_ShkFA-3iXSXKSqNqjPAKluJwb-t8Eyg2oUuXr-kyu3A6bbe7sZxiFzKdC6CQ3g4NTH-7ufJ6y6zjADNFylH2a4ZH-0OQUjW0YIRArAHj-Uuw-xAZDPTMtiFR7nH9V2Mel3mpebY2O3k2GcaN4LnIUJPJNOec5NwFg')",
          }}
          aria-label="Retrato de la agente Elena"
          role="img"
        />
        <div>
          <h3 className="text-xl font-bold">Anfitriona: Elena R.</h3>
          <p className="text-gray-500 text-sm">
            Agente certificada con 8 años de experiencia en Indonesia
          </p>
        </div>
      </div>
      <button className="px-6 py-2.5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors text-sm">
        Contactar Agente
      </button>
    </div>
  )
}
