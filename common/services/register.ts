import type { RegisterInput } from '@/common/schemas/auth/RegisterInputSchema';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api/gateway').replace(/\/$/, '');

export async function registerRequest(data: RegisterInput) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = 'No se pudo crear la cuenta';
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // Some gateway errors do not include a JSON body.
    }
    throw new Error(message);
  }
}
