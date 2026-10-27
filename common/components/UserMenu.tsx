"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const router = useRouter();

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
        <li>
          <button type="button" onClick={logout}>
            <LogOut className="size-4" strokeWidth={2} />
            Logout
          </button>
        </li>
      </ul>
    </details>
  );
}
