"use client";

import BookForm from "@/common/components/BookForm";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import type { bookInputType } from "@/common/schemas/book/BookInputSchema";
import {
  createBookRequest,
  getAuthorsRequest,
  getBooksRequest,
  getGenresRequest,
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
  authorsById: Map<number, string>,
  genresById: Map<number, string>
): AdminBook | null {
  if (book.id === null) return null;

  return {
    id: String(book.id),
    title: book.title ?? "Sin título",
    description: book.description ?? "",
    price: book.price === null ? "" : String(book.price),
    coverUrl: book.coverUrl ?? "",
    authors: (book.authorIds ?? []).flatMap((id) => {
      const name = id === null ? undefined : authorsById.get(id);
      return name ? [name] : [];
    }),
    genres: (book.genreIds ?? []).flatMap((id) => {
      const name = id === null ? undefined : genresById.get(id);
      return name ? [name] : [];
    }),
  };
}

export default function AdminLibrosPage() {
  const queryClient = useQueryClient();
  const booksQuery = useQuery({
    queryKey: ["books", "catalog"],
    queryFn: getBooksRequest,
    staleTime: 60_000,
  });
  const bookRecords = booksQuery.data ?? EMPTY_BOOKS;
  const needsAuthors = bookRecords.some((book) =>
    book.authorIds?.some((id) => id !== null)
  );
  const needsGenres = bookRecords.some((book) =>
    book.genreIds?.some((id) => id !== null)
  );
  const authorsQuery = useQuery({
    queryKey: ["authors", "catalog"],
    queryFn: getAuthorsRequest,
    enabled: needsAuthors,
    staleTime: Infinity,
  });
  const genresQuery = useQuery({
    queryKey: ["genres", "catalog"],
    queryFn: getGenresRequest,
    enabled: needsGenres,
    staleTime: Infinity,
  });
  const apiBooks = useMemo(() => {
    const authorsById = new Map(
      (authorsQuery.data ?? []).flatMap((author) =>
        author.id !== null && author.name ? [[author.id, author.name] as const] : []
      )
    );
    const genresById = new Map(
      (genresQuery.data ?? []).flatMap((genre) =>
        genre.id !== null && genre.name ? [[genre.id, genre.name] as const] : []
      )
    );

    return bookRecords.flatMap((book) => {
      const adminBook = toAdminBook(book, authorsById, genresById);
      return adminBook ? [adminBook] : [];
    });
  }, [authorsQuery.data, bookRecords, genresQuery.data]);
  const books = apiBooks;
  const [query, setQuery] = useState("");
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
        queryClient.invalidateQueries({ queryKey: ["authors", "catalog"] }),
        queryClient.invalidateQueries({ queryKey: ["genres", "catalog"] }),
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
    (needsAuthors && authorsQuery.isPending) ||
    (needsGenres && genresQuery.isPending);
  const hasError =
    booksQuery.isError ||
    (needsAuthors && authorsQuery.isError) ||
    (needsGenres && genresQuery.isError);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.authors.some((a) => a.toLowerCase().includes(q)) ||
        b.genres.some((g) => g.toLowerCase().includes(q))
    );
  }, [books, query]);

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
                  placeholder="Buscar por título, autor o género..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
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
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-base-content/60 py-8 text-center text-sm"
                        >
                          No se encontraron libros.
                        </td>
                      </tr>
                    )}
                    {filtered.map((book) => (
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
