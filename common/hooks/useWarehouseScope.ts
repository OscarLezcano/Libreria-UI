"use client";

import { getAuthenticatedWarehouseId } from "@/common/services/auth";
import { parseWarehouseId } from "@/common/utils/warehouseScope";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";

const UNKNOWN_WAREHOUSE_ID = -1;

function subscribeToWarehouse(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getWarehouseSnapshot() {
  return getAuthenticatedWarehouseId() ?? 0;
}

function getServerWarehouseSnapshot() {
  return UNKNOWN_WAREHOUSE_ID;
}

export function useWarehouseScope() {
  const searchParams = useSearchParams();
  const warehouseParam = searchParams.get("warehouseId");
  const authenticatedSnapshot = useSyncExternalStore(
    subscribeToWarehouse,
    getWarehouseSnapshot,
    getServerWarehouseSnapshot
  );
  const selectedWarehouseId = parseWarehouseId(warehouseParam);
  const hasWarehouseOverride = warehouseParam !== null;

  return {
    warehouseId: hasWarehouseOverride
      ? selectedWarehouseId
      : authenticatedSnapshot > 0
        ? authenticatedSnapshot
        : null,
    warehouseLoaded:
      hasWarehouseOverride || authenticatedSnapshot !== UNKNOWN_WAREHOUSE_ID,
    isInvalidWarehouseOverride:
      hasWarehouseOverride && selectedWarehouseId === null,
    warehouseParam,
  };
}
