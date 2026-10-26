import type { loginInputType } from "@/common/schemas/auth/LoginInputSchema";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api/gateway').replace(/\/$/, '');
const HEADER = { 'Content-Type': 'application/json' };

export async function loginRequest(data: loginInputType): Promise<{
  token: string;
  user?: { role?: string; roles?: { name?: string }[] };
}> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: HEADER,
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = 'Credenciales inválidas';
    try {
      const body = await response.json();
      message = body.message || body.error || body.data?.message || message;
    } catch {
      // The gateway may return an empty response for an authentication failure.
    }
    throw new Error(message);
  }

  const body = await response.json();
  const auth = body.data || body;
  if (!auth.token) throw new Error('La respuesta de autenticación no contiene un token');
  return auth;
}