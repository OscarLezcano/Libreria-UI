import type { bookInputType } from "@/common/schemas/book/BookInputSchema";
import { getAuthHeaders } from "@/common/services/http";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const STOCK_API_URL =
  process.env.NEXT_PUBLIC_STOCK_API_URL ?? "http://localhost:8080/stock";
const API_PAGE_SIZE = 25;

export interface BookRecord {
  id: number | null;
  title: string | null;
  description: string | null;
  price: number | null;
  coverUrl: string | null;
  authorIds?: (number | null)[] | null;
  genreIds?: (number | null)[] | null;
}

export interface CatalogEntity {
  id: number | null;
  name: string | null;
}

interface ListResponse<T> {
  data: T[];
  pagination?: {
    totalPages?: number | null;
  };
}

interface ItemResponse<T> {
  data: T;
}

async function getAllPages<T>(resource: string): Promise<T[]> {
  const items: T[] = [];
  let page = 0;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await fetch(
      `${STOCK_API_URL}/${resource}?page=${page}&size=${API_PAGE_SIZE}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error(`No se pudieron cargar ${resource}`);
    }

    const result: ListResponse<T> = await response.json();
    items.push(...result.data);
    hasNextPage =
      result.pagination?.totalPages != null
        ? page + 1 < result.pagination.totalPages
        : result.data.length === API_PAGE_SIZE;
    page += 1;
  }

  return items;
}

export function getBooksRequest(): Promise<BookRecord[]> {
  return getAllPages<BookRecord>("books");
}

export async function getBookByIdRequest(
  id: string
): Promise<BookRecord | null> {
  const response = await fetch(`${STOCK_API_URL}/books/${id}`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("No se pudo cargar el libro");

  const result: ItemResponse<BookRecord> = await response.json();
  return result.data;
}

export function getAuthorsRequest(): Promise<CatalogEntity[]> {
  return getAllPages<CatalogEntity>("authors");
}

export function getGenresRequest(): Promise<CatalogEntity[]> {
  return getAllPages<CatalogEntity>("genres");
}

export async function createBookRequest(
  data: bookInputType
): Promise<{ id: string }> {
  const response = await fetch(`${API_URL}/books`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      price: data.price ? Number(data.price) : null,
      coverUrl: data.coverUrl || null,
      authors: data.authors.map((name) => ({ name })),
      genres: data.genres.map((name) => ({ name })),
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear el libro");
  }

  return response.json();
}

export async function updateBookRequest(
  id: string,
  data: bookInputType
): Promise<void> {
  const response = await fetch(`${API_URL}/books/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      price: data.price ? Number(data.price) : null,
      coverUrl: data.coverUrl || null,
      authors: data.authors.map((name) => ({ name })),
      genres: data.genres.map((name) => ({ name })),
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar el libro");
  }
}
