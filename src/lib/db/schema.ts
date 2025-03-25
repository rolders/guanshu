import { pgTable, text, timestamp, integer, jsonb, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const users = pgTable("User", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name"),
  role: text("role", { enum: ["USER", "GUEST", "ADMIN"] })
    .default("USER")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("Session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const keys = pgTable("Key", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  hashedPassword: text("hashed_password"),
});

// New table: Pages (aggregator pages)
export const pages = pgTable("Page", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  backgroundImage: text("background_image"),
  mainIcon: text("main_icon"),
  theme: text("theme").default("default"),
  customColors: jsonb("custom_colors"),
  hasContactForm: boolean("has_contact_form").default(false),
  contactFormTitle: text("contact_form_title"),
  contactFormCta: text("contact_form_cta"),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New table: Links (social media links)
export const links = pgTable("Link", {
  id: uuid("id").defaultRandom().primaryKey(),
  pageId: uuid("page_id")
    .notNull()
    .references(() => pages.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // e.g., "xiaohongshu", "wechat", "douyin", "bilibili", "custom"
  title: text("title").notNull(),
  url: text("url").notNull(),
  iconType: text("icon_type").default("default"), // "default", "custom"
  customIcon: text("custom_icon"),
  position: integer("position").notNull(),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New table: Contacts (form submissions)
export const contacts = pgTable("Contact", {
  id: uuid("id").defaultRandom().primaryKey(),
  pageId: uuid("page_id")
    .notNull()
    .references(() => pages.id, { onDelete: "cascade" }),
  email: text("email"),
  phone: text("phone"),
  wechatId: text("wechat_id"),
  name: text("name"),
  message: text("message"),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New table: PageViews (analytics for page views)
export const pageViews = pgTable("PageView", {
  id: uuid("id").defaultRandom().primaryKey(),
  pageId: uuid("page_id")
    .notNull()
    .references(() => pages.id, { onDelete: "cascade" }),
  visitorIp: text("visitor_ip"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

// New table: LinkClicks (analytics for link clicks)
export const linkClicks = pgTable("LinkClick", {
  id: uuid("id").defaultRandom().primaryKey(),
  linkId: uuid("link_id")
    .notNull()
    .references(() => links.id, { onDelete: "cascade" }),
  pageId: uuid("page_id")
    .notNull()
    .references(() => pages.id, { onDelete: "cascade" }),
  visitorIp: text("visitor_ip"),
  userAgent: text("user_agent"),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});

// New table: PageSettings (additional page configurations)
export const pageSettings = pgTable("PageSettings", {
  id: uuid("id").defaultRandom().primaryKey(),
  pageId: uuid("page_id")
    .notNull()
    .references(() => pages.id, { onDelete: "cascade" }),
  customDomain: text("custom_domain").unique(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  socialPreviewImage: text("social_preview_image"),
  allowedEmailDomains: text("allowed_email_domains").array(),
  googleAnalyticsId: text("google_analytics_id"),
  metaPixelId: text("meta_pixel_id"),
  customCss: text("custom_css"),
  customJs: text("custom_js"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schema for inserting/selecting entities
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertPageSchema = createInsertSchema(pages);
export const selectPageSchema = createSelectSchema(pages);

export const insertLinkSchema = createInsertSchema(links);
export const selectLinkSchema = createSelectSchema(links);

export const insertContactSchema = createInsertSchema(contacts);
export const selectContactSchema = createSelectSchema(contacts);

// Initialize database with node-postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const db = drizzle(pool, {
  schema: {
    users,
    sessions,
    keys,
    pages,
    links,
    contacts,
    pageViews,
    linkClicks,
    pageSettings,
  },
});
