export type PurchaseStatus = "pendiente" | "aprobado" | "enviado" | "cancelado";

export interface Purchase {
  id: string;
  bookId: string;
  date: string;
  quantity: number;
  status: PurchaseStatus;
}

export const PURCHASES: Purchase[] = [
  {
    id: "P-1042",
    bookId: "mystery-of-the-lost-island",
    date: "24/05/2026",
    quantity: 1,
    status: "aprobado",
  },
  {
    id: "P-1037",
    bookId: "taste-of-italy",
    date: "20/05/2026",
    quantity: 2,
    status: "enviado",
  },
  {
    id: "P-1021",
    bookId: "cooking-made-easy",
    date: "02/05/2026",
    quantity: 1,
    status: "pendiente",
  },
  {
    id: "P-1009",
    bookId: "shadows-of-doubt",
    date: "28/04/2026",
    quantity: 1,
    status: "cancelado",
  },
  {
    id: "P-0994",
    bookId: "cooking-made-easy",
    date: "15/04/2026",
    quantity: 2,
    status: "enviado",
  },
  {
    id: "P-0981",
    bookId: "mystery-of-the-lost-island",
    date: "02/04/2026",
    quantity: 1,
    status: "aprobado",
  },
  {
    id: "P-0975",
    bookId: "taste-of-italy",
    date: "21/03/2026",
    quantity: 1,
    status: "pendiente",
  },
  {
    id: "P-0962",
    bookId: "shadows-of-doubt",
    date: "09/03/2026",
    quantity: 3,
    status: "enviado",
  },
  {
    id: "P-0950",
    bookId: "mystery-of-the-lost-island",
    date: "27/02/2026",
    quantity: 1,
    status: "aprobado",
  },
  {
    id: "P-0941",
    bookId: "cooking-made-easy",
    date: "14/02/2026",
    quantity: 1,
    status: "cancelado",
  },
];
