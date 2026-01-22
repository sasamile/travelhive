"use client";

interface PriceTypeAndCategorySectionProps {
  priceType: "adults" | "children" | "both";
  category: string;
  onPriceTypeChange: (priceType: "adults" | "children" | "both") => void;
  onCategoryChange: (category: string) => void;
}

export default function PriceTypeAndCategorySection({
  priceType,
  category,
  onPriceTypeChange,
  onCategoryChange,
}: PriceTypeAndCategorySectionProps) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 block">Tipo de Precio</label>
        <div className="relative">
          <select
            className="w-full h-11 px-4 border border-neutral-200 rounded-xl text-sm appearance-none bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            value={priceType}
            onChange={(e) => onPriceTypeChange(e.target.value as "adults" | "children" | "both")}
          >
            <option value="adults">Solo Adultos</option>
            <option value="children">Solo Niños</option>
            <option value="both">Familia (Adultos y Niños)</option>
          </select>
          <span className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">⌄</span>
        </div>
      </div>
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 block">Categoría</label>
        <div className="relative">
          <select
            className="w-full h-11 px-4 border border-neutral-200 rounded-xl text-sm appearance-none bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="Adventure">Aventura</option>
            <option value="Luxury">Lujo</option>
            <option value="Cultural">Cultural</option>
            <option value="Wellness">Bienestar</option>
            <option value="Wildlife">Vida Silvestre</option>
          </select>
          <span className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">⌄</span>
        </div>
      </div>
    </div>
  );
}
