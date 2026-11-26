import Link from "next/link";

export default function HomeFooter() {
  return (
    <footer className="mt-auto bg-neutral text-neutral-content">
      <div className="text-neutral-content/50 mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-6 py-4 text-center text-xs">
        <span>© 2026 BigBooks</span>
        <span aria-hidden="true">·</span>
        <Link href="/contacto" className="link link-hover text-neutral-content/70">
          Contacto
        </Link>
        <span aria-hidden="true">·</span>
        <span>Condiciones de uso · Política de privacidad</span>
      </div>
    </footer>
  );
}
