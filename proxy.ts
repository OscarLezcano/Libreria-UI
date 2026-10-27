import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (token) return NextResponse.next();

  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );
  loginUrl.searchParams.set("reason", "auth-required");

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/checkout/:path*",
    "/pago/:path*",
    "/mis-compras/:path*",
    "/admin/:path*",
  ],
};
