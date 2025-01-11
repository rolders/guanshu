// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/i18n/locales";

// Match only internationalized pathnames
export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api, /_next, /_vercel, /static, /favicon.ico, etc.
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};

const publicRoutes = ["/", "/auth/login"];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Step 1: Handle root redirect
  if (pathname === "/" || pathname === "") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  // Step 2: Create and apply intl middleware
  const handleI18nRouting = createIntlMiddleware({
    locales,
    defaultLocale,
    localePrefix: "always",
  });

  const response = await handleI18nRouting(request);

  // Step 3: Check authentication for non-public routes
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?:\/|$)/, "/");
  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathnameWithoutLocale === route || pathnameWithoutLocale === `${route}/`
  );

  if (!isPublicRoute) {
    const hasAuthCookie = request.cookies.has("auth_session");
    if (!hasAuthCookie) {
      const url = new URL(`/${defaultLocale}/auth/login`, request.url);
      return NextResponse.redirect(url);
    }
  }

  return response;
}
