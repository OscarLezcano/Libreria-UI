import type { bookInputType } from "@/common/schemas/book/BookInputSchema";
import { apiUrl, getAuthHeaders } from "@/common/services/http";

export const BOOKS_PAGE_SIZE = 4;
type CatalogResource = "authors" | "genres";

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
    totalElements?: number | null;
  };
}

export interface BooksPage {
  books: BookRecord[];
  totalPages: number;
  totalElements: number;
  nextPage: number | undefined;
}

interface ItemResponse<T> {
  data: T;
}

async function getAllPages<T>(resource: string, name?: string): Promise<T[]> {
  const items: T[] = [];
  let page = 0;
  let hasNextPage = true;

  while (hasNextPage) {
    const query = new URLSearchParams({
      page: String(page),
      size: String(BOOKS_PAGE_SIZE),
    });
    if (name) query.set("name", name);

    const response = await fetch(
      apiUrl(`stock/${resource}?${query.toString()}`),
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
        : result.data.length === BOOKS_PAGE_SIZE;
    page += 1;
  }

  return items;
}

export async function getBooksPageRequest(
  pageIndex: number,
  options: { size?: number; title?: string } = {}
): Promise<BooksPage> {
  const page = Math.max(0, pageIndex);
  const size = options.size ?? BOOKS_PAGE_SIZE;
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (options.title?.trim()) query.set("title", options.title.trim());
  const response = await fetch(apiUrl(`stock/books?${query.toString()}`), {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar los libros");
  }

  const result: ListResponse<BookRecord> = await response.json();
  const totalPages = Math.max(
    1,
    result.pagination?.totalPages ??
    (result.data.length === size ? page + 2 : page + 1)
  );

  return {
    books: result.data,
    totalPages,
    totalElements: result.pagination?.totalElements ?? result.data.length,
    nextPage: page + 1 < totalPages ? page + 1 : undefined,
  };
}

export async function getBookByIdRequest(
  id: string
): Promise<BookRecord | null> {
  const response = await fetch(apiUrl(`stock/books/${id}`), {
    headers: getAuthHeaders(),
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("No se pudo cargar el libro");

  const result: ItemResponse<BookRecord> = await response.json();
  return result.data;
}

export async function getAuthorByIdRequest(
  id: number
): Promise<CatalogEntity | null> {
  const response = await fetch(apiUrl(`stock/authors/${id}`), {
    headers: getAuthHeaders(),
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("No se pudo cargar el autor");

  const result: ItemResponse<CatalogEntity> = await response.json();
  return result.data;
}

export async function getGenreByIdRequest(
  id: number
): Promise<CatalogEntity | null> {
  const response = await fetch(apiUrl(`stock/genres/${id}`), {
    headers: getAuthHeaders(),
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("No se pudo cargar el género");

  const result: ItemResponse<CatalogEntity> = await response.json();
  return result.data;
}

export function searchCatalogRequest(
  resource: CatalogResource,
  name: string
): Promise<CatalogEntity[]> {
  return getAllPages<CatalogEntity>(resource, name.trim());
}

function normalizeName(name: string): string {
  return name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function findCatalogEntityByName(
  resource: CatalogResource,
  name: string
): Promise<CatalogEntity | null> {
  const matches = await getAllPages<CatalogEntity>(resource, name);
  return (
    matches.find(
      (entity) =>
        entity.id !== null &&
        entity.name !== null &&
        normalizeName(entity.name) === normalizeName(name)
    ) ?? null
  );
}

async function createCatalogEntityRequest(
  resource: CatalogResource,
  name: string
): Promise<CatalogEntity> {
  const response = await fetch(apiUrl(`stock/${resource}`), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo crear ${resource === "authors" ? "el autor" : "el género"}: ${name}`);
  }

  const result: ItemResponse<CatalogEntity> = await response.json();
  if (result.data?.id == null) {
    throw new Error(`La API no devolvió el identificador de ${name}`);
  }

  return result.data;
}

async function resolveCatalogIds(
  resource: CatalogResource,
  names: string[]
): Promise<number[]> {
  const uniqueNames = [
    ...new Map(
      names
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => [normalizeName(name), name] as const)
    ).values(),
  ];
  if (uniqueNames.length === 0) return [];

  return Promise.all(
    uniqueNames.map(async (name) => {
      const entity =
        (await findCatalogEntityByName(resource, name)) ??
        (await createCatalogEntityRequest(resource, name));
      if (entity.id === null) {
        throw new Error(`La API no devolvió el identificador de ${name}`);
      }
      return entity.id;
    })
  );
}

function toBookRequest(data: bookInputType, authorIds: number[], genreIds: number[]) {
  return {
    title: data.title,
    description: data.description,
    price: Number(data.price),
    coverUrl: data.coverUrl || null,
    authorIds,
    genreIds,
  };
}

export async function createBookRequest(
  data: bookInputType
): Promise<BookRecord> {
  const [authorIds, genreIds] = await Promise.all([
    resolveCatalogIds("authors", data.authors),
    resolveCatalogIds("genres", data.genres),
  ]);
  const response = await fetch(apiUrl("stock/books"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(toBookRequest(data, authorIds, genreIds)),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear el libro");
  }

  const result: ItemResponse<BookRecord> = await response.json();
  if (result.data?.id == null) {
    throw new Error("La API no devolvió el identificador del libro creado");
  }

  return result.data;
}

export async function updateBookRequest(
  id: string,
  data: bookInputType
): Promise<void> {
  const [authorIds, genreIds] = await Promise.all([
    resolveCatalogIds("authors", data.authors),
    resolveCatalogIds("genres", data.genres),
  ]);
  const response = await fetch(apiUrl(`stock/books/${id}`), {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(toBookRequest(data, authorIds, genreIds)),
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar el libro");
  }
}
