"use client";

import LoadingSpinner from "@/common/components/LoadingSpinner";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import MisComprasContent from "./MisComprasContent";

function parsePage(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

function MisComprasPageContent() {
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get("page") ?? "");
  const search = (searchParams.get("search") ?? "").trim().slice(0, 100);

  return <MisComprasContent page={page} search={search} />;
}

export default function MisComprasPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Cargando compras" />}>
      <MisComprasPageContent />
    </Suspense>
  );
}
