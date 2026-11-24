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
import Link from "next/link";

const PAGE_SIZE = 10;

interface MisComprasContentProps {
  page: number;
  search: string;
}

function buildHref(targetPage: number, search: string): string {
  const params = new URLSearchParams();
  if (targetPage > 1) params.set("page", String(targetPage));
  if (search) params.set("search", search);
  const query = params.toString();
  return `/mis-compras${query ? `?${query}` : ""}`;
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("es-PY");
}

export default function MisComprasContent({
  page,
  search,
}: MisComprasContentProps) {
  const ordersQuery = useQuery({
    queryKey: ["orders", "mine", page, search],
    queryFn: () => getMyOrders(page, PAGE_SIZE, search),
    staleTime: 30_000,
  });
  const orders = ordersQuery.data?.orders ?? [];
  const totalPages = ordersQuery.data?.totalPages ?? 1;
  const totalElements = ordersQuery.data?.totalElements ?? 0;

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

            <form
              action="/mis-compras"
              method="get"
              className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <label className="input input-bordered flex w-full max-w-md items-center gap-2">
                <span className="text-base-content/50 text-sm">Buscar</span>
                <input
                  type="search"
                  name="search"
                  defaultValue={search}
                  className="grow"
                  placeholder="Pedido o factura"
                  aria-label="Buscar pedido o factura"
                />
              </label>
              <div className="flex gap-2 self-start sm:self-auto">
                <button type="submit" className="btn btn-outline btn-sm">
                  Buscar
                </button>
                {search && (
                  <Link href="/mis-compras" className="btn btn-ghost btn-sm">
                    Limpiar
                  </Link>
                )}
              </div>
            </form>

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
              getHref={(targetPage) => buildHref(targetPage, search)}
            />
          </div>
        </section>
      </div>

      <HomeFooter />
    </main>
  );
}
