"use client";

import BookModal from "@/common/components/BookModal";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import PurchaseItemsSection, {
  type PurchaseBook,
  type PurchaseItem,
} from "@/common/components/PurchaseItemsSection";
import type { bookInputType } from "@/common/schemas/book/BookInputSchema";
import {
  createBookRequest,
  getBooksPageRequest,
  type BookRecord,
} from "@/common/services/books";
import {
  createPurchaseRequest,
  getPurchaseByIdRequest,
  getPurchaseDetailsRequest,
} from "@/common/services/purchases";
import {
  getSupplierByIdRequest,
  searchSuppliersRequest,
  type SupplierRecord,
} from "@/common/services/suppliers";
import { getAuthenticatedWarehouseId } from "@/common/services/auth";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type FormEvent, useEffect, useState } from "react";

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

function NuevaCompraContent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get("purchaseId");
  const isViewingPurchase = purchaseId !== null;
  const isValidPurchaseId = purchaseId !== null && /^\d+$/.test(purchaseId);
  const [draftSupplierId, setDraftSupplierId] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [isSupplierFocused, setIsSupplierFocused] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const [bookSearchTerm, setBookSearchTerm] = useState("");
  const [draftItems, setDraftItems] = useState<PurchaseItem[]>([]);
  const [isBookPickerOpen, setIsBookPickerOpen] = useState(false);
  const [knownBooks, setKnownBooks] = useState<PurchaseBook[]>([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookFormSession, setBookFormSession] = useState(0);
  const [bookFormError, setBookFormError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const purchaseQuery = useQuery({
    queryKey: ["purchases", "detail", purchaseId],
    queryFn: () => {
      if (!purchaseId) throw new Error("No se indicó una compra válida.");
      return getPurchaseByIdRequest(purchaseId);
    },
    enabled: isValidPurchaseId,
    staleTime: 60_000,
  });
  const purchaseDetailsQuery = useQuery({
    queryKey: ["purchases", "details", purchaseId],
    queryFn: () => {
      if (!purchaseId) throw new Error("No se indicó una compra válida.");
      return getPurchaseDetailsRequest(purchaseId);
    },
    enabled: isValidPurchaseId && purchaseQuery.data != null,
    staleTime: 60_000,
  });
  const purchaseSupplierQuery = useQuery({
    queryKey: ["suppliers", "detail", purchaseQuery.data?.supplierId],
    queryFn: () => {
      const selectedSupplierId = purchaseQuery.data?.supplierId;
      if (!selectedSupplierId) {
        throw new Error("La compra no tiene un proveedor válido.");
      }
      return getSupplierByIdRequest(selectedSupplierId);
    },
    enabled: isValidPurchaseId && purchaseQuery.data?.supplierId != null,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const purchaseDetails = purchaseDetailsQuery.data ?? [];
  const supplierInputValue = isViewingPurchase
    ? purchaseSupplierQuery.data
      ? `${purchaseSupplierQuery.data.name} (RUC: ${purchaseSupplierQuery.data.ruc || "Sin RUC"})`
      : purchaseQuery.data?.supplierId
        ? `Proveedor #${purchaseQuery.data.supplierId}`
        : ""
    : supplierSearch;
  const selectedSupplierId = isViewingPurchase
    ? purchaseQuery.data?.supplierId ?? ""
    : draftSupplierId;
  const purchaseItems: PurchaseItem[] = isViewingPurchase
    ? purchaseDetails.map((detail) => ({
      bookId: detail.bookId,
      quantity: detail.quantity,
      unitCost: detail.unitCost,
    }))
    : draftItems;
  const isPurchaseLoading =
    isViewingPurchase &&
    isValidPurchaseId &&
    (purchaseQuery.isPending ||
      (purchaseQuery.data != null &&
        (purchaseDetailsQuery.isPending || purchaseSupplierQuery.isPending)));
  const isPurchaseError =
    isViewingPurchase &&
    isValidPurchaseId &&
    (purchaseQuery.isError ||
      (purchaseQuery.data != null &&
        (purchaseDetailsQuery.isError ||
          purchaseDetailsQuery.data === null ||
          purchaseSupplierQuery.isError)));
  const purchaseNotFound =
    isViewingPurchase &&
    isValidPurchaseId &&
    !purchaseQuery.isPending &&
    purchaseQuery.data === null &&
    !purchaseQuery.isError;
  useEffect(() => {
    const timeout = window.setTimeout(
      () => setSupplierSearchTerm(supplierSearch.trim()),
      200
    );
    return () => window.clearTimeout(timeout);
  }, [supplierSearch]);
  useEffect(() => {
    const timeout = window.setTimeout(
      () => setBookSearchTerm(bookSearch.trim()),
      200
    );
    return () => window.clearTimeout(timeout);
  }, [bookSearch]);
  const suppliersQuery = useQuery({
    queryKey: ["supplier-suggestions", supplierSearchTerm],
    queryFn: () => searchSuppliersRequest(supplierSearchTerm),
    enabled:
      !isViewingPurchase &&
      isSupplierFocused &&
      !draftSupplierId &&
      supplierSearch.trim() === supplierSearchTerm &&
      supplierSearchTerm.length > 0,
    staleTime: 30_000,
  });
  const showSupplierSuggestions =
    !isViewingPurchase &&
    isSupplierFocused &&
    !draftSupplierId &&
    supplierSearch.trim().length > 0;
  const booksQuery = useInfiniteQuery({
    queryKey: ["books", "purchase-picker", bookSearchTerm],
    queryFn: ({ pageParam }) =>
      getBooksPageRequest(pageParam, { title: bookSearchTerm }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled:
      isBookPickerOpen &&
      !isViewingPurchase &&
      bookSearchTerm.length > 0 &&
      bookSearch.trim() === bookSearchTerm,
    staleTime: 60_000,
  });
  const loadedBooks = toPurchaseBooks(
    booksQuery.data?.pages.flatMap((page) => page.books) ?? []
  );
  const purchaseBooks: PurchaseBook[] = isViewingPurchase
    ? purchaseDetails.map((detail) => ({
      id: detail.bookId,
      title: detail.bookName,
      coverUrl: null,
    }))
    : (() => {
      const loadedIds = new Set(loadedBooks.map((book) => book.id));
      return [
        ...loadedBooks,
        ...knownBooks.filter((book) => !loadedIds.has(book.id)),
      ];
    })();
  const isLoadingBookSearch =
    bookSearch.trim().length > 0 &&
    (bookSearch.trim() !== bookSearchTerm ||
      (booksQuery.isFetching && !booksQuery.isFetchingNextPage));
  const createMutation = useMutation({
    mutationFn: createPurchaseRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
      router.push("/admin/compras");
    },
    onError: (error) => {
      setFormError(
        error instanceof Error ? error.message : "No se pudo registrar la compra."
      );
    },
  });
  const appendItem = (book: PurchaseBook, quantity = 1) => {
    setDraftItems((current) =>
      current.some((item) => item.bookId === book.id)
        ? current
        : [...current, { bookId: book.id, quantity, unitCost: 0 }]
    );
  };

  const rememberBook = (book: PurchaseBook) => {
    setKnownBooks((current) =>
      current.some((known) => known.id === book.id) ? current : [...current, book]
    );
  };

  const addItem = (bookId: string, quantity = 1) => {
    const book = purchaseBooks.find((candidate) => candidate.id === bookId);
    if (!book) return;

    rememberBook(book);
    appendItem(book, quantity);
  };

  const createBookMutation = useMutation({
    mutationFn: createBookRequest,
    onSuccess: async (created) => {
      if (created.id === null) return;

      const createdBook: PurchaseBook = {
        id: String(created.id),
        title: created.title ?? "Sin título",
        coverUrl: created.coverUrl,
      };
      rememberBook(createdBook);
      appendItem(createdBook);
      setIsBookModalOpen(false);
      setBookFormError(null);
      await queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error) => {
      setBookFormError(
        error instanceof Error ? error.message : "No se pudo crear el libro."
      );
    },
  });

  const openBookModal = () => {
    setBookFormSession((session) => session + 1);
    setBookFormError(null);
    setIsBookModalOpen(true);
  };

  const closeBookModal = () => {
    setIsBookModalOpen(false);
    setBookFormError(null);
  };

  const handleCreateBook = (data: bookInputType) => {
    setBookFormError(null);
    createBookMutation.mutate(data);
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

  const selectSupplier = (supplier: SupplierRecord) => {
    setDraftSupplierId(supplier.id);
    setSupplierSearch(`${supplier.name} (RUC: ${supplier.ruc || "Sin RUC"})`);
    setSupplierSearchTerm("");
    setIsSupplierFocused(false);
    setFormError(null);
  };

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

    if (isViewingPurchase) return;

    if (!selectedSupplierId || draftItems.length === 0) {
      setFormError("Seleccioná un proveedor y agregá al menos un libro.");
      return;
    }

    const warehouseId = getAuthenticatedWarehouseId();
    if (warehouseId === null) {
      setFormError("Tu usuario no tiene un almacén asignado.");
      return;
    }

    createMutation.mutate({
      warehouseId,
      supplierId: Number(selectedSupplierId),
      items: draftItems.map((item) => ({
        bookId: Number(item.bookId),
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
    });
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">
            {isViewingPurchase
              ? `Detalle de compra #${purchaseId}`
              : "Registrar Nueva Compra"}
          </h1>
          <p className="text-base-content/60 mt-1 text-sm">
            {isViewingPurchase
              ? "Detalle de la compra registrada. La edición está deshabilitada."
              : "Seleccioná el proveedor y agregá los libros comprados. La factura se carga al aceptar la compra."}
          </p>
          {isViewingPurchase && purchaseQuery.data && (
            <p className="text-base-content/60 mt-2 text-sm">
              Estado: {purchaseQuery.data.status} · Factura:{" "}
              {purchaseQuery.data.invoiceNumber || "Pendiente de aceptación"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/compras" className="btn btn-ghost">
            Cancelar
          </Link>
          <button
            type="submit"
            form="purchase-form"
            className="btn btn-neutral"
            disabled={
              isViewingPurchase ||
              createMutation.isPending ||
              draftItems.length === 0
            }
          >
            {createMutation.isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Guardar Compra"
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
      {isViewingPurchase && !isValidPurchaseId ? (
        <NotificationToast
          type="error"
          message="El identificador de compra no es válido."
          className="my-6 w-full"
        />
      ) : isPurchaseLoading ? (
        <LoadingSpinner label="Cargando compra" />
      ) : isPurchaseError ? (
        <NotificationToast
          type="error"
          message="No se pudieron cargar los datos completos de la compra."
          className="my-6 w-full"
        />
      ) : purchaseNotFound ? (
        <p className="text-base-content/60 py-8 text-center">
          No se encontró la compra solicitada.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          <form id="purchase-form" onSubmit={handleSubmit}>
            <section className="card bg-base-100 card-border">
              <div className="card-body">
                <h2 className="card-title border-b border-base-200 pb-2 text-lg">
                  {isViewingPurchase ? "Proveedor" : "Datos del Proveedor"}
                </h2>
                <div className="grid grid-cols-1 gap-5">
                  <fieldset className="fieldset">
                    <div className="flex gap-2">
                      <div className="relative min-w-0 flex-1">
                        <label className="input w-full">
                          <Search className="size-4 opacity-50" strokeWidth={2} />
                          <input
                            type="search"
                            required
                            placeholder="Buscar por nombre o RUC..."
                            value={supplierInputValue}
                            disabled={isViewingPurchase}
                            role="combobox"
                            aria-autocomplete="list"
                            aria-expanded={showSupplierSuggestions}
                            aria-controls={
                              showSupplierSuggestions
                                ? "supplier-suggestions"
                                : undefined
                            }
                            aria-label="Buscar proveedor por nombre o RUC"
                            onFocus={() => setIsSupplierFocused(true)}
                            onBlur={() => setIsSupplierFocused(false)}
                            onChange={(event) => {
                              setDraftSupplierId("");
                              setSupplierSearch(event.target.value);
                              setIsSupplierFocused(true);
                              setFormError(null);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Escape") {
                                setIsSupplierFocused(false);
                              }
                              if (event.key === "Enter" && showSupplierSuggestions) {
                                event.preventDefault();
                                if (
                                  supplierSearch.trim() === supplierSearchTerm &&
                                  !suppliersQuery.isFetching
                                ) {
                                  const firstSupplier = suppliersQuery.data?.[0];
                                  if (firstSupplier) {
                                    selectSupplier(firstSupplier);
                                  }
                                }
                              }
                            }}
                          />
                        </label>
                        {showSupplierSuggestions && (
                          <div
                            id="supplier-suggestions"
                            className="absolute top-full z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-box border border-base-300 bg-base-100 shadow-lg"
                          >
                            {supplierSearch.trim() !== supplierSearchTerm ||
                              suppliersQuery.isFetching ? (
                              <p className="px-3 py-2 text-sm text-base-content/60">
                                Buscando proveedores...
                              </p>
                            ) : suppliersQuery.isError ? (
                              <p className="px-3 py-2 text-sm text-error" role="alert">
                                No se pudieron buscar proveedores.
                              </p>
                            ) : (suppliersQuery.data ?? []).length > 0 ? (
                              <ul
                                className="menu menu-sm w-full p-1"
                                role="listbox"
                              >
                                {suppliersQuery.data?.map((supplier) => (
                                  <li key={supplier.id}>
                                    <button
                                      type="button"
                                      role="option"
                                      aria-selected={supplier.id === draftSupplierId}
                                      onMouseDown={(event) =>
                                        event.preventDefault()
                                      }
                                      onClick={() => selectSupplier(supplier)}
                                    >
                                      <span>{supplier.name}</span>
                                      <span className="text-xs text-base-content/60">
                                        RUC: {supplier.ruc || "Sin RUC"}
                                      </span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="px-3 py-2 text-sm text-base-content/60">
                                No se encontraron proveedores.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {!isViewingPurchase && (
                        <Link
                          href="/admin/proveedores"
                          className="btn btn-square"
                          title="Agregar proveedor"
                          aria-label="Agregar proveedor"
                        >
                          <Plus className="size-4" strokeWidth={2.5} />
                        </Link>
                      )}
                    </div>
                  </fieldset>

                </div>
              </div>
            </section>
          </form>

          <PurchaseItemsSection
            items={purchaseItems}
            books={purchaseBooks}
            bookSearch={bookSearch}
            onBookSearchChange={setBookSearch}
            onAdd={addItem}
            onRemove={removeItem}
            onItemChange={changeItem}
            isBookPickerOpen={isBookPickerOpen}
            onOpenBookPicker={openBookPicker}
            onCloseBookPicker={closeBookPicker}
            onCreateBook={openBookModal}
            hasMoreBooks={
              !isViewingPurchase &&
              bookSearch.trim() === bookSearchTerm &&
              !!booksQuery.hasNextPage
            }
            isLoadingBooks={!isViewingPurchase && isLoadingBookSearch}
            isLoadingMoreBooks={!isViewingPurchase && booksQuery.isFetchingNextPage}
            booksError={
              !isViewingPurchase &&
              bookSearch.trim() === bookSearchTerm &&
              booksQuery.isError
            }
            onLoadMoreBooks={() => void booksQuery.fetchNextPage()}
            onRetryBooks={() => void booksQuery.refetch()}
            readOnly={isViewingPurchase}
          />
        </div>
      )}
      <BookModal
        isOpen={isBookModalOpen}
        initial={null}
        formSession={bookFormSession}
        error={bookFormError}
        onErrorClose={() => setBookFormError(null)}
        onSubmit={handleCreateBook}
        onClose={closeBookModal}
        isPending={createBookMutation.isPending}
      />
    </main>
  );
}

export default function NuevaCompraPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Cargando formulario de compra" />}>
      <NuevaCompraContent />
    </Suspense>
  );
}
