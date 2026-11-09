"use client";

import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import Pagination from "@/common/components/Pagination";
import { useAuthorsByIds } from "@/common/hooks/useAuthorsByIds";
import { useGenresByIds } from "@/common/hooks/useGenresByIds";
import {
  type BookRecord,
  type CatalogEntity,
  getBookByIdRequest,
  getWarehouseBookStocksRequest,
  type WarehouseBookStock,
} from "@/common/services/books";
import { getWarehouseByIdRequest } from "@/common/services/warehouses";
import { formatGs } from "@/common/utils/format";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { useMemo, useState } from "react";

const STOCKS_PAGE_SIZE = 10;
const EMPTY_STOCKS: WarehouseBookStock[] = [];
const EMPTY_BOOK_DETAILS: WarehouseBookDetail[] = [];

interface WarehouseBookDetail {
  stock: WarehouseBookStock;
  book: BookRecord | null;
}

interface AdminWarehouseBook {
  id: string;
  title: string;
  coverUrl: string;
  authors: string[];
  genres: string[];
  price: number | null;
  quantity: number;
}

function toPositiveId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function toAdminBook(
  book: BookRecord,
  quantity: number,
  authorsById: Map<number, CatalogEntity>,
  genresById: Map<number, CatalogEntity>
): AdminWarehouseBook | null {
  if (book.id === null) return null;

  return {
    id: String(book.id),
    title: book.title ?? "Sin título",
    coverUrl: book.coverUrl ?? "",
    authors: (book.authorIds ?? []).flatMap((id) => {
      const name = id === null ? undefined : authorsById.get(id)?.name;
      return name ? [name] : [];
    }),
    genres: (book.genreIds ?? []).flatMap((id) => {
      const name = id === null ? undefined : genresById.get(id)?.name;
      return name ? [name] : [];
    }),
    price: book.price,
    quantity,
  };
}

