"use client";

import { getSupplierByIdRequest, type SupplierRecord } from "@/common/services/suppliers";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

export function useSuppliersByIds(supplierIds: string[]) {
  const uniqueIds = Array.from(new Set(supplierIds));
  const supplierQueries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ["suppliers", "detail", id],
      queryFn: () => getSupplierByIdRequest(id),
      staleTime: Infinity,
      gcTime: Infinity,
    })),
  });
  const suppliersById = useMemo(
    () =>
      new Map<string, SupplierRecord>(
        supplierQueries.flatMap((query) => {
          const supplier = query.data;
          return supplier ? [[supplier.id, supplier] as const] : [];
        })
      ),
    [supplierQueries]
  );

  return {
    suppliersById,
    isLoading: supplierQueries.some((query) => query.isPending),
    isError: supplierQueries.some((query) => query.isError),
  };
}
