"use client";

import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import Pagination from "@/common/components/Pagination";
import { getAuthenticatedWarehouseId } from "@/common/services/auth";
import {
  getStockAdjustmentDetailsRequest,
  getStockAdjustmentsPageRequest,
  type StockAdjustmentDetailRecord,
  type StockAdjustmentRecord,
} from "@/common/services/stockAdjustments";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";

function subscribeToUserStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getWarehouseSnapshot() {
  return getAuthenticatedWarehouseId() ?? 0;
}

function getServerWarehouseSnapshot() {
  return -1;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("es-PY", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
}

function getDifference(physicalQuantity: number, systemQuantity: number) {
  return physicalQuantity - systemQuantity;
}

function differenceLabel(difference: number): string {
  if (difference > 0) return `+${difference}`;
  return String(difference);
}

function DifferenceBadge({ difference }: { difference: number }) {
  const className =
    difference > 0
      ? "badge badge-sm badge-success"
      : difference < 0
        ? "badge badge-sm badge-error"
        : "badge badge-sm";

  return (
    <span className={className}>
      {difference > 0 && <ArrowUp className="size-3" aria-hidden="true" />}
      {difference < 0 && <ArrowDown className="size-3" aria-hidden="true" />}
      {differenceLabel(difference)}
    </span>
  );
}

export default function AdminInventoryPage() {
  const detailsDialogRef = useRef<HTMLDialogElement>(null);
  const warehouseSnapshot = useSyncExternalStore(
    subscribeToUserStorage,
    getWarehouseSnapshot,
    getServerWarehouseSnapshot
  );
  const warehouseLoaded = warehouseSnapshot !== -1;
  const warehouseId = warehouseSnapshot > 0 ? warehouseSnapshot : null;
  const [page, setPage] = useState(1);
  const [selectedAdjustment, setSelectedAdjustment] =
    useState<StockAdjustmentRecord | null>(null);

  const adjustmentsQuery = useQuery({
    queryKey: ["stock-adjustments", warehouseId, page],
    queryFn: () => {
      if (warehouseId === null) {
        throw new Error("No se encontró un almacén asignado al usuario.");
      }
      return getStockAdjustmentsPageRequest(warehouseId, page);
    },
    enabled: warehouseId !== null,
  });
  const detailsQuery = useQuery({
    queryKey: ["stock-adjustments", "details", selectedAdjustment?.id],
    queryFn: () => {
      if (!selectedAdjustment) {
        throw new Error("No se seleccionó un ajuste.");
      }
      return getStockAdjustmentDetailsRequest(selectedAdjustment.id);
    },
    enabled: selectedAdjustment !== null,
  });

  const openDetails = (adjustment: StockAdjustmentRecord) => {
    setSelectedAdjustment(adjustment);
    detailsDialogRef.current?.showModal();
  };

  const closeDetails = () => {
    detailsDialogRef.current?.close();
    setSelectedAdjustment(null);
  };

  const adjustments = adjustmentsQuery.data?.adjustments ?? [];
  const totalPages = adjustmentsQuery.data?.totalPages ?? 1;

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Ajustes de stock</h1>
            <p className="text-base-content/60 mt-1 text-sm">
              Historial de conteos físicos y diferencias de inventario
            </p>
          </div>
          {warehouseLoaded && warehouseId !== null ? (
            <Link href="/vendedor/inventario/nuevo" className="btn btn-primary">
              <Plus className="size-4" strokeWidth={2.5} />
              Nuevo Ajuste
            </Link>
          ) : (
            <button className="btn btn-primary" type="button" disabled>
              <Plus className="size-4" strokeWidth={2.5} />
              Nuevo Ajuste
            </button>
          )}
        </div>

        <section className="card bg-base-100 card-border">
          <div className="card-body">
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                Lista de ajustes
              </h2>
            </div>

            {!warehouseLoaded ? (
              <LoadingSpinner label="Cargando almacén" />
            ) : warehouseId === null ? (
              <NotificationToast
                type="error"
                message="Tu usuario no tiene un almacén asignado."
                placement="toast"
              />
            ) : adjustmentsQuery.isPending ? (
              <LoadingSpinner label="Cargando ajustes" />
            ) : adjustmentsQuery.isError ? (
              <NotificationToast
                type="error"
                message={
                  adjustmentsQuery.error instanceof Error
                    ? adjustmentsQuery.error.message
                    : "No se pudo cargar el historial."
                }
                placement="toast"
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Motivo</th>
                        <th className="text-center">Libros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adjustments.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-base-content/60 py-8 text-center text-sm"
                          >
                            No hay ajustes de stock registrados.
                          </td>
                        </tr>
                      )}
                      {adjustments.map((adjustment) => (
                        <tr
                          key={adjustment.id}
                          className="cursor-pointer hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                          tabIndex={0}
                          onClick={() => openDetails(adjustment)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              openDetails(adjustment);
                            }
                          }}
                        >
                          <td className="whitespace-nowrap">
                            {formatDate(adjustment.createdAt)}
                          </td>
                          <td className="font-semibold">{adjustment.note}</td>
                          <td className="text-center">
                            {adjustment.detailCount} ítem
                            {adjustment.detailCount === 1 ? "" : "s"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={setPage}
                />
              </>
            )}
          </div>
        </section>
      </main>

      <dialog
        ref={detailsDialogRef}
        className="modal"
        onClose={() => setSelectedAdjustment(null)}
      >
        <div className="modal-box max-w-3xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Detalle del ajuste</h2>
              <p className="text-base-content/60 mt-1 text-sm">
                {selectedAdjustment?.note} ·{" "}
                {formatDate(selectedAdjustment?.createdAt ?? null)}
              </p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={closeDetails}
            >
              Cerrar
            </button>
          </div>

          {detailsQuery.isPending ? (
            <LoadingSpinner label="Cargando detalle" />
          ) : detailsQuery.isError ? (
            <NotificationToast
              type="error"
              message={
                detailsQuery.error instanceof Error
                  ? detailsQuery.error.message
                  : "No se pudo cargar el detalle del ajuste."
              }
            />
          ) : (
            <AdjustmentDetailsTable details={detailsQuery.data ?? []} />
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            type="submit"
            aria-label="Cerrar detalle"
            onClick={closeDetails}
          >
            cerrar
          </button>
        </form>
      </dialog>
    </>
  );
}

function AdjustmentDetailsTable({
  details,
}: {
  details: StockAdjustmentDetailRecord[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Libro</th>
            <th className="text-right">Sistema</th>
            <th className="text-right">Conteo físico</th>
            <th className="text-right">Diferencia</th>
          </tr>
        </thead>
        <tbody>
          {details.map((detail) => (
            <tr key={detail.id}>
              <td className="font-medium">{detail.bookName}</td>
              <td className="text-right tabular-nums">
                {detail.systemQuantity}
              </td>
              <td className="text-right tabular-nums">
                {detail.physicalQuantity}
              </td>
              <td className="text-right">
                <DifferenceBadge
                  difference={getDifference(
                    detail.physicalQuantity,
                    detail.systemQuantity
                  )}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
