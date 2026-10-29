"use client";

import HomeFooter from "@/common/components/HomeFooter";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import Pagination from "@/common/components/Pagination";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import { getMyOrders } from "@/common/services/sales";
import { formatGs } from "@/common/utils/format";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PAGE_SIZE = 10;

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

export default function MisComprasPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getMyOrders();
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error al cargar compras");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = orders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <main className="bg-base-100 flex min-h-dvh flex-col">
      <ReaderNavbar active="compras" />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 lg:px-8">
        <h1 className="text-2xl font-extrabold">Mis compras</h1>
        <p className="text-base-content/60 mt-1 text-sm">
          Historial de pedidos
        </p>

        <section className="card bg-base-100 card-border mt-8 flex-1">
          <div className="card-body flex-1 flex flex-col">
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                Mis pedidos
              </h2>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="table table-md w-full min-w-[860px]">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Fecha</th>
                    <th>Ítems</th>
                    <th className="text-right">Total (Gs)</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={5} className="p-0 h-64">
                        <div className="flex h-full items-center justify-center">
                          <LoadingSpinner label="Cargando compras" />
                        </div>
                      </td>
                    </tr>
                  )}
                  {error && (
                    <tr>
                      <td colSpan={5} className="text-error py-8 text-center text-sm">
                        {error}
                      </td>
                    </tr>
                  )}
                  {!loading && !error && visible.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-base-content/60 py-8 text-center text-sm">
                        Aún no tenés compras.
                      </td>
                    </tr>
                  )}
                  {visible.map((order: any) => {
                    const items = order?.orderDetails || order?.order_details || order?.items || [];
                    const meta = getMeta(order?.status);
                    const dateRaw = order?.createdAt || order?.created_at || order?.date;
                    const date = dateRaw ? new Date(dateRaw).toLocaleDateString("es-PY") : "-";
                    const total = order?.totalPrice ?? order?.total ?? order?.subtotal ?? 0;
                    const units = Array.isArray(items)
                      ? items.reduce((acc: number, it: any) => acc + Number(it?.quantity || 0), 0)
                      : 0;

                    return (
                      <tr
                        key={order.id}
                        className="cursor-pointer hover:bg-base-200"
                        onClick={() => router.push(`/mis-compras/${order.id}`)}
                      >
                        <td className="font-semibold">#{order.id}</td>
                        <td>{date}</td>
                        <td>
                          <span className="text-base-content/70 text-xs">
                            {items.length} producto{items.length !== 1 ? "s" : ""} · {units} unidad{units !== 1 ? "es" : ""}
                          </span>
                        </td>
                        <td className="text-right font-semibold">{formatGs(Number(total))}</td>
                        <td>
                          <span className={`badge badge-sm ${meta.badge}`}>{meta.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
          </div>
        </section>
      </div>

      <HomeFooter />
    </main>
  );
}
