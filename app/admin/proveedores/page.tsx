"use client";

import SupplierForm from "@/common/components/SupplierForm";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import {
  createSupplierRequest,
  deleteSupplierRequest,
  getSuppliersRequest,
  type SupplierInput,
  type SupplierPage,
  type SupplierRecord,
  updateSupplierRequest,
} from "@/common/services/suppliers";
import Pagination from "@/common/components/Pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

const PAGE_SIZE = 25;

export default function AdminProveedoresPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const search = query.trim();
  const suppliersQuery = useQuery({
    queryKey: ["suppliers", page, search],
    queryFn: () => getSuppliersRequest(page, search),
  });
  const suppliers = suppliersQuery.data?.suppliers ?? [];
  const totalPages = suppliersQuery.data?.totalPages ?? 1;
  const totalElements = suppliersQuery.data?.totalElements ?? 0;
  const currentPage = Math.min(page, totalPages);
  const modalRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<SupplierRecord | null>(null);
  const [formSession, setFormSession] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const saveSupplierMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | null;
      data: SupplierInput;
    }) => (id ? updateSupplierRequest(id, data) : createSupplierRequest(data)),
    onSuccess: async (_supplier, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      modalRef.current?.close();
      setFormError(null);
      setSuccessMessage(
        variables.id
          ? "Proveedor actualizado correctamente."
          : "Proveedor creado correctamente."
      );
    },
    onError: (error) => {
      setFormError(
        error instanceof Error ? error.message : "No se pudo guardar el proveedor."
      );
    },
  });
  const deleteSupplierMutation = useMutation({
    mutationFn: deleteSupplierRequest,
    onSuccess: async () => {
      const currentPageData = queryClient.getQueryData<SupplierPage>([
        "suppliers",
        page,
        search,
      ]);
      if (page > 1 && currentPageData?.suppliers.length === 1) {
        setPage((current) => current - 1);
      }
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setSuccessMessage("Proveedor borrado correctamente.");
      setActionError(null);
    },
    onError: (error) => {
      setActionError(
        error instanceof Error
          ? error.message
          : "No se pudo borrar el proveedor."
      );
    },
  });
  const isLoading = suppliersQuery.isPending;
  const hasError = suppliersQuery.isError;

  const openNew = () => {
    setEditing(null);
    setFormSession((session) => session + 1);
    setFormError(null);
    setSuccessMessage(null);
    modalRef.current?.showModal();
  };

  const openEdit = (supplier: SupplierRecord) => {
    setEditing(supplier);
    setFormSession((session) => session + 1);
    setFormError(null);
    setSuccessMessage(null);
    modalRef.current?.showModal();
  };

  const handleSubmit = (data: SupplierInput) => {
    setFormError(null);
    setActionError(null);
    setSuccessMessage(null);
    saveSupplierMutation.mutate({ id: editing?.id ?? null, data });
  };

  const deleteSupplier = (supplier: SupplierRecord) => {
    if (
      !window.confirm(
        `¿Borrar al proveedor ${supplier.name}? No podrás restaurarlo desde el sistema.`
      )
    ) {
      return;
    }
    setActionError(null);
    setSuccessMessage(null);
    deleteSupplierMutation.mutate(supplier.id);
  };

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-8">
        {successMessage && (
          <NotificationToast
            type="success"
            message={successMessage}
            placement="toast"
            onClose={() => setSuccessMessage(null)}
          />
        )}
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
            {actionError && (
              <NotificationToast
                type="error"
                message={actionError}
                placement="toast"
                onClose={() => setActionError(null)}
              />
            )}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                Lista de proveedores
              </h2>
              <label className="input input-sm w-full sm:w-72">
                <Search className="size-4 opacity-50" strokeWidth={2} />
                <input
                  type="search"
                  placeholder="Buscar por nombre o RUC..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Buscar proveedores"
                />
              </label>
            </div>

            {isLoading ? (
              <LoadingSpinner label="Cargando proveedores" />
            ) : hasError ? (
              <NotificationToast
                type="error"
                message="No se pudieron cargar los proveedores de la base de datos."
                placement="toast"
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Proveedor</th>
                        <th>RUC</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-base-content/60 py-8 text-center text-sm"
                          >
                            No se encontraron proveedores.
                          </td>
                        </tr>
                      )}
                      {suppliers.map((supplier) => (
                        <tr
                          key={supplier.id}
                          className="cursor-pointer hover:bg-base-200"
                          onClick={() => openEdit(supplier)}
                        >
                          <td className="font-semibold">{supplier.name}</td>
                          <td className="font-mono text-xs">{supplier.ruc}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-ghost btn-square btn-sm text-error"
                              disabled={deleteSupplierMutation.isPending}
                              aria-label={`Borrar ${supplier.name}`}
                              title={`Borrar ${supplier.name}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                deleteSupplier(supplier);
                              }}
                            >
                              {deleteSupplierMutation.isPending &&
                                deleteSupplierMutation.variables === supplier.id ? (
                                <span className="loading loading-spinner loading-xs" />
                              ) : (
                                <Trash2 className="size-4" aria-hidden="true" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={setPage}
                />

              </>
            )}
          </div>
        </section>
      </main>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="mb-4 text-lg font-bold">
            {editing ? "Editar Proveedor" : "Nuevo Proveedor"}
          </h3>
          {formError && (
            <NotificationToast
              type="error"
              message={formError}
              placement="toast"
              onClose={() => setFormError(null)}
            />
          )}
          <SupplierForm
            key={formSession}
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => modalRef.current?.close()}
            isPending={saveSupplierMutation.isPending}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
