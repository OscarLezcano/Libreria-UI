"use client";

import BookCard from "@/common/components/BookCard";
import ExploreFilters from "@/common/components/ExploreFilters";
import HomeFooter from "@/common/components/HomeFooter";
import Pagination from "@/common/components/Pagination";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { BOOKS } from "@/common/data/books";
import { useMemo, useState } from "react";

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
  { value: "relevancia", label: "Relevancia" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "titulo", label: "Título: A-Z" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export default function ExplorarPage() {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<SortValue>("relevancia");
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    BOOKS.forEach((book) =>
      book.categories.forEach((category) =>
        counts.set(category, (counts.get(category) ?? 0) + 1)
      )
    );
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = BOOKS.filter((book) => {
      const matchesQuery =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.authors.some((author) => author.toLowerCase().includes(q)) ||
        book.categories.some((category) => category.toLowerCase().includes(q));
      const matchesCategories =
        selectedCategories.length === 0 ||
        book.categories.some((category) =>
          selectedCategories.includes(category)
        );
      return matchesQuery && matchesCategories;
    });

    switch (sort) {
      case "precio-asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "precio-desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "titulo":
        return [...result].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return result;
    }
  }, [query, selectedCategories, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleBooks = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const clearFilters = () => {
    setQuery("");
    setSelectedCategories([]);
    setPage(1);
  };

  const toggleCategory = (name: string) =>
    setSelectedCategories((current) =>
      current.includes(name)
        ? current.filter((category) => category !== name)
        : [...current, name]
    );

  return (
    <main className="bg-base-100 min-h-screen">
      <ReaderNavbar active="explorar" initials="HA" />

      <div className="mx-auto flex max-w-6xl flex-col lg:flex-row">
        <aside className="border-b border-base-300 lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
          <ExploreFilters
            query={query}
            onQueryChange={setQuery}
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            onClear={clearFilters}
          />
        </aside>

        <div className="flex-1 p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-base-content/60 text-sm">
              Mostrando <b className="text-base-content">{filtered.length}</b>{" "}
              de <b className="text-base-content">{BOOKS.length}</b> resultados
              {query.trim() && (
                <>
                  {" "}
                  para <b className="text-base-content">“{query.trim()}”</b>
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-base-content/60 text-sm">Ordenar por:</span>
              <label className="select select-sm w-48">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortValue)}
                  aria-label="Ordenar resultados"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center">
              <p className="text-lg font-bold">Sin resultados</p>
              <p className="text-base-content/60 mt-1 text-sm">
                Probá con otros términos o quitá algunos filtros.
              </p>
              <button
                className="btn btn-outline btn-sm mt-4"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    href={`/book/${book.id}`}
                    coverSrc={book.coverSrc}
                    price={book.price}
                    title={book.title}
                    authors={book.authors}
                    description={book.shortDescription}
                  />
                ))}
              </div>

              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onChange={setPage}
              />
            </>
          )}
        </div>
      </div>

      <HomeFooter />
    </main>
  );
}
