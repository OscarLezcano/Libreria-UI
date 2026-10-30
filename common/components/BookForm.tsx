"use client";

import type { bookInputType } from "@/common/schemas/book/BookInputSchema";
import { searchCatalogRequest } from "@/common/services/books";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface BookFormProps {
  initial?: bookInputType | null;
  onSubmit: (data: bookInputType) => void;
  onCancel: () => void;
  isPending?: boolean;
}

const EMPTY = {
  title: "",
  description: "",
  price: "",
  coverUrl: "",
  authors: [] as string[],
  genres: [] as string[],
};

function normalizeTag(tag: string): string {
  return tag
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function TagList({
  label,
  resource,
  required,
  tags,
  onChange,
  placeholder,
}: {
  label: string;
  resource: "authors" | "genres";
  required?: boolean;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchTerm(draft.trim()), 200);
    return () => window.clearTimeout(timeout);
  }, [draft]);

  const suggestionsQuery = useQuery({
    queryKey: ["catalog-suggestions", resource, searchTerm],
    queryFn: () => searchCatalogRequest(resource, searchTerm),
    enabled: isFocused && searchTerm.length > 0,
    staleTime: 30_000,
  });
  const suggestions = (suggestionsQuery.data ?? []).flatMap((entity) => {
    const name = entity.name;
    if (!name || tags.some((tag) => normalizeTag(tag) === normalizeTag(name))) {
      return [];
    }
    return [{ ...entity, name }];
  });
  const showSuggestions = isFocused && draft.trim().length > 0;

  const addTag = (tag = draft) => {
    const value = tag.trim();
    if (
      value &&
      !tags.some((existing) => normalizeTag(existing) === normalizeTag(value))
    ) {
      onChange([...tags, value]);
    }
    setDraft("");
    setIsFocused(false);
  };

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">
        {label} {required && <span className="text-error">*</span>}
      </legend>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            className="input input-sm w-full"
            placeholder={placeholder}
            value={draft}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls={
              showSuggestions && suggestions.length > 0
                ? `${resource}-suggestions`
                : undefined
            }
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          {showSuggestions && (
            <div className="absolute top-full z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-box border border-base-300 bg-base-100 shadow-lg">
              {draft.trim() !== searchTerm || suggestionsQuery.isFetching ? (
                <p className="px-3 py-2 text-sm text-base-content/60">
                  Buscando...
                </p>
              ) : suggestionsQuery.isError ? (
                <p className="px-3 py-2 text-sm text-error" role="alert">
                  No se pudieron buscar coincidencias.
                </p>
              ) : suggestions.length > 0 ? (
                <ul
                  id={`${resource}-suggestions`}
                  className="menu menu-sm w-full p-1"
                  role="listbox"
                >
                  {suggestions.map((entity) => (
                    <li key={entity.id ?? entity.name}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={false}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => addTag(entity.name)}
                      >
                        {entity.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-2 text-sm text-base-content/60">
                  Sin coincidencias. Usa “Agregar” para incluirlo como nuevo.
                </p>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          className="btn btn-neutral btn-sm"
          onClick={() => addTag()}
        >
          Agregar
        </button>
      </div>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="badge badge-sm gap-1 pr-1">
              {tag}
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-circle p-0"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                aria-label={`Quitar ${tag}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </fieldset>
  );
}

export default function BookForm({
  initial,
  onSubmit,
  onCancel,
  isPending = false,
}: BookFormProps) {
  const [form, setForm] = useState({
    title: initial?.title ?? EMPTY.title,
    description: initial?.description ?? EMPTY.description,
    price: initial?.price ?? EMPTY.price,
    coverUrl: initial?.coverUrl ?? EMPTY.coverUrl,
    authors: initial?.authors ?? EMPTY.authors,
    genres: initial?.genres ?? EMPTY.genres,
  });

  const update = (field: keyof typeof form, value: string | string[]) =>
    setForm((current) => ({ ...current, [field]: value }));

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <fieldset className="fieldset sm:col-span-2">
          <legend className="fieldset-legend">
            Título <span className="text-error">*</span>
          </legend>
          <input
            className="input w-full"
            required
            placeholder="Ej: El Gran Libro de Cocina"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </fieldset>

        <fieldset className="fieldset sm:col-span-2">
          <legend className="fieldset-legend">
            Descripción <span className="text-error">*</span>
          </legend>
          <textarea
            className="textarea w-full"
            required
            rows={3}
            placeholder="Descripción del libro..."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            Precio (Gs.) <span className="text-error">*</span>
          </legend>
          <input
            type="number"
            required
            min={0}
            step={1000}
            className="input"
            placeholder="Ej: 150000"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">URL de portada</legend>
          <input
            type="url"
            className="input"
            placeholder="https://ejemplo.com/portada.jpg"
            value={form.coverUrl}
            onChange={(e) => update("coverUrl", e.target.value)}
          />
        </fieldset>

        {form.coverUrl && (
          <div className="sm:col-span-2">
            <img
              src={form.coverUrl}
              alt="Vista previa de portada"
              className="aspect-[3/4] w-28 rounded border border-base-300 object-cover"
            />
          </div>
        )}

        <TagList
          label="Autores"
          resource="authors"
          tags={form.authors}
          onChange={(tags) => update("authors", tags)}
          placeholder="Ej: Gabriel García Márquez"
        />

        <TagList
          label="Géneros"
          resource="genres"
          tags={form.genres}
          onChange={(tags) => update("genres", tags)}
          placeholder="Ej: Novela, Misterio"
        />
      </div>

      <div className="modal-action">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
        >
          {isPending && <span className="loading loading-spinner loading-xs" />}
          Guardar Libro
        </button>
      </div>
    </form>
  );
}
