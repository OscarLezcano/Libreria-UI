"use client";

import { useSyncExternalStore } from "react";
import { LayoutDashboard, LogOut, Store, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PanelRole = "ADMIN" | "SELLER" | null;

function getPanelRole(): PanelRole {
  const storedUser = localStorage.getItem("bigbooks.user");
  if (!storedUser) return null;

  try {
    const user: unknown = JSON.parse(storedUser);
    if (!user || typeof user !== "object") return null;

    const { roleNames } = user as {
      roleNames?: unknown;
    };
    if (!Array.isArray(roleNames)) return null;

    const roles = roleNames.filter(
      (role): role is string => typeof role === "string"
    );
    if (roles.includes("ADMIN")) return "ADMIN";
    if (roles.includes("SELLER") || roles.includes("SALLER")) return "SELLER";
    return null;
  } catch {
    return null;
  }
}

function subscribeToUserStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export default function UserMenu() {
  const router = useRouter();
  const panelRole = useSyncExternalStore(
    subscribeToUserStorage,
    getPanelRole,
    () => null
  );
  const showAdminLink = panelRole === "ADMIN";
  const showSellerLink = panelRole === "ADMIN" || panelRole === "SELLER";

  const logout = () => {
    document.cookie = "token=; path=/; max-age=0; Secure; SameSite=Strict";
    localStorage.removeItem("bigbooks.user");
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
      <ul className="menu dropdown-content z-50 mt-2 w-40 rounded-box bg-base-100 p-2 shadow-[0_0_16px_rgba(0,0,0,0.16)]">
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
        <li>
          <button type="button" onClick={logout} className="text-error">
            <LogOut className="size-4 text-error" strokeWidth={2} />
            Logout
          </button>
        </li>
      </ul>
    </details>
  );
}
