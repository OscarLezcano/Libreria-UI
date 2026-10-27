import { getAuthHeaders } from "@/common/services/http";

const SALES_API_URL =
  process.env.NEXT_PUBLIC_SALES_API_URL ?? "http://localhost:8080/sales";

export interface CreateOrderInput {
  items: { bookId: number; quantity: number }[];
  couponCode?: string;
}

export async function createOrderRequest(
  order: CreateOrderInput
): Promise<string> {
  const response = await fetch(`${SALES_API_URL}/orders`, {
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

// export async function markOrderAsPaidRequest(orderId: string): Promise<void> {
//   const response = await fetch(`${SALES_API_URL}/orders/${orderId}/status`, {
//     method: "PUT",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({ status: "PAID" }),
//   });

//   if (!response.ok) {
//     throw new Error("El pedido se creó, pero no se pudo confirmar el pago.");
//   }
// }
