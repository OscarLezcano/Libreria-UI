"use client";

import CartItemCard from "@/common/components/CartItemCard";
import HomeFooter from "@/common/components/HomeFooter";
import OrderSummary from "@/common/components/OrderSummary";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { useCart } from "@/common/context/CartContext";
import { getBook } from "@/common/data/books";
import Link from "next/link";

export default function CarritoPage() {
  const { items, remove, setQuantity } = useCart();

  const lines = items.flatMap((item) => {
    const book = getBook(item.bookId);
    return book ? [{ item, book }] : [];
  });

  const subtotal = lines.reduce(
    (total, { item, book }) => total + book.price * item.quantity,
    0
  );

  return (
    <main className="bg-base-100 min-h-screen">
      <ReaderNavbar active="compras" initials="HA" />

      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <h1 className="text-2xl font-extrabold">Tu carrito</h1>
        <p className="text-base-content/60 mt-1 text-sm">
          {lines.length === 0
            ? "No hay productos todavía"
            : `${lines.reduce((count, { item }) => count + item.quantity, 0)} items`}
        </p>

        {lines.length === 0 ? (
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
              <OrderSummary subtotal={subtotal} />
            </aside>
          </div>
        )}
      </div>

      <HomeFooter />
    </main>
  );
}
