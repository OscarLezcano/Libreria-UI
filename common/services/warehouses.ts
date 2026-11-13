import { apiUrl, getAuthHeaders } from "@/common/services/http";

const WAREHOUSES_URL = "stock/warehouses";
const DEFAULT_PAGE_SIZE = 10;

export interface WarehouseRecord {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
}

export interface WarehouseInput {
  name: string;
  address: string;
  city: string;
  phone: string;
}

interface WarehouseDto {
  id: number | null;
  name: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
}

interface WarehouseListResponse {
  data: WarehouseDto[];
  pagination?: {
    totalPages?: number | null;
    totalElements?: number | null;
  };
}

interface WarehouseItemResponse {
  data: WarehouseDto;
}

export interface WarehousePage {
  warehouses: WarehouseRecord[];
  totalPages: number;
  totalElements: number;
}

function parseWarehouse(warehouse: WarehouseDto): WarehouseRecord {
  if (
    typeof warehouse.id !== "number" ||
    !Number.isSafeInteger(warehouse.id) ||
    warehouse.id <= 0
  ) {
    throw new Error("La API devolvió una sucursal sin identificador válido.");
  }

  return {
    id: warehouse.id,
    name: warehouse.name ?? "",
    address: warehouse.address ?? "",
    city: warehouse.city ?? "",
    phone: warehouse.phone ?? "",
  };
}

function getWarehouseError(response: Response, action: string): Error {
  if (response.status === 401 || response.status === 403) {
    return new Error("No tienes permisos para administrar sucursales.");
  }
  if (response.status === 400) {
    return new Error("Revisá los datos de la sucursal e intentá nuevamente.");
  }
  return new Error(`${action} (HTTP ${response.status}).`);
}

export async function getWarehousesRequest(
  page: number,
  size = DEFAULT_PAGE_SIZE,
  city = ""
): Promise<WarehousePage> {
  const query = new URLSearchParams({
    page: String(Math.max(0, page - 1)),
    size: String(size),
  });
  if (city.trim()) query.set("city", city.trim());

  const response = await fetch(apiUrl(`${WAREHOUSES_URL}?${query.toString()}`), {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw getWarehouseError(response, "No se pudieron cargar las sucursales");
  }

  const result: WarehouseListResponse = await response.json();
  if (!Array.isArray(result.data)) {
    throw new Error("La API devolvió una lista de sucursales inválida.");
  }

  const totalPages = result.pagination?.totalPages;
  const totalElements = result.pagination?.totalElements;

  return {
    warehouses: result.data.map(parseWarehouse),
    totalPages:
      typeof totalPages === "number" && Number.isSafeInteger(totalPages)
        ? Math.max(1, totalPages)
        : 1,
    totalElements:
      typeof totalElements === "number" && Number.isSafeInteger(totalElements)
        ? Math.max(0, totalElements)
        : result.data.length,
  };
}

export async function getWarehouseByIdRequest(
  id: number
): Promise<WarehouseRecord | null> {
  const response = await fetch(apiUrl(`${WAREHOUSES_URL}/${id}`), {
    headers: getAuthHeaders(),
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw getWarehouseError(response, "No se pudo cargar la sucursal");
  }

  const result: WarehouseItemResponse = await response.json();
  return parseWarehouse(result.data);
}

export async function createWarehouseRequest(
  data: WarehouseInput
): Promise<WarehouseRecord> {
  const response = await fetch(apiUrl(WAREHOUSES_URL), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw getWarehouseError(response, "No se pudo crear la sucursal");
  }

  const result: WarehouseItemResponse = await response.json();
  return parseWarehouse(result.data);
}
