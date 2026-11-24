"use client";

import HomeFooter from "@/common/components/HomeFooter";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import PaymentForm from "@/common/components/PaymentForm";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { useCart } from "@/common/context/CartContext";
import { getOrderStatusMeta } from "@/common/data/orders";
import {
  getOrderByNumeroOrdenRequest,
  markOrderAsPaidRequest,
  NUMERO_ORDEN_PATTERN,
  type Order,
} from "@/common/services/sales";
import { formatGs } from "@/common/utils/format";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

const SESSION_KEY = "bigbooks.checkout-session";

const PAID_STATUSES = new Set([
  "PAID",
  "APPROVED",
  "COMPLETED",
  "SHIPPED",
  "DELIVERED",
  "REFUNDED",
]);

function isPaidStatus(status: string): boolean {
  return PAID_STATUSES.has(status.trim().toUpperCase());
}

function joinParts(parts: (string | null | undefined)[]): string {
  return parts.filter((part): part is string => Boolean(part?.trim())).join(" ");
}

export default function PagarPedidoPage() {
  const params = useParams();
  const rawNumeroOrden = Array.isArray(params?.numeroOrden)
    ? params.numeroOrden[0]
    : params?.numeroOrden;
  const numeroOrden = typeof rawNumeroOrden === "string" ? rawNumeroOrden.trim() : "";
  const isValid = NUMERO_ORDEN_PATTERN.test(numeroOrden);

  const { clear, clearCheckout } = useCart();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderQuery = useQuery({
    queryKey: ["orders", "numero", numeroOrden],
    queryFn: () => getOrderByNumeroOrdenRequest(numeroOrden),
    enabled: isValid,
    staleTime: 0,
  });
  const order = orderQuery.data ?? null;

  const finishPaid = useCallback(
    (paidOrder: Order) => {
      clear();
      clearCheckout();
      localStorage.removeItem(SESSION_KEY);
      void queryClient.invalidateQueries({ queryKey: ["orders", "mine"] });
      void queryClient.invalidateQueries({
        queryKey: ["orders", "numero", paidOrder.numeroOrden],
      });
      router.replace(`/pedidos/${paidOrder.numeroOrden}`);
    },
    [clear, clearCheckout, queryClient, router]
  );

  useEffect(() => {
    if (order && isPaidStatus(order.status)) finishPaid(order);
  }, [order, finishPaid]);

  const handlePaid = async () => {
    if (!order || !isValid) {
      throw new Error("No se pudo identificar el pedido a pagar.");
    }
    try {
      const paidOrder = await markOrderAsPaidRequest(numeroOrden);
      finishPaid(paidOrder);
    } catch (error) {
      try {
        const currentOrder = await getOrderByNumeroOrdenRequest(numeroOrden);
        if (currentOrder && isPaidStatus(currentOrder.status)) {
          finishPaid(currentOrder);
          return;
        }
      } catch {
        // Se conserva el error original del intento de pago.
      }
      throw error;
    }
  };

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

  const statusMeta = order ? getOrderStatusMeta(order.status) : null;
  const shipping = order?.shipping;
  const recipient = joinParts([shipping?.name, shipping?.lastName]);
  const address = joinParts([
    shipping?.address,
    shipping?.city,
    shipping?.department,
  ]);
  const total = order?.totalPrice ?? 0;
  const details = order?.details ?? [];

  return (
    <main className="bg-base-100 flex min-h-dvh flex-col">
      <ReaderNavbar active="compras" />

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 lg:px-8">
        {orderQuery.isPending ? (
          <LoadingSpinner label="Cargando pedido" />
        ) : orderQuery.isError ? (
          <div className="mx-auto my-10 flex w-full max-w-xl flex-col gap-3">
            <NotificationToast
              type="error"
              message="No se pudo cargar el pedido. Revisá tu conexión e intentá nuevamente."
            />
            <button
              type="button"
              className="btn btn-outline self-start"
              onClick={() => void orderQuery.refetch()}
            >
              Reintentar
            </button>
          </div>
        ) : !order ? (
          <div className="py-10 text-center">
            <h1 className="text-2xl font-extrabold">Pedido no encontrado</h1>
            <p className="text-base-content/60 mt-1 text-sm">
              Verificá el número de orden o revisá tu historial de compras.
            </p>
            <Link href="/mis-compras" className="btn btn-primary mt-6">
              Ver mis compras
            </Link>
          </div>
        ) : isPaidStatus(order.status) ? (
          <LoadingSpinner label="Redirigiendo al detalle del pedido" />
        ) : order.status === "CANCELLED" || order.status === "CANCELED" ? (
          <div className="py-10 text-center">
            <h1 className="text-2xl font-extrabold">Pedido cancelado</h1>
            <p className="text-base-content/60 mt-1 text-sm">
              El pedido {order.numeroOrden} ya no puede pagarse.
            </p>
            <Link href="/mis-compras" className="btn btn-primary mt-6">
              Ver mis compras
            </Link>
          </div>
        ) : order.status !== "PENDING" ? (
          <div className="py-10 text-center">
            <h1 className="text-2xl font-extrabold">Pedido {order.numeroOrden}</h1>
            <p className="text-base-content/60 mt-1 text-sm">
              Estado actual: {statusMeta?.label ?? order.status}
            </p>
            <Link
              href={`/pedidos/${order.numeroOrden}`}
              className="btn btn-primary mt-6"
            >
              Ver detalle del pedido
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold">Pagar pedido {order.numeroOrden}</h1>
            <p className="text-base-content/60 mt-1 text-sm">
              Ingresá los datos de tu tarjeta para completar la compra
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <PaymentForm total={total} onPaid={handlePaid} />

              <aside className="flex flex-col gap-4 self-start">
                <div className="card bg-base-100 card-border">
                  <div className="card-body gap-2">
                    <h2 className="card-title text-base">Total a pagar</h2>
                    <div className="flex justify-between py-1 text-sm">
                      <span className="text-base-content/60">Subtotal</span>
                      <span>{formatGs(order.subtotal)} Gs</span>
                    </div>
                    {order.couponCode && order.discountAmount > 0 && (
                      <div className="flex justify-between py-1 text-sm">
                        <span className="text-base-content/60">
                          Descuento ({order.couponCode})
                        </span>
                        <span className="text-success">
                          -{formatGs(order.discountAmount)} Gs
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-base-300 py-2 text-base font-extrabold">
                      <span>Total</span>
                      <span>{formatGs(total)} Gs</span>
                    </div>
                    {details.length > 0 && (
                      <p className="text-base-content/60 mt-1 text-xs">
                        {details.length} producto{details.length !== 1 ? "s" : ""} ·{" "}
                        {order.totalUnits ?? details.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                        unidad{order.totalUnits === 1 ? "" : "es"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="card bg-base-200">
                  <div className="card-body gap-1">
                    <h2 className="text-sm font-bold">Envío a</h2>
                    {shipping ? (
                      <>
                        <p className="text-base-content/70 text-sm">
                          {recipient ? `${recipient} · ` : ""}
                          {address || "Dirección no disponible"}
                        </p>
                        {shipping.reference && (
                          <p className="text-base-content/60 text-xs">
                            Referencia: {shipping.reference}
                          </p>
                        )}
                        {shipping.phone && (
                          <p className="text-base-content/60 text-xs">
                            Contacto: {shipping.phone}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-base-content/60 text-sm">
                        El pedido no tiene datos de envío registrados.
                      </p>
                    )}
                    <Link
                      href="/mis-compras"
                      className="link link-primary mt-1 self-start text-xs"
                    >
                      Ver mis compras
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>

      <HomeFooter />
    </main>
  );
}
