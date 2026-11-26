import { apiUrl, getAuthHeaders } from "@/common/services/http";

export const NUMERO_ORDEN_PATTERN = /^\d{8}$/;

export interface CreateOrderInput {
  items: { bookId: number; quantity: number }[];
  couponCode?: string;
  invoiceName: string;
  invoiceLastName: string;
  invoiceRuc: string;
  invoicePhone: string;
  shippingName: string;
  shippingLastName: string;
  shippingDepartment: string;
  shippingCity: string;
  shippingAddress: string;
  shippingReference?: string;
  shippingPhone: string;
}

export interface OrderShipping {
  name: string | null;
  lastName: string | null;
  department: string | null;
  city: string | null;
  address: string | null;
  reference: string | null;
  phone: string | null;
}

export interface OrderDetail {
  bookId: string | null;
  bookName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
  coverSrc: string | null;
  authors: string[];
}

export interface Order {
  numeroOrden: string;
  details: OrderDetail[] | null;
  status: string;
  createdAt: string | null;
  couponCode: string | null;
  invoiceNumber: string | null;
  invoiceRuc: string | null;
  invoiceName: string | null;
  invoiceLastName: string | null;
  invoicePhone: string | null;
  shipping: OrderShipping | null;
  subtotal: number;
  discountAmount: number;
  totalPrice: number;
  productCount: number | null;
  totalUnits: number | null;
}

export interface OrderPage {
  orders: Order[];
  totalPages: number;
  totalElements: number;
}

export class SalesApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "SalesApiError";
  }
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function amount(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function optionalInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : null;
}

function publicOrderNumber(value: unknown): string {
  const normalized = typeof value === "number" ? String(value) : text(value);
  if (!normalized || !NUMERO_ORDEN_PATTERN.test(normalized)) {
    throw new SalesApiError(
      "La API devolvió un pedido sin un número de orden válido."
    );
  }
  return normalized;
}

function validateOrderNumber(value: string): string {
  const normalized = value.trim();
  if (!NUMERO_ORDEN_PATTERN.test(normalized)) {
    throw new SalesApiError("El número de orden debe tener exactamente 8 dígitos.", 400);
  }
  return normalized;
}

function parseDetail(value: unknown): OrderDetail {
  const data = record(value);
  if (!data) throw new SalesApiError("La API devolvió un producto inválido.");
  const book = record(data.book);
  const rawBookId = data.bookId ?? data.book_id ?? book?.id;
  const bookId =
    typeof rawBookId === "number" && Number.isSafeInteger(rawBookId)
      ? String(rawBookId)
      : text(rawBookId);
  const quantity = amount(data.quantity) ?? 0;
  const unitPrice = amount(data.unitPrice ?? data.price) ?? 0;
  const discount = amount(data.discount) ?? 0;
  const lineTotal =
    amount(data.lineTotal ?? data.totalPrice ?? data.subtotal) ??
    Math.max(0, unitPrice * quantity - discount);
  const rawAuthors = book?.authors ?? data.authors;
  const authors = Array.isArray(rawAuthors)
    ? rawAuthors.flatMap((author) => {
        const name = text(author) ?? text(record(author)?.name);
        return name ? [name] : [];
      })
    : [];

  return {
    bookId,
    bookName:
      text(data.bookName ?? data.title ?? book?.title) ?? "Producto no disponible",
    quantity,
    unitPrice,
    discount,
    lineTotal,
    coverSrc: text(data.coverSrc ?? data.coverUrl ?? book?.coverSrc ?? book?.coverUrl),
    authors,
  };
}

function parseDetails(value: unknown): OrderDetail[] | null {
  return Array.isArray(value) ? value.map(parseDetail) : null;
}

