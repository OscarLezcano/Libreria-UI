export interface Supplier {
  id: string;
  name: string;
  ruc: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  active: boolean;
}

export const SUPPLIERS: Supplier[] = [
  {
    id: "1",
    name: "Editorial Sur",
    ruc: "80012345-6",
    contactName: "Raúl Benítez",
    email: "ventas@editorialsur.com.py",
    phone: "+595 21 555 100",
    address: "Av. España 1234, Asunción",
    active: true,
  },
  {
    id: "2",
    name: "Fondo de Cultura",
    ruc: "80098765-4",
    contactName: "Silvia Ojeda",
    email: "contacto@fondodecultura.com.py",
    phone: "+595 71 202 340",
    address: "Cero Corá 890, Encarnación",
    active: true,
  },
  {
    id: "3",
    name: "Distribuidora Lector",
    ruc: "80055511-2",
    contactName: "Mario Ramírez",
    email: "pedidos@distribuidoralector.com.py",
    phone: "+595 61 445 780",
    address: "Independencia 456, Ciudad del Este",
    active: true,
  },
  {
    id: "4",
    name: "Librería Central",
    ruc: "80033322-1",
    contactName: "Ana Torres",
    email: "info@libreriacentral.com.py",
    phone: "+595 29 440 220",
    address: "Maipú 1220, Villarrica",
    active: false,
  },
];

export type PurchaseStatus = "PENDING" | "RECEIVED" | "CANCELLED";

export const PURCHASE_STATUS_OPTIONS: {
  value: PurchaseStatus;
  label: string;
}[] = [
  { value: "PENDING", label: "Pendiente de entrega" },
  { value: "RECEIVED", label: "Recibido en inventario" },
  { value: "CANCELLED", label: "Cancelado" },
];

export const PURCHASE_STATUS_META: Record<
  PurchaseStatus,
  { label: string; badge: string }
> = {
  PENDING: { label: "Pendiente", badge: "badge-warning" },
  RECEIVED: { label: "Recibido", badge: "badge-success" },
  CANCELLED: { label: "Cancelado", badge: "badge-error" },
};
