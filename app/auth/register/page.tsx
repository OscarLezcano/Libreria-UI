'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LockKeyhole, Mail, MapPin, UserRound } from 'lucide-react';
import { registerInputSchema, type RegisterInput } from '@/common/schemas/auth/RegisterInputSchema';
import { registerRequest } from '@/common/services/register';

export default function RegisterPage() {
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setMessage('');
    setServerError('');
    const result = registerInputSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      const nextErrors: Partial<Record<keyof RegisterInput, string>> = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof RegisterInput;
        if (!nextErrors[field]) nextErrors[field] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsPending(true);
    try {
      await registerRequest(result.data);
      setMessage('Cuenta creada correctamente. Ya puedes iniciar sesión.');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'No se pudo crear la cuenta');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-base-200 px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-xl lg:grid-cols-[.8fr_1.2fr]">
        <section className="hidden bg-neutral p-10 text-neutral-content lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="font-serif text-3xl font-bold">Bigo<span className="text-primary">Books</span></p>
            <p className="mt-1 text-xs uppercase tracking-[.25em] text-neutral-content/50">sistema unificado</p>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-primary">Tu librería, en orden</p>
            <h1 className="font-serif text-4xl font-bold leading-tight">Empieza a gestionar tu catálogo.</h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-neutral-content/60">Accede a compras, ventas e inventario desde una sola plataforma.</p>
          </div>
          <p className="text-xs text-neutral-content/40">Acceso protegido por API Gateway</p>
        </section>
        <section className="flex items-center p-6 sm:p-10">
          <div className="mx-auto w-full max-w-md">
            <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-primary">Crear cuenta</p>
            <h2 className="font-serif text-3xl font-bold">Bienvenido a BigoBooks</h2>
            <p className="mt-2 text-sm text-base-content/60">Completa tus datos para comenzar.</p>
            <form action={handleSubmit} className="mt-7 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre" name="name" placeholder="Tu nombre" icon={<UserRound size={17} />} error={errors.name} />
                <Field label="Apellido" name="lastName" placeholder="Tu apellido" icon={<UserRound size={17} />} error={errors.lastName} />
              </div>
              <Field label="Correo electrónico" name="email" type="email" placeholder="tu@correo.com" icon={<Mail size={17} />} error={errors.email} />
              <Field label="Contraseña" name="password" type="password" placeholder="Mínimo 6 caracteres" icon={<LockKeyhole size={17} />} error={errors.password} />
              <Field label="Ciudad" name="city" placeholder="Asunción" icon={<MapPin size={17} />} error={errors.city} />
              {serverError && <div role="alert" className="alert alert-error text-sm">{serverError}</div>}
              {message && <div role="status" className="alert alert-success text-sm">{message}</div>}
              <button className="btn btn-primary w-full" type="submit" disabled={isPending}>{isPending ? 'Creando cuenta...' : 'Crear cuenta'}</button>
            </form>
            <p className="mt-6 text-center text-sm text-base-content/60">¿Ya tienes una cuenta? <Link href="/auth/login" className="link link-primary font-semibold">Inicia sesión</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, name, placeholder, type = 'text', icon, error }: { label: string; name: keyof RegisterInput; placeholder: string; type?: string; icon: React.ReactNode; error?: string }) {
  return <label className="form-control w-full"><span className="label-text mb-2 text-sm font-semibold">{label}</span><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">{icon}</span><input name={name} type={type} placeholder={placeholder} className={`input input-bordered w-full pl-10 ${error ? 'input-error' : ''}`} /></div>{error && <span className="mt-1 text-xs text-error">{error}</span>}</label>;
}
