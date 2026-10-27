"use client";

import InputText from "@/common/components/InputText";
import NotificationToast from "@/common/components/NotificationToast";
import { useRegister } from "@/common/hooks/useAuth";
import { registerInputSchema } from "@/common/schemas/auth/RegisterInputSchema";
import type { registerInputType } from "@/common/schemas/auth/RegisterInputSchema";
import { DEPARTAMENTOS } from "@/common/data/paraguay";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import z from "zod";

export default function RegisterForm() {
  const { mutateAsync, isPending } = useRegister();
  const [errors, setErrors] = useState<Partial<registerInputType>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const validation = registerInputSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget))
    );
    if (!validation.success) {
      const fieldErrors = z.treeifyError(validation.error).properties;
      setErrors({
        name: fieldErrors?.name?.errors?.[0],
        lastName: fieldErrors?.lastName?.errors?.[0],
        email: fieldErrors?.email?.errors?.[0],
        password: fieldErrors?.password?.errors?.[0],
        city: fieldErrors?.city?.errors?.[0],
      });
      return;
    }

    setErrors({});
    try {
      await mutateAsync(validation.data);
      setRegistered(true);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "No se pudo crear la cuenta. Intentá nuevamente."
      );
    }
  };

  if (registered) {
    return (
      <div className="card bg-base-200">
        <div className="card-body items-start gap-4">
          <div>
            <h2 className="text-lg font-bold">Cuenta creada</h2>
            <p className="text-base-content/70 mt-1 text-sm">
              Ya podés iniciar sesión con tu correo y contraseña.
            </p>
          </div>
          <Link href="/auth/login" className="btn btn-primary">
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-1" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <InputText
          label="Nombre"
          name="name"
          type="text"
          autoComplete="given-name"
          required
          placeholder="Tu nombre"
          icon={<UserRound className="size-5 opacity-50" />}
          error={errors.name}
        />
        <InputText
          label="Apellido"
          name="lastName"
          type="text"
          autoComplete="family-name"
          required
          placeholder="Tu apellido"
          icon={<UserRound className="size-5 opacity-50" />}
          error={errors.lastName}
        />
      </div>
      <InputText
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="correo@ejemplo.com"
        icon={<Mail className="size-5 opacity-50" />}
        error={errors.email}
      />
      <InputText
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        placeholder="Mínimo 4 caracteres"
        icon={<LockKeyhole className="size-5 opacity-50" />}
        error={errors.password}
      />
      <fieldset className="fieldset mb-4">
        <legend className="fieldset-legend">Ciudad</legend>
        <select
          className="select w-full"
          name="city"
          required
          defaultValue=""
          aria-label="Ciudad"
        >
          <option value="" disabled>
            Seleccioná tu ciudad
          </option>
          {DEPARTAMENTOS.map((department) => (
            <optgroup key={department.name} label={department.name}>
              {department.cities.map((city) => (
                <option key={`${department.name}-${city}`} value={city}>
                  {city}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {errors.city && (
          <p className="text-error text-sm" role="alert">
            {errors.city}
          </p>
        )}
      </fieldset>

      {serverError && (
        <NotificationToast
          type="error"
          message={serverError}
          className="my-2 text-sm"
        />
      )}

      <button
        className="btn btn-primary mt-2 w-full"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
