"use client";

import BookPurchaseCard from "@/common/components/BookPurchaseCard";
import HomeFooter from "@/common/components/HomeFooter";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { getBook } from "@/common/data/books";
import {
  getAuthorsRequest,
  getBookByIdRequest,
  getGenresRequest,
} from "@/common/services/books";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const isApiBook = /^\d+$/.test(id);
  const bookQuery = useQuery({
    queryKey: ["book", id],
    queryFn: () => getBookByIdRequest(id),
    enabled: isApiBook,
    staleTime: 60_000,
  });
  const apiBook = bookQuery.data;
  const needsAuthors = apiBook?.authorIds?.some((authorId) => authorId !== null);
  const needsGenres = apiBook?.genreIds?.some((genreId) => genreId !== null);
  const authorsQuery = useQuery({
    queryKey: ["authors", "catalog"],
    queryFn: getAuthorsRequest,
    enabled: Boolean(needsAuthors),
    staleTime: Infinity,
  });
  const genresQuery = useQuery({
    queryKey: ["genres", "catalog"],
    queryFn: getGenresRequest,
    enabled: Boolean(needsGenres),
    staleTime: Infinity,
  });

  const staticBook = isApiBook ? undefined : getBook(id);
  const book = !isApiBook
    ? staticBook
      ? {
          id: staticBook.id,
          title: staticBook.title,
          coverSrc: staticBook.coverSrc,
          description: staticBook.description,
          authors: staticBook.authors,
          categories: staticBook.categories,
          price: staticBook.price,
        }
      : null
    : apiBook && apiBook.id !== null
      ? {
          id: String(apiBook.id),
          title: apiBook.title ?? "Sin título",
          coverSrc:
            apiBook.coverUrl ??
            `https://picsum.photos/seed/book-${apiBook.id}/300/400`,
          description: apiBook.description ?? "",
          authors: (apiBook.authorIds ?? []).flatMap((authorId) => {
            const author = authorsQuery.data?.find(
              (item) => item.id === authorId
            );
            return author?.name ? [author.name] : [];
          }),
          categories: (apiBook.genreIds ?? []).flatMap((genreId) => {
            const genre = genresQuery.data?.find(
              (item) => item.id === genreId
            );
            return genre?.name ? [genre.name] : [];
          }),
          price: apiBook.price,
        }
      : null;

  const isLoading =
    (isApiBook && bookQuery.isPending) ||
    (Boolean(needsAuthors) && authorsQuery.isPending) ||
    (Boolean(needsGenres) && genresQuery.isPending);
  const hasError =
    (isApiBook && bookQuery.isError) ||
    (Boolean(needsAuthors) && authorsQuery.isError) ||
    (Boolean(needsGenres) && genresQuery.isError);

  return (
    <main className="bg-base-100 flex min-h-dvh flex-col">
      <ReaderNavbar active="explorar" />

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 lg:px-8">
        <div className="py-5">
          <Link
            href="/explorar"
            className="btn btn-ghost btn-sm -ml-2 text-sm font-semibold"
          >
            <ChevronLeft className="size-4" strokeWidth={2.5} />
            Volver al catálogo
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner label="Cargando libro" />
        ) : hasError ? (
          <NotificationToast
            type="error"
            message="No se pudo cargar el libro. Intentá nuevamente más tarde."
            className="mx-auto my-10 w-full max-w-xl"
          />
        ) : !book ? (
          <p className="text-base-content/60 py-10 text-center">
            No se encontró el libro solicitado.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-10 pb-16 lg:grid-cols-[300px_minmax(0,1fr)_320px]">
            <div>
              <img
                src={book.coverSrc}
                alt={book.title}
                className="aspect-[3/4] w-full rounded-box object-cover shadow-2xl lg:w-72"
              />
            </div>

            <div className="max-w-xl">
              <div className="flex flex-wrap gap-2">
                {book.categories.map((category) => (
                  <span key={category} className="badge badge-soft badge-primary">
                    {category}
                  </span>
                ))}
              </div>
              <h1 className="mt-4 text-3xl font-extrabold">{book.title}</h1>
              <p className="text-primary mt-2 text-sm font-bold">
                {book.authors.join(", ")}
              </p>
              <p className="text-base-content/80 mt-6 leading-relaxed">
                {book.description}
              </p>
            </div>

            <aside className="self-start">
              {book.price === null ? (
                <div className="card bg-base-100 card-border">
                  <div className="card-body">
                    <p className="font-bold">Precio no disponible</p>
                  </div>
                </div>
              ) : (
                <BookPurchaseCard bookId={book.id} price={book.price} />
              )}
            </aside>
          </div>
        )}
      </div>

      <HomeFooter />
    </main>
  );
}
