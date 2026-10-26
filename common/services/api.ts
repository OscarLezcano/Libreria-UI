export type Role = 'ADMIN' | 'SELLER' | 'WAREHOUSE' | 'READER';

export interface ApiPage<T> {
  data: T[];
  pagination?: { page?: number; size?: number; totalPages?: number; totalElements?: number };
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
}

export interface BookDto {
  id: number;
  title: string;
  authorName?: string;
  author?: { name?: string };
  genreName?: string;
  price?: number;
  stock?: number;
}

export interface SupplierDto {
  id: number;
  name: string;
  ruc?: string;
}

export interface PurchaseDto {
  id: number;
  supplierName?: string;
  invoiceNumber: string;
  status: string;
  totalPrice: number;
  details?: { bookName: string; quantity: number; unitCost: number }[];
  createdAt?: string;
}

export interface OrderDto {
  id: number;
  status: string;
  total?: number;
  totalPrice?: number;
  createdAt?: string;
  details?: { bookName?: string; quantity?: number }[];
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api/gateway').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function token() {
  if (typeof document === 'undefined') return '';
  return document.cookie.match(/(?:^|; )token=([^;]+)/)?.[1] || localStorage.getItem('token') || '';
}

export async function gatewayRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const jwt = token();
  if (jwt) headers.set('Authorization', `Bearer ${decodeURIComponent(jwt)}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    let message = `No se pudo completar la solicitud (${response.status})`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // The gateway can return an empty body for 401/404.
    }
    throw new ApiError(response.status, message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function query(path: string, params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => value !== undefined && value !== '' && search.set(key, String(value)));
  return `${path}?${search.toString()}`;
}

export const api = {
  books: (search = '', page = 0) => gatewayRequest<ApiPage<BookDto>>(query('/stock/books', { title: search, page, size: 8 })),
  suppliers: (page = 0) => gatewayRequest<ApiPage<SupplierDto>>(query('/api/v1/suppliers', { page, size: 8 })),
  purchases: (page = 0) => gatewayRequest<ApiPage<PurchaseDto>>(query('/api/v1/purchases', { page, size: 8, sort: 'createdAt,desc' })),
  orders: (page = 0) => gatewayRequest<ApiPage<OrderDto> | { data: OrderDto[] }>(query('/sales/orders', { page, size: 8, sort: 'createdAt,desc' })),
  createPurchase: (payload: {
    warehouseId: number;
    supplierId: number;
    invoiceNumber: string;
    details: { bookId: number; bookName: string; quantity: number; unitCost: number }[];
  }) => gatewayRequest<PurchaseDto>('/api/v1/purchases', { method: 'POST', body: JSON.stringify(payload) }),
  createOrder: (payload: { warehouseId?: number; details: { bookId: number; quantity: number }[] }) =>
    gatewayRequest<OrderDto>('/sales/orders', { method: 'POST', body: JSON.stringify(payload) }),
};

export function normalizePage<T>(response: ApiPage<T> | { data?: T[] } | T[]): { data: T[]; totalPages: number } {
  if (Array.isArray(response)) return { data: response, totalPages: 1 };
  const page = response as ApiPage<T>;
  const pagination = page.pagination;
  return {
    data: page.data || [],
    totalPages: pagination?.totalPages || page.totalPages || 1,
  };
}

export function getRole(): Role {
  if (typeof window === 'undefined') return 'READER';
  const value = localStorage.getItem('role') || document.cookie.match(/(?:^|; )role=([^;]+)/)?.[1];
  return (value?.toUpperCase() as Role) || 'READER';
}
