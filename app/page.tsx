"use client";

import BookCard from "@/common/components/BookCard";
import HomeFooter from "@/common/components/HomeFooter";
import HomeHero from "@/common/components/HomeHero";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import Pagination from "@/common/components/Pagination";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { useBookCatalog } from "@/common/hooks/useBookCatalog";
import Link from "next/link";
import { useState } from "react";

const PROMO_COVERS = [
  "https://picsum.photos/seed/promo1/200/300",
  "https://picsum.photos/seed/promo2/200/300",
  "https://picsum.photos/seed/promo3/200/300",
  "https://picsum.photos/seed/promo4/200/300",
  "https://picsum.photos/seed/promo5/200/300",
  "https://picsum.photos/seed/promo6/200/300",
];

const PAGE_SIZE = 4;

export default function Home() {
  const [page, setPage] = useState(1);
  const { catalog, totalPages, isLoading, isError } = useBookCatalog(
    page,
    PAGE_SIZE
  );

  return (
    <main className="bg-base-100 flex min-h-dvh flex-col">
      <ReaderNavbar active="inicio" />

      <HomeHero />

      <section className="mx-auto max-w-6xl px-4 pt-12 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-extrabold">
          Libros más vendidos
        </h2>
        {isLoading ? (
          <LoadingSpinner label="Cargando libros" />
        ) : isError ? (
          <NotificationToast
            type="error"
            message="No se pudieron cargar los libros."
            className="mx-auto my-10 w-full max-w-xl"
          />
        ) : catalog.length === 0 ? (
          <p className="text-base-content/60 py-10 text-center">
            Todavía no hay libros disponibles.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      </section>

      <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 md:flex-row md:px-8">
        <div className="grid w-full max-w-xs shrink-0 grid-cols-3 gap-2">
          {PROMO_COVERS.map((src) => (
            <img
              key={src}
              src={src}
              alt="Portada de libro"
              className="aspect-[2/3] w-full rounded-lg object-cover"
            />
          ))}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-extrabold leading-snug">
            ¡Tus libros
            <br />
            <span className="text-primary">favoritos aquí!</span>
          </h2>
          <p className="text-base-content/60 mx-auto mt-4 max-w-md leading-relaxed md:mx-0">
            Encontrá las historias que te apasionan, los autores que admirás y
            los géneros que marcan tendencia.
          </p>
          <Link href="/explorar" className="btn btn-primary mt-6">
            Explorar
          </Link>
        </div>
      </section>

      <HomeFooter />
    </main>
  );
}
