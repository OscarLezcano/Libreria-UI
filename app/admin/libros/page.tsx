"use client";

import BookForm from "@/common/components/BookForm";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import Pagination from "@/common/components/Pagination";
import type { bookInputType } from "@/common/schemas/book/BookInputSchema";
import { useAuthorsByIds } from "@/common/hooks/useAuthorsByIds";
import { useGenresByIds } from "@/common/hooks/useGenresByIds";
import {
  BOOKS_PAGE_SIZE,
  createBookRequest,
  getBooksPageRequest,
  type CatalogEntity,
  updateBookRequest,
  type BookRecord,
} from "@/common/services/books";
import { formatGs } from "@/common/utils/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type AdminBook = bookInputType & { id: string };
const EMPTY_BOOKS: BookRecord[] = [];

function toAdminBook(
  book: BookRecord,
  authorsById: Map<number, CatalogEntity>,
  genresById: Map<number, CatalogEntity>
): AdminBook | null {
  if (book.id === null) return null;

  return {
    id: String(book.id),
    title: book.title ?? "Sin título",
    description: book.description ?? "",
    price: book.price === null ? "" : String(book.price),
    coverUrl: book.coverUrl ?? "",
    authors: (book.authorIds ?? []).flatMap((id) => {
      const name = id === null ? undefined : authorsById.get(id)?.name;
      return name ? [name] : [];
    }),
    genres: (book.genreIds ?? []).flatMap((id) => {
      const name = id === null ? undefined : genresById.get(id)?.name;
      return name ? [name] : [];
    }),
  };
}

export default function AdminLibrosPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const booksQuery = useQuery({
    queryKey: ["books", "catalog", page, BOOKS_PAGE_SIZE, query.trim()],
    queryFn: () =>
      getBooksPageRequest(page - 1, {
        size: BOOKS_PAGE_SIZE,
        title: query,
      }),
    staleTime: 60_000,
  });
  const bookRecords = booksQuery.data?.books ?? EMPTY_BOOKS;
  const authorsQuery = useAuthorsByIds(
    bookRecords.flatMap((book) => book.authorIds ?? [])
  );
  const genresQuery = useGenresByIds(
    bookRecords.flatMap((book) => book.genreIds ?? [])
  );
  const apiBooks = useMemo(() => {
    return bookRecords.flatMap((book) => {
      const adminBook = toAdminBook(
        book,
        authorsQuery.authorsById,
        genresQuery.genresById
      );
      return adminBook ? [adminBook] : [];
    });
  }, [authorsQuery.authorsById, bookRecords, genresQuery.genresById]);
  const books = apiBooks;
  const modalRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<AdminBook | null>(null);
  const [formSession, setFormSession] = useState(0);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const saveBookMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | null;
      data: bookInputType;
    }) => {
      if (id) {
        await updateBookRequest(id, data);
      } else {
        await createBookRequest(data);
      }
    },
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["books", "catalog"] }),
        queryClient.invalidateQueries({ queryKey: ["books", "detail"] }),
      ]);
      modalRef.current?.close();
      setSubmissionError(null);
      setSubmissionSuccess(
        variables.id ? "Libro actualizado correctamente." : "Libro creado correctamente."
      );
    },
    onError: (error) => {
      setSubmissionError(
        error instanceof Error ? error.message : "No se pudo guardar el libro."
      );
    },
  });
  const isLoading =
    booksQuery.isPending ||
    authorsQuery.isLoading ||
    genresQuery.isLoading;
  const hasError =
    booksQuery.isError ||
    authorsQuery.isError ||
    genresQuery.isError;

  const openNew = () => {
    setEditing(null);
    setFormSession((session) => session + 1);
    setSubmissionError(null);
    modalRef.current?.showModal();
  };

  const openEdit = (book: AdminBook) => {
    setEditing(book);
    setFormSession((session) => session + 1);
    setSubmissionError(null);
    modalRef.current?.showModal();
  };

  const handleSubmit = (data: bookInputType) => {
    setSubmissionError(null);
    setSubmissionSuccess(null);
    saveBookMutation.mutate({ id: editing?.id ?? null, data });
  };

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-8">
        {submissionSuccess && (
          <NotificationToast
            type="success"
            message={submissionSuccess}
            placement="toast"
            onClose={() => setSubmissionSuccess(null)}
          />
        )}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Catálogo de Libros</h1>
            <p className="text-base-content/60 mt-1 text-sm">
              Cargá y administrá los libros del catálogo
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={openNew}>
            <Plus className="size-4" strokeWidth={2.5} />
            Nuevo Libro
          </button>
        </div>

        <section className="card bg-base-100 card-border">
          <div className="card-body">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                Lista de libros
              </h2>
              <label className="input input-sm w-full sm:w-72">
                <Search className="size-4 opacity-50" strokeWidth={2} />
                <input
                  type="search"
                  placeholder="Buscar por título..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Buscar libros"
                />
              </label>
            </div>

            {isLoading ? (
              <LoadingSpinner label="Cargando libros" />
            ) : hasError ? (
              <NotificationToast
                type="error"
                message="No se pudieron cargar los libros del catálogo."
                placement="toast"
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
                        <th className="text-right">Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-base-content/60 py-8 text-center text-sm"
                          >
                            No se encontraron libros.
                          </td>
                        </tr>
                      )}
                      {books.map((book) => (
                        <tr
                          key={book.id}
                          className="cursor-pointer hover:bg-base-200"
                          onClick={() => openEdit(book)}
                        >
                          <td>
                            {book.coverUrl ? (
                              <img
                                src={book.coverUrl}
                                alt={book.title}
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
                                book.genres.map((g) => (
                                  <span key={g} className="badge badge-sm">
                                    {g}
                                  </span>
                                ))
                              ) : (
                                <span className="text-base-content/60 text-sm">
                                  —
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-right text-sm font-semibold">
                            {book.price
                              ? `${formatGs(Number(book.price))} Gs`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={page}
                  totalPages={booksQuery.data?.totalPages ?? 1}
                  onChange={setPage}
                />
              </>
            )}
          </div>
        </section>
      </main>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="mb-4 text-lg font-bold">
            {editing ? "Editar Libro" : "Nuevo Libro"}
          </h3>
          {submissionError && (
            <NotificationToast
              type="error"
              message={submissionError}
              placement="toast"
              onClose={() => setSubmissionError(null)}
            />
          )}
          <BookForm
            key={formSession}
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => modalRef.current?.close()}
            isPending={saveBookMutation.isPending}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