function parseShipping(data: Record<string, unknown>): OrderShipping | null {
  const nested = record(data.shipping);
  const source = nested ?? data;
  const shipping = {
    name: text(source.shippingName ?? source.nombre ?? source.name),
    lastName: text(source.shippingLastName ?? source.apellido ?? source.lastName),
    department: text(source.shippingDepartment ?? source.departamento ?? source.department),
    city: text(source.shippingCity ?? source.ciudad ?? source.city),
    address: text(source.shippingAddress ?? source.direccion ?? source.address),
    reference: text(source.shippingReference ?? source.referencia ?? source.reference),
    phone: text(source.shippingPhone ?? source.telefono ?? source.phone),
  };
  return Object.values(shipping).some(Boolean) ? shipping : null;
}

function parseOrder(value: unknown): Order {
  const data = record(value);
  if (!data) throw new SalesApiError("La API devolvió un pedido inválido.");
  const details = parseDetails(data.orderDetails ?? data.order_details ?? data.items);
  const detailSubtotal = details?.reduce((sum, item) => sum + item.lineTotal, 0);
  const subtotal = amount(data.subtotal) ?? detailSubtotal ?? amount(data.totalPrice ?? data.total) ?? 0;
  const discountAmount = amount(data.discountAmount ?? data.discount) ?? 0;
  const totalPrice = amount(data.totalPrice ?? data.total) ?? Math.max(0, subtotal - discountAmount);
  const totalUnits = optionalInteger(data.totalUnits) ??
    (details ? details.reduce((sum, item) => sum + item.quantity, 0) : null);

  return {
    numeroOrden: publicOrderNumber(data.numeroOrden),
    details,
    status: text(data.status)?.toUpperCase() ?? "UNKNOWN",
    createdAt: text(data.createdAt ?? data.created_at ?? data.createdDate ?? data.date),
    couponCode: text(data.couponCode),
    invoiceNumber: text(data.invoiceNumber),
    invoiceRuc: text(data.invoiceRuc),
    invoiceName: text(data.invoiceName),
    invoiceLastName: text(data.invoiceLastName),
    invoicePhone: text(data.invoicePhone),
    shipping: parseShipping(data),
    subtotal,
    discountAmount,
    totalPrice,
    productCount: optionalInteger(data.productCount) ?? details?.length ?? null,
    totalUnits,
  };
}

async function responseError(response: Response, fallback: string): Promise<never> {
  let message = fallback;
  if (response.status === 400) {
    message = "Los datos del pedido no son válidos. Revisalos e intentá nuevamente.";
  } else if (response.status === 401) {
    message = "Tu sesión venció. Iniciá sesión nuevamente.";
  } else if (response.status === 403) {
    message = "No tenés permisos para operar sobre este pedido.";
  } else if (response.status === 404) {
    message = "No se encontró el pedido solicitado.";
  } else if (response.status === 409) {
    message = "El pedido cambió o no hay stock suficiente. Actualizá su estado antes de reintentar.";
  }
  throw new SalesApiError(message, response.status);
}

async function fetchSales(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(getAuthHeaders());
  const requestHeaders = new Headers(init.headers);
  requestHeaders.forEach((value, key) => headers.set(key, value));
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    throw new SalesApiError(
      "No pudimos comunicarnos con Ventas. Revisá tu conexión e intentá nuevamente."
    );
  }
  return response;
}

export async function createOrderRequest(
  order: CreateOrderInput,
  idempotencyKey: string
): Promise<Order> {
  const headers = new Headers({ "Idempotency-Key": idempotencyKey });
  const response = await fetchSales("sales/orders", {
    method: "POST",
    headers,
    body: JSON.stringify(order),
  });
  if (!response.ok) {
    return responseError(response, "No se pudo crear el pedido. Intentá nuevamente.");
  }
  const result = record(await response.json());
  return parseOrder(result?.data ?? result);
}

export interface MyOrdersFilters {
  sort?: string;
  minTotal?: number;
  maxTotal?: number;
  createdFrom?: string;
  createdTo?: string;
}

