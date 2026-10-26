"use client";

import AdminNavbar from "@/common/components/AdminNavbar";
import Pagination from "@/common/components/Pagination";
import { getBook } from "@/common/data/books";
import {
  PURCHASE_ORDERS,
  orderTotal,
  orderUnits,
} from "@/common/data/purchaseOrders";
import {
  PURCHASE_STATUS_META,
  PURCHASE_STATUS_OPTIONS,
  type PurchaseStatus,
} from "@/common/data/suppliers";
import { formatGs } from "@/common/utils/format";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const PAGE_SIZE = 5;

function bookSummary(bookId: string): string {
  const book = getBook(bookId);
  return book ? book.title : bookId;
}

export default function AdminComprasPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PurchaseStatus>(
    "ALL"
  );
  const [page, setPage] = useState(1);
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PURCHASE_ORDERS.filter((order) => {
      const matchesQuery =
        !q ||
        order.invoiceNumber.toLowerCase().includes(q) ||
        order.supplierName.toLowerCase().includes(q) ||
        order.id.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="bg-base-200 min-h-dvh">
      <AdminNavbar active="Compras" initials="HA" />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Compras</h1>
            <p className="text-base-content/60 mt-1 text-sm">
              Historial de órdenes de compra a proveedores
            </p>
          </div>
          <Link href="/admin/compras/nueva" className="btn btn-primary">
            <Plus className="size-4" strokeWidth={2.5} />
            Nueva Compra
          </Link>
        </div>

        <section className="card bg-base-100 card-border">
          <div className="card-body">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                Lista de compras
              </h2>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="input input-sm w-full sm:w-64">
                  <Search className="size-4 opacity-50" strokeWidth={2} />
                  <input
                    type="search"
                    placeholder="Factura, proveedor o ID..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    aria-label="Buscar compras"
                  />
                </label>
                <select
                  className="select select-sm w-full sm:w-44"
                  value={statusFilter}
                  aria-label="Filtrar por estado"
                  onChange={(e) => {
                    setStatusFilter(e.target.value as "ALL" | PurchaseStatus);
                    setPage(1);
                  }}
                >
                  <option value="ALL">Todos los estados</option>
                  {PURCHASE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Nº Factura</th>
                    <th>Proveedor</th>
                    <th>Fecha</th>
                    <th>Ítems</th>
                    <th className="text-right">Total (Gs)</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-base-content/60 py-8 text-center text-sm"
                      >
                        No se encontraron compras con esos filtros.
                      </td>
                    </tr>
                  )}
                  {visible.map((order) => {
                    const meta = PURCHASE_STATUS_META[order.status];
                    return (
                      <tr
                        key={order.id}
                        className="cursor-pointer hover:bg-base-200"
                        onClick={() =>
                          router.push(`/admin/compras/nueva?id=${order.id}`)
                        }
                      >
                        <td className="font-semibold">{order.invoiceNumber}</td>
                        <td>{order.supplierName}</td>
                        <td>{order.date}</td>
                        <td>
                          <span
                            className="text-base-content/70 text-xs"
                            title={order.items
                              .map(
                                (item) =>
                                  `${item.quantity} × ${bookSummary(item.bookId)}`
                              )
                              .join(", ")}
                          >
                            {order.items.length} título
                            {order.items.length > 1 ? "s" : ""} ·{" "}
                            {orderUnits(order)} u.
                          </span>
                        </td>
                        <td className="text-right font-semibold">
                          {formatGs(orderTotal(order))}
                        </td>
                        <td>
                          <span className={`badge badge-sm ${meta.badge}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="link link-error text-xs font-bold"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Anular
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
