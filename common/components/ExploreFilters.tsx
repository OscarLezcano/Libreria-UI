"use client";

import { Search } from "lucide-react";

export interface CategoryOption {
  name: string;
  count: number;
}

interface ExploreFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  categories: CategoryOption[];
  selectedCategories: string[];
  onToggleCategory: (name: string) => void;
  onClear: () => void;
}

export default function ExploreFilters({
  query,
  onQueryChange,
  categories,
  selectedCategories,
  onToggleCategory,
  onClear,
}: ExploreFiltersProps) {
  return (
    <div className="flex flex-col gap-5 p-6 lg:p-4">
      <div>
        <h3 className="mb-2 text-sm font-bold">Buscar</h3>
        <label className="input input-sm w-full">
          <Search className="size-4 opacity-50" strokeWidth={2} />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Título, autor o categoría"
            aria-label="Buscar"
          />
        </label>
      </div>

      <div className="divider my-0">Categorías</div>
      <div className="flex flex-col gap-2">
        {categories.map((category) => (
          <label
            key={category.name}
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={selectedCategories.includes(category.name)}
              onChange={() => onToggleCategory(category.name)}
            />
            {category.name}
            <span className="text-base-content/50 ml-auto text-xs">
              {category.count}
            </span>
          </label>
        ))}
      </div>

      <button
        className="btn btn-outline btn-sm"
        onClick={onClear}
        type="button"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
