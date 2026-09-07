'use client';

import { useState } from 'react';
import { loginInputSchema } from '@/commons/schemas/auth/LoginInputSchema';
import type { loginInputType } from '@/commons/schemas/auth/LoginInputSchema';
import { useLogin } from '@/commons/hooks/useAuth';
import { User as UserIcon } from "lucide-react";
import { Lock as LockIcon } from "lucide-react";
import z from 'zod';
import InputText from '@/commons/components/InputText';

export default function LoginForm() {
  const { mutate, isPending, isError, error } = useLogin();
  const [errors, setErrors] = useState<Partial<loginInputType>>({});

  function handleSubmit(formData: FormData) {
    const validation = loginInputSchema.safeParse(Object.fromEntries(formData));
    if (!validation.success) {
      const fieldErrors = z.treeifyError(validation.error).properties;
      setErrors({
        username: fieldErrors?.username?.errors?.[0],
        password: fieldErrors?.password?.errors?.[0],
      });
      return;
    }

    mutate(validation.data);
  }

  return (
    <form action={handleSubmit}>
      <InputText
        label="Correo electrónico"
        name="username"
        type="text"
        placeholder="Usuario"
        icon={<UserIcon size={20} className="opacity-50" />}
        error={errors.username}
        defaultValue="mor_2314"
      />

      <InputText
        label="Contraseña"
        name="password"
        type="password"
        placeholder="Contraseña"
        icon={<LockIcon size={20} className="opacity-50 pr-1" />}
        error={errors.password}
        defaultValue="83r5^_"
      />

      {isError && <p>{error.message}</p>}

      <button className="btn btn-primary w-full" type="submit" disabled={isPending}>
        {isPending ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
