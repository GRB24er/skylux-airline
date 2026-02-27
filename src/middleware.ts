import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Let all API routes handle their own auth
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // PUBLIC pages — no auth needed
  const publicPaths = ["/", "/auth", "/portal", "/setup"];
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // ADMIN pages — require token
  const adminPaths = ["/dashboard", "/flights", "/bookings", "/fleet", "/crew", "/customers", "/revenue", "/notifications", "/settings"];
  const isAdmin = adminPaths.some(p => pathname.startsWith(p));
  if (isAdmin && !token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // CREW pages — require token
  if (pathname.startsWith("/panel") && !token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|icons).*)"],
};
