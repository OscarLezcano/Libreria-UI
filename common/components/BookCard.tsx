import { ShoppingCart } from "lucide-react";
import Link from "next/link";

interface BookCardProps {
  coverSrc: string;
  price: number;
  title: string;
  authors: string[];
  description: string;
  href?: string;
}

export default function BookCard({
  coverSrc,
  price,
  title,
  authors,
  description,
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
          {new Intl.NumberFormat("es-PY").format(price)} Gs
        </h2>
        <h3 className="text-sm font-bold leading-snug">{title}</h3>
        <p className="text-base-content/70 text-xs font-semibold">
          {authors.join(", ")}
        </p>
        <p className="text-base-content/60 text-xs leading-relaxed">
          {description}
        </p>
        <div className="card-actions mt-2">
          <button className="btn btn-neutral btn-sm btn-block">
            <ShoppingCart className="size-4" strokeWidth={2} />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
