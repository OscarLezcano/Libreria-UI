"use client";

import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotificationToast from "@/common/components/NotificationToast";
import Pagination from "@/common/components/Pagination";
import UserForm from "@/common/components/UserForm";
import {
  createUserRequest,
  deleteUserRequest,
  getRolesRequest,
  getUsersRequest,
  updateUserRequest,
  type UserInput,
  type UserPage,
  type UserRecord,
} from "@/common/services/users";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

const PAGE_SIZE = 10;

export default function AdminUsuariosPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const search = query.trim();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [formSession, setFormSession] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () => getUsersRequest(page, PAGE_SIZE, search),
  });
  const rolesQuery = useQuery({
    queryKey: ["admin-roles"],
    queryFn: getRolesRequest,
    staleTime: 60_000,
  });
  const users = usersQuery.data?.users ?? [];
  const totalPages = usersQuery.data?.totalPages ?? 1;
  const totalElements = usersQuery.data?.totalElements ?? 0;
  const currentPage = Math.min(page, totalPages);

  const saveUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | null; data: UserInput }) =>
      id ? updateUserRequest(id, data) : createUserRequest(data),
    onSuccess: async (_user, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      modalRef.current?.close();
      setFormError(null);
      setSuccessMessage(
        variables.id ? "Usuario actualizado correctamente." : "Usuario creado correctamente."
      );
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "No se pudo guardar el usuario.");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUserRequest,
    onSuccess: async () => {
      const currentPageData = queryClient.getQueryData<UserPage>(["admin-users", page, search]);
      if (page > 1 && currentPageData?.users.length === 1) {
        setPage((current) => current - 1);
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSuccessMessage("Usuario eliminado correctamente.");
      setActionError(null);
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : "No se pudo eliminar el usuario.");
    },
  });

  const openNew = () => {
    setEditing(null);
    setFormSession((session) => session + 1);
    setFormError(null);
    setSuccessMessage(null);
    modalRef.current?.showModal();
  };

  const openEdit = (user: UserRecord) => {
    setEditing(user);
    setFormSession((session) => session + 1);
    setFormError(null);
    setSuccessMessage(null);
    modalRef.current?.showModal();
  };

  const handleSubmit = (data: UserInput) => {
    setFormError(null);
    setActionError(null);
    setSuccessMessage(null);
    saveUserMutation.mutate({ id: editing?.id ?? null, data });
  };

  const deleteUser = (user: UserRecord) => {
    if (!window.confirm(`¿Eliminar al usuario ${user.name} ${user.lastName}?`)) return;
    setActionError(null);
    setSuccessMessage(null);
    deleteUserMutation.mutate(user.id);
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
            <h1 className="text-3xl font-extrabold">Usuarios</h1>
            <p className="text-base-content/60 mt-1 text-sm">
              Administrá cuentas, datos y roles de usuario
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={openNew}>
            <Plus className="size-4" strokeWidth={2.5} />
            Nuevo Usuario
          </button>
        </div>

        <section className="card card-border bg-base-100">
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
              <h2 className="text-base-content/60 text-sm font-bold uppercase tracking-wider">
                {totalElements} usuario{totalElements !== 1 ? "s" : ""}
              </h2>
              <label className="input input-sm w-full sm:w-72">
                <Search className="size-4 opacity-50" strokeWidth={2} />
                <input
                  type="search"
                  placeholder="Buscar por nombre o correo..."
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  aria-label="Buscar usuarios"
                />
              </label>
            </div>

            {usersQuery.isPending ? (
              <LoadingSpinner label="Cargando usuarios" />
            ) : usersQuery.isError ? (
              <NotificationToast
                type="error"
                message={
                  usersQuery.error instanceof Error
                    ? usersQuery.error.message
                    : "No se pudieron cargar los usuarios."
                }
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Correo</th>
                        <th>Ciudad</th>
                        <th>Roles</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-base-content/60 py-8 text-center text-sm">
                            No se encontraron usuarios.
                          </td>
                        </tr>
                      )}
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="font-semibold">
                            {user.name} {user.lastName}
                          </td>
                          <td>{user.email}</td>
                          <td>{user.city || "—"}</td>
                          <td>
                            <div className="flex flex-wrap gap-1">
                              {user.roleNames.map((role) => (
                                <span key={role} className="badge badge-sm badge-ghost">
                                  {role}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div className="flex justify-center gap-1">
                              <button
                                type="button"
                                className="btn btn-ghost btn-square btn-sm"
                                aria-label={`Editar ${user.name}`}
                                title="Editar usuario"
                                onClick={() => openEdit(user)}
                              >
                                <Pencil className="size-4" strokeWidth={2} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-square btn-sm text-error"
                                disabled={deleteUserMutation.isPending}
                                aria-label={`Eliminar ${user.name}`}
                                title="Eliminar usuario"
                                onClick={() => deleteUser(user)}
                              >
                                <Trash2 className="size-4" strokeWidth={2} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </div>
        </section>
      </main>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="mb-4 text-lg font-bold">
            {editing ? "Editar Usuario" : "Nuevo Usuario"}
          </h3>
          {formError && (
            <NotificationToast
              type="error"
              message={formError}
              placement="inline"
              className="mb-4"
              onClose={() => setFormError(null)}
            />
          )}
          {rolesQuery.isPending ? (
            <LoadingSpinner label="Cargando roles" />
          ) : rolesQuery.isError ? (
            <NotificationToast type="error" message="No se pudieron cargar los roles." />
          ) : (
            <UserForm
              key={formSession}
              initial={editing}
              roles={rolesQuery.data ?? []}
              onSubmit={handleSubmit}
              onCancel={() => modalRef.current?.close()}
              isPending={saveUserMutation.isPending}
            />
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Cerrar">close</button>
        </form>
      </dialog>
    </>
  );
}
