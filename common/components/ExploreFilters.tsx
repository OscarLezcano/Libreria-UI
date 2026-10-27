"use client";

import { Search } from "lucide-react";

interface ExploreFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  onClear: () => void;
}

export default function ExploreFilters({
  query,
  onQueryChange,
  onClear,
}: ExploreFiltersProps) {
  return (
    <div className="flex flex-col gap-5 p-6 lg:p-4">
      <div>
        <h3 className="mb-2 text-sm font-bold">Buscar por título</h3>
        <label className="input input-sm w-full">
          <Search className="size-4 opacity-50" strokeWidth={2} />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Título del libro"
            aria-label="Buscar por título"
          />
        </label>
      </div>

      <button
        className="btn btn-outline btn-sm"
        onClick={onClear}
        type="button"
      >
        Limpiar búsqueda
      </button>
    </div>
  );
}
