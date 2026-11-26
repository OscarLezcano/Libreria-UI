export interface OrderStatusMeta {
  label: string;
  badge: string;
}

const STATUS_META: Record<string, OrderStatusMeta> = {
  PENDING: { label: "Pendiente", badge: "badge-warning" },
  PAID: { label: "Pagado", badge: "badge-info" },
  APPROVED: { label: "Aprobado", badge: "badge-success" },
  COMPLETED: { label: "Completado", badge: "badge-success" },
  SHIPPED: { label: "Enviado", badge: "badge-info" },
  CANCELLED: { label: "Cancelado", badge: "badge-error" },
  CANCELED: { label: "Cancelado", badge: "badge-error" },
  REFUNDED: { label: "Reembolsado", badge: "badge-ghost" },
};

export function getOrderStatusMeta(status: string): OrderStatusMeta {
  const key = status.trim().toUpperCase();
  return STATUS_META[key] ?? {
    label: key || "Desconocido",
    badge: "badge-ghost",
  };
}
