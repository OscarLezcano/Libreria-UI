"use client";

import AdminNavbar from "@/common/components/AdminNavbar";
import SupplierForm from "@/common/components/SupplierForm";
import { SUPPLIERS, type Supplier } from "@/common/data/suppliers";
import { Plus, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";

export default function AdminProveedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS);
  const [query, setQuery] = useState("");
  const modalRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.ruc.toLowerCase().includes(q)
    );
  }, [suppliers, query]);

  const openNew = () => {
    setEditing(null);
    modalRef.current?.showModal();
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    modalRef.current?.showModal();
  };

  const handleSubmit = (data: Omit<Supplier, "id">) => {
    if (editing) {
      setSuppliers((current) =>
        current.map((s) => (s.id === editing.id ? { ...s, ...data } : s))
      );
    } else {
      const nextId =
        String(Math.max(0, ...suppliers.map((s) => Number(s.id))) + 1);
      setSuppliers((current) => [...current, { id: nextId, ...data }]);
    }
    modalRef.current?.close();
  };

  const toggleActive = (id: string) =>
    setSuppliers((current) =>
      current.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );

  return (
    <div className="bg-base-200 min-h-dvh">
      <AdminNavbar active="Proveedores" initials="HA" />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Proveedores</h1>
            <p className="text-base-content/60 mt-1 text-sm">
              Administrá los proveedores de libros del catálogo
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={openNew}>
            <Plus className="size-4" strokeWidth={2.5} />
            Nuevo Proveedor
          </button>
        </div>

        <section className="card bg-base-100 card-border">
          <div className="card-body">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                Lista de proveedores
              </h2>
              <label className="input input-sm w-full sm:w-72">
                <Search className="size-4 opacity-50" strokeWidth={2} />
                <input
                  type="search"
                  placeholder="Buscar por nombre, RUC o contacto..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Buscar proveedores"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>RUC</th>
                    <th>Teléfono</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-base-content/60 py-8 text-center text-sm"
                      >
                        No se encontraron proveedores.
                      </td>
                    </tr>
                  )}
                  {filtered.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="cursor-pointer hover:bg-base-200"
                      onClick={() => openEdit(supplier)}
                    >
                      <td>
                        <p className="font-semibold">{supplier.name}</p>
                        {supplier.email && (
                          <p className="text-base-content/60 text-xs">
                            {supplier.email}
                          </p>
                        )}
                      </td>
                      <td className="font-mono text-xs">{supplier.ruc}</td>
                      <td className="text-sm">{supplier.phone ?? "—"}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          className={`link text-xs font-bold ${
                            supplier.active ? "link-error" : "link-primary"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActive(supplier.id);
                          }}
                        >
                          {supplier.active ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="mb-4 text-lg font-bold">
            {editing ? "Editar Proveedor" : "Nuevo Proveedor"}
          </h3>
          <SupplierForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => modalRef.current?.close()}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
