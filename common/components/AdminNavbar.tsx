"use client";

import SiteNavbar from "@/common/components/SiteNavbar";

const ADMIN_MENU = [
  { key: "inicio", label: "Inicio", href: "/" },
  { key: "sucursales", label: "Sucursales", href: "/admin/sucursales" },
] as const;

export default function AdminNavbar() {
  return <SiteNavbar items={ADMIN_MENU} />;
}
