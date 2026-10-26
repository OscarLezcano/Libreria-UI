import type { bookInputType } from "@/common/schemas/book/BookInputSchema";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const HEADER = { "Content-Type": "application/json" };

function authHeaders(): HeadersInit {
  const token = document.cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.slice("token=".length);

  return token ? { ...HEADER, Authorization: `Bearer ${token}` } : HEADER;
}

export async function createBookRequest(
  data: bookInputType
): Promise<{ id: string }> {
  const response = await fetch(`${API_URL}/books`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      price: data.price ? Number(data.price) : null,
      coverUrl: data.coverUrl || null,
      authors: data.authors.map((name) => ({ name })),
      genres: data.genres.map((name) => ({ name })),
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear el libro");
  }

  return response.json();
}

export async function updateBookRequest(
  id: string,
  data: bookInputType
): Promise<void> {
  const response = await fetch(`${API_URL}/books/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      price: data.price ? Number(data.price) : null,
      coverUrl: data.coverUrl || null,
      authors: data.authors.map((name) => ({ name })),
      genres: data.genres.map((name) => ({ name })),
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar el libro");
  }
}
