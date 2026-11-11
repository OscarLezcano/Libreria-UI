"use client";

import SiteNavbar from "@/common/components/SiteNavbar";

const ADMIN_MENU = [
  { key: "inicio", label: "Inicio", href: "/" },
  { key: "catalogo", label: "Catálogo", href: "/admin/libros" },
  { key: "inventario", label: "Inventario", href: "/admin/inventario" },
  { key: "sucursales", label: "Sucursales", href: "/admin/sucursales" },
  { key: "compras", label: "Compras", href: "/admin/compras" },
  { key: "proveedores", label: "Proveedores", href: "/admin/proveedores" },
] as const;

export default function AdminNavbar() {
  return <SiteNavbar items={ADMIN_MENU} />;
}
