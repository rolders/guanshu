import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

export async function up(db: ReturnType<typeof drizzle>) {
  await db.execute(sql`
    -- Create Page table (aggregator page)
    CREATE TABLE IF NOT EXISTS "Page" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      background_image TEXT,
      main_icon TEXT,
      theme TEXT DEFAULT 'default',
      custom_colors JSONB,
      has_contact_form BOOLEAN DEFAULT FALSE,
      contact_form_title TEXT,
      contact_form_cta TEXT,
      is_published BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Create Link table (social media links)
    CREATE TABLE IF NOT EXISTS "Link" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      page_id UUID NOT NULL REFERENCES "Page"(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      icon_type TEXT DEFAULT 'default',
      custom_icon TEXT,
      position INTEGER NOT NULL,
      is_visible BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Create Contact table (form submissions)
    CREATE TABLE IF NOT EXISTS "Contact" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      page_id UUID NOT NULL REFERENCES "Page"(id) ON DELETE CASCADE,
      email TEXT,
      phone TEXT,
      wechat_id TEXT,
      name TEXT,
      message TEXT,
      custom_fields JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Create PageView table (analytics for page views)
    CREATE TABLE IF NOT EXISTS "PageView" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      page_id UUID NOT NULL REFERENCES "Page"(id) ON DELETE CASCADE,
      visitor_ip TEXT,
      user_agent TEXT,
      referrer TEXT,
      viewed_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Create LinkClick table (analytics for link clicks)
    CREATE TABLE IF NOT EXISTS "LinkClick" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      link_id UUID NOT NULL REFERENCES "Link"(id) ON DELETE CASCADE,
      page_id UUID NOT NULL REFERENCES "Page"(id) ON DELETE CASCADE,
      visitor_ip TEXT,
      user_agent TEXT,
      clicked_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Create PageSettings table (additional page configurations)
    CREATE TABLE IF NOT EXISTS "PageSettings" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      page_id UUID NOT NULL REFERENCES "Page"(id) ON DELETE CASCADE,
      custom_domain TEXT UNIQUE,
      seo_title TEXT,
      seo_description TEXT,
      social_preview_image TEXT,
      allowed_email_domains TEXT[],
      google_analytics_id TEXT,
      meta_pixel_id TEXT,
      custom_css TEXT,
      custom_js TEXT,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_page_user_id ON "Page"(user_id);
    CREATE INDEX IF NOT EXISTS idx_link_page_id ON "Link"(page_id);
    CREATE INDEX IF NOT EXISTS idx_contact_page_id ON "Contact"(page_id);
    CREATE INDEX IF NOT EXISTS idx_pageview_page_id ON "PageView"(page_id);
    CREATE INDEX IF NOT EXISTS idx_linkclick_link_id ON "LinkClick"(link_id);
    CREATE INDEX IF NOT EXISTS idx_linkclick_page_id ON "LinkClick"(page_id);
    CREATE INDEX IF NOT EXISTS idx_pagesettings_page_id ON "PageSettings"(page_id);
  `);
}

export async function down(db: ReturnType<typeof drizzle>) {
  await db.execute(sql`
    -- Drop indexes
    DROP INDEX IF EXISTS idx_pagesettings_page_id;
    DROP INDEX IF EXISTS idx_linkclick_page_id;
    DROP INDEX IF EXISTS idx_linkclick_link_id;
    DROP INDEX IF EXISTS idx_pageview_page_id;
    DROP INDEX IF EXISTS idx_contact_page_id;
    DROP INDEX IF EXISTS idx_link_page_id;
    DROP INDEX IF EXISTS idx_page_user_id;

    -- Drop tables in reverse order due to dependencies
    DROP TABLE IF EXISTS "PageSettings";
    DROP TABLE IF EXISTS "LinkClick";
    DROP TABLE IF EXISTS "PageView";
    DROP TABLE IF EXISTS "Contact";
    DROP TABLE IF EXISTS "Link";
    DROP TABLE IF EXISTS "Page";
  `);
} 