type AgentInfoProps = {
  agencyName?: string | null;
  agencyPicture?: string | null;
};

export function AgentInfo({ agencyName, agencyPicture }: AgentInfoProps) {
  const displayName = agencyName || "Agencia de Viajes";
  const pictureUrl = agencyPicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=fff`;

  return (
    <div className="flex items-center justify-between pb-8 border-b border-gray-100 dark:border-gray-800">
      <div className="flex gap-4">
        <div
          className="size-16 rounded-full bg-cover bg-center border-2 border-primary/10"
          style={{
            backgroundImage: `url('${pictureUrl}')`,
          }}
          aria-label={`Logo de ${displayName}`}
          role="img"
        />
        <div>
          <h3 className="text-xl font-bold">Agencia: {displayName}</h3>
          <p className="text-gray-500 text-sm">
            Agencia certificada con experiencia en viajes
          </p>
        </div>
      </div>
      <button className="px-6 py-2.5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors text-sm">
        Contactar Agencia
      </button>
    </div>
  );
}
