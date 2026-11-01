import { apiUrl, getAuthHeaders } from "@/common/services/http";
import type { PurchaseStatus } from "@/common/data/suppliers";

const PURCHASES_URL = "api/v1/purchases";

interface PurchaseDto {
  id: number | null;
  supplierId: number | null;
  status: string | null;
  totalPrice: number | null;
  invoiceNumber: string | null;
  createdAt: string | null;
  detailIds?: number[] | null;
}

interface PurchaseListResponse {
  data: PurchaseDto[];
  pagination?: {
    totalPages?: number | null;
    totalElements?: number | null;
  };
}

interface PurchaseDetailDto {
  bookId: number | null;
  bookName: string | null;
  quantity: number | null;
  unitCost: number | null;
}

interface PurchaseDetailListResponse {
  data: PurchaseDetailDto[];
}

export interface PurchaseRecord {
  id: string;
  supplierId: string;
  status: PurchaseStatus;
  totalPrice: number;
  invoiceNumber: string;
  createdAt: string | null;
  detailCount: number;
}

export interface PurchaseDetailRecord {
  bookId: string;
  bookName: string;
  quantity: number;
  unitCost: number;
}

export interface PurchasePage {
  purchases: PurchaseRecord[];
  totalPages: number;
  totalElements: number;
}

export interface CreatePurchaseInput {
  warehouseId: number;
  supplierId: number;
  items: { bookId: number; quantity: number; unitCost: number }[];
}

function parsePurchase(purchase: PurchaseDto): PurchaseRecord {
  if (purchase.id === null || purchase.supplierId === null) {
    throw new Error("La API devolvió una compra sin identificador o proveedor.");
  }
  if (
    purchase.status !== "PENDING" &&
    purchase.status !== "RECEIVED" &&
    purchase.status !== "CANCELLED"
  ) {
    throw new Error("La API devolvió una compra con estado inválido.");
  }

  return {
    id: String(purchase.id),
    supplierId: String(purchase.supplierId),
    status: purchase.status,
    totalPrice: purchase.totalPrice ?? 0,
    invoiceNumber: purchase.invoiceNumber ?? "",
    createdAt: purchase.createdAt,
    detailCount: purchase.detailIds?.length ?? 0,
  };
}

export async function getPurchasesRequest(
  page: number,
  size: number,
  status: "ALL" | PurchaseStatus,
  invoiceNumber: string,
  warehouseId: number
): Promise<PurchasePage> {
  const query = new URLSearchParams({
    page: String(Math.max(0, page - 1)),
    size: String(size),
    warehouseId: String(warehouseId),
  });
  if (status !== "ALL") query.set("status", status);
  if (invoiceNumber.trim()) query.set("invoiceNumber", invoiceNumber.trim());

  const response = await fetch(
    apiUrl(`${PURCHASES_URL}?${query.toString()}`),
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error(
      response.status === 401 || response.status === 403
        ? "No tienes permisos para consultar las compras."
        : `No se pudieron cargar las compras (HTTP ${response.status}).`
    );
  }

  const result: PurchaseListResponse = await response.json();
  return {
    purchases: result.data.map(parsePurchase),
    totalPages: Math.max(1, result.pagination?.totalPages ?? 1),
    totalElements: result.pagination?.totalElements ?? result.data.length,
  };
}

export async function getPurchaseByIdRequest(
  id: string
): Promise<PurchaseRecord | null> {
  const response = await fetch(apiUrl(`${PURCHASES_URL}/${id}`), {
    headers: getAuthHeaders(),
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`No se pudo cargar la compra (HTTP ${response.status}).`);
  }

  const result: { data: PurchaseDto } = await response.json();
  return parsePurchase(result.data);
}

export async function getPurchaseDetailsRequest(
  id: string
): Promise<PurchaseDetailRecord[] | null> {
  const response = await fetch(apiUrl(`${PURCHASES_URL}/${id}/details`), {
    headers: getAuthHeaders(),
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`No se pudieron cargar los ítems de la compra (HTTP ${response.status}).`);
  }

  const result: PurchaseDetailListResponse = await response.json();
  return result.data.map((detail) => {
    if (detail.bookId === null || detail.quantity === null || detail.unitCost === null) {
      throw new Error("La API devolvió un ítem de compra incompleto.");
    }

    return {
      bookId: String(detail.bookId),
      bookName: detail.bookName ?? `Libro #${detail.bookId}`,
      quantity: detail.quantity,
      unitCost: detail.unitCost,
    };
  });
}

export async function createPurchaseRequest(
  purchase: CreatePurchaseInput
): Promise<PurchaseRecord> {
  const response = await fetch(apiUrl(PURCHASES_URL), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(purchase),
  });

  if (!response.ok) {
    throw new Error(
      response.status === 401 || response.status === 403
        ? "No tienes permisos para registrar compras."
        : response.status === 404
          ? "No se encontró el proveedor o uno de los libros seleccionados."
          : `No se pudo registrar la compra (HTTP ${response.status}).`
    );
  }

  const result: { data: PurchaseDto } = await response.json();
  return parsePurchase(result.data);
}

export async function updatePurchaseStatusRequest(
  id: string,
  status: Exclude<PurchaseStatus, "PENDING">,
  invoiceNumber?: string
): Promise<void> {
  const body: {
    status: Exclude<PurchaseStatus, "PENDING">;
    invoiceNumber?: string;
  } = { status };
  if (status === "RECEIVED") {
    const normalizedInvoiceNumber = invoiceNumber?.trim();
    if (!normalizedInvoiceNumber) {
      throw new Error("Ingresá el número de factura para aceptar la compra.");
    }
    body.invoiceNumber = normalizedInvoiceNumber;
  }

  const response = await fetch(apiUrl(`${PURCHASES_URL}/${id}/status`), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      response.status === 401 || response.status === 403
        ? "No tienes permisos para cambiar el estado de la compra."
        : response.status === 409
          ? "No se pudo cambiar el estado porque la compra ya cambió."
          : `No se pudo actualizar la compra (HTTP ${response.status}).`
    );
  }
}
