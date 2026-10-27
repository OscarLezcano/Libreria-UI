"use client";

import HomeFooter from "@/common/components/HomeFooter";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import PaymentForm from "@/common/components/PaymentForm";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { useCart } from "@/common/context/CartContext";
import { couponDiscount, findCoupon } from "@/common/data/coupons";
import { useBookCatalog } from "@/common/hooks/useBookCatalog";
import {
  createOrderRequest,
  // markOrderAsPaidRequest,
} from "@/common/services/sales";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const formatGs = (value: number) =>
  new Intl.NumberFormat("es-PY").format(value);

interface PaidData {
  orderId: string;
}

export default function PagoPage() {
  const { items, coupon, shipping, clear } = useCart();
  const { catalog, isLoading, isError } = useBookCatalog();
  const [paid, setPaid] = useState<PaidData | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const lines = items.flatMap((item) => {
    const book = catalog.find((candidate) => candidate.id === item.bookId);
    return book ? [{ item, book }] : [];
  });
  const subtotal = lines.reduce(
    (total, { item, book }) => total + (book.price ?? 0) * item.quantity,
    0
  );
  const applied = coupon ? findCoupon(coupon) : undefined;
  const total = Math.max(0, subtotal - (applied ? couponDiscount(applied, subtotal) : 0));
  const canPay =
    items.length > 0 &&
    lines.length === items.length &&
    lines.every(
      ({ item, book }) =>
        book.price !== null &&
        Number.isSafeInteger(Number(item.bookId)) &&
        Number(item.bookId) > 0
    );

  const handlePaid = async () => {
    let orderId = createdOrderId;
    if (!orderId) {
      orderId = await createOrderRequest({
        items: lines.map(({ item }) => ({
          bookId: Number(item.bookId),
          quantity: item.quantity,
        })),
        ...(coupon ? { couponCode: coupon } : {}),
      });
      setCreatedOrderId(orderId);
    }

    // await markOrderAsPaidRequest(orderId);
    setPaid({ orderId });
    clear();
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 5000);
  };

  return (
    <main className="bg-base-100 flex min-h-dvh flex-col">
      <ReaderNavbar active="compras" />

      <div className="mx-auto max-w-6xl flex-1 px-4 py-10 lg:px-8">
        {paid ? (
          <div className="mt-8 flex justify-center">
            <div className="card bg-base-100 card-border w-full max-w-sm">
              <div className="card-body items-center text-center">
                <CheckCircle2
                  className="size-16 text-success"
                  strokeWidth={1.5}
                />
                <h2 className="mt-2 text-xl font-extrabold">
                  ¡Pago aprobado!
                </h2>
                <p className="text-base-content/60 mt-2 text-sm">
                  N° de pedido: <b className="text-base-content">#{paid.orderId}</b>
                </p>
                <div className="card-actions mt-4 flex-col justify-center gap-2">
                  <Link href="/explorar" className="btn btn-primary w-full">
                    Seguir explorando
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-lg font-bold">No hay un pedido pendiente de pago</p>
            <p className="text-base-content/60 mt-1 text-sm">
              Agregá libros a tu carrito antes de pagar.
            </p>
            <Link href="/explorar" className="btn btn-primary mt-6">
              Explorar catálogo
            </Link>
          </div>
        ) : isLoading ? (
          <LoadingSpinner label="Cargando productos del pedido" />
        ) : isError ? (
          <NotificationToast
            type="error"
            message="No se pudieron cargar los libros del pedido."
            className="mx-auto my-10 w-full max-w-xl"
          />
        ) : !shipping ? (
          <div className="py-10 text-center">
            <p className="text-lg font-bold">Faltan los datos de envío</p>
            <Link href="/checkout" className="btn btn-primary mt-6">
              Completar envío
            </Link>
          </div>
        ) : !canPay ? (
          <div className="py-10 text-center">
            <p className="text-lg font-bold">No se puede procesar este pedido</p>
            <p className="text-base-content/60 mt-1 text-sm">
              Revisá que todos los libros sigan disponibles y tengan precio.
            </p>
            <Link href="/carrito" className="btn btn-primary mt-6">
              Volver al carrito
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold">Pago</h1>
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
                      <span>{formatGs(subtotal)} Gs</span>
                    </div>
                    {applied && (
                      <div className="flex justify-between py-1 text-sm">
                        <span className="text-base-content/60">
                          Descuento ({applied.code})
                        </span>
                        <span className="text-success">
                          -{formatGs(couponDiscount(applied, subtotal))} Gs
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-base-300 py-2 text-base font-extrabold">
                      <span>Total</span>
                      <span>{formatGs(total)} Gs</span>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-200">
                  <div className="card-body gap-1">
                    <h2 className="text-sm font-bold">Envío a</h2>
                    <p className="text-base-content/70 text-sm">
                      {shipping.direccion}, {shipping.ciudad}, {shipping.departamento}
                    </p>
                    <p className="text-base-content/60 text-xs">
                      Contacto: {shipping.telefono}
                    </p>
                    <Link
                      href="/checkout"
                      className="link link-primary mt-1 self-start text-xs"
                    >
                      Modificar datos de envío
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>

      {showToast && (
        <NotificationToast
          type="success"
          message={`Pago confirmado · pedido #${paid?.orderId}`}
          placement="toast"
          onClose={() => setShowToast(false)}
        />
      )}

      <HomeFooter />
    </main>
  );
}
