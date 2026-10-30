import type { loginInputType } from "@/common/schemas/auth/LoginInputSchema";
import type { registerInputType } from "@/common/schemas/auth/RegisterInputSchema";
import { apiUrl } from "@/common/services/http";

const HEADER = { "Content-Type": "application/json" };

export interface AuthenticatedUser {
  warehouseId?: number | null;
  name?: string | null;
  lastName?: string | null;
  email?: string | null;
}

export function getAuthenticatedWarehouseId(): number | null {
  if (typeof window === "undefined") return null;

  try {
    const storedUser = window.localStorage.getItem("bigbooks.user");
    if (!storedUser) return null;

    const user = JSON.parse(storedUser) as AuthenticatedUser;
    return typeof user.warehouseId === "number" &&
      Number.isSafeInteger(user.warehouseId) &&
      user.warehouseId > 0
      ? user.warehouseId
      : null;
  } catch {
    return null;
  }
}

interface LoginResponseData {
  token?: string;
  user?: AuthenticatedUser;
}

export async function loginRequest(
  data: loginInputType
): Promise<{ token: string; user: AuthenticatedUser | null }> {
  const response = await fetch(apiUrl("auth/login"), {
    method: "POST",
    credentials: "include",
    headers: HEADER,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Credenciales inválidas");
  }

  const result: LoginResponseData & { data?: LoginResponseData } =
    await response.json();
  const token = result.token ?? result.data?.token;
  if (!token) throw new Error("El servidor no devolvió un token de acceso");

  return { token, user: result.user ?? result.data?.user ?? null };
}

export async function registerRequest(
  data: registerInputType
): Promise<void> {
  const response = await fetch(apiUrl("auth/register"), {
    method: "POST",
    headers: HEADER,
    body: JSON.stringify(data),
  });

  if (response.ok) return;

  const result: { message?: string } | null = await response
    .json()
    .catch(() => null);
  throw new Error(
    result?.message ?? "No se pudo crear la cuenta. Revisá los datos e intentá de nuevo."
  );
}
