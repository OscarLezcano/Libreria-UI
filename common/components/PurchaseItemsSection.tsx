"use client";

import { BOOKS, getBook } from "@/common/data/books";
import { formatGs } from "@/common/utils/format";
import { Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

export interface PurchaseItem {
  bookId: string;
  quantity: number;
  unitCost: number;
}

interface PurchaseItemsSectionProps {
  items: PurchaseItem[];
  onAdd: (bookId: string) => void;
  onRemove: (bookId: string) => void;
  onItemChange: (
    bookId: string,
    patch: Partial<Pick<PurchaseItem, "quantity" | "unitCost">>
  ) => void;
}

export default function PurchaseItemsSection({
  items,
  onAdd,
  onRemove,
  onItemChange,
}: PurchaseItemsSectionProps) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const matches = q
    ? BOOKS.filter(
        (book) =>
          !items.some((item) => item.bookId === book.id) &&
          (book.title.toLowerCase().includes(q) ||
            book.authors.join(" ").toLowerCase().includes(q) ||
            String(book.code).includes(q))
      ).slice(0, 5)
    : [];

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );

  return (
    <section className="card bg-base-100 card-border">
      <div className="card-body">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Ítems de la Compra</h2>
            <p className="text-base-content/60 text-xs">
              Agregá los libros indicando su costo unitario y cantidad recibida.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="input input-sm w-full sm:w-80">
              <Search className="size-4 opacity-50" strokeWidth={2} />
              <input
                type="search"
                placeholder="Buscar libro por título, autor o ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar libro para agregar"
              />
            </label>
            <button
              type="button"
              className="btn btn-primary btn-sm whitespace-nowrap"
              disabled={matches.length === 0}
              onClick={() => {
                if (matches[0]) {
                  onAdd(matches[0].id);
                  setQuery("");
                }
              }}
            >
              <Plus className="size-4" strokeWidth={2.5} />
              Agregar
            </button>
          </div>
        </div>

        {matches.length > 0 && (
          <div className="rounded-box border border-base-300 bg-base-100">
            {matches.map((book) => (
              <div
                key={book.id}
                className="flex items-center justify-between gap-2 border-b border-base-200 p-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{book.title}</p>
                  <p className="text-base-content/60 truncate text-xs">
                    {book.authors.join(", ")}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-xs shrink-0"
                  onClick={() => {
                    onAdd(book.id);
                    setQuery("");
                  }}
                >
                  <Plus className="size-3" strokeWidth={2.5} />
                  Agregar
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>ID Libro</th>
                <th>Título del Libro</th>
                <th className="w-28">Cantidad</th>
                <th className="w-36">Costo Unit. (Gs)</th>
                <th className="text-right">Subtotal (Gs)</th>
                <th className="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-base-content/60 py-8 text-center text-sm">
                    Sin ítems todavía. Buscá un libro para agregarlo.
                  </td>
                </tr>
              )}
              {items.map((item) => {
                const book = getBook(item.bookId);
                if (!book) return null;
                return (
                  <tr key={item.bookId}>
                    <td className="text-base-content/60 font-mono text-xs">
                      #{book.code}
                    </td>
                    <td className="font-medium">{book.title}</td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        aria-label={`Cantidad de ${book.title}`}
                        className="input input-sm w-20 text-center"
                        onChange={(e) =>
                          onItemChange(item.bookId, {
                            quantity: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={item.unitCost}
                        aria-label={`Costo unitario de ${book.title}`}
                        className="input input-sm w-28 text-right"
                        onChange={(e) =>
                          onItemChange(item.bookId, {
                            unitCost: Math.max(
                              0,
                              Number(e.target.value) || 0
                            ),
                          })
                        }
                      />
                    </td>
                    <td className="text-right font-semibold">
                      {formatGs(item.quantity * item.unitCost)} Gs
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-ghost btn-circle btn-sm text-error"
                        aria-label={`Eliminar ${book.title}`}
                        onClick={() => onRemove(item.bookId)}
                      >
                        <Trash2 className="size-4" strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-end justify-between gap-3 sm:flex-row sm:items-center">
          <span className="text-base-content/50 text-xs">
            Totales calculados automáticamente según ítems añadidos.
          </span>
          <div className="rounded-box bg-base-200 flex items-center gap-4 border border-base-300 px-5 py-3">
            <span className="text-base-content/60 text-xs font-bold tracking-wider uppercase">
              Total de la Compra:
            </span>
            <span className="text-2xl font-extrabold">{formatGs(total)} Gs</span>
          </div>
        </div>
      </div>
    </section>
  );
}
