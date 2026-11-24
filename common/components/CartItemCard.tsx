"use client";

import QuantitySelector from "@/common/components/QuantitySelector";
import { formatGs } from "@/common/utils/format";
import { Trash2 } from "lucide-react";
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
      <div className="card-body items-start gap-4 p-4 sm:card-side sm:items-center">
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
        <QuantitySelector
          value={quantity}
          onChange={onQuantityChange}
          label={`Cantidad de ${title}`}
        />
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
