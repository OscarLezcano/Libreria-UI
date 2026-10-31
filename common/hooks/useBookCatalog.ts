"use client";

import type { BookRecord } from "@/common/services/books";
import {
  BOOKS_PAGE_SIZE,
  getBookByIdRequest,
  getBooksPageRequest,
} from "@/common/services/books";
import { useAuthorsByIds } from "@/common/hooks/useAuthorsByIds";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export interface CatalogBook {
  id: string;
  coverSrc: string;
  price: number | null;
  title: string;
  authors: string[];
}

const EMPTY_BOOKS: BookRecord[] = [];

function toCatalogBooks(
  books: BookRecord[],
  authorsById: Map<number, { id: number | null; name: string | null }>
): CatalogBook[] {
  return books.flatMap((book) => {
    if (book.id === null) return [];

    return [
      {
        id: String(book.id),
        coverSrc:
          book.coverUrl ?? `https://picsum.photos/seed/book-${book.id}/300/400`,
        price: book.price,
        title: book.title ?? "Sin título",
        authors: (book.authorIds ?? []).flatMap((id) => {
          const name = id === null ? undefined : authorsById.get(id)?.name;
          return name ? [name] : [];
        }),
      },
    ];
  });
}

export function useBookCatalog(
  page = 1,
  pageSize = BOOKS_PAGE_SIZE,
  title = ""
) {
  const booksQuery = useQuery({
    queryKey: ["books", "catalog", page, pageSize, title.trim()],
    queryFn: () =>
      getBooksPageRequest(Math.max(0, page - 1), {
        size: pageSize,
        title,
      }),
    staleTime: 60_000,
  });
  const books = booksQuery.data?.books ?? EMPTY_BOOKS;
  const authorsQuery = useAuthorsByIds(
    books.flatMap((book) => book.authorIds ?? [])
  );

  const catalog = useMemo(
    () => toCatalogBooks(books, authorsQuery.authorsById),
    [books, authorsQuery.authorsById]
  );

  return {
    catalog,
    totalPages: booksQuery.data?.totalPages ?? 1,
    totalElements: booksQuery.data?.totalElements ?? 0,
    isLoading: booksQuery.isPending || authorsQuery.isLoading,
    isError: booksQuery.isError || authorsQuery.isError,
  };
}

export function useCartBooks(bookIds: string[]) {
  const bookQueries = useQueries({
    queries: bookIds.map((id) => ({
      queryKey: ["books", "detail", id],
      queryFn: () => getBookByIdRequest(id),
      staleTime: 60_000,
    })),
  });
  const books = bookQueries.flatMap((query) =>
    query.data ? [query.data] : []
  );
  const authorsQuery = useAuthorsByIds(
    books.flatMap((book) => book.authorIds ?? [])
  );
  const catalog = useMemo(
    () => toCatalogBooks(books, authorsQuery.authorsById),
    [books, authorsQuery.authorsById]
  );

  return {
    catalog,
    isLoading:
      bookQueries.some((query) => query.isPending) ||
      authorsQuery.isLoading,
    isError:
      bookQueries.some((query) => query.isError) ||
      authorsQuery.isError,
  };
}
