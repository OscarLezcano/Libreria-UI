import MisComprasContent from "./MisComprasContent";
import type { MisComprasFilters } from "./MisComprasContent";

const DEFAULT_SORT = "createdAt,desc";
const ALLOWED_SORTS = new Set([
  "numeroOrden,asc",
  "numeroOrden,desc",
  "createdAt,asc",
  "createdAt,desc",
  "totalPrice,asc",
  "totalPrice,desc",
]);

interface MisComprasPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parsePage(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

function parseSort(value: string): string {
  return ALLOWED_SORTS.has(value) ? value : DEFAULT_SORT;
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

export default async function MisComprasPage({
  searchParams,
}: MisComprasPageProps) {
  const params = await searchParams;
  const page = parsePage(firstValue(params.page));
  const search = firstValue(params.search).trim().slice(0, 100);
  let minTotal = parseAmount(firstValue(params.minTotal));
  let maxTotal = parseAmount(firstValue(params.maxTotal));
  let dateFrom = parseDate(firstValue(params.dateFrom));
  let dateTo = parseDate(firstValue(params.dateTo));

  if (minTotal && maxTotal && Number(minTotal) > Number(maxTotal)) {
    [minTotal, maxTotal] = [maxTotal, minTotal];
  }
  if (dateFrom && dateTo && dateFrom > dateTo) {
    [dateFrom, dateTo] = [dateTo, dateFrom];
  }

  const filters: MisComprasFilters = {
    sort: parseSort(firstValue(params.sort)),
    minTotal,
    maxTotal,
    dateFrom,
    dateTo,
  };

  return <MisComprasContent page={page} search={search} filters={filters} />;
}
