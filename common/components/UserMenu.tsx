"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { AUTH_CHANGED_EVENT, useCart } from "@/common/context/CartContext";
import {
  BookOpen,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  Store,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getUserRoles(): string[] {
  const storedUser = localStorage.getItem("bigbooks.user");
  if (!storedUser) return [];

  try {
    const user: unknown = JSON.parse(storedUser);
    if (!user || typeof user !== "object") return [];

    const { roleNames } = user as { roleNames?: unknown };
    if (!Array.isArray(roleNames)) return [];
    return roleNames.flatMap((role) =>
      typeof role === "string" ? [role.trim().toUpperCase()] : []
    );
  } catch {
    return [];
  }
}

function hasStoredUser() {
  return localStorage.getItem("bigbooks.user") !== null;
}

function getShowAdminLink() {
  return getUserRoles().includes("ADMIN");
}

function getShowSellerLink() {
  return getUserRoles().some(
    (role) =>
      role === "ADMIN" ||
      role === "SELLER" ||
      role === "SALLER" ||
      role === "VENDEDOR"
  );
}

// Un usuario que solo es CLIENT no debe ver "Panel Cliente": ya está en él.
// Los usuarios con otros roles sí pueden volver al area de cliente desde Perfil.
function getShowClientLink() {
  return getUserRoles().some((role) => role !== "CLIENT");
}

function subscribeToUserStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(AUTH_CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(AUTH_CHANGED_EVENT, onChange);
  };
}

export default function UserMenu() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clear } = useCart();
  const isLoggedIn = useSyncExternalStore(
    subscribeToUserStorage,
    hasStoredUser,
    () => false
  );
  const showAdminLink = useSyncExternalStore(
    subscribeToUserStorage,
    getShowAdminLink,
    () => false
  );
  const showSellerLink = useSyncExternalStore(
    subscribeToUserStorage,
    getShowSellerLink,
    () => false
  );
  const showClientLink = useSyncExternalStore(
    subscribeToUserStorage,
    getShowClientLink,
    () => false
  );

  const logout = () => {
    clear();
    queryClient.clear();
    document.cookie = "token=; path=/; max-age=0; Secure; SameSite=Strict";
    localStorage.removeItem("bigbooks.user");
    localStorage.removeItem("bigbooks.order-checkout-data");
    localStorage.removeItem("bigbooks.checkout-session");
    sessionStorage.removeItem("bigbooks.checkout-session");
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    router.replace("/auth/login");
  };

  return (
    <details className="dropdown dropdown-end">
      <summary
        className="btn btn-ghost btn-circle list-none"
        aria-label="Abrir menú de usuario"
      >
        <div className="avatar avatar-placeholder">
          <div className="bg-primary/10 text-primary w-9 rounded-full">
            <User className="size-5" strokeWidth={2} />
          </div>
        </div>
      </summary>
      <ul className="menu dropdown-content z-50 mt-2 w-48 rounded-box bg-base-100 p-2 shadow-[0_0_16px_rgba(0,0,0,0.16)]">
        {isLoggedIn ? (
          <>
            {showAdminLink && (
              <li>
                <Link href="/admin/sucursales">
                  <LayoutDashboard className="size-4" strokeWidth={2} />
                  Panel Admin
                </Link>
              </li>
            )}
            {showSellerLink && (
              <li>
                <Link href="/vendedor/libros">
                  <Store className="size-4" strokeWidth={2} />
                  Panel Vendedor
                </Link>
              </li>
            )}
            {showClientLink && (
              <li>
                <Link href="/">
                  <BookOpen className="size-4" strokeWidth={2} />
                  Panel Cliente
                </Link>
              </li>
            )}
            <li>
              <Link
                href={
                  showSellerLink
                    ? "/vendedor/configuracion"
                    : "/perfil/configuracion"
                }
              >
                <Settings className="size-4" strokeWidth={2} />
                Configuración
              </Link>
            </li>
            <li>
              <button type="button" onClick={logout} className="text-error">
                <LogOut className="size-4 text-error" strokeWidth={2} />
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/auth/login">
                <LogIn className="size-4" strokeWidth={2} />
                Iniciar sesión
              </Link>
            </li>
            <li>
              <Link href="/auth/register">
                <UserPlus className="size-4" strokeWidth={2} />
                Crear cuenta
              </Link>
            </li>
          </>
        )}
      </ul>
    </details>
  );
}