export default function AdminSucursalDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = use(params);
  const warehouseId = toPositiveId(rawId);
  const [page, setPage] = useState(1);

  const warehouseQuery = useQuery({
    queryKey: ["warehouses", "detail", warehouseId],
    queryFn: () => {
      if (warehouseId === null) {
        throw new Error("El identificador de la sucursal no es válido.");
      }
      return getWarehouseByIdRequest(warehouseId);
    },
    enabled: warehouseId !== null,
  });
  const stocksQuery = useQuery({
    queryKey: ["stocks", "warehouse", warehouseId, "available"],
    queryFn: () => {
      if (warehouseId === null) {
        throw new Error("El identificador de la sucursal no es válido.");
      }
      return getWarehouseBookStocksRequest(warehouseId);
    },
    enabled: warehouseId !== null,
    staleTime: 60_000,
  });
  const stockRecords = stocksQuery.data ?? EMPTY_STOCKS;
  const totalPages = Math.max(
    1,
    Math.ceil(stockRecords.length / STOCKS_PAGE_SIZE)
  );
  const currentStocks = useMemo(
    () =>
      stockRecords.slice(
        (page - 1) * STOCKS_PAGE_SIZE,
        page * STOCKS_PAGE_SIZE
      ),
    [page, stockRecords]
  );
  const booksQuery = useQuery({
    queryKey: [
      "books",
      "warehouse-stock",
      warehouseId,
      currentStocks.map((stock) => stock.bookId),
    ],
    queryFn: () =>
      Promise.all(
        currentStocks.map(async (stock) => ({
          stock,
          book: await getBookByIdRequest(String(stock.bookId)),
        }))
      ),
    enabled:
      warehouseId !== null && stocksQuery.isSuccess && currentStocks.length > 0,
    staleTime: 60_000,
  });
  const bookDetails = booksQuery.data ?? EMPTY_BOOK_DETAILS;
  const bookRecords = bookDetails.flatMap(({ book }) => (book ? [book] : []));
  const authorsQuery = useAuthorsByIds(
    bookRecords.flatMap((book) => book.authorIds ?? [])
  );
  const genresQuery = useGenresByIds(
    bookRecords.flatMap((book) => book.genreIds ?? [])
  );
  const books = useMemo(
    () =>
      bookDetails.flatMap(({ stock, book }) => {
        if (!book || book.id === null) {
          return [{
            id: String(stock.bookId),
            title: `Libro #${stock.bookId}`,
            coverUrl: "",
            authors: [],
            genres: [],
            price: null,
            quantity: stock.quantity,
          }];
        }
        const mapped = toAdminBook(
          book,
          stock.quantity,
          authorsQuery.authorsById,
          genresQuery.genresById
        );
        return mapped ? [mapped] : [];
      }),
    [
      authorsQuery.authorsById,
      bookDetails,
      genresQuery.genresById,
    ]
  );

  const warehouse = warehouseQuery.data;
  const invalidId = warehouseId === null;
  const isLoading =
    !invalidId && (warehouseQuery.isPending || stocksQuery.isPending);
  const isBookDetailsLoading =
    (booksQuery.isPending || authorsQuery.isLoading || genresQuery.isLoading) &&
    currentStocks.length > 0;
  const hasBookDetailsError =
    booksQuery.isError || authorsQuery.isError || genresQuery.isError;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <Link
        href="/admin/sucursales"
        className="btn btn-ghost btn-sm mb-5 -ml-3"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver a sucursales
      </Link>

      {invalidId ? (
        <NotificationToast
          type="error"
          message="El identificador de la sucursal no es válido."
        />
      ) : isLoading ? (
        <LoadingSpinner label="Cargando sucursal y stock" />
      ) : warehouseQuery.isError ? (
        <NotificationToast
          type="error"
          message={
            warehouseQuery.error instanceof Error
              ? warehouseQuery.error.message
              : "No se pudo cargar la sucursal."
          }
        />
      ) : !warehouse ? (
        <NotificationToast
          type="error"
          message="No se encontró la sucursal solicitada."
        />
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold">{warehouse.name}</h1>
            <div className="text-base-content/60 mt-2 flex flex-col gap-2 text-sm sm:flex-row sm:gap-5">
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" aria-hidden="true" />
                {[warehouse.address, warehouse.city].filter(Boolean).join(", ") || "Sin dirección"}
              </span>
              <span className="inline-flex items-center gap-2">
                <Phone className="size-4" aria-hidden="true" />
                {warehouse.phone || "Sin teléfono"}
              </span>
            </div>
          </div>

          <section className="card card-border bg-base-100">
            <div className="card-body">
              <div className="mb-4">
                <h2 className="text-base-content/60 text-sm font-bold uppercase tracking-wider">
                  Libros en stock
                </h2>
              </div>

              {stocksQuery.isError ? (
                <NotificationToast
                  type="error"
                  message={
                    stocksQuery.error instanceof Error
                      ? stocksQuery.error.message
                      : "No se pudieron cargar las existencias."
                  }
                />
              ) : hasBookDetailsError ? (
                <NotificationToast
                  type="error"
                  message={
                    booksQuery.error instanceof Error
                      ? booksQuery.error.message
                      : "No se pudieron cargar los datos completos de los libros."
                  }
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Portada</th>
                          <th>Título</th>
                          <th>Autores</th>
                          <th>Géneros</th>
                          <th>Existencias</th>
                          <th className="text-right">Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stocksQuery.isSuccess && stockRecords.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="text-base-content/60 py-8 text-center text-sm"
                            >
                              Esta sucursal no tiene libros en stock.
                            </td>
                          </tr>
                        )}
                        {isBookDetailsLoading && (
                          <tr>
                            <td colSpan={6}>
                              <LoadingSpinner label="Cargando datos de libros" />
                            </td>
                          </tr>
                        )}
                        {!isBookDetailsLoading && books.map((book) => (
                          <tr key={book.id}>
                            <td>
                              {book.coverUrl ? (
                                <Image
                                  src={book.coverUrl}
                                  alt={book.title}
                                  width={40}
                                  height={54}
                                  unoptimized
                                  className="aspect-[3/4] w-10 rounded object-cover"
                                />
                              ) : (
                                <div className="bg-base-200 text-base-content/40 flex aspect-[3/4] w-10 items-center justify-center rounded text-[10px]">
                                  S/F
                                </div>
                              )}
                            </td>
                            <td className="font-semibold">{book.title}</td>
                            <td className="text-sm">
                              {book.authors.length > 0
                                ? book.authors.join(", ")
                                : "—"}
                            </td>
                            <td>
                              <div className="flex flex-wrap gap-1">
                                {book.genres.length > 0 ? (
                                  book.genres.map((genre) => (
                                    <span key={genre} className="badge badge-sm">
                                      {genre}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-base-content/60 text-sm">
                                    —
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-success">
                                {book.quantity}
                              </span>
                            </td>
                            <td className="text-right text-sm font-semibold">
                              {book.price === null
                                ? "—"
                                : `${formatGs(book.price)} Gs`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      onChange={setPage}
                    />
                  )}
                </>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
