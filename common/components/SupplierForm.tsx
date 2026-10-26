"use client";

import type { Supplier } from "@/common/data/suppliers";
import { useState } from "react";

interface SupplierFormProps {
  initial?: Supplier | null;
  onSubmit: (data: Omit<Supplier, "id">) => void;
  onCancel: () => void;
}

const EMPTY = {
  name: "",
  ruc: "",
  email: "",
  phone: "",
  address: "",
  active: true,
};

export default function SupplierForm({
  initial,
  onSubmit,
  onCancel,
}: SupplierFormProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? EMPTY.name,
    ruc: initial?.ruc ?? EMPTY.ruc,
    contactName: initial?.contactName ?? "",
    email: initial?.email ?? EMPTY.email,
    phone: initial?.phone ?? EMPTY.phone,
    address: initial?.address ?? EMPTY.address,
    active: initial?.active ?? EMPTY.active,
  });

  const update = (field: keyof typeof form, value: string | boolean) =>
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

        <fieldset className="fieldset sm:col-span-2">
          <legend className="fieldset-legend">Teléfono</legend>
          <input
            type="tel"
            className="input w-full"
            placeholder="+595 ..."
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </fieldset>

        <fieldset className="fieldset sm:col-span-2">
          <legend className="fieldset-legend">Correo electrónico</legend>
          <input
            type="email"
            className="input w-full"
            placeholder="ventas@proveedor.com.py"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </fieldset>

        <fieldset className="fieldset sm:col-span-2">
          <legend className="fieldset-legend">Dirección</legend>
          <input
            className="input w-full"
            placeholder="Calle, número, ciudad"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </fieldset>
      </div>

      <div className="modal-action">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          Guardar Proveedor
        </button>
      </div>
    </form>
  );
}
