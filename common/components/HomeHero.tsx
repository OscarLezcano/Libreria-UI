import { Search } from "lucide-react";

export default function HomeHero() {
  return (
    <section className="bg-base-200">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-14 md:flex-row md:px-8 lg:py-20">
        <div className="flex-1 text-center md:text-left">
          <h1 className="mb-4 text-4xl font-extrabold leading-tight lg:text-5xl">
            Buenos viejos
            <br />
            libros para ti
          </h1>
          <p className="text-base-content/70 mx-auto mb-6 max-w-md leading-relaxed md:mx-0">
            Encontrá y leé más libros que te encantarán y llevá un registro de
            los que querés leer.
          </p>
          <label className="input w-full max-w-md">
            <Search className="size-4 opacity-50" strokeWidth={2} />
            <input
              type="search"
              placeholder="Buscar título, autor o género..."
              aria-label="Buscar libros"
            />
          </label>
        </div>
        <div className="hidden shrink-0 md:block">
          <img
            src="https://picsum.photos/seed/bigbookcover/300/400"
            alt="Libro destacado"
            className="aspect-[3/4] w-56 rounded-box shadow-2xl object-cover lg:w-64"
          />
        </div>
      </div>
    </section>
  );
}
