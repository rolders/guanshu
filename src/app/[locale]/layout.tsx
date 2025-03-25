// src/app/[locale]/layout.tsx

import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Metadata } from "next";
import { locales, type Locale } from "@/i18n/locales";
import { Topbar } from "@/components/ui/topbar";
import { getPageSession } from "@/lib/auth/lucia";
import { DatabaseUserAttributes } from "@/lib/auth/types";
import "../globals.css";

// Type guard for session user
interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "GUEST" | "ADMIN";
}

function isSessionUser(user: unknown): user is SessionUser {
  if (!user || typeof user !== "object") return false;
  const u = user as Record<string, unknown>;
  return (
    typeof u.id === "string" &&
    typeof u.email === "string" &&
    (typeof u.name === "string" || u.name === null) &&
    typeof u.role === "string" &&
    ["USER", "GUEST", "ADMIN"].includes(u.role)
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const t = messages.site;

  return {
    title: {
      template: `%s | ${t.name}`,
      default: t.name,
    },
    description: t.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) notFound();

  const [messages, session] = await Promise.all([
    getMessages({ locale }),
    getPageSession(),
  ]);
  const now = new Date();

  // Get user attributes from session
  const userAttributes: DatabaseUserAttributes | null =
    session?.user && isSessionUser(session.user)
      ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          createdAt: new Date(), // We don't have these in the session
          updatedAt: new Date(), // We don't have these in the session
        }
      : null;

  return (
    <html lang={locale} suppressHydrationWarning={false}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="next-head-count" content="0" />
        <meta name="next-locale" content={locale} />
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider
          messages={messages}
          locale={locale}
          now={now}
          timeZone="Asia/Shanghai"
        >
          <div className="font-sans">
            <Topbar user={userAttributes} />
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
