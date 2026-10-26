"use client";

import AdminNavbar from "@/common/components/AdminNavbar";
import BookForm from "@/common/components/BookForm";
import { BOOKS, type Book } from "@/common/data/books";
import type { bookInputType } from "@/common/schemas/book/BookInputSchema";
import { formatGs } from "@/common/utils/format";
import { Plus, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type AdminBook = bookInputType & { id: string };

function toAdminBook(book: Book): AdminBook {
  return {
    id: book.id,
    title: book.title,
    description: book.description,
    price: String(book.price),
    coverUrl: book.coverSrc,
    authors: book.authors,
    genres: book.categories,
  };
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminLibrosPage() {
  const [books, setBooks] = useState<AdminBook[]>(
    BOOKS.map(toAdminBook)
  );
  const [query, setQuery] = useState("");
  const modalRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<AdminBook | null>(null);

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
    modalRef.current?.showModal();
  };

  const openEdit = (book: AdminBook) => {
    setEditing(book);
    modalRef.current?.showModal();
  };

  const handleSubmit = (data: bookInputType) => {
    if (editing) {
      setBooks((current) =>
        current.map((b) => (b.id === editing.id ? { ...b, ...data } : b))
      );
    } else {
      const id = slugify(data.title) || `libro-${books.length + 1}`;
      setBooks((current) => [...current, { id, ...data }]);
    }
    modalRef.current?.close();
  };

  return (
    <div className="bg-base-200 min-h-dvh">
      <AdminNavbar active="Catálogo" initials="HA" />

      <main className="mx-auto max-w-6xl px-6 py-8">
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
          </div>
        </section>
      </main>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="mb-4 text-lg font-bold">
            {editing ? "Editar Libro" : "Nuevo Libro"}
          </h3>
          <BookForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => modalRef.current?.close()}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
