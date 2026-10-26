export interface Coupon {
  code: string;
  description: string;
  type: "percent" | "fixed";
  value: number;
}

export const COUPONS: Coupon[] = [
  {
    code: "LIBRO10",
    description: "10% de descuento",
    type: "percent",
    value: 10,
  },
  {
    code: "BIENVENIDO",
    description: "5.000 Gs de descuento",
    type: "fixed",
    value: 5000,
  },
];

export function findCoupon(code: string): Coupon | undefined {
  const normalized = code.trim().toUpperCase();
  return COUPONS.find((coupon) => coupon.code === normalized);
}

export function couponDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.type === "percent") {
    return Math.round((subtotal * coupon.value) / 100);
  }
  return Math.min(coupon.value, subtotal);
}
