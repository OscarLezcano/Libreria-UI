"use client";

import type {
  SupplierInput,
  SupplierRecord,
} from "@/common/services/suppliers";
import { useState } from "react";

interface SupplierFormProps {
  initial?: SupplierRecord | null;
  onSubmit: (data: SupplierInput) => void;
  onCancel: () => void;
  isPending?: boolean;
}

const EMPTY = {
  name: "",
  ruc: "",
};

export default function SupplierForm({
  initial,
  onSubmit,
  onCancel,
  isPending = false,
}: SupplierFormProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? EMPTY.name,
    ruc: initial?.ruc ?? EMPTY.ruc,
  });

  const update = (field: keyof typeof form, value: string) =>
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
        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            Nombre <span className="text-error">*</span>
          </legend>
          <input
            className="input"
            required
            placeholder="Ej: Editorial Sur"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            RUC <span className="text-error">*</span>
          </legend>
          <input
            className="input"
            required
            placeholder="Ej: 80012345-6"
            value={form.ruc}
            onChange={(e) => update("ruc", e.target.value)}
          />
        </fieldset>

      </div>

      <div className="modal-action">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending && <span className="loading loading-spinner loading-xs" />}
          Guardar Proveedor
        </button>
      </div>
    </form>
  );
}
