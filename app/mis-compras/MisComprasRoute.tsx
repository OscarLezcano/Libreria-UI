"use client";

import { useSearchParams } from "next/navigation";
import MisCompraDetalleClient from "./MisCompraDetalleClient";
import MisComprasListClient from "./MisComprasListClient";

export default function MisComprasRoute() {
  const id = useSearchParams().get("id");
  return id === null ? (
    <MisComprasListClient />
  ) : (
    <MisCompraDetalleClient id={id} />
  );
}