export async function getMyOrders(
  page = 1,
  size = 10,
  search = "",
  filters: MyOrdersFilters = {}
): Promise<OrderPage> {
  const currentPage = Math.max(1, Math.floor(page));
  const pageSize = Math.max(1, Math.floor(size));
  const query = new URLSearchParams({
    page: String(currentPage - 1),
    size: String(pageSize),
    sort: filters.sort ?? "createdAt,desc",
  });
  if (search.trim()) query.set("search", search.trim());
  if (filters.minTotal !== undefined) {
    query.set("minTotal", String(filters.minTotal));
  }
  if (filters.maxTotal !== undefined) {
    query.set("maxTotal", String(filters.maxTotal));
  }
  if (filters.createdFrom) query.set("createdFrom", filters.createdFrom);
  if (filters.createdTo) query.set("createdTo", filters.createdTo);
  const response = await fetchSales(`sales/orders/mine?${query.toString()}`);
  if (!response.ok) {
    return responseError(response, "No se pudieron cargar tus compras. Intentá nuevamente.");
  }

  const result = record(await response.json());
  const nestedPage = record(result?.data);
  const rawOrders = Array.isArray(result?.data)
    ? result.data
    : Array.isArray(nestedPage?.content)
      ? nestedPage.content
      : null;
  if (!rawOrders) {
    throw new SalesApiError("La respuesta del historial de pedidos no es válida.");
  }
  const pagination = record(result?.pagination) ?? record(nestedPage?.pagination);
  const totalElements = optionalInteger(
    pagination?.totalElements ?? nestedPage?.totalElements
  );
  const totalPages = optionalInteger(
    pagination?.totalPages ?? nestedPage?.totalPages
  ) ??
    (totalElements !== null
      ? Math.max(1, Math.ceil(totalElements / pageSize))
      : rawOrders.length === pageSize
        ? currentPage + 1
        : currentPage);

  return {
    orders: rawOrders.map(parseOrder),
    totalPages: Math.max(1, totalPages),
    totalElements: totalElements ?? rawOrders.length,
  };
}

export async function getOrderByNumeroOrdenRequest(
  numeroOrden: string
): Promise<Order | null> {
  const code = validateOrderNumber(numeroOrden);
  const response = await fetchSales(`sales/orders/numero/${code}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    return responseError(response, "No se pudo cargar el pedido. Intentá nuevamente.");
  }
  const result = record(await response.json());
  const order = parseOrder(result?.data ?? result);
  if (order.numeroOrden !== code) {
    throw new SalesApiError("La API devolvió un pedido distinto al solicitado.");
  }
  return order;
}

export async function getOrderDetailsRequest(
  numeroOrden: string
): Promise<OrderDetail[]> {
  const code = validateOrderNumber(numeroOrden);
  const response = await fetchSales(`sales/orders/numero/${code}/details`);
  if (!response.ok) {
    return responseError(response, "No se pudieron cargar los productos del pedido.");
  }
  const result = record(await response.json());
  if (!Array.isArray(result?.data)) {
    throw new SalesApiError("La respuesta de los productos del pedido no es válida.");
  }
  return result.data.map(parseDetail);
}

async function updateOrderStatus(
  numeroOrden: string,
  status: "PAID" | "CANCELLED"
): Promise<Order> {
  const code = validateOrderNumber(numeroOrden);
  const response = await fetchSales(`sales/orders/numero/${code}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    return responseError(
      response,
      status === "PAID"
        ? "No se pudo confirmar el pago. Revisá el estado del pedido antes de reintentar."
        : "No se pudo cancelar el pedido. Intentá nuevamente."
    );
  }
  const result = record(await response.json());
  const order = parseOrder(result?.data ?? result);
  if (order.numeroOrden !== code) {
    throw new SalesApiError("La API devolvió un pedido distinto al actualizado.");
  }
  return order;
}

export function markOrderAsPaidRequest(numeroOrden: string): Promise<Order> {
  return updateOrderStatus(numeroOrden, "PAID");
}

export function cancelOrderRequest(numeroOrden: string): Promise<Order> {
  return updateOrderStatus(numeroOrden, "CANCELLED");
}
