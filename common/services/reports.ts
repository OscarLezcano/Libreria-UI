import { apiFetch, apiUrl, getAuthHeaders } from "@/common/services/http";

export interface BestSellingBook {
  bookId: number;
  bookName: string;
  totalSold: number;
}

interface BestSellingBookDto {
  bookId?: number | null;
  bookName?: string | null;
  totalSold?: number | null;
}

export async function getBestSellingBooksRequest(limit = 10): Promise<BestSellingBook[]> {
  const normalizedLimit = Math.max(1, Math.min(Math.floor(limit), 100));
  const response = await apiFetch(apiUrl(`sales/orders/best-sellers?limit=${normalizedLimit}`), {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("No tenés permisos para consultar este reporte.");
    }
    throw new Error(`No se pudo cargar el reporte (HTTP ${response.status}).`);
  }
  const result = (await response.json()) as { data?: BestSellingBookDto[] };
  if (!Array.isArray(result.data)) throw new Error("La API devolvió un reporte inválido.");
  return result.data.map((book) => ({
    bookId: book.bookId ?? 0,
    bookName: book.bookName ?? "Sin título",
    totalSold: book.totalSold ?? 0,
  }));
}
