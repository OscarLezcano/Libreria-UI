"use client";

import type { BookRecord } from "@/common/services/books";
import {
  getAuthorsRequest,
  getBooksRequest,
} from "@/common/services/books";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export interface CatalogBook {
  id: string;
  coverSrc: string;
  price: number | null;
  title: string;
  authors: string[];
}

const EMPTY_BOOKS: BookRecord[] = [];

export function useBookCatalog() {
  const booksQuery = useQuery({
    queryKey: ["books", "catalog"],
    queryFn: getBooksRequest,
    staleTime: 60_000,
  });
  const books = booksQuery.data ?? EMPTY_BOOKS;
  const needsAuthors = books.some((book) =>
    book.authorIds?.some((id) => id !== null)
  );
  const authorsQuery = useQuery({
    queryKey: ["authors", "catalog"],
    queryFn: getAuthorsRequest,
    enabled: needsAuthors,
    staleTime: Infinity,
  });

  const catalog = useMemo(() => {
    const authorsById = new Map(
      (authorsQuery.data ?? []).flatMap((author) =>
        author.id !== null && author.name ? [[author.id, author.name] as const] : []
      )
    );

    return books.flatMap((book) => {
      if (book.id === null) return [];

      return [
        {
          id: String(book.id),
          coverSrc:
            book.coverUrl ??
            `https://picsum.photos/seed/book-${book.id}/300/400`,
          price: book.price,
          title: book.title ?? "Sin título",
          authors: (book.authorIds ?? []).flatMap((id) => {
            const name = id === null ? undefined : authorsById.get(id);
            return name ? [name] : [];
          }),
        },
      ];
    });
  }, [books, authorsQuery.data]);

  return {
    catalog,
    isLoading: booksQuery.isPending || (needsAuthors && authorsQuery.isPending),
    isError: booksQuery.isError || (needsAuthors && authorsQuery.isError),
  };
}
