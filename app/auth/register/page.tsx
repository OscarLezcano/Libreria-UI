import Image from "next/image";
import Link from "next/link";
import RegisterForm from "@/common/components/RegisterForm";
import LoginImage from "@/public/images/login-image.png";

export default function RegisterPage() {
  return (
    <main className="bg-base-100 grid min-h-dvh grid-cols-1 md:grid-cols-2">
      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-lg">
          <Link href="/" className="text-base-content text-sm font-bold">
            BigBooks
          </Link>
          <h1 className="mt-8 text-3xl font-extrabold">Crear cuenta</h1>
          <p className="text-base-content/60 mb-6 mt-2 text-sm">
            Registrate para guardar tu carrito y completar tus compras.
          </p>
          <RegisterForm />
          <p className="text-base-content/60 mt-6 text-center text-sm">
            ¿Ya tenés una cuenta?{" "}
            <Link href="/auth/login" className="link link-primary font-semibold">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </section>
      <div className="relative hidden min-h-dvh md:block">
        <Image
          src={LoginImage}
          alt="Libros para descubrir"
          fill
          sizes="50vw"
          className="object-cover"
        />
      </div>
    </main>
  );
}
