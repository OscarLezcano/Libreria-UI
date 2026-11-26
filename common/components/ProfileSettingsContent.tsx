"use client";

import ThemePalettePicker from "@/common/components/ThemePalettePicker";
import { AUTH_CHANGED_EVENT } from "@/common/context/CartContext";
import { useSyncExternalStore } from "react";

interface StoredUser {
  name?: string;
  lastName?: string;
  email?: string;
  roleNames?: string[];
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(AUTH_CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(AUTH_CHANGED_EVENT, onChange);
  };
}

function getUserSnapshot(): string {
  const stored = localStorage.getItem("bigbooks.user");
  if (!stored) return "";
  try {
    const user = JSON.parse(stored) as StoredUser;
    const name = [user.name, user.lastName]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(" ");
    const roles = (user.roleNames ?? []).join(", ");
    return JSON.stringify({ name, email: user.email ?? "", roles });
  } catch {
    return "";
  }
}

interface DisplayUser {
  name: string;
  email: string;
  roles: string;
}

function getServerSnapshot() {
  return "";
}

export default function ProfileSettingsContent() {
  const rawUser = useSyncExternalStore(
    subscribe,
    getUserSnapshot,
    getServerSnapshot
  );
  let user: DisplayUser | null = null;
  try {
    user = rawUser ? (JSON.parse(rawUser) as DisplayUser) : null;
  } catch {
    user = null;
  }

  return (
    <div className="grid gap-6">
      <section className="card card-border bg-base-100">
        <div className="card-body gap-3">
          <h2 className="text-lg font-bold">Tu cuenta</h2>
          {user ? (
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-base-content/60">Nombre</dt>
                <dd className="font-semibold">{user.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-base-content/60">Correo</dt>
                <dd className="font-semibold">{user.email || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-base-content/60">Roles</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {user.roles
                    ? user.roles.split(", ").map((role) => (
                        <span key={role} className="badge badge-soft badge-sm">
                          {role}
                        </span>
                      ))
                    : "—"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-base-content/60 text-sm">
              Iniciá sesión para ver los datos de tu cuenta.
            </p>
          )}
        </div>
      </section>

      <ThemePalettePicker />
    </div>
  );
}
