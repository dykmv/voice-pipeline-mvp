import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = request.nextUrl

  // Allow auth routes and public pages
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname === "/" ||
    pathname === "/landing.html"
  ) {
    return NextResponse.next()
  }

  // Protect app routes
  if (
    pathname.startsWith("/app") ||
    pathname.startsWith("/today") ||
    pathname.startsWith("/leads")
  ) {
    if (!token) {
      const loginUrl = new URL("/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/app/:path*", "/today/:path*", "/leads/:path*"],
}
