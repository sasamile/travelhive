import CustomersNav from "@/components/customers/CustomersNav";
import Image from "next/image";
import {
  ChevronDown,
  Heart,
  Layers,
  Map,
  Minus,
  Plus,
  SlidersHorizontal,
  Star,
} from "lucide-react";

const experiences = [
  {
    id: "safari-kenia",
    title: "Safari de Lujo en Kenia",
    subtitle: "Reserva Natural Maasai Mara • 7 días",
    price: "$2.500",
    rating: "4.9",
    badge: "Todo incluido",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCVM9N-tgee1n9L9Hh16ICwHwBRqMrkp_ipt5YTjGvDMXXtm4FPWRRCpsSl9p1N1njYjMqVP5Ev_41opHAcCdZrWzhOq0Sb-FMfVJyCvv5aIrxK7F0RJbZBJ7Yl_7hT4tXkh4DlkDnA88N8661cO4Vp8CpGeiCBIpvEOZc-jRioD_h0HHsTrOAVEJGOo3E7gkb8QJE9pVgCmyoH8x1JhtRl1Q88hqLdm-sVMehPm5edGZ7X6_dGYmLrHyZNdTDqwr1KtnYSqJMqaPSQ",
  },
  {
    id: "crucero-griego",
    title: "Crucero por las Islas Griegas",
    subtitle: "Santorini y Mykonos • 10 días",
    price: "$1.850",
    rating: "4.8",
    badge: "Oferta especial",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB9FbTXYutsJamJPOzzwKV-RLci4lZ9BWtyfsYEpgOEk9gUX27iRBtsSsywesFo9zarAZ__55rXcwHt14pw_eCPXaLWiX-hlynvqWnG7rTfiNIOEcBCg32Nz-YztbRifJnEEOwfmZ51D3PhdGbBynhwi6APF04Fakl7lHeHGBSfHfjN2cPryd5JfHtf4KKiS5qGYZhz3EpC0eQ6_-3qpfMKs1Rkhn3rmInceMrjZrcZo5N4-DNh4FDpcUptIU2FXAXJKrj2kQL31o06",
  },
  {
    id: "retiro-bali",
    title: "Retiro Espiritual en Bali",
    subtitle: "Ubud y Selvas del Norte • 12 días",
    price: "$1.200",
    rating: "4.9",
    badge: null,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD5BbsFMYzKzEWQ5F7QkUfxEN9xNDBB2XaldY6GoU3bJrp3gK2dHdj8AipOSECF1uKpTBBsC3ka1p_x7KuHujSC5XFfVwajYbiB_89mrIFeHoxXICljJqcoI6b_0gGDKSGII5XCBkZqLNPwB1YXwd32zwjPlJe3QnlU6d0UN8InuP1t4A1gmxkW3zuoYhJSY1R4Fy_Dq_3yVJZ6nKZfW_WXjiefjDs5Yd15EWTmwTH1wrxmC3jCc8PPdo8BlfQZeN_dzOBR2zZei76U",
  },
  {
    id: "kioto-japon",
    title: "Tradiciones de Kioto, Japón",
    subtitle: "Tokio, Kioto y Osaka • 14 días",
    price: "$3.400",
    rating: "5.0",
    badge: "Grupo reducido",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBRXXMxuYmJXxO67l9czO6EWZ4pCIuE8deQpkXYlObjh7dnrCZ3FT7Ohbhlz-ChnMAOpOaJVkkvzRsk7hptBkgCPngusHXCEICG4z9XMpOV1p_yx3tyleFeCb-Q7R29n23KdB5PgrBG7Qqs3jTyiW-1eNa0QZ28Ve3-A5yxWgtA809wJDIJhWSNDeU7AwzsAEvLNX4C25M-H8ZDNtYTWOiDqcBjI1StHK03uU0_SZoRWHs4-cTooSmkejzaNYLkNhAPaE_Wa5g6szg_",
  },
];

const mapPins = [
  { id: "pin-1", label: "$2.500", className: "top-[30%] left-[20%]" },
  { id: "pin-2", label: "$1.850", className: "top-[45%] left-[55%]" },
  { id: "pin-3", label: "$1.200", className: "top-[60%] left-[80%]" },
  { id: "pin-4", label: "12", className: "top-[20%] left-[70%]", isCluster: true },
];

