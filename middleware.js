import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  const secureCookie = req.nextUrl.protocol === "https:";
  const token = await getToken({ req, secret, secureCookie });

  // ต้องล็อกอิน: /orders/*
  if (path.startsWith("/orders")) {
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ต้องเป็นแอดมิน: /admin/*
  if (path.startsWith("/admin")) {
    if (!token || token.role !== "admin") {
      const url = new URL("/login", req.url);
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = { matcher: ["/orders/:path*", "/admin/:path*"] };
