"use client";

import { useCart } from "@/common/context/CartContext";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
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
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const total = price * quantity;

  const addToCart = () => {
    add(bookId, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

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
          <div className="join">
            <button
              className="btn btn-neutral join-item btn-sm"
              aria-label="Disminuir cantidad"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="size-3" strokeWidth={2.5} />
            </button>
            <input
              type="number"
              min={1}
              value={quantity}
              aria-label="Cantidad"
              onChange={(e) =>
                setQuantity(Math.max(1, Number(e.target.value) || 1))
              }
              className="input input-sm join-item w-16 text-center"
            />
            <button
              className="btn btn-neutral join-item btn-sm"
              aria-label="Aumentar cantidad"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="size-3" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-base-content/60">Total</span>
          <span className="font-extrabold">{formatGs(total)} Gs</span>
        </div>
        <button
          className={`btn btn-block ${added ? "btn-success" : "btn-neutral"}`}
          onClick={addToCart}
        >
          {added ? (
            <>
              <Check className="size-4" strokeWidth={2.5} />
              Agregado
            </>
          ) : (
            <>
              <ShoppingCart className="size-4" strokeWidth={2} />
              Agregar al carrito
            </>
          )}
        </button>
      </div>
    </div>
  );
}
