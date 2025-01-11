// src/i18n/locales.ts
// Locale configuration and type definitions for internationalization

// Available locales in the application
export const locales = ["en", "zh"] as const;

// Type for supported locales
export type Locale = (typeof locales)[number];

// Default locale for the application
export const defaultLocale = "zh";
