"use client";

import { formatGs } from "@/common/utils/format";
import EditableNumberInput from "@/common/components/EditableNumberInput";
import NotificationToast from "@/common/components/NotificationToast";
import QuantitySelector from "@/common/components/QuantitySelector";
import { BookOpen, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface PurchaseItem {
  bookId: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseBook {
  id: string;
  title: string;
  coverUrl: string | null;
}

interface PurchaseItemsSectionProps {
  items: PurchaseItem[];
  books: PurchaseBook[];
  onAdd: (bookId: string, quantity: number) => void;
  onRemove: (bookId: string) => void;
  onItemChange: (
    bookId: string,
    patch: Partial<Pick<PurchaseItem, "quantity" | "unitCost">>
  ) => void;
  isBookPickerOpen: boolean;
  onOpenBookPicker: () => void;
  onCloseBookPicker: () => void;
  hasMoreBooks: boolean;
  isLoadingMoreBooks: boolean;
  booksError: boolean;
  onLoadMoreBooks: () => void;
  onRetryBooks: () => void;
}

export default function PurchaseItemsSection({
  items,
  books,
  onAdd,
  onRemove,
  onItemChange,
  isBookPickerOpen,
  onOpenBookPicker,
  onCloseBookPicker,
  hasMoreBooks,
  isLoadingMoreBooks,
  booksError,
  onLoadMoreBooks,
  onRetryBooks,
}: PurchaseItemsSectionProps) {
  const [query, setQuery] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const booksById = new Map(books.map((book) => [book.id, book]));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isBookPickerOpen && !dialog.open) dialog.showModal();
    if (!isBookPickerOpen && dialog.open) dialog.close();
  }, [isBookPickerOpen]);

  const q = query.trim().toLowerCase();
  const matches = books.filter((book) => book.title.toLowerCase().includes(q));

  useEffect(() => {
    const root = listRef.current;
    const target = loadMoreRef.current;
    if (!isBookPickerOpen || !hasMoreBooks || isLoadingMoreBooks || !root || !target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMoreBooks();
      },
      { root, rootMargin: "0px 0px 120px 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreBooks, isBookPickerOpen, isLoadingMoreBooks, onLoadMoreBooks]);

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
          <button type="button" className="btn" onClick={onOpenBookPicker}>
            <Plus className="size-4" strokeWidth={2.5} />
            Agregar libro
          </button>
        </div>

        <dialog
          ref={dialogRef}
          className="modal"
          onClose={onCloseBookPicker}
          onClick={(event) => {
            if (event.target === event.currentTarget) onCloseBookPicker();
          }}
          aria-labelledby="book-picker-title"
        >
          {booksError && isBookPickerOpen && (
            <NotificationToast
              type="error"
              message={
                books.length > 0
                  ? "No se pudieron cargar más libros."
                  : "No se pudieron cargar los libros."
              }
              placement="toast"
            />
          )}
          <div className="modal-box flex max-h-[85vh] w-11/12 max-w-2xl flex-col gap-4 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="book-picker-title" className="text-xl font-bold">
                  Agregar libro
                </h3>
                <p className="text-base-content/60 mt-1 text-sm">
                  Buscá por nombre y seleccioná los títulos para la compra.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-square btn-sm"
                aria-label="Cerrar"
                onClick={onCloseBookPicker}
              >
                <X className="size-4" />
              </button>
            </div>

            <label className="input w-full">
              <Search className="size-4 opacity-50" strokeWidth={2} />
              <input
                type="search"
                placeholder="Buscar libro por nombre..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Buscar libro por nombre"
                autoFocus
              />
            </label>

            <div
              ref={listRef}
              className="max-h-[55vh] min-h-48 overflow-y-auto rounded-box border border-base-300"
              aria-live="polite"
            >
              {books.length === 0 && !booksError && (
                <div className="flex min-h-48 items-center justify-center gap-3 p-6 text-sm text-base-content/60">
                  <span className="loading loading-spinner loading-sm" />
                  Cargando libros...
                </div>
              )}
              {booksError && books.length === 0 && (
                <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={onRetryBooks}
                  >
                    Reintentar carga de libros
                  </button>
                </div>
              )}
              {books.length > 0 && matches.length === 0 && !booksError && (
                <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
                  <p className="text-sm text-base-content/60">
                    No hay coincidencias entre los libros cargados.
                  </p>
                  {hasMoreBooks && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      disabled={isLoadingMoreBooks}
                      onClick={onLoadMoreBooks}
                    >
                      {isLoadingMoreBooks ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        "Cargar los siguientes 25"
                      )}
                    </button>
                  )}
                </div>
              )}
              {matches.map((book) => {
                const isAdded = items.some((item) => item.bookId === book.id);
                const quantity = quantities[book.id] ?? 1;
                return (
                  <div
                    key={book.id}
                    className="flex items-center gap-2 border-b border-base-200 p-2 last:border-b-0 sm:gap-3 sm:p-3"
                  >
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={`Portada de ${book.title}`}
                        className="aspect-[3/4] w-10 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div
                        className="flex aspect-[3/4] w-10 shrink-0 items-center justify-center rounded bg-base-200 text-base-content/40"
                        aria-label="Libro sin portada"
                      >
                        <BookOpen className="size-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold sm:text-sm">
                        {book.title}
                      </p>
                      <div className="mt-1 flex items-center justify-end gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base-content/60 text-[10px]">
                            Cant.
                          </span>
                          <QuantitySelector
                            value={quantity}
                            onChange={(nextQuantity) =>
                              setQuantities((current) => ({
                                ...current,
                                [book.id]: nextQuantity,
                              }))
                            }
                            label={`Cantidad de ${book.title}`}
                            size="xs"
                            disabled={isAdded}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-xs shrink-0"
                          disabled={isAdded}
                          onClick={() => onAdd(book.id, quantity)}
                        >
                          {isAdded ? "Agregado" : "Agregar"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {booksError && books.length > 0 && (
                <div className="flex items-center justify-center gap-3 p-3 text-sm">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={onRetryBooks}
                  >
                    Reintentar carga de libros
                  </button>
                </div>
              )}
              {hasMoreBooks && matches.length > 0 && !booksError && (
                <div
                  ref={loadMoreRef}
                  className="flex min-h-12 items-center justify-center"
                  aria-hidden="true"
                >
                  {isLoadingMoreBooks && (
                    <span className="loading loading-spinner loading-sm" />
                  )}
                </div>
              )}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>Cerrar</button>
          </form>
        </dialog>

        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
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
                  <td colSpan={5} className="text-base-content/60 py-8 text-center text-sm">
                    Sin ítems todavía. Agregá un libro para comenzar.
                  </td>
                </tr>
              )}
              {items.map((item) => {
                const book = booksById.get(item.bookId);
                if (!book) return null;
                return (
                  <tr key={item.bookId}>
                    <td className="font-medium">{book.title}</td>
                    <td>
                      <EditableNumberInput
                        value={item.quantity}
                        min={1}
                        step={1}
                        label={`Cantidad de ${book.title}`}
                        className="input input-sm w-20 text-center"
                        onChange={(quantity) =>
                          onItemChange(item.bookId, { quantity })
                        }
                      />
                    </td>
                    <td>
                      <EditableNumberInput
                        value={item.unitCost}
                        min={0}
                        step={500}
                        label={`Costo unitario de ${book.title}`}
                        className="input input-sm w-28 text-right"
                        onChange={(unitCost) =>
                          onItemChange(item.bookId, { unitCost })
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
