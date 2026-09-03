'use client';

import { useState } from 'react';
import { loginInputSchema } from '@/schemas/auth/LoginInputSchema';
import type { loginInputType } from '@/schemas/auth/LoginInputSchema';
import { useLogin } from '@/hooks/useAuth';
import z from 'zod';

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
      <div>
        <input placeholder="Usuario" className="input" name="username" type="text" defaultValue={"mor_2314"}/>
        {errors.username && <span>{errors.username}</span>}
      </div>

      <div>
        <input placeholder="Contraseña" className="input" name="password" type="password" defaultValue={"83r5^_"}/>
        {errors.password && <span>{errors.password}</span>}
      </div>

      {isError && <p>{error.message}</p>}

      <button className="btn" type="submit" disabled={isPending}>
        {isPending ? 'Ingresando...' : 'Entrar'}
      </button>
    </form>
  );
}
