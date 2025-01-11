// src/i18n/request.ts
// Configuration for Next.js Internationalization (i18n) request handling

import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale, type Locale } from "./locales";

// Configure i18n request handling with locale validation and fallback
export default getRequestConfig(async ({ locale }) => {
  // Validate locale and fallback to default if invalid
  if (!locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    locale: locale as Locale,
    timeZone: "Asia/Shanghai",
  };
});
