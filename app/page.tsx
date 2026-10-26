import BookCard from "@/common/components/BookCard";
import HomeFooter from "@/common/components/HomeFooter";
import HomeHero from "@/common/components/HomeHero";
import Pagination from "@/common/components/Pagination";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { BOOKS } from "@/common/data/books";
import Link from "next/link";

const PROMO_COVERS = [
  "https://picsum.photos/seed/promo1/200/300",
  "https://picsum.photos/seed/promo2/200/300",
  "https://picsum.photos/seed/promo3/200/300",
  "https://picsum.photos/seed/promo4/200/300",
  "https://picsum.photos/seed/promo5/200/300",
  "https://picsum.photos/seed/promo6/200/300",
];

export default function Home() {
  return (
    <main className="bg-base-100 min-h-screen">
      <ReaderNavbar active="inicio" initials="HA" />

      <HomeHero />

      <section className="mx-auto max-w-6xl px-4 pt-12 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-extrabold">
          Libros más vendidos
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BOOKS.map((book) => (
            <BookCard
              key={book.id}
              href={`/book/${book.id}`}
              coverSrc={book.coverSrc}
              price={book.price}
              title={book.title}
              authors={book.authors}
              description={book.shortDescription}
            />
          ))}
        </div>
        <Pagination totalPages={4} />
      </section>

      <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 md:flex-row md:px-8">
        <div className="grid w-full max-w-xs shrink-0 grid-cols-3 gap-2">
          {PROMO_COVERS.map((src) => (
            <img
              key={src}
              src={src}
              alt="Portada de libro"
              className="aspect-[2/3] w-full rounded-lg object-cover"
            />
          ))}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-extrabold leading-snug">
            ¡Tus libros
            <br />
            <span className="text-primary">favoritos aquí!</span>
          </h2>
          <p className="text-base-content/60 mx-auto mt-4 max-w-md leading-relaxed md:mx-0">
            Encontrá las historias que te apasionan, los autores que admirás y
            los géneros que marcan tendencia.
          </p>
          <Link href="/explorar" className="btn btn-primary mt-6">
            Explorar
          </Link>
        </div>
      </section>

      <HomeFooter />
    </main>
  );
}
