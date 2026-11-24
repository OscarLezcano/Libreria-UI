import MisComprasContent from "./MisComprasContent";

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

export default async function MisComprasPage({
  searchParams,
}: MisComprasPageProps) {
  const params = await searchParams;
  const page = parsePage(firstValue(params.page));
  const search = firstValue(params.search).trim().slice(0, 100);

  return <MisComprasContent page={page} search={search} />;
}
