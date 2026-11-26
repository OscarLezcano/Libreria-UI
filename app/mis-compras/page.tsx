"use client";

import LoadingSpinner from "@/common/components/LoadingSpinner";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import MisComprasContent from "./MisComprasContent";

function parsePage(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

function parseAmount(value: string): string {
  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) return "";
  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? String(parsed) : "";
}

function parseDate(value: string): string {
  const normalized = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return "";
  const parsed = new Date(`${normalized}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === normalized
    ? normalized
    : "";
}

function MisComprasPageContent() {
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get("page") ?? "");
  const search = (searchParams.get("search") ?? "").trim().slice(0, 100);
  let minTotal = parseAmount(searchParams.get("minTotal") ?? "");
  let maxTotal = parseAmount(searchParams.get("maxTotal") ?? "");
  let dateFrom = parseDate(searchParams.get("dateFrom") ?? "");
  let dateTo = parseDate(searchParams.get("dateTo") ?? "");

  if (minTotal && maxTotal && Number(minTotal) > Number(maxTotal)) {
    [minTotal, maxTotal] = [maxTotal, minTotal];
  }
  if (dateFrom && dateTo && dateFrom > dateTo) {
    [dateFrom, dateTo] = [dateTo, dateFrom];
  }

  return (
    <MisComprasContent
      page={page}
      search={search}
      filters={{ minTotal, maxTotal, dateFrom, dateTo }}
    />
  );
}

export default function MisComprasPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Cargando compras" />}>
      <MisComprasPageContent />
    </Suspense>
  );
}
