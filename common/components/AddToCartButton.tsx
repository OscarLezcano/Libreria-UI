"use client";

import { useCart } from "@/common/context/CartContext";
import { Check, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

interface AddToCartButtonProps {
  bookId: string;
  quantity?: number;
  label?: string;
  successLabel?: string;
  className?: string;
  disabled?: boolean;
}

export default function AddToCartButton({
  bookId,
  quantity = 1,
  label = "Agregar al carrito",
  successLabel = "Agregado",
  className = "btn-block",
  disabled = false,
}: AddToCartButtonProps) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1500);
    return () => window.clearTimeout(timer);
  }, [added]);

  const handleClick = () => {
    add(bookId, quantity);
    setAdded(true);
  };

  return (
    <>
      <button
        type="button"
        className={`btn ${className} ${added ? "btn-success" : "btn-neutral"}`}
        onClick={handleClick}
        disabled={disabled}
      >
        {added ? (
          <>
            <Check className="size-4" strokeWidth={2.5} />
            {successLabel}
          </>
        ) : (
          <>
            <ShoppingCart className="size-4" strokeWidth={2} />
            {label}
          </>
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {added ? `${successLabel}: libro agregado al carrito.` : ""}
      </span>
    </>
  );
}
