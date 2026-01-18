"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function SearchDivider() {
  return <div className="hidden h-6 w-px bg-[#ebefef] md:block" />;
}

function SearchInput({
  label,
  placeholder,
  readOnly,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  readOnly?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="group w-full flex-1 cursor-pointer px-6 py-2">
      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-400 transition-colors group-hover:text-primary">
        {label}
      </label>
      <input
        className="w-full border-none bg-transparent p-0 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-transparent"
        placeholder={placeholder}
        readOnly={readOnly}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function SearchBar() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [travelers, setTravelers] = useState("");

  return (
    <form
      className="w-full max-w-[850px] rounded-full border border-gray-100 bg-white p-2 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-all hover:shadow-[0px_8px_24px_rgba(0,0,0,0.12)] dark:border-gray-800 dark:bg-gray-900"
      onSubmit={(event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (destination) params.set("destino", destination);
        if (dates) params.set("fechas", dates);
        if (travelers) params.set("viajeros", travelers);
        router.push(`/customers/search?${params.toString()}`);
      }}
    >
      <div className="flex flex-col items-center md:flex-row">
        <SearchInput
          label="Destino"
          placeholder="¿A dónde vas?"
          value={destination}
          onChange={setDestination}
        />
        <SearchDivider />
        <SearchInput
          label="Fechas"
          placeholder="Añadir fechas"
          value={dates}
          onChange={setDates}
        />
        <SearchDivider />
        <SearchInput
          label="Viajeros"
          placeholder="¿Cuántos?"
          value={travelers}
          onChange={setTravelers}
        />
        <button
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-white transition-all hover:bg-primary/90 md:ml-2 md:h-12 md:w-auto md:aspect-square"
          type="submit"
        >
          <Search className="h-5 w-5" />
          <span className="ml-2 font-bold md:hidden">Buscar</span>
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
