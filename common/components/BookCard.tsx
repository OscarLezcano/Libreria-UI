import AddToCartButton from "@/common/components/AddToCartButton";
import Link from "next/link";

interface BookCardProps {
  bookId: string;
  coverSrc: string;
  price: number | null;
  title: string;
  authors: string[];
  href?: string;
}

export default function BookCard({
  bookId,
  coverSrc,
  price,
  title,
  authors,
  href,
}: BookCardProps) {
  const cover = (
    <img
      src={coverSrc}
      alt={title}
      className="aspect-[3/4] w-full object-cover"
    />
  );

  return (
    <div className="card bg-base-100 card-border border-base-300 overflow-hidden">
      <figure>
        {href ? (
          <Link href={href} aria-label={title}>
            {cover}
          </Link>
        ) : (
          cover
        )}
      </figure>
      <div className="card-body gap-1 p-4">
        <h2 className="text-primary card-title text-base font-extrabold">
          {price === null
            ? "Precio no disponible"
            : `${new Intl.NumberFormat("es-PY").format(price)} Gs`}
        </h2>
        <h3 className="text-sm font-bold leading-snug">{title}</h3>
        <p className="text-base-content/70 text-xs font-semibold">
          {authors.join(", ")}
        </p>
        <div className="card-actions mt-2">
          <AddToCartButton
            bookId={bookId}
            label="Agregar"
            className="btn-sm btn-block"
            disabled={price === null}
          />
        </div>
      </div>
    </div>
  );
}
