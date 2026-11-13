import { apiUrl, getAuthHeaders } from "@/common/services/http";

export interface CreateOrderInput {
  items: { bookId: number; quantity: number }[];
  couponCode?: string;
  invoiceName: string;
  invoiceLastName: string;
  invoiceRuc: string;
  invoicePhone: string;
}

export interface CreatedOrder {
  id: string;
  orderNumber: string;
}

export interface PaidOrder {
  orderNumber: string;
  invoiceNumber: string;
}

export async function createOrderRequest(
  order: CreateOrderInput
): Promise<CreatedOrder> {
  const response = await fetch(apiUrl("sales/orders"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear el pedido. Revisá el carrito e intentá de nuevo.");
  }

  const result: { data?: unknown } = await response.json();
  if (
    !result.data ||
    typeof result.data !== "object" ||
    !("id" in result.data) ||
    !("orderNumber" in result.data)
  ) {
    throw new Error("La respuesta del pedido no contiene sus identificadores.");
  }

  const data = result.data as { id?: unknown; orderNumber?: unknown };
  if (
    (typeof data.id !== "number" && typeof data.id !== "string") ||
    typeof data.orderNumber !== "string" ||
    !data.orderNumber
  ) {
    throw new Error("La respuesta del pedido contiene un identificador inválido.");
  }

  return { id: String(data.id), orderNumber: data.orderNumber };
}

export interface OrderItem {
  bookId: number | string;
  book_id?: number | string;
  quantity: number;
  price?: number;
  book?: {
    id?: number | string;
    title?: string;
    authors?: string[];
    coverSrc?: string;
  };
}

export interface OrderDetail extends OrderItem {
  id?: number | string;
  bookName?: string;
  unitPrice?: number;
  discount?: number;
}

export interface Order {
  id: string | number;
  orderNumber?: string;
  orderId?: string | number;
  items: OrderItem[];
  orderDetails?: OrderItem[];
  order_details?: OrderItem[];
  orderDetailIds?: Array<string | number>;
  status: string;
  createdAt?: string;
  created_at?: string;
  date?: string;
  createdDate?: string;
  couponCode?: string | null;
  invoiceNumber?: string;
  subtotal?: number;
  totalPrice?: number;
  total?: number;
  [key: string]: unknown;
}

export async function getMyOrders(): Promise<Order[]> {
  const response = await fetch(apiUrl("sales/orders/mine"), {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar tus compras");
  }

  const result: unknown = await response.json();

  if (Array.isArray(result)) return result as Order[];
  if (result && typeof result === "object") {
    const obj = result as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as Order[];
    if (obj.data && typeof obj.data === "object") {
      const page = obj.data as Record<string, unknown>;
      if (Array.isArray(page.content)) return page.content as Order[];
    }
    if (Array.isArray(obj.orders)) return obj.orders as Order[];
    if (Array.isArray(obj.items)) return obj.items as Order[];
    if (Array.isArray(obj.content)) return obj.content as Order[];
    if (Array.isArray(obj.results)) return obj.results as Order[];
  }
  return [];
}

export async function getOrderDetailsRequest(
  orderId: string | number
): Promise<OrderDetail[]> {
  const response = await fetch(apiUrl(`sales/orders/${orderId}/details`), {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el detalle del pedido");
  }

  const result: { data?: unknown } = await response.json();
  if (!Array.isArray(result.data)) {
    throw new Error("La respuesta del detalle del pedido no es válida");
  }
  return result.data as OrderDetail[];
}

export async function markOrderAsPaidRequest(orderId: string): Promise<PaidOrder> {
  const response = await fetch(apiUrl(`sales/orders/${orderId}/status`), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: "PAID" }),
  });

  if (!response.ok) {
    throw new Error("El pedido se creó, pero no se pudo confirmar el pago.");
  }
  const result: { data?: unknown } = await response.json();
  if (!result.data || typeof result.data !== "object") {
    throw new Error("El pago fue confirmado, pero la factura no fue devuelta.");
  }
  const data = result.data as Record<string, unknown>;
  if (typeof data.orderNumber !== "string" || typeof data.invoiceNumber !== "string") {
    throw new Error("La respuesta de pago no contiene los datos de factura.");
  }
  return { orderNumber: data.orderNumber, invoiceNumber: data.invoiceNumber };
}
