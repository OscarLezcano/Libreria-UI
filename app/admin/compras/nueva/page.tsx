"use client";

import AdminNavbar from "@/common/components/AdminNavbar";
import PurchaseItemsSection, {
  type PurchaseItem,
} from "@/common/components/PurchaseItemsSection";
import { getBook } from "@/common/data/books";
import { PURCHASE_ORDERS } from "@/common/data/purchaseOrders";
import {
  PURCHASE_STATUS_OPTIONS,
  SUPPLIERS,
  type PurchaseStatus,
} from "@/common/data/suppliers";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const DEFAULT_ITEMS: PurchaseItem[] = [
  { bookId: "mystery-of-the-lost-island", quantity: 10, unitCost: 68000 },
  { bookId: "cooking-made-easy", quantity: 5, unitCost: 45000 },
];

function NuevaCompraForm() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const order = orderId
    ? PURCHASE_ORDERS.find((o) => o.id === orderId)
    : undefined;

  const [supplierId, setSupplierId] = useState(order?.supplierId ?? "");
  const [invoiceNumber, setInvoiceNumber] = useState(
    order?.invoiceNumber ?? ""
  );
  const [status, setStatus] = useState<PurchaseStatus>(
    order?.status ?? "PENDING"
  );
  const [items, setItems] = useState<PurchaseItem[]>(
    order ? order.items.map((item) => ({ ...item })) : DEFAULT_ITEMS
  );

  const addItem = (bookId: string) => {
    const book = getBook(bookId);
    if (!book || items.some((item) => item.bookId === bookId)) return;
    const suggestedCost = Math.round((book.price * 0.65) / 500) * 500;
    setItems((current) => [
      ...current,
      { bookId, quantity: 1, unitCost: suggestedCost },
    ]);
  };

  const removeItem = (bookId: string) =>
    setItems((current) =>
      current.filter((item) => item.bookId !== bookId)
    );

  const changeItem = (
    bookId: string,
    patch: Partial<Pick<PurchaseItem, "quantity" | "unitCost">>
  ) =>
    setItems((current) =>
      current.map((item) =>
        item.bookId === bookId ? { ...item, ...patch } : item
      )
    );

  return (
    <div className="bg-base-200 min-h-dvh">
      <AdminNavbar active="Compras" initials="HA" />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">
              {order ? `Compra ${order.id}` : "Registrar Nueva Compra"}
            </h1>
            <p className="text-base-content/60 mt-1 text-sm">
              {order
                ? `Factura ${order.invoiceNumber} · ${order.date}`
                : "Cargá la factura del proveedor y agregá los libros recibidos o pendientes."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/compras" className="btn btn-ghost">
              Cancelar
            </Link>
            <button type="button" className="btn btn-neutral">
              Guardar Compra
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <section className="card bg-base-100 card-border">
            <div className="card-body">
              <h2 className="card-title border-b border-base-200 pb-2 text-lg">
                Datos de la Factura y Proveedor
              </h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    Proveedor <span className="text-error">*</span>
                  </legend>
                  <div className="flex gap-2">
                    <select
                      className="select flex-1"
                      required
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                    >
                      <option value="" disabled>
                        Seleccione un proveedor
                      </option>
                      {SUPPLIERS.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} (RUC: {supplier.ruc})
                        </option>
                      ))}
                    </select>
                    <Link
                      href="/admin/proveedores"
                      className="btn btn-square"
                      title="Agregar proveedor"
                      aria-label="Agregar proveedor"
                    >
                      <Plus className="size-4" strokeWidth={2.5} />
                    </Link>
                  </div>
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    Nº Factura <span className="text-error">*</span>
                  </legend>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="Ej: 001-001-00001234"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    Estado de Compra <span className="text-error">*</span>
                  </legend>
                  <select
                    className="select"
                    required
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as PurchaseStatus)
                    }
                  >
                    {PURCHASE_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </fieldset>
              </div>
            </div>
          </section>

          <PurchaseItemsSection
            items={items}
            onAdd={addItem}
            onRemove={removeItem}
            onItemChange={changeItem}
          />
        </div>
      </main>
    </div>
  );
}

export default function NuevaCompraPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-base-200 flex min-h-dvh items-center justify-center">
          <span className="loading loading-dots loading-lg text-primary" />
        </div>
      }
    >
      <NuevaCompraForm />
    </Suspense>
  );
}
