"use client";

import { getGenreByIdRequest, type CatalogEntity } from "@/common/services/books";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

export function useGenresByIds(genreIds: (number | null)[]) {
  const uniqueIds = Array.from(
    new Set(genreIds.filter((id): id is number => id !== null))
  );
  const genreQueries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ["genres", "detail", id],
      queryFn: () => getGenreByIdRequest(id),
      staleTime: Infinity,
      gcTime: Infinity,
    })),
  });
  const genresById = useMemo(
    () =>
      new Map<number, CatalogEntity>(
        genreQueries.flatMap((query) => {
          const genre = query.data;
          return genre?.id != null ? [[genre.id, genre] as const] : [];
        })
      ),
    [genreQueries]
  );

  return {
    genresById,
    isLoading: genreQueries.some((query) => query.isPending),
    isError: genreQueries.some((query) => query.isError),
  };
}
