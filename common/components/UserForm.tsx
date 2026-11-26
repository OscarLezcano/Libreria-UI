"use client";

import type { RoleRecord, UserInput, UserRecord } from "@/common/services/users";
import { useState } from "react";

interface UserFormProps {
  initial?: UserRecord | null;
  roles: RoleRecord[];
  onSubmit: (data: UserInput) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export default function UserForm({
  initial = null,
  roles,
  onSubmit,
  onCancel,
  isPending = false,
}: UserFormProps) {
  const [form, setForm] = useState<UserInput>({
    name: initial?.name ?? "",
    lastName: initial?.lastName ?? "",
    email: initial?.email ?? "",
    password: "",
    city: initial?.city ?? "",
    warehouseId: initial?.warehouseId ?? null,
    roleIds: initial?.roleIds ?? [],
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const update = <K extends keyof UserInput>(field: K, value: UserInput[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setValidationError(null);
  };

  const toggleRole = (roleId: number) => {
    update(
      "roleIds",
      form.roleIds.includes(roleId)
        ? form.roleIds.filter((id) => id !== roleId)
        : [...form.roleIds, roleId]
    );
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data: UserInput = {
          ...form,
          name: form.name.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          city: form.city.trim(),
          password: form.password,
        };
        if (!data.name || !data.lastName || !data.email || !data.city) {
          setValidationError("Completá nombre, apellido, correo y ciudad.");
          return;
        }
        if (!initial && data.password.length < 6) {
          setValidationError("La contraseña debe tener al menos 6 caracteres.");
          return;
        }
        if (data.password && data.password.length < 6) {
          setValidationError("La nueva contraseña debe tener al menos 6 caracteres.");
          return;
        }
        if (data.roleIds.length === 0) {
          setValidationError("Seleccioná al menos un rol.");
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
          <legend className="fieldset-legend">Nombre</legend>
          <input
            className="input w-full"
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Apellido</legend>
          <input
            className="input w-full"
            required
            value={form.lastName}
            onChange={(event) => update("lastName", event.target.value)}
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Correo electrónico</legend>
          <input
            className="input w-full"
            type="email"
            required
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Ciudad</legend>
          <input
            className="input w-full"
            required
            value={form.city}
            onChange={(event) => update("city", event.target.value)}
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            {initial ? "Nueva contraseña (opcional)" : "Contraseña"}
          </legend>
          <input
            className="input w-full"
            type="password"
            required={!initial}
            minLength={6}
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Almacén (opcional)</legend>
          <input
            className="input w-full"
            type="number"
            min="1"
            step="1"
            placeholder="ID del almacén"
            value={form.warehouseId ?? ""}
            onChange={(event) =>
              update("warehouseId", event.target.value ? Number(event.target.value) : null)
            }
          />
        </fieldset>
      </div>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Roles</legend>
        <div className="flex flex-wrap gap-3">
          {roles.map((role) => (
            <label key={role.id} className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={form.roleIds.includes(role.id)}
                onChange={() => toggleRole(role.id)}
              />
              <span className="label-text">{role.name}</span>
            </label>
          ))}
          {roles.length === 0 && (
            <span className="text-base-content/60 text-sm">No hay roles disponibles.</span>
          )}
        </div>
      </fieldset>

      <div className="modal-action">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isPending}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending && <span className="loading loading-spinner loading-xs" />}
          {initial ? "Guardar cambios" : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}
