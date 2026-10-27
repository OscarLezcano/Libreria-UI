const JSON_HEADER = { "Content-Type": "application/json" };

export function getAuthHeaders(): HeadersInit {
  const token = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("token="))
    ?.slice("token=".length);

  return token
    ? { ...JSON_HEADER, Authorization: `Bearer ${token}` }
    : JSON_HEADER;
}
