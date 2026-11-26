"use client";

import HomeFooter from "@/common/components/HomeFooter";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { getOrderStatusMeta } from "@/common/data/orders";
import {
  getOrderByNumeroOrdenRequest,
  getOrderDetailsRequest,
  NUMERO_ORDEN_PATTERN,
} from "@/common/services/sales";
import { formatGs } from "@/common/utils/format";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function joinParts(parts: (string | null | undefined)[]): string {
  return parts.filter((part): part is string => Boolean(part?.trim())).join(" ");
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("es-PY");
}

export default function PedidoDetallePage() {
  const rawNumeroOrden = useSearchParams().get("numeroOrden");
  const numeroOrden = typeof rawNumeroOrden === "string" ? rawNumeroOrden.trim() : "";
  const isValid = NUMERO_ORDEN_PATTERN.test(numeroOrden);

  const orderQuery = useQuery({
    queryKey: ["orders", "numero", numeroOrden],
    queryFn: () => getOrderByNumeroOrdenRequest(numeroOrden),
    enabled: isValid,
    staleTime: 30_000,
  });
  const order = orderQuery.data ?? null;
  const detailsQuery = useQuery({
    queryKey: ["orders", "numero", numeroOrden, "details"],
    queryFn: () => getOrderDetailsRequest(numeroOrden),
    enabled: isValid && Boolean(order) && order?.details === null,
    staleTime: 30_000,
  });

  if (!isValid) {
    return (
      <main className="bg-base-100 flex min-h-dvh flex-col">
        <ReaderNavbar active="compras" />
        <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 text-center lg:px-8">
          <h1 className="text-2xl font-extrabold">Número de pedido inválido</h1>
          <p className="text-base-content/60 mt-1 text-sm">
            El enlace no contiene un número de orden válido.
          </p>
          <Link href="/mis-compras" className="btn btn-primary mt-6">
            Ver mis compras
          </Link>
        </div>
        <HomeFooter />
      </main>
    );
  }

  const meta = order ? getOrderStatusMeta(order.status) : null;
  const details = order?.details ?? detailsQuery.data ?? [];
  const shipping = order?.shipping;
  const recipient = joinParts([shipping?.name, shipping?.lastName]);
  const address = joinParts([
    shipping?.address,
    shipping?.city,
    shipping?.department,
  ]);
  const total = order?.totalPrice ?? 0;

  return (
    <main className="bg-base-100 flex min-h-dvh flex-col">
      <ReaderNavbar active="compras" />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">
              Detalle del pedido {numeroOrden}
            </h1>
            <p className="text-base-content/60 mt-1 text-sm">
              {orderQuery.isPending
                ? "Cargando pedido"
                : order
                  ? `Fecha: ${formatDate(order.createdAt)}`
                  : "\u00A0"}
            </p>
          </div>
          <Link href="/mis-compras" className="btn btn-ghost btn-sm">
            Volver
          </Link>
        </div>

        {orderQuery.isPending && <LoadingSpinner label="Cargando pedido" />}

        {orderQuery.isError && (
          <NotificationToast
            type="error"
            message="No se pudo cargar el pedido. Intentá nuevamente."
          />
        )}

        {!orderQuery.isPending && !orderQuery.isError && !order && (
          <div className="py-10 text-center">
            <p className="text-lg font-bold">Pedido no encontrado</p>
            <p className="text-base-content/60 mt-1 text-sm">
              Verificá el número de orden o revisá tu historial de compras.
            </p>
            <Link href="/mis-compras" className="btn btn-primary mt-6">
              Ver mis compras
            </Link>
          </div>
        )}

        {order && (
          <>
            <div className="card bg-base-100 card-border mb-6">
              <div className="card-body flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-base-content/60 text-sm">Estado</div>
                  <span className={`badge mt-1 ${meta?.badge ?? "badge-ghost"}`}>
                    {meta?.label ?? order.status}
                  </span>
                </div>
                <div>
                  <div className="text-base-content/60 text-sm">Total</div>
                  <div className="text-lg font-extrabold">{formatGs(total)} Gs</div>
                  {order.invoiceNumber && (
                    <div className="text-base-content/60 mt-1 text-xs">
                      Factura: <b className="text-base-content">{order.invoiceNumber}</b>
                    </div>
                  )}
                </div>
                {order.status === "PENDING" && (
                  <Link href={`/pago/?numeroOrden=${order.numeroOrden}`} className="btn btn-primary btn-sm">
                    Continuar con el pago
                  </Link>
                )}
              </div>
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-2">
              <section className="card bg-base-100 card-border">
                <div className="card-body">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                    Datos de facturación
                  </h2>
                  <dl className="mt-3 grid gap-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-base-content/60">RUC / CI</dt>
                      <dd className="font-semibold">{order.invoiceRuc || "-"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-base-content/60">Nombre</dt>
                      <dd className="font-semibold">
                        {joinParts([order.invoiceName, order.invoiceLastName]) || "-"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-base-content/60">Teléfono</dt>
                      <dd className="font-semibold">{order.invoicePhone || "-"}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section className="card bg-base-100 card-border">
                <div className="card-body">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                    Datos de envío
                  </h2>
                  <dl className="mt-3 grid gap-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-base-content/60">Destinatario</dt>
                      <dd className="text-right font-semibold">{recipient || "-"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-base-content/60">Dirección</dt>
                      <dd className="text-right font-semibold">{address || "-"}</dd>
                    </div>
                    {shipping?.reference && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-base-content/60">Referencia</dt>
                        <dd className="text-right font-semibold">{shipping.reference}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-4">
                      <dt className="text-base-content/60">Teléfono</dt>
                      <dd className="text-right font-semibold">
                        {shipping?.phone || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>
            </div>

            <section className="card bg-base-100 card-border">
              <div className="card-body">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-base-content/60">
                  Productos
                </h2>
                {detailsQuery.isError && (
                  <div className="mb-4 flex flex-col gap-2">
                    <NotificationToast
                      type="error"
                      message="No se pudieron cargar los productos del pedido."
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm self-start"
                      onClick={() => void detailsQuery.refetch()}
                    >
                      Reintentar
                    </button>
                  </div>
                )}
                {detailsQuery.isPending && order.details === null && (
                  <LoadingSpinner label="Cargando productos" />
                )}
                <div className="overflow-x-auto">
                  <table className="table table-md w-full min-w-[720px]">
                    <thead>
                      <tr>
                        <th>Libro</th>
                        <th className="text-right">Precio unitario</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.length === 0 &&
                        !detailsQuery.isPending &&
                        !detailsQuery.isError && (
                          <tr>
                            <td colSpan={4} className="text-base-content/60 py-8 text-center text-sm">
                              No hay productos para mostrar.
                            </td>
                          </tr>
                        )}
                      {details.map((item, index) => {
                        const bookId =
                          typeof item.bookId === "string" && /^\d+$/.test(item.bookId)
                            ? item.bookId
                            : null;
                        return (
                          <tr key={`${item.bookId ?? "producto"}-${index}`}>
                            <td>
                              <div className="flex items-center gap-3">
                                {item.coverSrc && (
                                  <div className="avatar">
                                    <div className="mask mask-squircle h-12 w-12">
                                      <img src={item.coverSrc} alt={item.bookName} />
                                    </div>
                                  </div>
                                )}
                                <div>
                                  {bookId ? (
                                    <Link
                                      href={`/book/?id=${bookId}`}
                                      className="link link-hover font-semibold"
                                    >
                                      {item.bookName}
                                    </Link>
                                  ) : (
                                    <span className="font-semibold">{item.bookName}</span>
                                  )}
                                  {item.authors.length > 0 && (
                                    <div className="text-base-content/60 text-xs">
                                      {item.authors.join(", ")}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-right">{formatGs(item.unitPrice)}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-right font-semibold">
                              {formatGs(item.lineTotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-col gap-1 self-end text-sm">
                  <div className="flex justify-between gap-8">
                    <span className="text-base-content/60">Subtotal</span>
                    <span>{formatGs(order.subtotal)} Gs</span>
                  </div>
                  {order.couponCode && order.discountAmount > 0 && (
                    <div className="flex justify-between gap-8">
                      <span className="text-base-content/60">
                        Descuento ({order.couponCode})
                      </span>
                      <span>-{formatGs(order.discountAmount)} Gs</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-8 border-t border-base-300 pt-2 font-extrabold">
                    <span>Total</span>
                    <span>{formatGs(total)} Gs</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <HomeFooter />
    </main>
  );
}
