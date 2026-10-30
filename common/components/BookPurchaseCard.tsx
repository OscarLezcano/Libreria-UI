"use client";

import AddToCartButton from "@/common/components/AddToCartButton";
import QuantitySelector from "@/common/components/QuantitySelector";
import { useState } from "react";

interface BookPurchaseCardProps {
  bookId: string;
  price: number;
}

const formatGs = (value: number) =>
  new Intl.NumberFormat("es-PY").format(value);

export default function BookPurchaseCard({
  bookId,
  price,
}: BookPurchaseCardProps) {
  const [quantity, setQuantity] = useState(1);
  const total = price * quantity;

  return (
    <div className="card bg-base-100 card-border">
      <div className="card-body gap-4">
        <div className="flex items-baseline justify-between">
          <span className="text-primary text-2xl font-extrabold">
            {formatGs(price)} Gs
          </span>
          <span className="text-base-content/60 text-xs">precio por unidad</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-bold">Cantidad</span>
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            label="Cantidad"
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-base-content/60">Total</span>
          <span className="font-extrabold">{formatGs(total)} Gs</span>
        </div>
        <AddToCartButton bookId={bookId} quantity={quantity} />
      </div>
    </div>
  );
}
