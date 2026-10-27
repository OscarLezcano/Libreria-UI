import type { loginInputType } from "@/common/schemas/auth/LoginInputSchema";
import type { registerInputType } from "@/common/schemas/auth/RegisterInputSchema";

const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:8080";
const HEADER = { "Content-Type": "application/json" };

export interface AuthenticatedUser {
  name?: string | null;
  lastName?: string | null;
  email?: string | null;
}

interface LoginResponseData {
  token?: string;
  user?: AuthenticatedUser;
}

export async function loginRequest(
  data: loginInputType
): Promise<{ token: string; user: AuthenticatedUser | null }> {
  const response = await fetch(`${AUTH_API_URL}/auth/login`, {
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
  const response = await fetch(`${AUTH_API_URL}/auth/register`, {
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
