"use client";

import type { WarehouseInput } from "@/common/services/warehouses";
import { useState } from "react";

interface WarehouseFormProps {
  onSubmit: (data: WarehouseInput) => void;
  onCancel: () => void;
  isPending?: boolean;
}

const EMPTY_FORM: WarehouseInput = {
  name: "",
  address: "",
  city: "",
  phone: "",
};

export default function WarehouseForm({
  onSubmit,
  onCancel,
  isPending = false,
}: WarehouseFormProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [validationError, setValidationError] = useState<string | null>(null);

  const update = (field: keyof WarehouseInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setValidationError(null);
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = Object.fromEntries(
          Object.entries(form).map(([field, value]) => [field, value.trim()])
        ) as WarehouseInput;

        if (Object.values(data).some((value) => value.length === 0)) {
          setValidationError("Completá todos los campos para crear la sucursal.");
          return;
        }

        onSubmit(data);
      }}
    >
      {validationError && (
        <div className="alert alert-error" role="alert">
          <span>{validationError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            Nombre <span className="text-error">*</span>
          </legend>
          <input
            className="input"
            required
            autoComplete="organization"
            placeholder="Ej: Sucursal Centro"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            Ciudad <span className="text-error">*</span>
          </legend>
          <input
            className="input"
            required
            autoComplete="address-level2"
            placeholder="Ej: Asunción"
            value={form.city}
            onChange={(event) => update("city", event.target.value)}
          />
        </fieldset>

        <fieldset className="fieldset sm:col-span-2">
          <legend className="fieldset-legend">
            Dirección <span className="text-error">*</span>
          </legend>
          <input
            className="input w-full"
            required
            autoComplete="street-address"
            placeholder="Ej: Av. España 1234"
            value={form.address}
            onChange={(event) => update("address", event.target.value)}
          />
        </fieldset>

        <fieldset className="fieldset sm:col-span-2">
          <legend className="fieldset-legend">
            Teléfono <span className="text-error">*</span>
          </legend>
          <input
            className="input w-full"
            type="tel"
            required
            autoComplete="tel"
            placeholder="Ej: +595 21 1234567"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
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
          Crear sucursal
        </button>
      </div>
    </form>
  );
}
