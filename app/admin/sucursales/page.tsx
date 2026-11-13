"use client";

import WarehouseForm from "@/common/components/WarehouseForm";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import Pagination from "@/common/components/Pagination";
import {
  createWarehouseRequest,
  getWarehousesRequest,
  type WarehouseInput,
} from "@/common/services/warehouses";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const PAGE_SIZE = 10;

export default function AdminSucursalesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [cityQuery, setCityQuery] = useState("");
  const city = cityQuery.trim();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [formSession, setFormSession] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const warehousesQuery = useQuery({
    queryKey: ["warehouses", page, city],
    queryFn: () => getWarehousesRequest(page, PAGE_SIZE, city),
  });
  const warehouses = warehousesQuery.data?.warehouses ?? [];
  const totalPages = warehousesQuery.data?.totalPages ?? 1;
  const currentPage = Math.min(page, totalPages);

  const createWarehouseMutation = useMutation({
    mutationFn: (data: WarehouseInput) => createWarehouseRequest(data),
    onSuccess: async () => {
      setPage(1);
      setCityQuery("");
      await queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      modalRef.current?.close();
      setFormError(null);
      setSuccessMessage("Sucursal creada correctamente.");
    },
    onError: (error) => {
      setFormError(
        error instanceof Error ? error.message : "No se pudo crear la sucursal."
      );
    },
  });

  const openNew = () => {
    setFormSession((session) => session + 1);
    setFormError(null);
    setSuccessMessage(null);
    modalRef.current?.showModal();
  };

  const handleSubmit = (data: WarehouseInput) => {
    setFormError(null);
    setSuccessMessage(null);
    createWarehouseMutation.mutate(data);
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
            <h1 className="text-3xl font-extrabold">Sucursales</h1>
            <p className="text-base-content/60 mt-1 text-sm">
              Administrá las sucursales y consultá sus existencias
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={openNew}>
            <Plus className="size-4" strokeWidth={2.5} />
            Nueva Sucursal
          </button>
        </div>

        <section className="card card-border bg-base-100">
          <div className="card-body">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base-content/60 text-sm font-bold uppercase tracking-wider">
                Lista de sucursales
              </h2>
              <label className="input input-sm w-full sm:w-72">
                <Search className="size-4 opacity-50" strokeWidth={2} />
                <input
                  type="search"
                  placeholder="Filtrar por ciudad exacta..."
                  value={cityQuery}
                  onChange={(event) => {
                    setCityQuery(event.target.value);
                    setPage(1);
                  }}
                  aria-label="Filtrar sucursales por ciudad exacta"
                />
              </label>
            </div>

            {warehousesQuery.isPending ? (
              <LoadingSpinner label="Cargando sucursales" />
            ) : warehousesQuery.isError ? (
              <NotificationToast
                type="error"
                message={
                  warehousesQuery.error instanceof Error
                    ? warehousesQuery.error.message
                    : "No se pudieron cargar las sucursales."
                }
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Sucursal</th>
                        <th>Ciudad</th>
                        <th>Dirección</th>
                        <th>Teléfono</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warehouses.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-base-content/60 py-8 text-center text-sm"
                          >
                            No se encontraron sucursales.
                          </td>
                        </tr>
                      )}
                      {warehouses.map((warehouse) => (
                        <tr
                          key={warehouse.id}
                          className="cursor-pointer hover:bg-base-200"
                          onClick={() =>
                            router.push(`/admin/sucursales/${warehouse.id}`)
                          }
                        >
                          <td>
                            <Link
                              href={`/admin/sucursales/${warehouse.id}`}
                              aria-label={`Ver sucursal ${warehouse.name}`}
                              className="text-base-content"
                              onClick={(event) => event.stopPropagation()}
                            >
                              {warehouse.name}
                            </Link>
                          </td>
                          <td>{warehouse.city || "—"}</td>
                          <td>{warehouse.address || "—"}</td>
                          <td>{warehouse.phone || "—"}</td>
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
          <h3 className="mb-4 text-lg font-bold">Nueva Sucursal</h3>
          {formError && (
            <NotificationToast
              type="error"
              message={formError}
              placement="inline"
              className="mb-4"
              onClose={() => setFormError(null)}
            />
          )}
          <WarehouseForm
            key={formSession}
            onSubmit={handleSubmit}
            onCancel={() => modalRef.current?.close()}
            isPending={createWarehouseMutation.isPending}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Cerrar">close</button>
        </form>
      </dialog>
    </>
  );
}
