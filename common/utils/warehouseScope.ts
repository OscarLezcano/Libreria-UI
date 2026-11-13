export function parseWarehouseId(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function withWarehouseContext(
  href: string,
  warehouseParam: string | null
): string {
  if (warehouseParam === null) return href;

  const [pathname, query = ""] = href.split("?", 2);
  const searchParams = new URLSearchParams(query);
  searchParams.set("warehouseId", warehouseParam);
  return `${pathname}?${searchParams.toString()}`;
}
