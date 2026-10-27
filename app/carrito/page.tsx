"use client";

import CartItemCard from "@/common/components/CartItemCard";
import HomeFooter from "@/common/components/HomeFooter";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import OrderSummary from "@/common/components/OrderSummary";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { useCart } from "@/common/context/CartContext";
import { useBookCatalog } from "@/common/hooks/useBookCatalog";
import Link from "next/link";

export default function CarritoPage() {
  const { items, remove, setQuantity } = useCart();
  const { catalog, isLoading, isError } = useBookCatalog();

  const lines = items.flatMap((item) => {
    const book = catalog.find((candidate) => candidate.id === item.bookId);
    return book ? [{ item, book }] : [];
  });
  const missingItems = items.filter(
    (item) => !catalog.some((book) => book.id === item.bookId)
  );

  const subtotal = lines.reduce(
    (total, { item, book }) => total + (book.price ?? 0) * item.quantity,
    0
  );
  const canCheckout =
    missingItems.length === 0 && lines.every(({ book }) => book.price !== null);

  return (
    <main className="bg-base-100 flex min-h-dvh flex-col">
      <ReaderNavbar active="compras" />

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 lg:px-8">
        <h1 className="text-2xl font-extrabold">Tu carrito</h1>
        <p className="text-base-content/60 mt-1 text-sm">
          {lines.length === 0
            ? "No hay productos todavía"
            : `${lines.reduce((count, { item }) => count + item.quantity, 0)} items`}
        </p>

        {isLoading ? (
          <LoadingSpinner label="Cargando productos del carrito" />
        ) : isError ? (
          <NotificationToast
            type="error"
            message="No se pudieron cargar los libros del carrito."
            className="mx-auto my-10 w-full max-w-xl"
          />
        ) : items.length === 0 ? (
          <div className="text-center">
            <p className="text-lg font-bold">Tu carrito está vacío</p>
            <p className="text-base-content/60 mt-1 text-sm">
              Explorá el catálogo y agregá los libros que querés comprar.
            </p>
            <Link href="/explorar" className="btn btn-primary mt-6">
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex flex-col gap-3">
              {missingItems.map((item) => (
                <div
                  key={item.bookId}
                  className="card bg-base-100 card-border"
                >
                  <div className="card-body flex-row items-center justify-between">
                    <p className="text-sm">
                      El libro {item.bookId} ya no está disponible.
                    </p>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => remove(item.bookId)}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
              {lines.map(({ item, book }) => (
                <CartItemCard
                  key={item.bookId}
                  coverSrc={book.coverSrc}
                  title={book.title}
                  authors={book.authors}
                  unitPrice={book.price}
                  quantity={item.quantity}
                  href={`/book/${book.id}`}
                  onQuantityChange={(quantity) =>
                    setQuantity(item.bookId, quantity)
                  }
                  onRemove={() => remove(item.bookId)}
                />
              ))}
            </div>
            <aside className="self-start">
              <OrderSummary subtotal={subtotal} canCheckout={canCheckout} />
            </aside>
          </div>
        )}
      </div>

      <HomeFooter />
    </main>
  );
}
