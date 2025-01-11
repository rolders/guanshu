import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale, type Locale } from "./locales";

export default getRequestConfig(async ({ locale = defaultLocale }) => {
  // Ensure we have a valid locale
  const validLocale = locales.includes(locale as Locale)
    ? locale
    : defaultLocale;

  return {
    messages: (await import(`./messages/${validLocale}.json`)).default,
    locale: validLocale,
    timeZone: "Asia/Shanghai",
  };
});
