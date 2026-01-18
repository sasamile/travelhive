"use client";

import { inspirationCards } from "@/components/customers/data";

function InspirationGrid() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {inspirationCards.map((card) => (
        <div
          key={card.title}
          className="group relative cursor-pointer overflow-hidden rounded-xl shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-all hover:shadow-[0px_8px_24px_rgba(0,0,0,0.12)]"
        >
          <div
            className="aspect-4/5 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%), url("${card.image}")`,
            }}
          />
          <div className="absolute bottom-0 left-0 w-full p-8">
            <span
              className={`mb-3 inline-block rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white ${card.badgeClassName}`}
            >
              {card.badge}
            </span>
            <h3 className="text-2xl font-extrabold leading-tight text-white">
              {card.title}
            </h3>
            <p className="mt-1 text-sm text-white/80 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default InspirationGrid;
