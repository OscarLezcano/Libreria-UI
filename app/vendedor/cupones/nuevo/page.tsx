"use client";

import CouponForm from "@/common/components/CouponForm";

export default function NewCouponPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">Nuevo cupón</h1>
        <p className="text-base-content/60 mt-1 text-sm">
          El cupón se valida también en el checkout antes de confirmar el pago.
        </p>
      </div>
      <CouponForm />
    </main>
  );
}
