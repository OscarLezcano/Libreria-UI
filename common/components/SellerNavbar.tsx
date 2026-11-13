"use client";

import SiteNavbar, {
  type NavbarItem,
} from "@/common/components/SiteNavbar";
import { withWarehouseContext } from "@/common/utils/warehouseScope";
import { useSearchParams } from "next/navigation";

const SELLER_MENU = [
  { key: "inicio", label: "Inicio", href: "/" },
  { key: "catalogo", label: "Catálogo", href: "/vendedor/libros" },
  { key: "inventario", label: "Inventario", href: "/vendedor/inventario" },
  { key: "compras", label: "Compras", href: "/vendedor/compras" },
  { key: "proveedores", label: "Proveedores", href: "/vendedor/proveedores" },
] as const;

export default function SellerNavbar() {
  const searchParams = useSearchParams();
  const warehouseParam = searchParams.get("warehouseId");
  const menuItems: NavbarItem[] =
    warehouseParam === null
      ? [...SELLER_MENU]
      : [
        ...SELLER_MENU,
        {
          key: "sucursales",
          label: "Sucursales",
          href: "/admin/sucursales",
        },

      ];
  const items = menuItems.map((item) => ({
    ...item,
    href:
      item.key === "sucursales" || item.key === "inicio"
        ? item.href
        : withWarehouseContext(item.href, warehouseParam),
  }));

  return <SiteNavbar items={items} />;
}
