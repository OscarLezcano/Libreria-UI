"use client";

import { useCart } from "@/common/context/CartContext";
import { couponDiscount, findCoupon } from "@/common/data/coupons";
import Link from "next/link";
import { useState } from "react";

interface OrderSummaryProps {
  subtotal: number;
}

const formatGs = (value: number) =>
  new Intl.NumberFormat("es-PY").format(value);

export default function OrderSummary({ subtotal }: OrderSummaryProps) {
  const { coupon, setCoupon } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const appliedCoupon = coupon ? findCoupon(coupon) : undefined;
  const discount = appliedCoupon ? couponDiscount(appliedCoupon, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = () => {
    const found = findCoupon(couponCode);
    if (found) {
      setCoupon(found.code);
      setError(null);
    } else {
      setCoupon(null);
      setError("Cupón inválido. Verificá el código e intentá de nuevo.");
    }
  };

  return (
    <div className="card bg-base-100 card-border">
      <div className="card-body gap-2">
        <h2 className="card-title text-base">Resumen del pedido</h2>
        <div className="flex justify-between py-2 text-sm">
          <span className="text-base-content/60">Subtotal</span>
          <span className="font-semibold">{formatGs(subtotal)} Gs</span>
        </div>

        <div className="border-t border-base-300 py-3">
          <label className="text-sm font-bold" htmlFor="coupon-input">
            Cupón de descuento
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="coupon-input"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Escribí tu cupón"
              className="input input-sm flex-1 uppercase"
            />
            <button
              className="btn btn-outline btn-sm"
              onClick={applyCoupon}
              disabled={!couponCode.trim()}
            >
              Aplicar
            </button>
          </div>
          {error && (
            <p className="text-error mt-2 text-xs" role="alert">
              {error}
            </p>
          )}
          {appliedCoupon && (
            <p className="text-success mt-2 text-xs">
              {appliedCoupon.code}: {appliedCoupon.description}
            </p>
          )}
        </div>

        <div className="flex justify-between py-2 text-sm">
          <span className="text-base-content/60">Descuento</span>
          <span className="font-semibold">
            {formatGs(discount)} Gs
          </span>
        </div>
        <div className="flex justify-between border-t border-base-300 py-3 text-base font-extrabold">
          <span>Total</span>
          <span>{formatGs(total)} Gs</span>
        </div>
        <Link
          href="/checkout"
          className={`btn btn-block ${total === 0 ? "btn-disabled" : "btn-primary"}`}
          tabIndex={total === 0 ? -1 : 0}
          role="button"
          aria-disabled={total === 0}
        >
          Continuar
        </Link>
      </div>
    </div>
  );
}
