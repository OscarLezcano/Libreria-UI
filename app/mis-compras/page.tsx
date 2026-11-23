import LoadingSpinner from "@/common/components/LoadingSpinner";
import { Suspense } from "react";
import MisComprasRoute from "./MisComprasRoute";

export default function MisComprasPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Cargando compras" />}>
      <MisComprasRoute />
    </Suspense>
  );
}
