'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { loginInputSchema } from '@/common/schemas/auth/LoginInputSchema';
import type { loginInputType } from '@/common/schemas/auth/LoginInputSchema';
import { useLogin } from '@/common/hooks/useAuth';
import { User as UserIcon } from "lucide-react";
import { Lock as LockIcon } from "lucide-react";
import { useRouter } from 'next/navigation';
import NotificationToast from '@/common/components/NotificationToast';
import z from 'zod';
import InputText from '@/common/components/InputText';

export default function LoginForm({
  authRequiredNotice = false,
}: {
  authRequiredNotice?: boolean;
}) {
  const { mutateAsync, isPending } = useLogin();
  const router = useRouter();
  const [errors, setErrors] = useState<Partial<loginInputType>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [showAuthNotice, setShowAuthNotice] = useState(authRequiredNotice);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const formData = new FormData(event.currentTarget);
    const validation = loginInputSchema.safeParse(Object.fromEntries(formData));
    if (!validation.success) {
      const fieldErrors = z.treeifyError(validation.error).properties;
      setErrors({
        email: fieldErrors?.email?.errors?.[0],
        password: fieldErrors?.password?.errors?.[0],
      });
      return;
    }

    setErrors({});
    try {
      await mutateAsync(validation.data);
      const next = new URLSearchParams(window.location.search).get('next');
      const requestedUrl = next
        ? new URL(next, window.location.origin)
        : null;
      const destination =
        requestedUrl?.origin === window.location.origin
          ? `${requestedUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`
          : '/explorar';
      router.replace(destination);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión. Intentá nuevamente.'
      );
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {showAuthNotice && (
        <NotificationToast
          type="info"
          message="Necesitás iniciar sesión para acceder a ese recurso."
          placement="toast"
          onClose={() => setShowAuthNotice(false)}
        />
      )}
      <InputText
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="correo@ejemplo.com"
        icon={<UserIcon size={20} className="opacity-50" />}
        error={errors.email}
      />

      <InputText
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="Contraseña"
        icon={<LockIcon size={20} className="opacity-50 pr-1" />}
        error={errors.password}
      />

      {serverError && (
        <NotificationToast
          type="error"
          message={serverError}
          className="mb-4 text-sm"
        />
      )}

      <button
        className="btn btn-primary w-full"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