function getParamValue(value?: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function SearchResultsPage({
  searchParams,
}: {
  searchParams?: {
    destino?: string | string[];
    fechas?: string | string[];
    viajeros?: string | string[];
    tipo?: string | string[];
  };
}) {
  const destination = getParamValue(searchParams?.destino);
  const dates = getParamValue(searchParams?.fechas);
  const travelers = getParamValue(searchParams?.viajeros);
  const travelType = getParamValue(searchParams?.tipo);

  return (
    <div className="min-h-screen bg-[#fdfdfc] text-[#121717] dark:bg-[#1a1a1a] dark:text-gray-100">

      <nav className="sticky top-20 z-40 border-b border-[#ebefef] bg-[#fdfdfc] py-3 shadow-sm dark:border-gray-800 dark:bg-[#1a1a1a]">
        <div className="mx-auto flex w-full max-w-full items-center justify-between gap-4 px-6 md:px-20">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {[
              { label: "Presupuesto" },
              { label: "Tipo de viaje" },
              { label: "Duración" },
              { label: "Cancelación gratuita" },
              { label: "Experiencias" },
            ].map((filter) => (
              <button
                key={filter.label}
                className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#ebefef] px-5 text-sm font-medium transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                type="button"
              >
                <span>{filter.label}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            ))}
          </div>
          <button
            className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm font-bold shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            type="button"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </button>
        </div>
      </nav>

      <main className="flex flex-1 overflow-hidden">
        <section className="w-full  overflow-y-auto bg-[#fdfdfc] px-20 py-8 dark:bg-[#1a1a1a] lg:w-[60%]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                Resultados para{" "}
                <span className="text-primary">
                  {destination || "Cualquier lugar"}
                </span>
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {travelType
                  ? `Tipo: ${travelType}`
                  : "Explora experiencias premium seleccionadas"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <span>Ordenar por:</span>
              <button
                className="flex items-center gap-1 font-bold text-[#121717] dark:text-white"
                type="button"
              >
                Recomendados <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {[
              { label: "Destino", value: destination || "Cualquier lugar" },
              { label: "Fechas", value: dates || "Cualquier semana" },
              { label: "Viajeros", value: travelers || "Añadir" },
            ].map((filter) => (
              <span
                key={filter.label}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                {filter.label}: {filter.value}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {experiences.map((item) => (
              <article key={item.id} className="group flex flex-col gap-3">
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-gray-200">
                  {item.badge && (
                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur-sm dark:bg-gray-900/90">
                      {item.badge}
                    </div>
                  )}
                  <button
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-transform hover:scale-110"
                    type="button"
                    aria-label="Guardar experiencia"
                  >
                    <Heart className="h-4 w-4 fill-white text-white" />
                  </button>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="px-1">
                  <div className="mb-1 flex items-start justify-between">
                    <h4 className="text-lg font-bold leading-tight transition-colors group-hover:text-primary">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1 text-sm font-bold">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    {item.subtitle}
                  </p>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Desde
                      </p>
                      <p className="text-xl font-extrabold">
                        {item.price}
                        <span className="text-sm font-medium text-gray-500">
                          {" "}
                          / pers.
                        </span>
                      </p>
                    </div>
                    <button
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ebefef] transition-all hover:bg-primary hover:text-white dark:bg-gray-800"
                      type="button"
                      aria-label="Ver detalles"
                    >
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mb-8 mt-12 flex flex-col items-center gap-4">
            <p className="text-sm text-gray-500">Has visto 4 de 300 resultados</p>
            <div className="h-1 w-64 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
              <div className="h-full w-1/4 bg-primary" />
            </div>
            <button
              className="mt-2 rounded-xl border-2 border-[#121717] px-8 py-3 font-bold transition-all hover:bg-[#121717] hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
              type="button"
            >
              Cargar más experiencias
            </button>
          </div>
        </section>

        <aside className="relative hidden w-[40%] border-l border-[#ebefef] dark:border-gray-800 lg:block">
          <div className="absolute inset-0 bg-linear-to-b from-[#f1f1ef] to-[#e7ebe8] dark:from-[#1e1e1e] dark:to-[#141414]" />
          {mapPins.map((pin) => (
            <div
              key={pin.id}
              className={`absolute ${pin.className} ${
                pin.isCluster ? "" : "group"
              }`}
            >
              <button
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold shadow-lg transition-all hover:scale-110 ${
                  pin.isCluster
                    ? "h-10 w-10 justify-center rounded-full border-2 border-primary bg-primary/20 text-primary"
                    : "border border-gray-200 bg-white text-[#121717] dark:border-gray-700 dark:bg-gray-800 dark:text-white hover:bg-primary hover:text-white"
                }`}
                type="button"
              >
                {pin.isCluster ? pin.label : pin.label}
              </button>
            </div>
          ))}
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-3 rounded-2xl border border-white/20 bg-white/90 p-1.5 shadow-xl backdrop-blur-md dark:bg-gray-800/90">
            <button
              className="rounded-xl p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
              type="button"
            >
              <Plus className="h-4 w-4" />
            </button>
            <div className="h-6 w-px self-center bg-gray-300 dark:bg-gray-600" />
            <button
              className="rounded-xl p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
              type="button"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="h-6 w-px self-center bg-gray-300 dark:bg-gray-600" />
            <button
              className="flex items-center gap-2 rounded-xl px-3 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
              type="button"
            >
              <Layers className="h-4 w-4" />
              <span className="text-sm font-bold">Capas</span>
            </button>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-[#fdfdfc] dark:to-[#1a1a1a]" />
        </aside>
      </main>

      <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 lg:hidden">
        <button
          className="flex items-center gap-2 rounded-full bg-[#121717] px-6 py-3.5 font-bold tracking-tight text-white shadow-2xl transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-[#121717]"
          type="button"
        >
          <Map className="h-4 w-4" />
          Ver mapa
        </button>
      </div>
    </div>
  );
}

export default SearchResultsPage;