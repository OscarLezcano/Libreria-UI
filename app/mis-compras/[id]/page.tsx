"use client";

import HomeFooter from "@/common/components/HomeFooter";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { getBook } from "@/common/data/books";
import { getMyOrders } from "@/common/services/sales";
import { formatGs } from "@/common/utils/format";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STATUS_META: Record<string, { label: string; badge: string }> = {
  PENDING: { label: "Pendiente", badge: "badge-warning" },
  PAID: { label: "Pagado", badge: "badge-info" },
  APPROVED: { label: "Aprobado", badge: "badge-success" },
  COMPLETED: { label: "Completado", badge: "badge-success" },
  SHIPPED: { label: "Enviado", badge: "badge-info" },
  CANCELLED: { label: "Cancelado", badge: "badge-error" },
  CANCELED: { label: "Cancelado", badge: "badge-error" },
};

function getMeta(status: string) {
  const key = (status || "").toUpperCase();
  return STATUS_META[key] || { label: status || "Desconocido", badge: "badge-ghost" };
}

export default function MisCompraDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getMyOrders();
        const list = Array.isArray(data) ? data : [];
        const found = list.find((o: any) => String(o?.id) === String(id));
        if (!found) throw new Error("Pedido no encontrado");
        if (!cancelled) setOrder(found);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error al cargar detalle");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const items = order?.orderDetails || order?.order_details || order?.items || [];
  const meta = getMeta(order?.status);
  const dateRaw = order?.createdAt || order?.created_at || order?.date;
  const date = dateRaw ? new Date(dateRaw).toLocaleDateString("es-PY") : "-";
  const total = order?.totalPrice ?? order?.total ?? order?.subtotal ?? 0;

  return (
    <main className="bg-base-100 flex min-h-dvh flex-col">
      <ReaderNavbar active="compras" />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Detalle del pedido #{id}</h1>
            <p className="text-base-content/60 mt-1 text-sm">
              {loading ? "\u00A0" : `Fecha: ${date}`}
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>
            Volver
          </button>
        </div>

        {loading && (
          <div className="flex flex-1 items-center justify-center">
            <LoadingSpinner label="Cargando pedido" />
          </div>
        )}

        {!loading && !error && order && (
          <>
            <div className="card bg-base-100 card-border mb-6 min-w-[720px]">
              <div className="card-body flex flex-row items-center justify-between">
                <div>
                  <div className="text-base-content/60 text-sm">Estado</div>
                  <span className={`badge mt-1 ${meta.badge}`}>{meta.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-base-content/60 text-sm">Total</div>
                  <div className="text-lg font-extrabold">{formatGs(Number(total))}</div>
                </div>
              </div>
            </div>

            <section className="card bg-base-100 card-border min-w-[720px]">
              <div className="card-body">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-base-content/60">
                  Productos
                </h2>
                <div className="overflow-x-auto">
                  <table className="table table-md w-full min-w-[720px]">
                    <thead>
                      <tr>
                        <th>Libro</th>
                        <th className="text-right">Precio unitario</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(items) && items.map((item: any, idx: number) => {
                        const bookId = item?.bookId ?? item?.book_id;
                        const book = bookId ? getBook(String(bookId)) : null;
                        const title = item?.bookName ?? book?.title ?? `Libro ${bookId ?? idx}`;
                        const price = Number(item?.unitPrice ?? item?.price ?? book?.price ?? 0);
                        const qty = Number(item?.quantity ?? 1);
                        const href = book ? `/book/${book.id}` : "#";

                        return (
                          <tr key={item?.id || idx}>
                            <td>
                              <div className="flex items-center gap-3">
                                {book?.coverSrc && (
                                  <div className="avatar">
                                    <div className="mask mask-squircle h-12 w-12">
                                      <img src={book.coverSrc} alt={title} />
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <Link href={href} className="link link-hover font-semibold">
                                    {title}
                                  </Link>
                                  {book?.authors?.length ? (
                                    <div className="text-base-content/60 text-xs">
                                      {book.authors.join(", ")}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            <td className="text-right">{formatGs(price)}</td>
                            <td className="text-center">{qty}</td>
                            <td className="text-right font-semibold">{formatGs(price * qty)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <HomeFooter />
    </main>
  );
}
