const JSON_HEADER = { "Content-Type": "application/json" };
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

let redirectingToLogin = false;

export function apiUrl(path: string): string {
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

function redirectToLogin() {
  if (typeof window === "undefined" || redirectingToLogin) return;
  if (window.location.pathname.startsWith("/auth/login")) return;

  redirectingToLogin = true;
  document.cookie = "token=; path=/; max-age=0";
  window.localStorage.removeItem("bigbooks.user");

  const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const loginUrl = new URL("/auth/login/", window.location.origin);
  loginUrl.searchParams.set("next", next);
  loginUrl.searchParams.set("reason", "auth-required");
  window.location.replace(`${loginUrl.pathname}${loginUrl.search}`);
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, init);
  if (response.status === 401) redirectToLogin();
  return response;
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
