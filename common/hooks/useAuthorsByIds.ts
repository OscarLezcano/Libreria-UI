"use client";

import { getAuthorByIdRequest, type CatalogEntity } from "@/common/services/books";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

export function useAuthorsByIds(authorIds: (number | null)[]) {
  const uniqueIds = Array.from(
    new Set(authorIds.filter((id): id is number => id !== null))
  );
  const authorQueries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ["authors", "detail", id],
      queryFn: () => getAuthorByIdRequest(id),
      staleTime: Infinity,
      gcTime: Infinity,
    })),
  });
  const authorsById = useMemo(
    () =>
      new Map<number, CatalogEntity>(
        authorQueries.flatMap((query) => {
          const author = query.data;
          return author?.id != null ? [[author.id, author] as const] : [];
        })
      ),
    [authorQueries]
  );

  return {
    authorsById,
    isLoading: authorQueries.some((query) => query.isPending),
    isError: authorQueries.some((query) => query.isError),
  };
}
