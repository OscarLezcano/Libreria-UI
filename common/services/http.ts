const JSON_HEADER = { "Content-Type": "application/json" };
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

export function apiUrl(path: string): string {
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

export function getAuthHeaders(): HeadersInit {
  const token = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("token="))
    ?.slice("token=".length);

  return token
    ? { ...JSON_HEADER, Authorization: `Bearer ${token}` }
    : JSON_HEADER;
}
