import HomeFooter from "@/common/components/HomeFooter";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col bg-base-100">
      <ReaderNavbar />

      <section className="hero flex-1 bg-base-200 px-4 py-14 sm:py-20">
        <div className="hero-content mx-auto flex w-full max-w-3xl">
          <div className="max-w-xl text-center">
            <p className="mb-3 text-7xl font-black tracking-tight text-primary sm:text-8xl">
              404
            </p>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              Página no encontrada
            </h1>
            <p className="text-base-content/70 mx-auto mt-5 max-w-lg leading-relaxed">
              Lo sentimos, no pudimos encontrar la página que estás buscando.
              Puede que la dirección haya cambiado.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/" className="btn">
                <ArrowLeft aria-hidden="true" className="size-4" />
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HomeFooter />
    </main>
  );
}
