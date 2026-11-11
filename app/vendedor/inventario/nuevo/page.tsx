"use client";

import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import PurchaseItemsSection, {
  type PurchaseBook,
  type PurchaseItem,
} from "@/common/components/PurchaseItemsSection";
import {
  getBookStockQuantityRequest,
  getBooksPageRequest,
  type BookRecord,
} from "@/common/services/books";
import { getAuthenticatedWarehouseId } from "@/common/services/auth";
import { createStockAdjustmentRequest } from "@/common/services/stockAdjustments";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState, useSyncExternalStore } from "react";

function toPurchaseBooks(records: BookRecord[]): PurchaseBook[] {
  return records.flatMap((book) =>
    book.id !== null && book.title
      ? [
          {
            id: String(book.id),
            title: book.title,
            coverUrl: book.coverUrl,
          },
        ]
      : []
  );
}

function subscribeToUserStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getWarehouseSnapshot() {
  return getAuthenticatedWarehouseId() ?? 0;
}

function getServerWarehouseSnapshot() {
  return -1;
}

export default function NewStockAdjustmentPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const warehouseSnapshot = useSyncExternalStore(
    subscribeToUserStorage,
    getWarehouseSnapshot,
    getServerWarehouseSnapshot
  );
  const warehouseLoaded = warehouseSnapshot !== -1;
  const warehouseId = warehouseSnapshot > 0 ? warehouseSnapshot : null;
  const [note, setNote] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [bookSearchTerm, setBookSearchTerm] = useState("");
  const [draftItems, setDraftItems] = useState<PurchaseItem[]>([]);
  const [isBookPickerOpen, setIsBookPickerOpen] = useState(false);
  const [knownBooks, setKnownBooks] = useState<PurchaseBook[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setBookSearchTerm(bookSearch.trim()),
      200
    );
    return () => window.clearTimeout(timeout);
  }, [bookSearch]);

  const booksQuery = useInfiniteQuery({
    queryKey: ["books", "purchase-picker", bookSearchTerm],
    queryFn: ({ pageParam }) =>
      getBooksPageRequest(pageParam, { title: bookSearchTerm }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled:
      isBookPickerOpen &&
      warehouseId !== null &&
      bookSearchTerm.length > 0 &&
      bookSearch.trim() === bookSearchTerm,
    staleTime: 60_000,
  });
  const loadedBooks = toPurchaseBooks(
    booksQuery.data?.pages.flatMap((page) => page.books) ?? []
  );
  const loadedIds = new Set(loadedBooks.map((book) => book.id));
  const books = [
    ...loadedBooks,
    ...knownBooks.filter((book) => !loadedIds.has(book.id)),
  ];
  const bookIds = books.map((book) => book.id);
  const bookQuantitiesQuery = useQuery({
    queryKey: [
      "stock-adjustment-picker-quantities",
      warehouseId,
      bookSearchTerm,
      bookIds,
    ],
    queryFn: async () => {
      if (warehouseId === null) {
        throw new Error("No se encontró un almacén asignado al usuario.");
      }

      const quantities: Record<string, number> = {};
      for (const bookId of bookIds) {
        quantities[bookId] = await queryClient.fetchQuery({
          queryKey: ["stocks", "warehouse", warehouseId, "book", bookId],
          queryFn: () =>
            getBookStockQuantityRequest(warehouseId, Number(bookId)),
          staleTime: 60_000,
        });
      }
      return quantities;
    },
    enabled:
      isBookPickerOpen &&
      warehouseId !== null &&
      bookSearchTerm.length > 0 &&
      bookSearch.trim() === bookSearchTerm &&
      books.length > 0,
    staleTime: 60_000,
  });
  const isLoadingBookSearch =
    bookSearch.trim().length > 0 &&
    (bookSearch.trim() !== bookSearchTerm ||
      (booksQuery.isFetching && !booksQuery.isFetchingNextPage) ||
      (books.length > 0 && bookQuantitiesQuery.isFetching));

  const createMutation = useMutation({
    mutationFn: () => {
      if (warehouseId === null) {
        throw new Error("No se encontró un almacén asignado al usuario.");
      }
      return createStockAdjustmentRequest(warehouseId, {
        note: note.trim(),
        details: draftItems.map((item) => ({
          bookId: Number(item.bookId),
          physicalQuantity: item.quantity,
        })),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["stock-adjustments", warehouseId],
        }),
        queryClient.invalidateQueries({ queryKey: ["stocks", "warehouse"] }),
      ]);
      router.push("/vendedor/inventario");
    },
    onError: (error) => {
      setFormError(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el ajuste de stock."
      );
    },
  });

  const rememberBook = (book: PurchaseBook) => {
    setKnownBooks((current) =>
      current.some((known) => known.id === book.id)
        ? current
        : [...current, book]
    );
  };

  const addItem = async (bookId: string, physicalQuantity: number) => {
    if (warehouseId === null) return;
    const book = books.find((candidate) => candidate.id === bookId);
    if (!book) return;
    if (draftItems.some((item) => item.bookId === bookId)) return;

    setFormError(null);
    try {
      const systemQuantity =
        bookQuantitiesQuery.data?.[bookId] ??
        (await getBookStockQuantityRequest(warehouseId, Number(bookId)));
      rememberBook(book);
      setDraftItems((current) =>
        current.some((item) => item.bookId === bookId)
          ? current
          : [
              ...current,
              {
                bookId,
                quantity: physicalQuantity,
                unitCost: 0,
                systemQuantity,
              },
            ]
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No se pudo consultar el stock actual del libro."
      );
    }
  };

  const removeItem = (bookId: string) =>
    setDraftItems((current) => current.filter((item) => item.bookId !== bookId));

  const changeItem = (
    bookId: string,
    patch: Partial<Pick<PurchaseItem, "quantity" | "unitCost">>
  ) =>
    setDraftItems((current) =>
      current.map((item) =>
        item.bookId === bookId ? { ...item, ...patch } : item
      )
    );

  const openBookPicker = () => {
    setBookSearch("");
    setBookSearchTerm("");
    setIsBookPickerOpen(true);
  };

  const closeBookPicker = () => {
    setIsBookPickerOpen(false);
    setBookSearch("");
    setBookSearchTerm("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (warehouseId === null) {
      setFormError("Tu usuario no tiene un almacén asignado.");
      return;
    }
    if (!note.trim()) {
      setFormError("Escribí el motivo o la referencia del conteo.");
      return;
    }
    if (draftItems.length === 0) {
      setFormError("Agregá al menos un libro al ajuste.");
      return;
    }
    if (
      draftItems.some(
        (item) =>
          !Number.isSafeInteger(item.quantity) || item.quantity < 0
      )
    ) {
      setFormError("Las cantidades físicas deben ser números enteros desde 0.");
      return;
    }

    createMutation.mutate();
  };

  const canSubmit =
    warehouseId !== null &&
    note.trim().length > 0 &&
    draftItems.length > 0 &&
    draftItems.every(
      (item) => Number.isSafeInteger(item.quantity) && item.quantity >= 0
    );

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Registrar Nuevo Ajuste</h1>
          <p className="text-base-content/60 mt-1 text-sm">
            Ingresá el motivo y el conteo físico para actualizar las existencias
            de tu almacén.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/vendedor/inventario" className="btn btn-ghost">
            Cancelar
          </Link>
          <button
            type="submit"
            form="stock-adjustment-form"
            className="btn btn-neutral"
            disabled={!canSubmit || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Guardar Ajuste"
            )}
          </button>
        </div>
      </div>

      {formError && (
        <NotificationToast
          type="error"
          message={formError}
          placement="toast"
          onClose={() => setFormError(null)}
        />
      )}

      {!warehouseLoaded ? (
        <LoadingSpinner label="Cargando almacén" />
      ) : warehouseId === null ? (
        <NotificationToast
          type="error"
          message="Tu usuario no tiene un almacén asignado."
          className="my-6 w-full"
        />
      ) : (
        <div className="flex flex-col gap-6">
          <form id="stock-adjustment-form" onSubmit={handleSubmit}>
            <section className="card bg-base-100 card-border">
              <div className="card-body">
                <h2 className="card-title border-b border-base-200 pb-2 text-lg">
                  Datos del Ajuste
                </h2>
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label
                      className="mb-2 block text-sm font-semibold"
                      htmlFor="stock-adjustment-note"
                    >
                      Motivo o referencia <span className="text-error">*</span>
                    </label>
                    <input
                      id="stock-adjustment-note"
                      className="input w-full"
                      required
                      maxLength={255}
                      placeholder="Ej: Conteo físico mensual"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>
          </form>

          <PurchaseItemsSection
            mode="stock-adjustment"
            items={draftItems}
            books={books}
            bookQuantities={bookQuantitiesQuery.data}
            bookQuantitiesError={bookQuantitiesQuery.isError}
            bookSearch={bookSearch}
            onBookSearchChange={setBookSearch}
            onAdd={addItem}
            onRemove={removeItem}
            onItemChange={changeItem}
            isBookPickerOpen={isBookPickerOpen}
            onOpenBookPicker={openBookPicker}
            onCloseBookPicker={closeBookPicker}
            hasMoreBooks={
              bookSearch.trim() === bookSearchTerm && !!booksQuery.hasNextPage
            }
            isLoadingBooks={isLoadingBookSearch}
            isLoadingMoreBooks={booksQuery.isFetchingNextPage}
            booksError={
              bookSearch.trim() === bookSearchTerm &&
              (booksQuery.isError || bookQuantitiesQuery.isError)
            }
            onLoadMoreBooks={() => void booksQuery.fetchNextPage()}
            onRetryBooks={() => {
              void booksQuery.refetch();
              void bookQuantitiesQuery.refetch();
            }}
          />
        </div>
      )}
    </main>
  );
}
