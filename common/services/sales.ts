import { apiUrl, getAuthHeaders } from "@/common/services/http";

export interface CreateOrderInput {
  items: { bookId: number; quantity: number }[];
  couponCode?: string;
}

export async function createOrderRequest(
  order: CreateOrderInput
): Promise<string> {
  const response = await fetch(apiUrl("sales/orders"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear el pedido. Revisá el carrito e intentá de nuevo.");
  }

  const result: { data?: unknown } = await response.json();
  if (!result.data || typeof result.data !== "object" || !("id" in result.data)) {
    throw new Error("La respuesta del pedido no contiene su identificador.");
  }

  const id = result.data.id;
  if (typeof id !== "number" && typeof id !== "string") {
    throw new Error("La respuesta del pedido contiene un identificador inválido.");
  }

  return String(id);
}

export interface OrderItem {
  bookId: number | string;
  quantity: number;
  price?: number;
  book?: {
    id?: number | string;
    title?: string;
    authors?: string[];
    coverSrc?: string;
  };
}

export interface Order {
  id: string | number;
  orderId?: string | number;
  items: OrderItem[];
  status: string;
  createdAt?: string;
  date?: string;
  createdDate?: string;
  couponCode?: string | null;
  total?: number;
  [key: string]: unknown;
}

export async function getMyOrders(): Promise<Order[]> {
  const response = await fetch(apiUrl("sales/orders"), {
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
    if (Array.isArray(obj.orders)) return obj.orders as Order[];
    if (Array.isArray(obj.items)) return obj.items as Order[];
    if (Array.isArray(obj.content)) return obj.content as Order[];
    if (Array.isArray(obj.results)) return obj.results as Order[];
  }
  return [];
}

// export async function markOrderAsPaidRequest(orderId: string): Promise<void> {
//   const response = await fetch(apiUrl(`sales/orders/${orderId}/status`), {
//     method: "PUT",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({ status: "PAID" }),
//   });
//
//   if (!response.ok) {
//     throw new Error("El pedido se creó, pero no se pudo confirmar el pago.");
//   }
// }
