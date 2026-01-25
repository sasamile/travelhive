"use client";

import { useState, useEffect } from "react";

interface PriceAndPersonsSectionProps {
  price?: number;
  currency: string;
  maxPersons?: number;
  onPriceChange: (price: number | undefined) => void;
  onCurrencyChange: (currency: string) => void;
  onMaxPersonsChange: (maxPersons: number | undefined) => void;
}

// Función para formatear número con separadores de miles
const formatNumber = (value: string): string => {
  // Remover todo excepto números
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  
  // Formatear con puntos como separadores de miles
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Función para convertir formato a número
const parseFormattedNumber = (formatted: string): number => {
  return parseFloat(formatted.replace(/\./g, '')) || 0;
};

export default function PriceAndPersonsSection({
  price,
  currency,
  maxPersons,
  onPriceChange,
  onCurrencyChange,
  onMaxPersonsChange,
}: PriceAndPersonsSectionProps) {
  const [formattedPrice, setFormattedPrice] = useState<string>("");

  // Sincronizar el precio formateado cuando cambia el precio numérico
  useEffect(() => {
    if (price === undefined || price === null) {
      setFormattedPrice("");
    } else {
      setFormattedPrice(formatNumber(price.toString()));
    }
  }, [price]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatNumber(inputValue);
    setFormattedPrice(formatted);
    
    if (formatted === "") {
      onPriceChange(undefined);
    } else {
      const numericValue = parseFormattedNumber(formatted);
      onPriceChange(numericValue);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
      <div className="space-y-2 sm:space-y-3">
        <label className="text-xs sm:text-sm font-semibold text-slate-700 block">Precio</label>
        <div className="relative w-full">
          <input
            className="w-full h-11 sm:h-12 px-3 sm:px-4 pr-16 sm:pr-20 border border-neutral-200 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all bg-white"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={formattedPrice}
            onChange={handlePriceChange}
          />
          <select
            className="absolute right-2 sm:right-3 top-2.5 sm:top-3 h-5 sm:h-6 px-1.5 sm:px-2 border border-transparent bg-transparent text-xs sm:text-base text-slate-600 font-medium focus:outline-none cursor-pointer z-10"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="COP">COP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>
      <div className="space-y-2 sm:space-y-3">
        <label className="text-xs sm:text-sm font-semibold text-slate-700 block">Cantidad de Personas</label>
        <input
          className="w-full h-11 sm:h-12 px-3 sm:px-4 border border-neutral-200 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all bg-white"
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
