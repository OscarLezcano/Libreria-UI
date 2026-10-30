"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_MENU = [
  { label: "Inicio", href: "/" },
  { label: "Catálogo", href: "/admin/libros" },
  { label: "Inventario", href: "#" },
  { label: "Compras", href: "/admin/compras" },
  { label: "Proveedores", href: "/admin/proveedores" },
] as const;

export default function AdminNavbar() {
  const pathname = usePathname();
  const active = pathname.startsWith("/admin/libros")
    ? "Catálogo"
    : pathname.startsWith("/admin/proveedores")
      ? "Proveedores"
      : "Compras";

  return (
    <header className="border-b border-base-300 bg-base-100">
      <div className="navbar mx-auto max-w-6xl px-4 lg:px-8">
        <div className="navbar-start">
          <Link href="/" className="text-xl font-bold">
            Libros
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-2 px-0">
            {ADMIN_MENU.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={
                    item.label === active
                      ? "text-base-content text-xs font-bold uppercase tracking-wider"
                      : "text-base-content/60 text-xs font-semibold uppercase tracking-wider hover:text-base-content"
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="navbar-end">
          <div className="avatar avatar-placeholder">
            <div className="bg-primary/10 text-primary w-8 rounded-full">
              <span className="text-xs font-bold">HA</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
