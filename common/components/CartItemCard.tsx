"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface CartItemCardProps {
  coverSrc: string;
  title: string;
  authors: string[];
  unitPrice: number | null;
  quantity: number;
  href: string;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

const formatGs = (value: number) =>
  new Intl.NumberFormat("es-PY").format(value);

export default function CartItemCard({
  coverSrc,
  title,
  authors,
  unitPrice,
  quantity,
  href,
  onQuantityChange,
  onRemove,
}: CartItemCardProps) {
  return (
    <div className="card bg-base-100 card-border">
      <div className="card-body card-side items-center gap-4 p-4">
        <Link href={href} aria-label={title} className="shrink-0">
          <img
            src={coverSrc}
            alt={title}
            className="aspect-[3/4] w-16 rounded-lg object-cover"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold">{title}</h3>
          <p className="text-base-content/60 mt-0.5 text-xs font-semibold">
            {authors.join(", ")}
          </p>
          <p className="text-base-content/60 mt-1 text-xs">
            {unitPrice === null
              ? "Precio no disponible"
              : `${formatGs(unitPrice)} Gs por unidad`}
          </p>
        </div>
        <div className="join shrink-0">
          <button
            className="btn btn-neutral join-item btn-sm"
            aria-label={`Quitar una unidad de ${title}`}
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          >
            <Minus className="size-3" strokeWidth={2.5} />
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            aria-label={`Cantidad de ${title}`}
            onChange={(e) =>
              onQuantityChange(Math.max(1, Number(e.target.value) || 1))
            }
            className="input input-sm join-item w-14 text-center"
          />
          <button
            className="btn btn-neutral join-item btn-sm"
            aria-label={`Agregar una unidad de ${title}`}
            onClick={() => onQuantityChange(quantity + 1)}
          >
            <Plus className="size-3" strokeWidth={2.5} />
          </button>
        </div>
        <div className="w-28 shrink-0 text-right">
          <p className="text-sm font-extrabold">
            {unitPrice === null
              ? "No disponible"
              : `${formatGs(unitPrice * quantity)} Gs`}
          </p>
        </div>
        <button
          className="btn btn-ghost btn-circle btn-sm text-error shrink-0"
          aria-label={`Eliminar ${title} del carrito`}
          onClick={onRemove}
        >
          <Trash2 className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
