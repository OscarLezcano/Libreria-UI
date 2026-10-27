"use client";

import { useCart } from "@/common/context/CartContext";
import UserMenu from "@/common/components/UserMenu";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

const MENU_ITEMS = [
  { key: "inicio", label: "INICIO", href: "/" },
  { key: "explorar", label: "EXPLORAR", href: "/explorar" },
  { key: "compras", label: "MIS COMPRAS", href: "/mis-compras" },
] as const;

interface ReaderNavbarProps {
  active?: (typeof MENU_ITEMS)[number]["key"];
}

export default function ReaderNavbar({ active = "inicio" }: ReaderNavbarProps) {
  const { count } = useCart();

  return (
    <header className="border-b border-base-300 bg-base-100">
      <div className="navbar mx-auto max-w-6xl px-4 lg:px-8">
        <div className="navbar-start">
          <Link href="/" className="text-xl font-bold">
            Libros
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-6 px-0">
            {MENU_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={
                    item.key === active
                      ? "text-base-content text-sm font-bold"
                      : "text-base-content/60 text-sm font-semibold hover:text-base-content"
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="navbar-end gap-2">
          <div className="indicator">
            {count > 0 && (
              <span className="badge badge-primary indicator-item badge-xs">
                {count}
              </span>
            )}
            <Link
              href="/carrito"
              className="btn btn-ghost btn-circle"
              aria-label="Carrito"
            >
              <ShoppingCart className="size-5" strokeWidth={2} />
            </Link>
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
