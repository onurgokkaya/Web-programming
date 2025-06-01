import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAdminPath = ["/auth/register", "/users", "/history/:path*"].includes(
    req.nextUrl.pathname
  );

  const isUserPath = ["/"].includes(req.nextUrl.pathname);

  if (!token) {
    if (isUserPath) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  } else {
    if (req.nextUrl.pathname === "/auth/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (isAdminPath && !token.isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/login", "/auth/register", "/users", "/history/:path*", "/"],
};
