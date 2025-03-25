// src/types/drizzle.ts
// Core database model interfaces and type guards for the application

// Base model interface that all database models extend
export interface DrizzleModel {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
}

// User model interface extending the base model
export interface User extends DrizzleModel {
  email: string;
  name: string | null;
  role: "USER" | "GUEST" | "ADMIN";
}

// Page model (aggregator page)
export interface Page extends DrizzleModel {
  userId: string;
  title: string;
  slug: string;
  description: string | null;
  backgroundImage: string | null;
  mainIcon: string | null;
  theme: string;
  customColors: Record<string, string> | null;
  hasContactForm: boolean;
  contactFormTitle: string | null;
  contactFormCta: string | null;
  isPublished: boolean;
}

// Link model (social media link)
export interface Link extends DrizzleModel {
  pageId: string;
  platform: string;
  title: string;
  url: string;
  iconType: string;
  customIcon: string | null;
  position: number;
  isVisible: boolean;
}

// Contact model (form submission)
export interface Contact extends DrizzleModel {
  pageId: string;
  email: string | null;
  phone: string | null;
  wechatId: string | null;
  name: string | null;
  message: string | null;
  customFields: Record<string, unknown> | null;
}

// PageView model
export interface PageView extends DrizzleModel {
  pageId: string;
  visitorIp: string | null;
  userAgent: string | null;
  referrer: string | null;
  viewedAt: Date;
}

// LinkClick model
export interface LinkClick extends DrizzleModel {
  linkId: string;
  pageId: string;
  visitorIp: string | null;
  userAgent: string | null;
  clickedAt: Date;
}

// PageSettings model
export interface PageSettings extends DrizzleModel {
  pageId: string;
  customDomain: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  socialPreviewImage: string | null;
  allowedEmailDomains: string[] | null;
  googleAnalyticsId: string | null;
  metaPixelId: string | null;
  customCss: string | null;
  customJs: string | null;
}

// Type guard for User model to ensure type safety at runtime
export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "email" in obj &&
    "role" in obj
  );
}

export function isPage(obj: unknown): obj is Page {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "userId" in obj &&
    "title" in obj &&
    "slug" in obj
  );
}

export function isLink(obj: unknown): obj is Link {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "pageId" in obj &&
    "platform" in obj &&
    "url" in obj &&
    "position" in obj
  );
}

export function isContact(obj: unknown): obj is Contact {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "pageId" in obj &&
    "createdAt" in obj
  );
}

export function isPageView(obj: unknown): obj is PageView {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "pageId" in obj &&
    "viewedAt" in obj
  );
}

export function isLinkClick(obj: unknown): obj is LinkClick {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "linkId" in obj &&
    "pageId" in obj &&
    "clickedAt" in obj
  );
}

export function isPageSettings(obj: unknown): obj is PageSettings {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "pageId" in obj
  );
}
