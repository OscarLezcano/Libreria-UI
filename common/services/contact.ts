import { apiUrl } from "@/common/services/http";

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ErrorResponse {
  message?: string;
}

export async function sendContactRequest(data: ContactInput): Promise<void> {
  let response: Response;
  try {
    response = await fetch(apiUrl("auth/contact"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error("No pudimos comunicarnos con el servidor. Intentá nuevamente.");
  }

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as ErrorResponse | null;
    throw new Error(result?.message ?? "No se pudo enviar la consulta. Revisá los datos.");
  }
}
