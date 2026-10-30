"use client";

import { useSyncExternalStore } from "react";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getShowAdminLink() {
  const storedUser = localStorage.getItem("bigbooks.user");
  if (!storedUser) return false;

  try {
    const user: unknown = JSON.parse(storedUser);
    if (!user || typeof user !== "object") return false;

    const { roleName, roleId } = user as {
      roleName?: unknown;
      roleId?: unknown;
    };
    return (
      roleName === "ADMIN" ||
      ((roleName === undefined || roleName === null) && roleId === 1)
    );
  } catch {
    return false;
  }
}

function subscribeToUserStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export default function UserMenu() {
  const router = useRouter();
  const showAdminLink = useSyncExternalStore(
    subscribeToUserStorage,
    getShowAdminLink,
    () => false
  );

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
            <Link href="/admin/libros">
              <LayoutDashboard className="size-4" strokeWidth={2} />
              Panel Admin
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
