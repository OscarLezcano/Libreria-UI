"use client";

import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import { getCouponsPageRequest } from "@/common/services/coupons";
import { useQuery } from "@tanstack/react-query";
import { BadgePercent, Plus } from "lucide-react";
import Link from "next/link";

function formatDate(value: string | null): string {
  if (!value) return "Sin límite";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("es-PY", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function couponStatus(validFrom: string | null, validUntil: string | null) {
  const now = Date.now();
  if (validFrom && new Date(validFrom).getTime() > now) {
    return { label: "Programado", className: "badge-info" };
  }
  if (validUntil && new Date(validUntil).getTime() < now) {
    return { label: "Vencido", className: "badge-error" };
  }
  return { label: "Vigente", className: "badge-success" };
}

export default function SellerCouponsPage() {
  const couponsQuery = useQuery({
    queryKey: ["coupons", 1],
    queryFn: () => getCouponsPageRequest(1, 100),
  });
  const coupons = couponsQuery.data?.coupons ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Cupones</h1>
          <p className="text-base-content/60 mt-1 text-sm">
            Descuentos por porcentaje, vigencia y libros seleccionados.
          </p>
        </div>
        <Link href="/vendedor/cupones/nuevo" className="btn btn-primary">
          <Plus className="size-4" strokeWidth={2.5} />
          Nuevo cupón
        </Link>
      </div>

      <section className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-base-content/60">
            <BadgePercent className="size-4" strokeWidth={2} />
            Cupones registrados
          </h2>

          {couponsQuery.isPending ? (
            <LoadingSpinner label="Cargando cupones" />
          ) : couponsQuery.isError ? (
            <NotificationToast
              type="error"
              message={
                couponsQuery.error instanceof Error
                  ? couponsQuery.error.message
                  : "No se pudieron cargar los cupones."
              }
            />
          ) : coupons.length === 0 ? (
            <p className="text-base-content/60 py-8 text-center text-sm">
              Todavía no hay cupones. Creá el primero desde “Nuevo cupón”.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descuento</th>
                    <th>Vigencia</th>
                    <th>Libros</th>
                    <th>Uso</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => {
                    const status = couponStatus(
                      coupon.validFrom,
                      coupon.validUntil
                    );
                    return (
                      <tr key={coupon.id}>
                        <td className="font-bold">{coupon.code}</td>
                        <td>{coupon.discountPercent}%</td>
                        <td className="text-xs">
                          <div>Desde: {formatDate(coupon.validFrom)}</div>
                          <div>Hasta: {formatDate(coupon.validUntil)}</div>
                        </td>
                        <td>
                          {coupon.bookIds.length === 0
                            ? "Todo el pedido"
                            : `${coupon.bookIds.length} libro(s)`}
                        </td>
                        <td>
                          <span className="badge badge-soft badge-sm">
                            {coupon.singleUsePerUser
                              ? "1 por usuario"
                              : "Ilimitado"}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-sm ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
