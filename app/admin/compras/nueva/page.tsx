"use client";

import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import PurchaseItemsSection, {
  type PurchaseBook,
  type PurchaseItem,
} from "@/common/components/PurchaseItemsSection";
import type { BookRecord } from "@/common/services/books";
import { getBooksPageRequest } from "@/common/services/books";
import { createPurchaseRequest } from "@/common/services/purchases";
import { getAllSuppliersRequest } from "@/common/services/suppliers";
import { getAuthenticatedWarehouseId } from "@/common/services/auth";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

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

export default function NuevaCompraPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [supplierId, setSupplierId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [isBookPickerOpen, setIsBookPickerOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const suppliersQuery = useQuery({
    queryKey: ["suppliers", "catalog"],
    queryFn: getAllSuppliersRequest,
    staleTime: 60_000,
  });
  const booksQuery = useInfiniteQuery({
    queryKey: ["books", "purchase-picker"],
    queryFn: ({ pageParam }) => getBooksPageRequest(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: isBookPickerOpen,
    staleTime: 60_000,
  });
  const books = toPurchaseBooks(
    booksQuery.data?.pages.flatMap((page) => page.books) ?? []
  );
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
  const isLoading = suppliersQuery.isPending;
  const hasError = suppliersQuery.isError;

  const addItem = (bookId: string, quantity = 1) => {
    const book = books.find((candidate) => candidate.id === bookId);
    if (!book || items.some((item) => item.bookId === bookId)) return;

    setItems((current) => [
      ...current,
      { bookId, quantity, unitCost: 0 },
    ]);
  };

  const removeItem = (bookId: string) =>
    setItems((current) => current.filter((item) => item.bookId !== bookId));

  const changeItem = (
    bookId: string,
    patch: Partial<Pick<PurchaseItem, "quantity" | "unitCost">>
  ) =>
    setItems((current) =>
      current.map((item) =>
        item.bookId === bookId ? { ...item, ...patch } : item
      )
    );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!supplierId || items.length === 0) {
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
      supplierId: Number(supplierId),
      invoiceNumber: invoiceNumber.trim(),
      items: items.map((item) => ({
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
          <h1 className="text-3xl font-extrabold">Registrar Nueva Compra</h1>
          <p className="text-base-content/60 mt-1 text-sm">
            Cargá la factura del proveedor y agregá los libros comprados.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/compras" className="btn btn-ghost">
            Cancelar
          </Link>
          <button
            type="submit"
            form="purchase-form"
            className="btn btn-neutral"
            disabled={isLoading || hasError || createMutation.isPending || items.length === 0}
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
      {isLoading ? (
        <LoadingSpinner label="Cargando proveedores y libros" />
      ) : hasError ? (
        <NotificationToast
          type="error"
          message="No se pudieron cargar los proveedores. Intentá nuevamente más tarde."
          placement="toast"
        />
      ) : (
        <div className="flex flex-col gap-6">
          <form id="purchase-form" onSubmit={handleSubmit}>
            <section className="card bg-base-100 card-border">
              <div className="card-body">
                <h2 className="card-title border-b border-base-200 pb-2 text-lg">
                  Datos de la Factura y Proveedor
                </h2>
                <p className="text-base-content/60 text-sm">
                  La compra se registrará como pendiente. Podés aceptarla desde
                  el historial cuando llegue la mercadería.
                </p>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">
                      Proveedor <span className="text-error">*</span>
                    </legend>
                    <div className="flex gap-2">
                      <select
                        className="select flex-1"
                        required
                        value={supplierId}
                        onChange={(event) => setSupplierId(event.target.value)}
                      >
                        <option value="" disabled>
                          Seleccione un proveedor
                        </option>
                        {suppliersQuery.data?.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name} (RUC: {supplier.ruc})
                          </option>
                        ))}
                      </select>
                      <Link
                        href="/admin/proveedores"
                        className="btn btn-square"
                        title="Agregar proveedor"
                        aria-label="Agregar proveedor"
                      >
                        <Plus className="size-4" strokeWidth={2.5} />
                      </Link>
                    </div>
                  </fieldset>

                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">
                      Nº Factura <span className="text-error">*</span>
                    </legend>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="Ej: 001-001-00001234"
                      value={invoiceNumber}
                      onChange={(event) => setInvoiceNumber(event.target.value)}
                    />
                  </fieldset>
                </div>
              </div>
            </section>
          </form>

          <PurchaseItemsSection
            items={items}
            books={books}
            onAdd={addItem}
            onRemove={removeItem}
            onItemChange={changeItem}
            isBookPickerOpen={isBookPickerOpen}
            onOpenBookPicker={() => setIsBookPickerOpen(true)}
            onCloseBookPicker={() => setIsBookPickerOpen(false)}
            hasMoreBooks={booksQuery.hasNextPage}
            isLoadingMoreBooks={booksQuery.isFetchingNextPage}
            booksError={booksQuery.isError}
            onLoadMoreBooks={() => void booksQuery.fetchNextPage()}
            onRetryBooks={() => void booksQuery.refetch()}
          />
        </div>
      )}
    </main>
  );
}
