import type { PurchaseItem } from "@/common/components/PurchaseItemsSection";
import type { PurchaseStatus } from "@/common/data/suppliers";

export interface PurchaseOrder {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  status: PurchaseStatus;
  items: PurchaseItem[];
}

export function orderTotal(order: PurchaseOrder): number {
  return order.items.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );
}

export function orderUnits(order: PurchaseOrder): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "OC-1042",
    invoiceNumber: "001-001-00001234",
    supplierId: "1",
    supplierName: "Editorial Sur",
    date: "24/05/2026",
    status: "RECEIVED",
    items: [
      { bookId: "mystery-of-the-lost-island", quantity: 10, unitCost: 68000 },
      { bookId: "cooking-made-easy", quantity: 5, unitCost: 45000 },
    ],
  },
  {
    id: "OC-1041",
    invoiceNumber: "002-003-00000981",
    supplierId: "2",
    supplierName: "Fondo de Cultura",
    date: "21/05/2026",
    status: "PENDING",
    items: [{ bookId: "taste-of-italy", quantity: 12, unitCost: 71000 }],
  },
  {
    id: "OC-1040",
    invoiceNumber: "003-001-00000455",
    supplierId: "3",
    supplierName: "Distribuidora Lector",
    date: "18/05/2026",
    status: "RECEIVED",
    items: [
      { bookId: "shadows-of-doubt", quantity: 8, unitCost: 63000 },
      { bookId: "cooking-made-easy", quantity: 4, unitCost: 44000 },
    ],
  },
  {
    id: "OC-1039",
    invoiceNumber: "001-002-00001187",
    supplierId: "1",
    supplierName: "Editorial Sur",
    date: "15/05/2026",
    status: "CANCELLED",
    items: [{ bookId: "mystery-of-the-lost-island", quantity: 6, unitCost: 69000 }],
  },
  {
    id: "OC-1038",
    invoiceNumber: "002-001-00000876",
    supplierId: "2",
    supplierName: "Fondo de Cultura",
    date: "12/05/2026",
    status: "RECEIVED",
    items: [
      { bookId: "taste-of-italy", quantity: 15, unitCost: 70000 },
      { bookId: "shadows-of-doubt", quantity: 9, unitCost: 62000 },
    ],
  },
  {
    id: "OC-1037",
    invoiceNumber: "003-002-00000342",
    supplierId: "3",
    supplierName: "Distribuidora Lector",
    date: "08/05/2026",
    status: "PENDING",
    items: [{ bookId: "cooking-made-easy", quantity: 20, unitCost: 43000 }],
  },
  {
    id: "OC-1036",
    invoiceNumber: "001-001-00001099",
    supplierId: "1",
    supplierName: "Editorial Sur",
    date: "03/05/2026",
    status: "RECEIVED",
    items: [{ bookId: "shadows-of-doubt", quantity: 7, unitCost: 64000 }],
  },
  {
    id: "OC-1035",
    invoiceNumber: "002-002-00000765",
    supplierId: "2",
    supplierName: "Fondo de Cultura",
    date: "29/04/2026",
    status: "RECEIVED",
    items: [{ bookId: "mystery-of-the-lost-island", quantity: 11, unitCost: 67000 }],
  },
];
