// src/components/ui/topbar.tsx
"use client";

import { AuthButton } from "./auth-button";
import { Button } from "./button";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { DatabaseUserAttributes } from "@/lib/auth/types";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import Link from "next/link";
import { locales } from "@/i18n/locales";

interface TopbarProps {
  user?: DatabaseUserAttributes | null;
}

export function Topbar({ user }: TopbarProps) {
  const t = useTranslations("common");
  const pathname = usePathname();

  // More defensive check for dashboard access
  const showDashboard = user?.role === "GUEST" || user?.role === "ADMIN";
  const displayName = user?.name || user?.email || "";

  const getLocalizedHref = (path: string, locale?: string) => {
    const currentLocale = pathname.split("/")[1];
    const targetLocale = locale || currentLocale;
    return path === "/" ? `/${targetLocale}` : `/${targetLocale}${path}`;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Button variant="ghost" className="text-lg font-semibold" asChild>
          <Link href="/" as={getLocalizedHref("/")}>
            App
          </Link>
        </Button>

        <div className="flex items-center gap-4">
          {showDashboard && (
            <Button variant="ghost" asChild>
              <Link href="/dashboard" as={getLocalizedHref("/dashboard")}>
                {t("dashboard")}
              </Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {locales.map((locale) => (
                <DropdownMenuItem key={locale} asChild>
                  <Link
                    href={pathname as `/${string}`}
                    as={getLocalizedHref(pathname.slice(3), locale)}
                  >
                    {locale === "en" ? "English" : "中文"}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {displayName && (
            <span className="text-sm text-muted-foreground">{displayName}</span>
          )}

          <AuthButton user={user} />
        </div>
      </div>
    </nav>
  );
}
