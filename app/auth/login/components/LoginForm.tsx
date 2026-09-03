'use client';

import { useState } from 'react';
import { loginInputSchema } from '@/schemas/auth/LoginInputSchema';
import type { loginInputType } from '@/schemas/auth/LoginInputSchema';
import { useLogin } from '@/hooks/useAuth';
import { User as UserIcon} from "lucide-react";
import { Lock as LockIcon} from "lucide-react";
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
            <label className="text-sm font-bold">Correo electrónico</label>
            <label className="input mb-4 w-full">
                <UserIcon size={20} className="opacity-50" />
                <input placeholder="Usuario" name="username" type="text" defaultValue={"mor_2314"}/>
            </label>
            {/* {errors.username && <span>{errors.username}</span>} */}
        </div>

        <div>
            <label className="text-sm font-bold">Contraseña</label>
            <label className="input mb-4 w-full">
                <LockIcon size={20} className="opacity-50 pr-1" />
                <input placeholder="Contraseña" name="password" type="password" defaultValue={"83r5^_"}/>
            </label>
            {/* {errors.password && <span>{errors.password}</span>} */}
        </div>

        {isError && <p>{error.message}</p>}

        <button className="btn btn-primary w-full" type="submit" disabled={isPending}>
          {isPending ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>
  );
}
