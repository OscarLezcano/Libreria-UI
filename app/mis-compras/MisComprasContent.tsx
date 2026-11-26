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
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  CreditCard,
  Eye,
  ListFilter,
  Search,
} from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 10;
const DEFAULT_SORT = "createdAt,desc";

type SortField = "numeroOrden" | "createdAt" | "totalPrice";

export interface MisComprasFilters {
  sort: string;
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

interface OrdersUrlState extends MisComprasFilters {
  page: number;
  search: string;
}

function buildHref(state: OrdersUrlState): string {
  const params = new URLSearchParams();
  if (state.page > 1) params.set("page", String(state.page));
  if (state.search) params.set("search", state.search);
  if (state.sort && state.sort !== DEFAULT_SORT) params.set("sort", state.sort);
  if (state.minTotal) params.set("minTotal", state.minTotal);
  if (state.maxTotal) params.set("maxTotal", state.maxTotal);
  if (state.dateFrom) params.set("dateFrom", state.dateFrom);
  if (state.dateTo) params.set("dateTo", state.dateTo);
  const query = params.toString();
  return `/mis-compras${query ? `?${query}` : ""}`;
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("es-PY");
}

function optionalAmount(value: string): number | undefined {
  return value ? Number(value) : undefined;
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
      filters.sort,
      filters.minTotal,
      filters.maxTotal,
      filters.dateFrom,
      filters.dateTo,
    ],
    queryFn: () =>
      getMyOrders(page, PAGE_SIZE, search, {
        sort: filters.sort,
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
  const currentUrlState: OrdersUrlState = { page, search, ...filters };
  const activeFilterCount = [
    filters.minTotal,
    filters.maxTotal,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  function sortDirection(field: SortField): "ascending" | "descending" | "none" {
    const [currentField, direction] = filters.sort.split(",");
    if (currentField !== field) return "none";
    return direction === "asc" ? "ascending" : "descending";
  }

  function sortLink(field: SortField, label: string, right = false) {
    const direction = sortDirection(field);
    const nextDirection = direction === "ascending" ? "desc" : "asc";
    const href = buildHref({
      ...currentUrlState,
      page: 1,
      sort: `${field},${nextDirection}`,
    });
    const Icon =
      direction === "ascending"
        ? ArrowUp
        : direction === "descending"
          ? ArrowDown
          : ArrowUpDown;
    return (
      <Link
        href={href}
        className={`inline-flex items-center gap-1 whitespace-nowrap hover:text-primary ${
          right ? "justify-end" : ""
        }`}
        title={`Ordenar por ${label}`}
      >
        {label}
        <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </Link>
    );
  }

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
              className="w-full max-w-md min-w-[240px] flex-1"
            >
              {filters.sort !== DEFAULT_SORT && (
                <input type="hidden" name="sort" value={filters.sort} />
              )}
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
              <div className="flex w-full items-center gap-2">
                <label className="input input-bordered flex min-w-0 flex-1 items-center gap-1 pr-1">
                  <input
                    type="search"
                    name="search"
                    defaultValue={search}
                    className="min-w-0 grow"
                    placeholder="Buscar pedido o factura"
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
                    href={buildHref({ ...currentUrlState, page: 1, search: "" })}
                    className="btn btn-ghost btn-sm shrink-0"
                  >
                    Limpiar
                  </Link>
                )}
              </div>
            </form>

            <details className="dropdown group shrink-0">
              <summary className="btn btn-outline btn-sm flex cursor-pointer list-none items-center gap-2">
                <span className="inline-flex items-center gap-2">
                  <ListFilter className="size-4" strokeWidth={2} />
                  Filtros
                </span>
                <span className="inline-flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <span className="badge badge-sm badge-ghost">
                      {activeFilterCount} activo{activeFilterCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  <ChevronDown
                    className="size-4 transition-transform group-open:rotate-180"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
              </summary>
              <form
                action="/mis-compras"
                method="get"
                className="dropdown-content z-30 mt-2 w-[min(85vw,38rem)] rounded-box border border-base-300 bg-base-100 p-3 shadow-lg"
              >
                {search && <input type="hidden" name="search" value={search} />}
                {filters.sort !== DEFAULT_SORT && (
                  <input type="hidden" name="sort" value={filters.sort} />
                )}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                {activeFilterCount > 0 && (
                  <Link
                    href={buildHref({
                      page: 1,
                      search,
                      sort: filters.sort,
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
              <table className="table table-md w-full min-w-[960px]">
                <thead>
                  <tr>
                    <th aria-sort={sortDirection("numeroOrden")}>
                      {sortLink("numeroOrden", "Pedido")}
                    </th>
                    <th aria-sort={sortDirection("createdAt")}>
                      {sortLink("createdAt", "Fecha")}
                    </th>
                    <th>Ítems</th>
                    <th className="text-right" aria-sort={sortDirection("totalPrice")}>
                      {sortLink("totalPrice", "Total (Gs)", true)}
                    </th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersQuery.isPending && (
                    <tr>
                      <td colSpan={6} className="h-64 p-0">
                        <div className="flex h-full items-center justify-center">
                          <LoadingSpinner label="Cargando compras" />
                        </div>
                      </td>
                    </tr>
                  )}
                  {ordersQuery.isError && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
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
                        <td colSpan={6} className="text-base-content/60 py-8 text-center text-sm">
                          {search || activeFilterCount > 0
                            ? "No se encontró ningún pedido con esos criterios."
                            : "Aún no tenés compras."}
                        </td>
                      </tr>
                    )}
                  {orders.map((order) => {
                    const meta = getOrderStatusMeta(order.status);
                    const pending = order.status === "PENDING";
                    const href = pending
                      ? `/pago/${order.numeroOrden}`
                      : `/pedidos/${order.numeroOrden}`;
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
                          <span className={`badge badge-sm ${meta.badge}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="w-36 text-center">
                          <Link
                            href={href}
                            className={`btn btn-sm w-32 gap-1.5 whitespace-nowrap ${
                              pending ? "btn-primary" : "btn-outline"
                            }`}
                          >
                            {pending ? (
                              <CreditCard className="size-4" strokeWidth={2} />
                            ) : (
                              <Eye className="size-4" strokeWidth={2} />
                            )}
                            {pending ? "Pagar" : "Ver detalle"}
                          </Link>
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
              getHref={(targetPage) =>
                buildHref({ ...currentUrlState, page: targetPage })
              }
            />
          </div>
        </section>
      </div>

      <HomeFooter />
    </main>
  );
}
