import BookPurchaseCard from "@/common/components/BookPurchaseCard";
import HomeFooter from "@/common/components/HomeFooter";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { getBook } from "@/common/data/books";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface BookDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params;
  const book = getBook(id);
  if (!book) notFound();

  return (
    <main className="bg-base-100 min-h-screen">
      <ReaderNavbar active="explorar" initials="HA" />

      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="py-5">
          <Link
            href="/"
            className="btn btn-ghost btn-sm -ml-2 text-sm font-semibold"
          >
            <ChevronLeft className="size-4" strokeWidth={2.5} />
            Volver al catálogo
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 pb-16 lg:grid-cols-[300px_minmax(0,1fr)_320px]">
          <div>
            <img
              src={book.coverSrc}
              alt={book.title}
              className="aspect-[3/4] w-full rounded-box shadow-2xl object-cover lg:w-72"
            />
          </div>

          <div className="max-w-xl">
            <div className="flex flex-wrap gap-2">
              {book.categories.map((category) => (
                <span key={category} className="badge badge-soft badge-primary">
                  {category}
                </span>
              ))}
            </div>
            <h1 className="mt-4 text-3xl font-extrabold">{book.title}</h1>
            <p className="text-primary mt-2 text-sm font-bold">
              {book.authors.join(", ")}
            </p>
            <p className="text-base-content/80 mt-6 leading-relaxed">
              {book.description}
            </p>
          </div>

          <aside className="self-start">
              <BookPurchaseCard
                bookId={book.id}
                price={book.price}
              />
          </aside>
        </div>
      </div>

      <HomeFooter />
    </main>
  );
}
