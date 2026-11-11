"use client";

import SiteNavbar from "@/common/components/SiteNavbar";

const SELLER_MENU = [
  { key: "inicio", label: "Inicio", href: "/" },
  { key: "catalogo", label: "Catálogo", href: "/vendedor/libros" },
  { key: "inventario", label: "Inventario", href: "/vendedor/inventario" },
  { key: "compras", label: "Compras", href: "/vendedor/compras" },
  { key: "proveedores", label: "Proveedores", href: "/vendedor/proveedores" },
] as const;

export default function SellerNavbar() {
  return <SiteNavbar items={SELLER_MENU} />;
}
