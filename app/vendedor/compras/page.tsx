"use client";

import Pagination from "@/common/components/Pagination";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import {
  PURCHASE_STATUS_META,
  PURCHASE_STATUS_OPTIONS,
  type PurchaseStatus,
} from "@/common/data/suppliers";
import { useSuppliersByIds } from "@/common/hooks/useSuppliersByIds";
import { useWarehouseScope } from "@/common/hooks/useWarehouseScope";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPurchasesRequest,
  updatePurchaseStatusRequest,
} from "@/common/services/purchases";
import { formatGs } from "@/common/utils/format";
import { withWarehouseContext } from "@/common/utils/warehouseScope";
import { Ban, Check, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useRef,
  useState,
} from "react";

const PAGE_SIZE = 5;

function formatPurchaseDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("es-PY", { dateStyle: "short" }).format(date);
}

export default function AdminComprasPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    warehouseId,
    warehouseLoaded,
    isInvalidWarehouseOverride,
    warehouseParam,
  } = useWarehouseScope();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PurchaseStatus>(
    "ALL"
  );
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [acceptingPurchaseId, setAcceptingPurchaseId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const invoiceDialogRef = useRef<HTMLDialogElement>(null);
  const search = query.trim();
  const purchasesQuery = useQuery({
    queryKey: ["purchases", warehouseId, page, statusFilter, search],
    queryFn: () => {
      if (warehouseId === null) {
        throw new Error("No se encontró un almacén asignado al usuario.");
      }
      return getPurchasesRequest(
        page,
        PAGE_SIZE,
        statusFilter,
        search,
        warehouseId
      );
    },
    enabled: warehouseId !== null,
  });
  const purchases = purchasesQuery.data?.purchases ?? [];
  const suppliersQuery = useSuppliersByIds(
    purchases.map((purchase) => purchase.supplierId)
  );
  const totalPages = purchasesQuery.data?.totalPages ?? 1;
  const currentPage = Math.min(page, totalPages);
  const supplierNames = suppliersQuery.suppliersById;
  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      invoiceNumber,
    }: {
      id: string;
      status: "RECEIVED" | "CANCELLED";
      invoiceNumber?: string;
    }) => updatePurchaseStatusRequest(id, status, invoiceNumber),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
      if (variables.status === "RECEIVED") {
        invoiceDialogRef.current?.close();
      }
      setActionSuccess(
        variables.status === "RECEIVED"
          ? "Compra aceptada y registrada en inventario."
          : "Compra anulada correctamente."
      );
      setActionError(null);
      setAcceptError(null);
    },
    onError: (error, variables) => {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado de la compra.";
      if (variables.status === "RECEIVED") {
        setAcceptError(message);
      } else {
        setActionError(message);
      }
    },
  });

  const openAcceptDialog = (id: string) => {
    setAcceptingPurchaseId(id);
    setInvoiceNumber("");
    setAcceptError(null);
    setActionError(null);
    setActionSuccess(null);
    invoiceDialogRef.current?.showModal();
  };

  const handleAcceptPurchase = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invoice = invoiceNumber.trim();
    if (!acceptingPurchaseId || !invoice) {
      setAcceptError("Ingresá el número de factura para aceptar la compra.");
      return;
    }
    updateStatusMutation.mutate({
      id: acceptingPurchaseId,
      status: "RECEIVED",
      invoiceNumber: invoice,
    });
  };

  const cancelPurchase = (id: string) => {
    if (!window.confirm("¿Anular esta compra? Esta acción no se puede deshacer.")) {
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    updateStatusMutation.mutate({ id, status: "CANCELLED" });
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
        {actionSuccess && (
          <NotificationToast
            type="success"
            message={actionSuccess}
            placement="toast"
            onClose={() => setActionSuccess(null)}
          />
        )}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Compras</h1>
            <p className="text-base-content/60 mt-1 text-sm">
              Historial de órdenes de compra a proveedores
            </p>
          </div>
          <Link
            href={withWarehouseContext(
              "/vendedor/compras/nueva",
              warehouseParam
            )}
            className="btn btn-primary"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Nueva Compra
          </Link>
        </div>

        <section className="card bg-base-100 card-border">
          <div className="card-body">
            {actionError && (
              <NotificationToast
                type="error"
                message={actionError}
                placement="toast"
                onClose={() => setActionError(null)}
              />
            )}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                Lista de compras
              </h2>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="input input-sm w-full sm:w-64">
                  <Search className="size-4 opacity-50" strokeWidth={2} />
                  <input
                    type="search"
                    placeholder="Buscar por número de factura..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    aria-label="Buscar compras"
                  />
                </label>
                <select
                  className="select select-sm w-full sm:w-44"
                  value={statusFilter}
                  aria-label="Filtrar por estado"
                  onChange={(e) => {
                    setStatusFilter(e.target.value as "ALL" | PurchaseStatus);
                    setPage(1);
                  }}
                >
                  <option value="ALL">Todos los estados</option>
                  {PURCHASE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!warehouseLoaded ||
            (warehouseId !== null &&
              (purchasesQuery.isPending || suppliersQuery.isLoading)) ? (
              <LoadingSpinner label="Cargando compras" />
            ) : warehouseId === null ? (
              <NotificationToast
                type="error"
                message={
                  isInvalidWarehouseOverride
                    ? "El identificador de la sucursal no es válido."
                    : "Tu usuario no tiene un almacén asignado."
                }
                placement="toast"
              />
            ) : purchasesQuery.isError ? (
              <NotificationToast
                type="error"
                message="No se pudieron cargar las compras. Intentá nuevamente más tarde."
                placement="toast"
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Nº Factura</th>
                        <th>Proveedor</th>
                        <th>Fecha</th>
                        <th>Ítems</th>
                        <th className="text-right">Total (Gs)</th>
                        <th>Estado</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-base-content/60 py-8 text-center text-sm"
                          >
                            No se encontraron compras con esos filtros.
                          </td>
                        </tr>
                      )}
                      {purchases.map((purchase) => {
                        const meta = PURCHASE_STATUS_META[purchase.status];
                        return (
                          <tr
                            key={purchase.id}
                            className="cursor-pointer hover:bg-base-200"
                            onClick={() =>
                              router.push(
                                withWarehouseContext(
                                  `/vendedor/compras/nueva?purchaseId=${encodeURIComponent(purchase.id)}`,
                                  warehouseParam
                                )
                              )
                            }
                          >
                            <td className="font-semibold">
                              <Link
                                href={withWarehouseContext(
                                  `/vendedor/compras/nueva?purchaseId=${encodeURIComponent(purchase.id)}`,
                                  warehouseParam
                                )}
                                className="link link-hover"
                                onClick={(event) => event.stopPropagation()}
                              >
                                {purchase.invoiceNumber || "Sin factura"}
                              </Link>
                            </td>
                            <td>
                              {supplierNames.get(purchase.supplierId)?.name ??
                                `Proveedor #${purchase.supplierId}`}
                            </td>
                            <td>{formatPurchaseDate(purchase.createdAt)}</td>
                            <td>
                              {purchase.detailCount} línea
                              {purchase.detailCount === 1 ? "" : "s"}
                            </td>
                            <td className="text-right font-semibold">
                              {formatGs(purchase.totalPrice)}
                            </td>
                            <td>
                              <span className={`badge badge-sm ${meta.badge}`}>
                                {meta.label}
                              </span>
                            </td>
                            <td className="text-center">
                              {purchase.status === "PENDING" ? (
                                <div className="flex justify-center gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-success btn-square btn-xs"
                                    disabled={updateStatusMutation.isPending}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      openAcceptDialog(purchase.id);
                                    }}
                                    title="Aceptar compra"
                                    aria-label={`Aceptar compra ${purchase.invoiceNumber || purchase.id}`}
                                  >
                                    <Check className="size-4" aria-hidden="true" />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-square btn-xs text-error"
                                    disabled={updateStatusMutation.isPending}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      cancelPurchase(purchase.id);
                                    }}
                                    title="Anular compra"
                                    aria-label={`Anular compra ${purchase.invoiceNumber || purchase.id}`}
                                  >
                                    <Ban className="size-4" aria-hidden="true" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-base-content/40">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={setPage}
                />
              </>
            )}
          </div>
        </section>
        <dialog
          ref={invoiceDialogRef}
          className="modal"
          aria-labelledby="accept-purchase-title"
          onClose={() => {
            setAcceptingPurchaseId(null);
            setInvoiceNumber("");
            setAcceptError(null);
          }}
          onCancel={(event) => {
            if (updateStatusMutation.isPending) event.preventDefault();
          }}
        >
          <div className="modal-box max-w-md">
            <h2 id="accept-purchase-title" className="text-xl font-bold">
              Aceptar compra
            </h2>
            <p className="text-base-content/60 mt-2 text-sm">
              Ingresá el número de factura para registrar la compra y actualizar
              el inventario.
            </p>
            {acceptError && (
              <p className="mt-4 text-sm text-error" role="alert">
                {acceptError}
              </p>
            )}
            <form
              className="mt-4"
              onSubmit={handleAcceptPurchase}
            >
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Nº Factura <span className="text-error">*</span>
                </legend>
                <input
                  className="input w-full"
                  autoFocus
                  required
                  value={invoiceNumber}
                  placeholder="Ej: 001-001-00001234"
                  disabled={updateStatusMutation.isPending}
                  onChange={(event) => {
                    setInvoiceNumber(event.target.value);
                    setAcceptError(null);
                  }}
                />
              </fieldset>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  disabled={updateStatusMutation.isPending}
                  onClick={() => invoiceDialogRef.current?.close()}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={
                    updateStatusMutation.isPending || !invoiceNumber.trim()
                  }
                >
                  {updateStatusMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Aceptar y registrar factura"
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button
              aria-label="Cerrar diálogo"
              disabled={updateStatusMutation.isPending}
            >
              Cerrar
            </button>
          </form>
        </dialog>
    </main>
  );
}
