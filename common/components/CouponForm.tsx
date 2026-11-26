"use client";

import NotificationToast from "@/common/components/NotificationToast";
import { getBooksPageRequest } from "@/common/services/books";
import { createCouponRequest } from "@/common/services/coupons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgePercent, Search, X } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

function toIsoDateTime(value: string): string | null {
  return value ? `${value}:00` : null;
}

export default function CouponForm() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [singleUsePerUser, setSingleUsePerUser] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const [bookSearchTerm, setBookSearchTerm] = useState("");
  const [selectedBooks, setSelectedBooks] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setBookSearchTerm(bookSearch.trim()),
      250
    );
    return () => window.clearTimeout(timeout);
  }, [bookSearch]);

  const booksQuery = useQuery({
    queryKey: ["books", "coupon-picker", bookSearchTerm],
    queryFn: () =>
      getBooksPageRequest(0, { size: 20, title: bookSearchTerm }),
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createCouponRequest({
        code,
        discountPercent: Number(discountPercent),
        validFrom: toIsoDateTime(validFrom),
        validUntil: toIsoDateTime(validUntil),
        bookIds: Object.keys(selectedBooks).map(Number),
        singleUsePerUser,
      }),
    onSuccess: async (coupon) => {
      setSuccess(`Cupón ${coupon.code} creado correctamente.`);
      setError(null);
      setCode("");
      setDiscountPercent("10");
      setValidFrom("");
      setValidUntil("");
      setSingleUsePerUser(false);
      setSelectedBooks({});
      setBookSearch("");
      await queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (mutationError) => {
      setSuccess(null);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo crear el cupón."
      );
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!code.trim()) {
      setError("Ingresá un código de cupón.");
      return;
    }
    const discount = Number(discountPercent);
    if (!Number.isFinite(discount) || discount < 1 || discount > 100) {
      setError("El descuento debe estar entre 1 y 100.");
      return;
    }
    if (validFrom && validUntil && validFrom > validUntil) {
      setError("La fecha de inicio no puede ser posterior al vencimiento.");
      return;
    }
    createMutation.mutate();
  };

  const toggleBook = (id: number, title: string) => {
    setSelectedBooks((current) => {
      const next = { ...current };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = title;
      }
      return next;
    });
  };

  const books = booksQuery.data?.books ?? [];

  return (
    <form className="card card-border bg-base-100" onSubmit={handleSubmit}>
      <div className="card-body gap-5">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary rounded-box p-3">
            <BadgePercent className="size-6" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Nuevo cupón</h2>
            <p className="text-base-content/60 mt-1 text-sm">
              Descuento porcentual, vigencia y libros opcionales.
            </p>
          </div>
        </div>

        {error && <NotificationToast type="error" message={error} />}
        {success && <NotificationToast type="success" message={success} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Código</legend>
            <input
              className="input w-full uppercase"
              value={code}
              maxLength={50}
              placeholder="EJ: LIBRO10"
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              required
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Descuento (%)</legend>
            <input
              className="input w-full"
              type="number"
              min={1}
              max={100}
              value={discountPercent}
              onChange={(event) => setDiscountPercent(event.target.value)}
              required
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Vigente desde</legend>
            <input
              className="input w-full"
              type="datetime-local"
              value={validFrom}
              onChange={(event) => setValidFrom(event.target.value)}
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Vigente hasta</legend>
            <input
              className="input w-full"
              type="datetime-local"
              value={validUntil}
              onChange={(event) => setValidUntil(event.target.value)}
            />
          </fieldset>
        </div>

        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={singleUsePerUser}
            onChange={(event) => setSingleUsePerUser(event.target.checked)}
          />
          <span className="label-text">
            Un solo uso por usuario (los cupones existentes no cambian)
          </span>
        </label>

        <section className="rounded-box border border-base-300 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold">Libros aplicables</h3>
              <p className="text-base-content/60 text-xs">
                Si no elegís libros, el cupón aplica a todo el pedido.
              </p>
            </div>
            <span className="badge badge-soft">
              {Object.keys(selectedBooks).length} seleccionado(s)
            </span>
          </div>

          {Object.keys(selectedBooks).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(selectedBooks).map(([id, title]) => (
                <span key={id} className="badge badge-primary gap-1">
                  {title}
                  <button
                    type="button"
                    aria-label={`Quitar ${title}`}
                    onClick={() => toggleBook(Number(id), title)}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <label className="input mt-4 w-full">
            <Search className="size-4 opacity-50" />
            <input
              type="search"
              placeholder="Buscar por título..."
              value={bookSearch}
              onChange={(event) => setBookSearch(event.target.value)}
            />
          </label>

          <div className="mt-3 max-h-64 overflow-y-auto rounded-box border border-base-200">
            {booksQuery.isPending ? (
              <div className="flex justify-center p-6">
                <span className="loading loading-spinner loading-sm" />
              </div>
            ) : booksQuery.isError ? (
              <p className="p-4 text-sm text-error">
                No se pudieron cargar los libros.
              </p>
            ) : books.length === 0 ? (
              <p className="text-base-content/60 p-4 text-sm">
                No se encontraron libros.
              </p>
            ) : (
              <ul className="menu w-full p-1">
                {books.map((book) =>
                  book.id === null || !book.title ? null : (
                    <li key={book.id}>
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={Boolean(selectedBooks[book.id])}
                          onChange={() => toggleBook(book.id as number, book.title as string)}
                        />
                        <span className="truncate">{book.title}</span>
                      </label>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending && (
              <span className="loading loading-spinner loading-sm" />
            )}
            Crear cupón
          </button>
          <Link href="/vendedor/cupones" className="btn btn-ghost">
            Ver listado
          </Link>
        </div>
      </div>
    </form>
  );
}
