"use client";

import type { bookInputType } from "@/common/schemas/book/BookInputSchema";
import { X } from "lucide-react";
import { useState } from "react";

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

function TagList({
  label,
  required,
  tags,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const value = draft.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
    }
    setDraft("");
  };

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">
        {label} {required && <span className="text-error">*</span>}
      </legend>
      <div className="flex gap-2">
        <input
          className="input input-sm flex-1"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
        />
        <button
          type="button"
          className="btn btn-neutral btn-sm"
          onClick={addTag}
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
            className="input"
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
          <legend className="fieldset-legend">Precio (Gs.)</legend>
          <input
            type="number"
            min={0}
            step={1000}
            className="input"
            placeholder="Dejar vacío si aún no tiene precio"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
          <p className="fieldset-hint">
            El precio se expresa en guaraníes. Se guarda como null si está
            vacío.
          </p>
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
          tags={form.authors}
          onChange={(tags) => update("authors", tags)}
          placeholder="Ej: Gabriel García Márquez"
        />

        <TagList
          label="Géneros"
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
