"use client";

import HomeFooter from "@/common/components/HomeFooter";
import Pagination from "@/common/components/Pagination";
import PurchaseCard from "@/common/components/PurchaseCard";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { getBook } from "@/common/data/books";
import { PURCHASES } from "@/common/data/purchases";
import { useState } from "react";

const PAGE_SIZE = 4;

export default function MisComprasPage() {
  const purchases = PURCHASES.flatMap((purchase) => {
    const book = getBook(purchase.bookId);
    return book ? [{ purchase, book }] : [];
  });

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(purchases.length / PAGE_SIZE));
  const visiblePurchases = purchases.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <main className="bg-base-100 flex min-h-dvh flex-col">
      <ReaderNavbar active="compras" />

      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <h1 className="text-2xl font-extrabold">Mis compras</h1>
        <p className="text-base-content/60 mt-1 text-sm">
          Historial de libros comprados y estado de tus pedidos
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visiblePurchases.map(({ purchase, book }) => (
            <PurchaseCard
              key={purchase.id}
              purchase={purchase}
              coverSrc={book.coverSrc}
              title={book.title}
              authors={book.authors}
              unitPrice={book.price}
              href={`/book/${book.id}`}
            />
          ))}
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <HomeFooter />
    </main>
  );
}
