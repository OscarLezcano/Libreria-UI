"use client";

import HomeFooter from "@/common/components/HomeFooter";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import ShippingForm from "@/common/components/ShippingForm";
import { useCart, type BillingData, type ShippingData } from "@/common/context/CartContext";
import { useCartBooks } from "@/common/hooks/useBookCatalog";
import {
  createOrderRequest,
  NUMERO_ORDEN_PATTERN,
  type CreateOrderInput,
} from "@/common/services/sales";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SESSION_KEY = "bigbooks.checkout-session";

interface CheckoutSession {
  fingerprint: string;
  idempotencyKey: string;
  numeroOrden: string | null;
}

function getEmail(): string {
  try {
    const raw = localStorage.getItem("bigbooks.user");
    const user = raw ? (JSON.parse(raw) as { email?: unknown }) : null;
    return typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";
  } catch {
    return "";
  }
}

function readSession(): CheckoutSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutSession>;
    if (
      typeof parsed.fingerprint !== "string" ||
      typeof parsed.idempotencyKey !== "string" ||
      !parsed.idempotencyKey
    ) {
      return null;
    }
    const numeroOrden =
      typeof parsed.numeroOrden === "string" &&
      NUMERO_ORDEN_PATTERN.test(parsed.numeroOrden)
        ? parsed.numeroOrden
        : null;
    return {
      fingerprint: parsed.fingerprint,
      idempotencyKey: parsed.idempotencyKey,
      numeroOrden,
    };
  } catch {
    return null;
  }
}

function saveSession(session: CheckoutSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function createIdempotencyKey(): string {
  return typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function CheckoutPage() {
  const { items, coupon, shipping, billing, hydrated, setCheckout } = useCart();
  const { catalog, isLoading, isError, refetchBooks } = useCartBooks(
    items.map((item) => item.bookId)
  );
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lines = items.flatMap((item) => {
    const book = catalog.find((candidate) => candidate.id === item.bookId);
    return book ? [{ item, book }] : [];
  });
  const ready =
    hydrated &&
    !isLoading &&
    !isError &&
    lines.length === items.length &&
    lines.every(
      ({ item, book }) =>
        book.price !== null &&
        Number.isSafeInteger(Number(item.bookId)) &&
        Number(item.bookId) > 0
    );

  const handleSubmit = async (nextShipping: ShippingData, nextBilling: BillingData) => {
    if (!ready || pending) return;
    setError(null);

    const input: CreateOrderInput = {
      items: lines.map(({ item }) => ({
        bookId: Number(item.bookId),
        quantity: item.quantity,
      })),
      invoiceName: nextBilling.nombre,
      invoiceLastName: nextBilling.apellido,
      invoiceRuc: nextBilling.ruc,
      invoicePhone: nextBilling.telefono,
      shippingName: nextShipping.nombre,
      shippingLastName: nextShipping.apellido,
      shippingDepartment: nextShipping.departamento,
      shippingCity: nextShipping.ciudad,
      shippingAddress: nextShipping.direccion,
      shippingReference: nextShipping.referencia,
      shippingPhone: nextShipping.telefono,
      ...(coupon ? { couponCode: coupon } : {}),
    };
    const fingerprint = JSON.stringify({ email: getEmail(), ...input });
    const existing = readSession();
    const session: CheckoutSession =
      existing?.fingerprint === fingerprint
        ? existing
        : {
            fingerprint,
            idempotencyKey: createIdempotencyKey(),
            numeroOrden: null,
          };
    saveSession(session);

    if (session.numeroOrden) {
      setCheckout(nextShipping, nextBilling);
      router.push(`/pago/${session.numeroOrden}`);
      return;
    }

    setPending(true);
    try {
      const order = await createOrderRequest(input, session.idempotencyKey);
      session.numeroOrden = order.numeroOrden;
      saveSession(session);
      setCheckout(nextShipping, nextBilling);
      router.push(`/pago/${order.numeroOrden}`);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo crear el pedido. Intentá nuevamente."
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="bg-base-100 flex min-h-dvh flex-col">
      <ReaderNavbar />

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 lg:px-8">
        <h1 className="text-2xl font-extrabold">Confirmar y pagar</h1>
        <p className="text-base-content/60 mt-1 text-sm">
          Completá los datos de envío y facturación para tu pedido
        </p>

        {!hydrated ? (
          <LoadingSpinner label="Cargando carrito" />
        ) : items.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-lg font-bold">No hay pedidos para confirmar</p>
            <p className="text-base-content/60 mt-1 text-sm">
              Agregá libros a tu carrito antes de continuar.
            </p>
            <Link href="/explorar" className="btn btn-primary mt-6">
              Explorar catálogo
            </Link>
          </div>
        ) : isLoading ? (
          <LoadingSpinner label="Cargando productos del pedido" />
        ) : isError || !ready ? (
          <div className="mx-auto my-10 flex w-full max-w-xl flex-col gap-3">
            <NotificationToast
              type="error"
              message={isError
                ? "No se pudieron cargar los libros del pedido."
                : "Revisá que todos los libros sigan disponibles y tengan precio."}
            />
            <div className="flex flex-wrap gap-2">
              {isError && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => void refetchBooks()}
                >
                  Reintentar
                </button>
              )}
              <Link href="/carrito" className="btn btn-outline">
                Volver al carrito
              </Link>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-6 w-full max-w-3xl">
            {error && (
              <NotificationToast
                type="error"
                message={error}
                className="mb-4"
              />
            )}
            <ShippingForm
              initialShipping={shipping}
              initialBilling={billing}
              pending={pending}
              onSubmit={(nextShipping, nextBilling) => {
                void handleSubmit(nextShipping, nextBilling);
              }}
            />
          </div>
        )}
      </div>

      <HomeFooter />
    </main>
  );
}
