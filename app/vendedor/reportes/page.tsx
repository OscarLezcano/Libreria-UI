"use client";

import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import { getBestSellingBooksRequest } from "@/common/services/reports";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Download } from "lucide-react";
import { useState } from "react";

function downloadCsv(books: Array<{ bookId: number; bookName: string; totalSold: number }>) {
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [
    ["Posicion", "ID Libro", "Libro", "Unidades vendidas"],
    ...books.map((book, index) => [index + 1, book.bookId, book.bookName, book.totalSold]),
  ];
  const csv = "\uFEFF" + rows.map((row) => row.map(escape).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "reporte-libros-mas-vendidos.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function VendedorReportesPage() {
  const [limit, setLimit] = useState(10);
  const reportQuery = useQuery({
    queryKey: ["best-selling-books", limit],
    queryFn: () => getBestSellingBooksRequest(limit),
  });
  const books = reportQuery.data ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Reportes</h1>
          <p className="text-base-content/60 mt-1 text-sm">
            Libros más vendidos en pedidos pagados
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Cantidad</legend>
            <select
              className="select select-sm"
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
              aria-label="Cantidad de libros del reporte"
            >
              {[5, 10, 20, 50].map((value) => (
                <option key={value} value={value}>
                  Top {value}
                </option>
              ))}
            </select>
          </fieldset>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={books.length === 0}
            onClick={() => downloadCsv(books)}
          >
            <Download className="size-4" strokeWidth={2} />
            Exportar CSV
          </button>
        </div>
      </div>

      <section className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-base-content/60">
            <BarChart3 className="size-4" strokeWidth={2} />
            Ranking de ventas
          </h2>
          {reportQuery.isPending ? (
            <LoadingSpinner label="Cargando reporte" />
          ) : reportQuery.isError ? (
            <NotificationToast
              type="error"
              message={
                reportQuery.error instanceof Error
                  ? reportQuery.error.message
                  : "No se pudo cargar el reporte."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Libro</th>
                    <th>ID</th>
                    <th className="text-right">Unidades vendidas</th>
                  </tr>
                </thead>
                <tbody>
                  {books.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-base-content/60 py-8 text-center text-sm">
                        Todavía no hay ventas pagadas para generar el reporte.
                      </td>
                    </tr>
                  )}
                  {books.map((book, index) => (
                    <tr key={book.bookId}>
                      <td className="font-bold">{index + 1}</td>
                      <td className="font-semibold">{book.bookName}</td>
                      <td className="text-base-content/60">{book.bookId}</td>
                      <td className="text-right font-bold">{book.totalSold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
