// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/i18n/locales";

// Match all pathnames except for /api, /_next, etc., and except for /p/* paths
export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api, /_next, /_vercel, /static, /favicon.ico, etc.
    // - /p/* (our non-localized aggregator pages)
    "/((?!api|_next|_vercel|p/|.*\\..*).*)",
  ],
};

const publicRoutes = ["/", "/auth/login", "/p/.*"];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware completely for /p/* routes
  if (pathname.startsWith('/p/')) {
    return NextResponse.next();
  }

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
    (route) => {
      if (route.endsWith(".*")) {
        // Handle regex pattern for routes like '/p/.*'
        const pattern = new RegExp(`^${route.replace(/\.\*$/, ".*")}$`);
        return pattern.test(pathnameWithoutLocale);
      }
      return pathnameWithoutLocale === route || pathnameWithoutLocale === `${route}/`;
    }
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
