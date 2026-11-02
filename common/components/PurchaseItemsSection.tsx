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
  systemQuantity?: number;
}

export interface PurchaseBook {
  id: string;
  title: string;
  coverUrl: string | null;
}

interface PurchaseItemsSectionProps {
  items: PurchaseItem[];
  books: PurchaseBook[];
  bookQuantities?: Record<string, number>;
  bookQuantitiesError?: boolean;
  bookSearch: string;
  onBookSearchChange: (search: string) => void;
  onAdd: (bookId: string, quantity: number) => void | Promise<void>;
  onRemove: (bookId: string) => void;
  onItemChange: (
    bookId: string,
    patch: Partial<Pick<PurchaseItem, "quantity" | "unitCost">>
  ) => void;
  isBookPickerOpen: boolean;
  onOpenBookPicker: () => void;
  onCloseBookPicker: () => void;
  onCreateBook?: () => void;
  hasMoreBooks: boolean;
  isLoadingBooks: boolean;
  isLoadingMoreBooks: boolean;
  booksError: boolean;
  onLoadMoreBooks: () => void;
  onRetryBooks: () => void;
  readOnly?: boolean;
  mode?: "purchase" | "stock-adjustment";
}

export default function PurchaseItemsSection({
  items,
  books,
  bookQuantities = {},
  bookQuantitiesError = false,
  bookSearch,
  onBookSearchChange,
  onAdd,
  onRemove,
  onItemChange,
  isBookPickerOpen,
  onOpenBookPicker,
  onCloseBookPicker,
  onCreateBook,
  hasMoreBooks,
  isLoadingBooks,
  isLoadingMoreBooks,
  booksError,
  onLoadMoreBooks,
  onRetryBooks,
  readOnly = false,
  mode = "purchase",
}: PurchaseItemsSectionProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addingBookId, setAddingBookId] = useState<string | null>(null);
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
  const isStockAdjustment = mode === "stock-adjustment";

  const addBook = async (bookId: string, quantity: number) => {
    if (addingBookId !== null) return;
    setAddingBookId(bookId);
    try {
      await onAdd(bookId, quantity);
    } finally {
      setAddingBookId(null);
    }
  };

  return (
    <section className="card bg-base-100 card-border">
      <div className="card-body">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">
              {isStockAdjustment ? "Libros del ajuste" : "Ítems de la Compra"}
            </h2>
          </div>
          {!readOnly && (
            <button type="button" className="btn" onClick={onOpenBookPicker}>
              <Plus className="size-4" strokeWidth={2.5} />
              Agregar libro
            </button>
          )}
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
                  {isStockAdjustment
                    ? "Buscá los libros del conteo físico y agregalos al ajuste."
                    : "Buscá por nombre y seleccioná los títulos para la compra."}
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

            <div className="flex gap-2">
              <label className="input flex-1">
                <Search className="size-4 opacity-50" strokeWidth={2} />
                <input
                  type="search"
                  placeholder="Buscar libro por nombre..."
                  value={bookSearch}
                  onChange={(event) => onBookSearchChange(event.target.value)}
                  aria-label="Buscar libro por nombre"
                  autoFocus
                />
              </label>
              {!readOnly && onCreateBook && (
                <button
                  type="button"
                  className="btn btn-square"
                  title="Crear libro"
                  aria-label="Crear libro"
                  onClick={onCreateBook}
                >
                  <Plus className="size-4" strokeWidth={2.5} />
                </button>
              )}
            </div>

            <div
              ref={listRef}
              className="max-h-[55vh] min-h-48 overflow-y-auto rounded-box border border-base-300"
              aria-live="polite"
            >
              {!bookSearch.trim() && (
                <div className="flex min-h-48 items-center justify-center p-6 text-center text-sm text-base-content/60">
                  Escribí el nombre de un libro para buscarlo.
                </div>
              )}
              {bookSearch.trim() && isLoadingBooks && (
                <div className="flex min-h-48 items-center justify-center gap-3 p-6 text-sm text-base-content/60">
                  <span className="loading loading-spinner loading-sm" />
                  Buscando libros...
                </div>
              )}
              {bookSearch.trim() &&
                !isLoadingBooks &&
                booksError &&
                books.length === 0 && (
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
              {bookSearch.trim() &&
                !isLoadingBooks &&
                books.length === 0 &&
                !booksError && (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
                    <p className="text-sm text-base-content/60">
                      No se encontraron libros.
                    </p>
                  </div>
                )}
              {bookSearch.trim() &&
                !isLoadingBooks &&
                books.map((book) => {
                  const isAdded = items.some((item) => item.bookId === book.id);
                  const availableQuantity = bookQuantities[book.id];
                  const hasAvailableQuantity = availableQuantity !== undefined;
                  const quantity =
                    quantities[book.id] ??
                    (isStockAdjustment ? availableQuantity ?? 0 : 1);
                  const quantityLoadFailed =
                    isStockAdjustment &&
                    bookQuantitiesError &&
                    !hasAvailableQuantity;
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
                          {quantityLoadFailed ? (
                            <span className="text-error text-xs">
                              No se pudo cargar el stock
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                            <span className="text-base-content/60 text-[10px]">
                              {isStockAdjustment ? "Conteo" : "Cant."}
                            </span>
                            <QuantitySelector
                              value={quantity}
                              onChange={(nextQuantity) =>
                                setQuantities((current) => ({
                                  ...current,
                                  [book.id]: nextQuantity,
                                }))
                              }
                              label={
                                isStockAdjustment
                                  ? `Conteo físico de ${book.title}`
                                  : `Cantidad de ${book.title}`
                              }
                              min={isStockAdjustment ? 0 : 1}
                              size="xs"
                              disabled={isAdded || addingBookId !== null}
                            />
                            </div>
                          )}
                          <button
                            type="button"
                            className="btn btn-xs shrink-0"
                            disabled={
                              isAdded ||
                              addingBookId !== null ||
                              quantityLoadFailed ||
                              (isStockAdjustment && !hasAvailableQuantity)
                            }
                            onClick={() => void addBook(book.id, quantity)}
                          >
                            {addingBookId === book.id ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : isAdded ? (
                              "Agregado"
                            ) : (
                              "Agregar"
                            )}
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
              {hasMoreBooks && books.length > 0 && !booksError && (
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
                {isStockAdjustment ? (
                  <>
                    <th className="w-28 text-right">Sistema</th>
                    <th className="w-36">Conteo físico</th>
                  </>
                ) : (
                  <>
                    <th className="w-28">Cantidad</th>
                    <th className="w-36">Costo Unit. (Gs)</th>
                    <th className="text-right">Subtotal (Gs)</th>
                  </>
                )}
                {!readOnly && <th className="text-center">Acción</th>}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      isStockAdjustment
                        ? readOnly
                          ? 3
                          : 4
                        : readOnly
                          ? 4
                          : 5
                    }
                    className="text-base-content/60 py-8 text-center text-sm"
                  >
                    Sin ítems todavía. Agregá un libro para comenzar.
                  </td>
                </tr>
              )}
              {items.map((item) => {
                const book = booksById.get(item.bookId);
                const title = book?.title ?? `Libro #${item.bookId}`;
                return (
                  <tr key={item.bookId}>
                    <td className="font-medium">{title}</td>
                    {isStockAdjustment ? (
                      <>
                        <td className="text-right tabular-nums">
                          {item.systemQuantity ?? 0}
                        </td>
                        <td>
                          {readOnly ? (
                            item.quantity
                          ) : (
                            <QuantitySelector
                              value={item.quantity}
                              label={`Conteo físico de ${title}`}
                              min={0}
                              onChange={(quantity) => onItemChange(item.bookId, { quantity })}
                            />
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          {readOnly ? (
                            item.quantity
                          ) : (
                            <EditableNumberInput
                              value={item.quantity}
                              min={1}
                              step={1}
                              label={`Cantidad de ${title}`}
                              className="input input-sm w-20 text-center"
                              onChange={(quantity) =>
                                onItemChange(item.bookId, { quantity })
                              }
                            />
                          )}
                        </td>
                        <td>
                          {readOnly ? (
                            `${formatGs(item.unitCost)} Gs`
                          ) : (
                            <EditableNumberInput
                              value={item.unitCost}
                              min={0}
                              step={500}
                              label={`Costo unitario de ${title}`}
                              className="input input-sm w-28 text-right"
                              onChange={(unitCost) =>
                                onItemChange(item.bookId, { unitCost })
                              }
                            />
                          )}
                        </td>
                        <td className="text-right font-semibold">
                          {formatGs(item.quantity * item.unitCost)} Gs
                        </td>
                      </>
                    )}
                    {!readOnly && (
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-ghost btn-circle btn-sm text-error"
                          aria-label={`Eliminar ${title}`}
                          onClick={() => onRemove(item.bookId)}
                        >
                          <Trash2 className="size-4" strokeWidth={2} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isStockAdjustment && (
          <div className="flex flex-col items-end justify-between gap-3 sm:flex-row sm:items-center">
            <span className="text-base-content/50 text-xs">
              Totales calculados automáticamente según ítems añadidos.
            </span>
            <div className="rounded-box bg-base-200 flex items-center gap-4 border border-base-300 px-5 py-3">
              <span className="text-base-content/60 text-xs font-bold tracking-wider uppercase">
                Total de la Compra:
              </span>
              <span className="text-2xl font-extrabold">
                {formatGs(total)} Gs
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
