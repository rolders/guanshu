"use server";

import { db } from "@/lib/db/schema";
import { pageViews, linkClicks, pages, links } from "@/lib/db/schema";
import { eq, and, sql, desc, count, between } from "drizzle-orm";
import { getPageSession } from "@/lib/auth/lucia";

/**
 * Records a page view for a published page
 * (This is a public action, no authentication required)
 */
export async function recordPageView(pageId: string, metadata: { 
  visitorIp?: string;
  userAgent?: string;
  referrer?: string;
}) {
  try {
    // Check if the page exists and is published
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, pageId),
        eq(pages.isPublished, true)
      ),
    });

    if (!page) {
      return { success: false, error: "Page not found or not published" };
    }

    // Create the page view
    await db.insert(pageViews).values({
      id: crypto.randomUUID(),
      pageId,
      visitorIp: metadata.visitorIp || null,
      userAgent: metadata.userAgent || null,
      referrer: metadata.referrer || null,
    });

    return { success: true };
  } catch (error) {
    console.error("Error recording page view:", error);
    return { success: false, error: "Failed to record page view" };
  }
}

/**
 * Records a link click for a published page
 * (This is a public action, no authentication required)
 */
export async function recordLinkClick(linkId: string, pageId: string, metadata: {
  visitorIp?: string;
  userAgent?: string;
}) {
  try {
    // Check if the page exists and is published
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, pageId),
        eq(pages.isPublished, true)
      ),
    });

    if (!page) {
      return { success: false, error: "Page not found or not published" };
    }

    // Check if the link exists and belongs to the page
    const link = await db.query.links.findFirst({
      where: and(
        eq(links.id, linkId),
        eq(links.pageId, pageId)
      ),
    });

    if (!link) {
      return { success: false, error: "Link not found or does not belong to this page" };
    }

    // Create the link click
    await db.insert(linkClicks).values({
      id: crypto.randomUUID(),
      linkId,
      pageId,
      visitorIp: metadata.visitorIp || null,
      userAgent: metadata.userAgent || null,
    });

    return { success: true };
  } catch (error) {
    console.error("Error recording link click:", error);
    return { success: false, error: "Failed to record link click" };
  }
}

/**
 * Gets page view statistics for a page
 */
export async function getPageViewStats(pageId: string) {
  const session = await getPageSession();
  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }

  try {
    // Check if the page belongs to the user
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, pageId),
        eq(pages.userId, session.user.id)
      ),
    });

    if (!page) {
      return { success: false, error: "Page not found or you don't have permission" };
    }

    // Get total views
    const totalViewsResult = await db.select({ value: count() })
      .from(pageViews)
      .where(eq(pageViews.pageId, pageId));
    
    const totalViews = Number(totalViewsResult[0].value);

    // Get views from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentViewsResult = await db.select({ value: count() })
      .from(pageViews)
      .where(and(
        eq(pageViews.pageId, pageId),
        between(pageViews.viewedAt, thirtyDaysAgo, new Date())
      ));
    
    const recentViews = Number(recentViewsResult[0].value);

    // Get daily views for the last 30 days
    const dailyViewsQuery = await db.execute(sql`
      SELECT DATE_TRUNC('day', viewed_at) as day, COUNT(*) as count
      FROM "PageView"
      WHERE page_id = ${pageId}
        AND viewed_at >= ${thirtyDaysAgo.toISOString()}
      GROUP BY DATE_TRUNC('day', viewed_at)
      ORDER BY day ASC
    `);

    const dailyViews = dailyViewsQuery.rows.map(row => ({
      day: row.day,
      count: Number(row.count)
    }));

    return { 
      success: true, 
      stats: {
        totalViews,
        recentViews,
        dailyViews
      }
    };
  } catch (error) {
    console.error("Error getting page view stats:", error);
    return { success: false, error: "Failed to get page view stats" };
  }
}

/**
 * Gets link click statistics for a page
 */
export async function getLinkClickStats(pageId: string) {
  const session = await getPageSession();
  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }

  try {
    // Check if the page belongs to the user
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, pageId),
        eq(pages.userId, session.user.id)
      ),
    });

    if (!page) {
      return { success: false, error: "Page not found or you don't have permission" };
    }

    // Get total clicks for the page
    const totalClicksResult = await db.select({ value: count() })
      .from(linkClicks)
      .where(eq(linkClicks.pageId, pageId));
    
    const totalClicks = Number(totalClicksResult[0].value);

    // Get clicks per link
    const clicksByLinkQuery = await db.execute(sql`
      SELECT l.id, l.title, l.platform, COUNT(lc.id) as click_count
      FROM "Link" l
      LEFT JOIN "LinkClick" lc ON l.id = lc.link_id
      WHERE l.page_id = ${pageId}
      GROUP BY l.id, l.title, l.platform
      ORDER BY click_count DESC
    `);

    const clicksByLink = clicksByLinkQuery.rows.map(row => ({
      linkId: row.id,
      title: row.title,
      platform: row.platform,
      count: Number(row.click_count)
    }));

    return { 
      success: true, 
      stats: {
        totalClicks,
        clicksByLink
      }
    };
  } catch (error) {
    console.error("Error getting link click stats:", error);
    return { success: false, error: "Failed to get link click stats" };
  }
}

/**
 * Gets a summary of analytics for a user's dashboard
 */
export async function getUserAnalyticsSummary() {
  const session = await getPageSession();
  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }

  try {
    // Get all pages for this user
    const userPages = await db.query.pages.findMany({
      where: eq(pages.userId, session.user.id),
    });

    if (userPages.length === 0) {
      return { 
        success: true, 
        summary: {
          totalPages: 0,
          totalViews: 0,
          totalClicks: 0,
          topPages: []
        }
      };
    }

    const pageIds = userPages.map(page => page.id);

    // Get total views across all pages
    const totalViewsResult = await db.select({ value: count() })
      .from(pageViews)
      .where(sql`page_id = ANY(${pageIds})`);
    
    const totalViews = Number(totalViewsResult[0].value);

    // Get total clicks across all pages
    const totalClicksResult = await db.select({ value: count() })
      .from(linkClicks)
      .where(sql`page_id = ANY(${pageIds})`);
    
    const totalClicks = Number(totalClicksResult[0].value);

    // Get top pages by views
    const topPagesQuery = await db.execute(sql`
      SELECT p.id, p.title, p.slug, COUNT(pv.id) as view_count
      FROM "Page" p
      LEFT JOIN "PageView" pv ON p.id = pv.page_id
      WHERE p.user_id = ${session.user.id}
      GROUP BY p.id, p.title, p.slug
      ORDER BY view_count DESC
      LIMIT 5
    `);

    const topPages = topPagesQuery.rows.map(row => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      viewCount: Number(row.view_count)
    }));

    return { 
      success: true, 
      summary: {
        totalPages: userPages.length,
        totalViews,
        totalClicks,
        topPages
      }
    };
  } catch (error) {
    console.error("Error getting user analytics summary:", error);
    return { success: false, error: "Failed to get user analytics summary" };
  }
} 