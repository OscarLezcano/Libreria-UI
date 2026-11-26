"use client";

import { useCart } from "@/common/context/CartContext";
import NotificationToast from "@/common/components/NotificationToast";
import { formatGs } from "@/common/utils/format";
import Link from "next/link";
import { useState } from "react";

interface OrderSummaryProps {
  subtotal: number;
  canCheckout?: boolean;
}

export default function OrderSummary({
  subtotal,
  canCheckout = true,
}: OrderSummaryProps) {
  const { coupon, setCoupon } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const checkoutDisabled = !canCheckout || subtotal <= 0;

  const applyCoupon = () => {
    const code = couponCode.trim();
    if (!code) {
      setError("Escribí un código de cupón.");
      return;
    }
    setCoupon(code);
    setCouponCode("");
    setError(null);
  };

  return (
    <div className="card bg-base-100 card-border">
      <div className="card-body gap-2">
        <h2 className="card-title text-base">Resumen del pedido</h2>

        <div className="border-t border-base-300 py-3">
          <label className="text-sm font-bold" htmlFor="coupon-input">
            Escribe tu cupón
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="coupon-input"
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setError(null);
              }}
              placeholder="Ingresa tu cupón"
              className="input input-sm flex-1 uppercase"
              aria-describedby="coupon-validation-note"
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={applyCoupon}
              disabled={!couponCode.trim()}
            >
              Guardar
            </button>
          </div>
          {error && (
            <NotificationToast type="error" message={error} className="mt-2 text-xs" />
          )}
          {coupon && (
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">Cupón: {coupon}</span>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => setCoupon(null)}
              >
                Quitar
              </button>
            </div>
          )}
          <p id="coupon-validation-note" className="text-base-content/60 mt-2 text-xs">
            El descuento y el total final se validan al crear el pedido.
          </p>
        </div>

        <div className="flex justify-between border-t border-base-300 py-3 text-base font-extrabold">
          <span>Subtotal</span>
          <span>{formatGs(subtotal)} Gs</span>
        </div>
        <Link
          href="/checkout"
          className={`btn btn-block ${checkoutDisabled ? "btn-disabled" : "btn-primary"}`}
          tabIndex={checkoutDisabled ? -1 : 0}
          aria-disabled={checkoutDisabled}
        >
          Continuar
        </Link>
      </div>
    </div>
  );
}
