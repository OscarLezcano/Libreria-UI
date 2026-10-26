"use client";

import HomeFooter from "@/common/components/HomeFooter";
import PaymentForm from "@/common/components/PaymentForm";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { useCart } from "@/common/context/CartContext";
import { couponDiscount, findCoupon } from "@/common/data/coupons";
import { getBook } from "@/common/data/books";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const formatGs = (value: number) =>
  new Intl.NumberFormat("es-PY").format(value);

function buildOrderNumber(): string {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const suffix = String(Math.floor(Math.random() * 900) + 100);
  return `#BB-${ymd}-${suffix}`;
}

function buildInvoiceNumber(): string {
  return `F-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
}

interface PaidData {
  orderNumber: string;
  invoiceNumber: string;
}

export default function PagoPage() {
  const { items, coupon, shipping, clear } = useCart();
  const [paid, setPaid] = useState<PaidData | null>(null);
  const [showToast, setShowToast] = useState(false);

  const subtotal = items.reduce((total, item) => {
    const book = getBook(item.bookId);
    return total + (book ? book.price * item.quantity : 0);
  }, 0);
  const applied = coupon ? findCoupon(coupon) : undefined;
  const total = Math.max(0, subtotal - (applied ? couponDiscount(applied, subtotal) : 0));

  const handlePaid = () => {
    setPaid({
      orderNumber: buildOrderNumber(),
      invoiceNumber: buildInvoiceNumber(),
    });
    clear();
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 5000);
  };

  if (items.length === 0 && !paid) {
    return (
      <main className="bg-base-100 flex min-h-dvh flex-col">
        <ReaderNavbar active="compras" initials="HA" />
        <div className="mx-auto max-w-6xl flex-1 px-4 py-20 text-center lg:px-8">
          <p className="text-lg font-bold">No hay un pedido pendiente de pago</p>
          <p className="text-base-content/60 mt-1 text-sm">
            Agregá libros a tu carrito antes de pagar.
          </p>
          <Link href="/explorar" className="btn btn-primary mt-6">
            Explorar catálogo
          </Link>
        </div>
        <HomeFooter />
      </main>
    );
  }

  return (
    <main className="bg-base-100 flex min-h-dvh flex-col">
      <ReaderNavbar active="compras" initials="HA" />

      <div className="mx-auto max-w-6xl flex-1 px-4 py-10 lg:px-8">
        {!paid && (
          <>
            <h1 className="text-2xl font-extrabold">Pago</h1>
            <p className="text-base-content/60 mt-1 text-sm">
              Ingresá los datos de tu tarjeta para completar la compra
            </p>
          </>
        )}

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
                  N° de orden:{" "}
                  <b className="text-base-content">{paid.orderNumber}</b>
                </p>
                <p className="text-base-content/60 mt-1 text-sm">
                  N° de factura:{" "}
                  <b className="text-base-content">{paid.invoiceNumber}</b>
                </p>
                <div className="card-actions mt-4 flex-col justify-center gap-2">
                  <Link href="/" className="btn btn-primary w-full">
                    Volver al inicio
                  </Link>
                  <button type="button" className="btn btn-ghost w-full">
                    Ver detalle
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
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

              {shipping && (
                <div className="card bg-base-200">
                  <div className="card-body gap-1">
                    <h2 className="text-sm font-bold">Envío a</h2>
                    <p className="text-base-content/70 text-sm">
                      {shipping.direccion}, {shipping.ciudad},{" "}
                      {shipping.departamento}
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
              )}
            </aside>
          </div>
        )}
      </div>

      {showToast && (
        <div className="toast toast-start toast-bottom">
          <div role="status" className="alert alert-success">
            <CheckCircle2 className="size-4" strokeWidth={2.5} />
            <span>Pago aprobado · tu pedido está en camino</span>
          </div>
        </div>
      )}

      <HomeFooter />
    </main>
  );
}
