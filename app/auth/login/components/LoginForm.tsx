'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginInputSchema } from '@/common/schemas/auth/LoginInputSchema';
import type { loginInputType } from '@/common/schemas/auth/LoginInputSchema';
import { useLogin } from '@/common/hooks/useAuth';
import { User as UserIcon } from "lucide-react";
import { Lock as LockIcon } from "lucide-react";
import z from 'zod';
import InputText from '@/common/components/InputText';

export default function LoginForm() {
  const router = useRouter();
  const { mutate, isPending, isError, error } = useLogin();
  const [errors, setErrors] = useState<Partial<loginInputType>>({});

  function handleSubmit(formData: FormData) {
    const validation = loginInputSchema.safeParse(Object.fromEntries(formData));
    if (!validation.success) {
      const fieldErrors = z.treeifyError(validation.error).properties;
      setErrors({
        email: fieldErrors?.email?.errors?.[0],
        password: fieldErrors?.password?.errors?.[0],
      });
      return;
    }

    mutate(validation.data, {
      onSuccess: () => router.push('/'),
    });
  }

  return (
    <form action={handleSubmit}>
      <InputText
        label="Correo electrónico"
        name="email"
        type="email"
        placeholder="tu@correo.com"
        icon={<UserIcon size={20} className="opacity-50" />}
        error={errors.email}
      />

      <InputText
        label="Contraseña"
        name="password"
        type="password"
        placeholder="Contraseña"
        icon={<LockIcon size={20} className="opacity-50 pr-1" />}
        error={errors.password}
      />

      {isError && <p>{error.message}</p>}

      <button className="btn btn-primary w-full" type="submit" disabled={isPending}>
        {isPending ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
