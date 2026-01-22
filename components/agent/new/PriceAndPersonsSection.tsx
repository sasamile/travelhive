"use client";

interface PriceAndPersonsSectionProps {
  price?: number;
  currency: string;
  maxPersons?: number;
  onPriceChange: (price: number | undefined) => void;
  onCurrencyChange: (currency: string) => void;
  onMaxPersonsChange: (maxPersons: number | undefined) => void;
}

export default function PriceAndPersonsSection({
  price,
  currency,
  maxPersons,
  onPriceChange,
  onCurrencyChange,
  onMaxPersonsChange,
}: PriceAndPersonsSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 block">Precio</label>
        <div className="relative">
          <input
            className="w-full h-11 px-4 pr-20 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={price === undefined ? "" : price}
            onChange={(e) => {
              const value = e.target.value;
              onPriceChange(value === "" ? undefined : parseFloat(value) || undefined);
            }}
          />
          <select
            className="absolute right-3 top-2.5 h-6 px-2 border border-transparent bg-transparent text-sm text-slate-500 focus:outline-none"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
          >
            <option value="COP">COP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 block">Cantidad de Personas</label>
        <input
          className="w-full h-11 px-4 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          type="number"
          min="1"
          placeholder="0"
          value={maxPersons === undefined ? "" : maxPersons}
          onChange={(e) => {
            const value = e.target.value;
            onMaxPersonsChange(value === "" ? undefined : parseInt(value) || undefined);
          }}
        />
      </div>
    </div>
  );
}
