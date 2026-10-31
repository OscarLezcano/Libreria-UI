import { apiUrl, getAuthHeaders } from "@/common/services/http";

const PAGE_SIZE = 25;
const SUPPLIERS_URL = "api/v1/suppliers";

export interface SupplierRecord {
  id: string;
  name: string;
  ruc: string;
}

export interface SupplierInput {
  name: string;
  ruc: string;
}

interface SupplierDto {
  id: number | null;
  name: string | null;
  ruc: string | null;
}

interface SupplierListResponse {
  data: SupplierDto[];
  pagination?: {
    totalPages?: number | null;
    totalElements?: number | null;
  };
}

export interface SupplierPage {
  suppliers: SupplierRecord[];
  totalPages: number;
  totalElements: number;
}

interface SupplierItemResponse {
  data: SupplierDto;
}

function parseSupplier(supplier: SupplierDto): SupplierRecord {
  if (supplier.id === null) {
    throw new Error("La API devolvió un proveedor sin identificador.");
  }

  return {
    id: String(supplier.id),
    name: supplier.name ?? "",
    ruc: supplier.ruc ?? "",
  };
}

function getSupplierError(response: Response, action: string): Error {
  if (response.status === 409) {
    return new Error("Ya existe un proveedor con ese nombre.");
  }
  if (response.status === 401 || response.status === 403) {
    return new Error("No tienes permisos para administrar proveedores.");
  }
  return new Error(`${action} (HTTP ${response.status}).`);
}

export async function getSuppliersRequest(
  page: number,
  size = PAGE_SIZE,
  search = ""
): Promise<SupplierPage> {
  const query = new URLSearchParams({
    page: String(Math.max(0, page - 1)),
    size: String(size),
  });
  if (search.trim()) query.set("search", search.trim());

  const response = await fetch(apiUrl(`${SUPPLIERS_URL}?${query.toString()}`), {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw getSupplierError(response, "No se pudieron cargar los proveedores");
  }

  const result: SupplierListResponse = await response.json();
  return {
    suppliers: result.data.map(parseSupplier),
    totalPages: Math.max(1, result.pagination?.totalPages ?? 1),
    totalElements: result.pagination?.totalElements ?? result.data.length,
  };
}

export async function getAllSuppliersRequest(): Promise<SupplierRecord[]> {
  const firstPage = await getSuppliersRequest(1);
  if (firstPage.totalPages === 1) return firstPage.suppliers;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      getSuppliersRequest(index + 2)
    )
  );

  return [firstPage, ...remainingPages].flatMap((page) => page.suppliers);
}

export async function createSupplierRequest(
  data: SupplierInput
): Promise<SupplierRecord> {
  const response = await fetch(apiUrl(SUPPLIERS_URL), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw getSupplierError(response, "No se pudo crear el proveedor");
  }

  const result: SupplierItemResponse = await response.json();
  return parseSupplier(result.data);
}

export async function updateSupplierRequest(
  id: string,
  data: SupplierInput
): Promise<SupplierRecord> {
  const response = await fetch(apiUrl(`${SUPPLIERS_URL}/${id}`), {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw getSupplierError(response, "No se pudo actualizar el proveedor");
  }

  const result: SupplierItemResponse = await response.json();
  return parseSupplier(result.data);
}

export async function deleteSupplierRequest(id: string): Promise<void> {
  const response = await fetch(apiUrl(`${SUPPLIERS_URL}/${id}`), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw getSupplierError(response, "No se pudo borrar el proveedor");
  }
}
