"use client";

import BookCard from "@/common/components/BookCard";
import ExploreFilters from "@/common/components/ExploreFilters";
import HomeFooter from "@/common/components/HomeFooter";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import Pagination from "@/common/components/Pagination";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { useBookCatalog } from "@/common/hooks/useBookCatalog";
import { useState } from "react";

const PAGE_SIZE = 8;

export default function ExplorarPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { catalog, totalPages, totalElements, isLoading, isError } =
    useBookCatalog(
      page,
      PAGE_SIZE,
      query
    );

  const clearSearch = () => {
    setQuery("");
    setPage(1);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  return (
    <main className="bg-base-100 flex min-h-dvh flex-col">
      <ReaderNavbar active="explorar" />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col lg:flex-row">
        <aside className="border-b border-base-300 lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
          <ExploreFilters
            query={query}
            onQueryChange={handleQueryChange}
            onClear={clearSearch}
          />
        </aside>

        <div className="min-w-0 flex-1 p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-base-content/60 text-sm">
              Mostrando <b className="text-base-content">{catalog.length}</b>{" "}
              de <b className="text-base-content">{totalElements}</b> resultados
              {query.trim() && (
                <>
                  {" "}
                  para <b className="text-base-content">“{query.trim()}”</b>
                </>
              )}
            </p>
          </div>

          {isLoading ? (
            <LoadingSpinner label="Cargando libros" />
          ) : isError ? (
            <NotificationToast
              type="error"
              message="No se pudo cargar el catálogo. Intentá nuevamente más tarde."
              className="my-10 w-full"
            />
          ) : catalog.length === 0 ? (
            <div className="text-center">
              <p className="text-lg font-bold">Sin resultados</p>
              <p className="text-base-content/60 mt-1 text-sm">
                Probá con otro título.
              </p>
              <button
                className="btn btn-outline btn-sm mt-4"
                onClick={clearSearch}
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {catalog.map((book) => (
                  <BookCard
                    key={book.id}
                    bookId={book.id}
                    href={`/book/${book.id}`}
                    coverSrc={book.coverSrc}
                    price={book.price}
                    title={book.title}
                    authors={book.authors}
                  />
                ))}
              </div>

              <Pagination
                page={page}
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
