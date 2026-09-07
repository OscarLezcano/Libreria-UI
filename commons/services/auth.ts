import type { loginInputType } from "@/commons/schemas/auth/LoginInputSchema";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const HEADER = { 'Content-Type': 'application/json' };

export async function loginRequest(data: loginInputType) : Promise<{ token: string; }> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: HEADER,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Credenciales inválidas');
  }

  return response.json();
}