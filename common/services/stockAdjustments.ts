import { apiUrl, getAuthHeaders } from "@/common/services/http";

const PAGE_SIZE = 6;

interface StockAdjustmentDto {
  id: number | null;
  note: string | null;
  createdAt: string | null;
  detailIds?: (number | null)[] | null;
}

interface StockAdjustmentDetailDto {
  id: number | null;
  bookId: number | null;
  bookName: string | null;
  systemQuantity: number | null;
  physicalQuantity: number | null;
}

interface PaginationDto {
  totalPages?: number | null;
  totalElements?: number | null;
}

export interface StockAdjustmentRecord {
  id: string;
  note: string;
  createdAt: string | null;
  detailCount: number;
}

export interface StockAdjustmentDetailRecord {
  id: string;
  bookId: number;
  bookName: string;
  systemQuantity: number;
  physicalQuantity: number;
}

export interface StockAdjustmentsPage {
  adjustments: StockAdjustmentRecord[];
  totalPages: number;
  totalElements: number;
}

export interface CreateStockAdjustmentInput {
  note: string;
  details: { bookId: number; physicalQuantity: number }[];
}

interface ItemResponse<T> {
  data: T;
}

function parseStockAdjustment(dto: StockAdjustmentDto): StockAdjustmentRecord {
  if (dto.id === null) {
    throw new Error("La API devolvió un ajuste sin identificador.");
  }

  return {
    id: String(dto.id),
    note: dto.note ?? "Sin nota",
    createdAt: dto.createdAt,
    detailCount: dto.detailIds?.length ?? 0,
  };
}

function getRequestError(response: Response, action: string): Error {
  if (response.status === 401 || response.status === 403) {
    return new Error("No tienes permisos para consultar o ajustar el inventario.");
  }
  if (response.status === 404) {
    return new Error("No se encontró el almacén o el ajuste solicitado.");
  }
  return new Error(`${action} (HTTP ${response.status}).`);
}

export async function getStockAdjustmentsPageRequest(
  warehouseId: number,
  page: number
): Promise<StockAdjustmentsPage> {
  const query = new URLSearchParams({
    page: String(Math.max(0, page - 1)),
    size: String(PAGE_SIZE),
  });
  const response = await fetch(
    apiUrl(`stock/stock-adjustments/warehouse/${warehouseId}?${query}`),
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw getRequestError(response, "No se pudo cargar el historial de ajustes");
  }

  const result: { data: StockAdjustmentDto[]; pagination?: PaginationDto } =
    await response.json();
  return {
    adjustments: result.data.map(parseStockAdjustment),
    totalPages: Math.max(1, result.pagination?.totalPages ?? 1),
    totalElements: result.pagination?.totalElements ?? result.data.length,
  };
}

export async function getStockAdjustmentDetailsRequest(
  adjustmentId: string
): Promise<StockAdjustmentDetailRecord[]> {
  const response = await fetch(
    apiUrl(`stock/stock-adjustments/${adjustmentId}/details`),
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw getRequestError(response, "No se pudo cargar el detalle del ajuste");
  }

  const result: { data: StockAdjustmentDetailDto[] } = await response.json();
  return result.data.map((detail) => {
    if (
      detail.id === null ||
      detail.bookId === null ||
      detail.systemQuantity === null ||
      detail.physicalQuantity === null
    ) {
      throw new Error("La API devolvió un detalle de ajuste incompleto.");
    }

    return {
      id: String(detail.id),
      bookId: detail.bookId,
      bookName: detail.bookName ?? `Libro #${detail.bookId}`,
      systemQuantity: detail.systemQuantity,
      physicalQuantity: detail.physicalQuantity,
    };
  });
}

export async function createStockAdjustmentRequest(
  warehouseId: number,
  adjustment: CreateStockAdjustmentInput
): Promise<StockAdjustmentRecord> {
  const response = await fetch(
    apiUrl(`stock/stock-adjustments/warehouse/${warehouseId}`),
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(adjustment),
    }
  );

  if (!response.ok) {
    throw getRequestError(response, "No se pudo registrar el ajuste de stock");
  }

  const result: ItemResponse<StockAdjustmentDto> = await response.json();
  return parseStockAdjustment(result.data);
}
