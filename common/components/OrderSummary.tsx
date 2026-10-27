"use client";

import { useCart } from "@/common/context/CartContext";
import { couponDiscount, findCoupon } from "@/common/data/coupons";
import NotificationToast from "@/common/components/NotificationToast";
import Link from "next/link";
import { useState } from "react";

interface OrderSummaryProps {
  subtotal: number;
  canCheckout?: boolean;
}

const formatGs = (value: number) =>
  new Intl.NumberFormat("es-PY").format(value);

export default function OrderSummary({
  subtotal,
  canCheckout = true,
}: OrderSummaryProps) {
  const { coupon, setCoupon } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const appliedCoupon = coupon ? findCoupon(coupon) : undefined;
  const discount = appliedCoupon ? couponDiscount(appliedCoupon, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);
  const checkoutDisabled = !canCheckout || subtotal <= 0;

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
            <NotificationToast
              type="error"
              message={error}
              className="mt-2 text-xs"
            />
          )}
          {appliedCoupon && (
            <NotificationToast
              type="success"
              message={`${appliedCoupon.code}: ${appliedCoupon.description}`}
              className="mt-2 text-xs"
            />
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
          className={`btn btn-block ${checkoutDisabled ? "btn-disabled" : "btn-primary"}`}
          tabIndex={checkoutDisabled ? -1 : 0}
          role="button"
          aria-disabled={checkoutDisabled}
        >
          Continuar
        </Link>
      </div>
    </div>
  );
}
