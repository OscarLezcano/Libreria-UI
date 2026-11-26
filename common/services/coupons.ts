import { apiUrl, getAuthHeaders } from "@/common/services/http";

export interface CouponRecord {
  id: number;
  code: string;
  discountPercent: number;
  validFrom: string | null;
  validUntil: string | null;
  bookIds: number[];
  singleUsePerUser: boolean;
  createdAt: string | null;
}

export interface CouponInput {
  code: string;
  discountPercent: number;
  validFrom?: string | null;
  validUntil?: string | null;
  bookIds: number[];
  singleUsePerUser: boolean;
}

export interface CouponPage {
  coupons: CouponRecord[];
  totalPages: number;
  totalElements: number;
}

interface CouponDto {
  id?: number | null;
  code?: string | null;
  discountPercent?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  bookIds?: (number | null)[] | null;
  singleUsePerUser?: boolean | null;
  createdAt?: string | null;
}

interface CouponEnvelope {
  data?: CouponDto | CouponDto[];
  pagination?: {
    totalPages?: number | null;
    totalElements?: number | null;
  };
}

export class CouponsApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "CouponsApiError";
  }
}

function parseCoupon(dto: CouponDto): CouponRecord {
  if (typeof dto.id !== "number") {
    throw new CouponsApiError("La API devolvió un cupón sin identificador.");
  }
  return {
    id: dto.id,
    code: dto.code ?? "",
    discountPercent: dto.discountPercent ?? 0,
    validFrom: dto.validFrom ?? null,
    validUntil: dto.validUntil ?? null,
    bookIds: (dto.bookIds ?? []).flatMap((id) =>
      typeof id === "number" ? [id] : []
    ),
    singleUsePerUser: Boolean(dto.singleUsePerUser),
    createdAt: dto.createdAt ?? null,
  };
}

async function responseError(response: Response): Promise<never> {
  let message = "No se pudo completar la operación con cupones.";
  try {
    const body = (await response.json()) as {
      message?: unknown;
      error?: unknown;
    };
    if (typeof body.message === "string" && body.message.trim()) {
      message = body.message;
    } else if (typeof body.error === "string" && body.error.trim()) {
      message = body.error;
    }
  } catch {
    // Se conserva el mensaje por defecto.
  }
  if (response.status === 401) {
    message = "Tu sesión venció. Iniciá sesión nuevamente.";
  } else if (response.status === 403) {
    message = "No tenés permisos para administrar cupones.";
  } else if (response.status === 409) {
    message = "Ya existe un cupón con ese código.";
  }
  throw new CouponsApiError(message, response.status);
}

function couponBody(input: CouponInput) {
  return {
    code: input.code.trim(),
    discountPercent: input.discountPercent,
    validFrom: input.validFrom || null,
    validUntil: input.validUntil || null,
    bookIds: input.bookIds,
    singleUsePerUser: input.singleUsePerUser,
  };
}

export async function createCouponRequest(
  input: CouponInput
): Promise<CouponRecord> {
  const response = await fetch(apiUrl("sales/coupons"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(couponBody(input)),
  });
  if (!response.ok) return responseError(response);
  const result = (await response.json()) as CouponEnvelope;
  if (!result.data || Array.isArray(result.data)) {
    throw new CouponsApiError("La API no devolvió el cupón creado.");
  }
  return parseCoupon(result.data);
}

export async function getCouponsPageRequest(
  page = 1,
  size = 50,
  code = ""
): Promise<CouponPage> {
  const query = new URLSearchParams({
    page: String(Math.max(0, page - 1)),
    size: String(Math.max(1, size)),
    sort: "createdAt,desc",
  });
  if (code.trim()) query.set("code", code.trim());
  const response = await fetch(apiUrl(`sales/coupons?${query.toString()}`), {
    headers: getAuthHeaders(),
  });
  if (!response.ok) return responseError(response);
  const result = (await response.json()) as CouponEnvelope;
  if (!Array.isArray(result.data)) {
    throw new CouponsApiError("La respuesta de cupones no es válida.");
  }
  const coupons = result.data.map(parseCoupon);
  const totalElements = result.pagination?.totalElements ?? coupons.length;
  const totalPages =
    result.pagination?.totalPages ??
    Math.max(1, Math.ceil(totalElements / Math.max(1, size)));
  return { coupons, totalPages: Math.max(1, totalPages), totalElements };
}
