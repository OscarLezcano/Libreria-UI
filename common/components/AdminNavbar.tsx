"use client";

import SiteNavbar from "@/common/components/SiteNavbar";

const ADMIN_MENU = [
  { key: "sucursales", label: "Sucursales", href: "/admin/sucursales" },
  { key: "usuarios", label: "Usuarios", href: "/admin/usuarios" },
] as const;

export default function AdminNavbar() {
  return <SiteNavbar items={ADMIN_MENU} showCart={false} />;
}
