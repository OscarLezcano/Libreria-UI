"use client";

import SiteNavbar from "@/common/components/SiteNavbar";

const MENU_ITEMS = [
  { key: "inicio", label: "INICIO", href: "/" },
  { key: "explorar", label: "EXPLORAR", href: "/explorar" },
  { key: "compras", label: "MIS COMPRAS", href: "/mis-compras" },
] as const;

interface ReaderNavbarProps {
  active?: (typeof MENU_ITEMS)[number]["key"];
}

export default function ReaderNavbar({ active = "inicio" }: ReaderNavbarProps) {
  return <SiteNavbar items={MENU_ITEMS} active={active} />;
}
