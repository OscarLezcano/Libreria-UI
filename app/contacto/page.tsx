"use client";

import HomeFooter from "@/common/components/HomeFooter";
import NotificationToast from "@/common/components/NotificationToast";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { sendContactRequest } from "@/common/services/contact";
import { Mail, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function ContactoPage() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const data = {
      name: String(values.name ?? "").trim(),
      email: String(values.email ?? "").trim(),
      subject: String(values.subject ?? "").trim(),
      message: String(values.message ?? "").trim(),
    };
    if (Object.values(data).some((value) => !value)) {
      setError("Completá todos los campos para enviar tu consulta.");
      return;
    }

    setIsPending(true);
    try {
      await sendContactRequest(data);
      form.reset();
      setSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo enviar la consulta."
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="bg-base-100 flex min-h-dvh flex-col">
      <ReaderNavbar />
      <div className="mx-auto flex w-full max-w-3xl flex-1 px-4 py-10 lg:px-8">
        <section className="card card-border bg-base-100 w-full self-start">
          <div className="card-body">
            <div className="mb-4 flex items-start gap-3">
              <div className="bg-primary/10 text-primary rounded-box p-3">
                <Mail className="size-6" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">Contacto</h1>
                <p className="text-base-content/60 mt-1 text-sm">
                  Envianos tu consulta y te responderemos por correo.
                </p>
              </div>
            </div>

            {success && (
              <NotificationToast
                type="success"
                message="Tu consulta quedó registrada y pendiente de envío."
                className="mb-4"
                onClose={() => setSuccess(false)}
              />
            )}
            {error && (
              <NotificationToast
                type="error"
                message={error}
                className="mb-4"
                onClose={() => setError(null)}
              />
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Nombre</legend>
                  <input
                    className="input w-full"
                    name="name"
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder="Tu nombre"
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Correo electrónico</legend>
                  <input
                    className="input w-full"
                    name="email"
                    type="email"
                    required
                    maxLength={255}
                    autoComplete="email"
                    placeholder="correo@ejemplo.com"
                  />
                </fieldset>
              </div>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Asunto</legend>
                <input
                  className="input w-full"
                  name="subject"
                  required
                  maxLength={160}
                  placeholder="¿Sobre qué querés consultar?"
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Mensaje</legend>
                <textarea
                  className="textarea w-full"
                  name="message"
                  required
                  maxLength={5000}
                  rows={6}
                  placeholder="Escribí tu mensaje"
                />
              </fieldset>
              <button type="submit" className="btn btn-primary self-end" disabled={isPending}>
                {isPending ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <Send className="size-4" strokeWidth={2} />
                )}
                {isPending ? "Enviando..." : "Enviar mensaje"}
              </button>
            </form>
          </div>
        </section>
      </div>
      <HomeFooter />
    </main>
  );
}
