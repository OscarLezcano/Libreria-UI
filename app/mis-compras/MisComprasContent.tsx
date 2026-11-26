"use client";

import HomeFooter from "@/common/components/HomeFooter";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import Pagination from "@/common/components/Pagination";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { getOrderStatusMeta } from "@/common/data/orders";
import { getMyOrders } from "@/common/services/sales";
import { formatGs } from "@/common/utils/format";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ListFilter, Search } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 10;

export interface MisComprasFilters {
  minTotal: string;
  maxTotal: string;
  dateFrom: string;
  dateTo: string;
}

interface MisComprasContentProps {
  page: number;
  search: string;
  filters: MisComprasFilters;
}

function buildHref(
  targetPage: number,
  search: string,
  filters: MisComprasFilters
): string {
  const params = new URLSearchParams();
  if (targetPage > 1) params.set("page", String(targetPage));
  if (search) params.set("search", search);
  if (filters.minTotal) params.set("minTotal", filters.minTotal);
  if (filters.maxTotal) params.set("maxTotal", filters.maxTotal);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  const query = params.toString();
  return `/mis-compras${query ? `?${query}` : ""}`;
}

function optionalAmount(value: string): number | undefined {
  return value ? Number(value) : undefined;
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("es-PY");
}

export default function MisComprasContent({
  page,
  search,
  filters,
}: MisComprasContentProps) {
  const ordersQuery = useQuery({
    queryKey: [
      "orders",
      "mine",
      page,
      search,
      filters.minTotal,
      filters.maxTotal,
      filters.dateFrom,
      filters.dateTo,
    ],
    queryFn: () =>
      getMyOrders(page, PAGE_SIZE, search, {
        minTotal: optionalAmount(filters.minTotal),
        maxTotal: optionalAmount(filters.maxTotal),
        createdFrom: filters.dateFrom
          ? `${filters.dateFrom}T00:00:00`
          : undefined,
        createdTo: filters.dateTo
          ? `${filters.dateTo}T23:59:59.999999999`
          : undefined,
      }),
    staleTime: 30_000,
  });
  const orders = ordersQuery.data?.orders ?? [];
  const totalPages = ordersQuery.data?.totalPages ?? 1;
  const totalElements = ordersQuery.data?.totalElements ?? 0;
  const activeFilterCount = [
    filters.minTotal,
    filters.maxTotal,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  return (
    <main className="bg-base-100 flex min-h-dvh flex-col">
      <ReaderNavbar active="compras" />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 lg:px-8">
        <h1 className="text-2xl font-extrabold">Mis compras</h1>
        <p className="text-base-content/60 mt-1 text-sm">
          Historial de pedidos
        </p>

        <section className="card bg-base-100 card-border mt-8 flex-1">
          <div className="card-body flex flex-1 flex-col">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                Mis pedidos
              </h2>
              {!ordersQuery.isPending && !ordersQuery.isError && (
                <span className="text-base-content/60 text-xs">
                  {totalElements} pedido{totalElements !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="mb-5 flex flex-wrap items-start gap-2">
              <form
                action="/mis-compras"
                method="get"
                className="flex w-full max-w-md min-w-[240px] flex-1 items-center gap-2"
              >
                {filters.minTotal && (
                  <input type="hidden" name="minTotal" value={filters.minTotal} />
                )}
                {filters.maxTotal && (
                  <input type="hidden" name="maxTotal" value={filters.maxTotal} />
                )}
                {filters.dateFrom && (
                  <input type="hidden" name="dateFrom" value={filters.dateFrom} />
                )}
                {filters.dateTo && (
                  <input type="hidden" name="dateTo" value={filters.dateTo} />
                )}
                <label className="input input-bordered flex min-w-0 flex-1 items-center gap-1 pr-1">
                  <input
                    type="search"
                    name="search"
                    defaultValue={search}
                    className="min-w-0 grow"
                    placeholder="Pedido o factura"
                    aria-label="Buscar pedido o factura"
                  />
                  <button
                    type="submit"
                    className="btn btn-ghost btn-sm btn-circle shrink-0"
                    aria-label="Buscar"
                    title="Buscar"
                  >
                    <Search className="size-4" strokeWidth={2} />
                  </button>
                </label>
                {search && (
                  <Link
                    href={buildHref(1, "", filters)}
                    className="btn btn-ghost btn-sm shrink-0"
                  >
                    Limpiar
                  </Link>
                )}
              </form>

              <details className="dropdown shrink-0">
                <summary className="btn btn-outline btn-sm flex cursor-pointer list-none items-center gap-2">
                  <ListFilter className="size-4" strokeWidth={2} />
                  Filtros
                  {activeFilterCount > 0 && (
                    <span className="badge badge-sm badge-ghost">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown className="size-4" strokeWidth={2} aria-hidden="true" />
                </summary>
                <form
                  action="/mis-compras"
                  method="get"
                  className="dropdown-content z-30 mt-2 w-[min(85vw,30rem)] rounded-box border border-base-300 bg-base-100 p-3 shadow-lg"
                >
                  {search && <input type="hidden" name="search" value={search} />}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="form-control w-full">
                      <span className="label-text mb-1 text-xs">Total mínimo (Gs)</span>
                      <input
                        type="number"
                        name="minTotal"
                        min="0"
                        step="1"
                        defaultValue={filters.minTotal}
                        placeholder="Sin mínimo"
                        className="input input-bordered input-sm w-full"
                      />
                    </label>
                    <label className="form-control w-full">
                      <span className="label-text mb-1 text-xs">Total máximo (Gs)</span>
                      <input
                        type="number"
                        name="maxTotal"
                        min="0"
                        step="1"
                        defaultValue={filters.maxTotal}
                        placeholder="Sin máximo"
                        className="input input-bordered input-sm w-full"
                      />
                    </label>
                    <label className="form-control w-full">
                      <span className="label-text mb-1 text-xs">Fecha desde</span>
                      <input
                        type="date"
                        name="dateFrom"
                        defaultValue={filters.dateFrom}
                        className="input input-bordered input-sm w-full"
                      />
                    </label>
                    <label className="form-control w-full">
                      <span className="label-text mb-1 text-xs">Fecha hasta</span>
                      <input
                        type="date"
                        name="dateTo"
                        defaultValue={filters.dateTo}
                        className="input input-bordered input-sm w-full"
                      />
                    </label>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    {activeFilterCount > 0 && (
                      <Link
                        href={buildHref(1, search, {
                          minTotal: "",
                          maxTotal: "",
                          dateFrom: "",
                          dateTo: "",
                        })}
                        className="btn btn-ghost btn-sm"
                      >
                        Limpiar filtros
                      </Link>
                    )}
                    <button type="submit" className="btn btn-primary btn-sm">
                      Aplicar filtros
                    </button>
                  </div>
                </form>
              </details>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="table table-md w-full min-w-[860px]">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Fecha</th>
                    <th>Ítems</th>
                    <th className="text-right">Total (Gs)</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersQuery.isPending && (
                    <tr>
                      <td colSpan={5} className="h-64 p-0">
                        <div className="flex h-full items-center justify-center">
                          <LoadingSpinner label="Cargando compras" />
                        </div>
                      </td>
                    </tr>
                  )}
                  {ordersQuery.isError && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center">
                        <div className="mx-auto flex max-w-md flex-col gap-2">
                          <NotificationToast
                            type="error"
                            message="No se pudieron cargar tus compras. Intentá nuevamente."
                          />
                          <button
                            type="button"
                            className="btn btn-outline btn-sm self-center"
                            onClick={() => void ordersQuery.refetch()}
                          >
                            Reintentar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!ordersQuery.isPending &&
                    !ordersQuery.isError &&
                    orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-base-content/60 py-8 text-center text-sm">
                          {search
                            ? "No se encontró ningún pedido o factura."
                            : "Aún no tenés compras."}
                        </td>
                      </tr>
                    )}
                  {orders.map((order) => {
                    const meta = getOrderStatusMeta(order.status);
                    const pending = order.status === "PENDING";
                    const href = pending
                      ? `/pago?numero=${encodeURIComponent(order.numeroOrden)}`
                      : `/pedidos?numero=${encodeURIComponent(order.numeroOrden)}`;
                    const totalUnits =
                      order.totalUnits ??
                      order.details?.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      ) ??
                      0;
                    const productCount =
                      order.productCount ?? order.details?.length ?? 0;

                    return (
                      <tr key={order.numeroOrden}>
                        <td className="font-semibold">
                          <Link href={href} className="link link-hover">
                            {order.numeroOrden}
                          </Link>
                          {order.invoiceNumber && (
                            <div className="text-base-content/60 text-xs font-normal">
                              Factura: {order.invoiceNumber}
                            </div>
                          )}
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <span className="text-base-content/70 text-xs">
                            {productCount} producto{productCount !== 1 ? "s" : ""} ·{" "}
                            {totalUnits} unidad{totalUnits !== 1 ? "es" : ""}
                          </span>
                        </td>
                        <td className="text-right font-semibold">
                          {formatGs(order.totalPrice)}
                        </td>
                        <td>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`badge badge-sm ${meta.badge}`}>
                              {meta.label}
                            </span>
                            <Link href={href} className="link link-primary text-xs">
                              {pending ? "Pagar" : "Ver detalle"}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!ordersQuery.isPending && !ordersQuery.isError && orders.length === 0 && (
              <div className="mt-4 text-center">
                <Link href="/explorar" className="btn btn-primary">
                  Explorar catálogo
                </Link>
              </div>
            )}

            <Pagination
              page={page}
              totalPages={totalPages}
              getHref={(targetPage) => buildHref(targetPage, search, filters)}
            />
          </div>
        </section>
      </div>

      <HomeFooter />
    </main>
  );
}
