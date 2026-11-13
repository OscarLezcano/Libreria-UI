"use client";

import UserMenu from "@/common/components/UserMenu";
import { useCart } from "@/common/context/CartContext";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavbarItem {
  key: string;
  label: string;
  href: string;
}

interface SiteNavbarProps {
  items: readonly NavbarItem[];
  active?: string;
}

export default function SiteNavbar({ items, active }: SiteNavbarProps) {
  const pathname = usePathname();
  const { count } = useCart();
  const activeKey =
    active ??
    items.find((item) => {
      const hrefPath = item.href.split("?", 1)[0];
      return (
        pathname === hrefPath ||
        (hrefPath !== "/" && pathname.startsWith(`${hrefPath}/`))
      );
    })?.key;

  return (
    <header className="border-b border-base-300 bg-base-100">
      <div className="navbar mx-auto max-w-6xl px-4 lg:px-8">
        <div className="navbar-start">
          <Link href="/" className="text-xl font-bold">
            Libros
          </Link>
        </div>
        <nav
          className="navbar-center hidden lg:flex"
          aria-label="Navegación principal"
        >
          <ul className="menu menu-horizontal gap-6 px-0">
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={item.key === activeKey ? "page" : undefined}
                  className={
                    item.key === activeKey
                      ? "text-base-content text-sm font-bold uppercase tracking-wider"
                      : "text-base-content/60 text-sm font-semibold uppercase tracking-wider hover:text-base-content"
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
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
