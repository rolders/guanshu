"use server";

import { db } from "@/lib/db/schema";
import { links, pages } from "@/lib/db/schema";
import { type Link } from "@/types/drizzle";
import { revalidatePath } from "next/cache";
import { eq, and, or, gt, lt, asc, desc } from "drizzle-orm";
import { getPageSession } from "@/lib/auth/lucia";

/**
 * Creates a new link for a page
 */
export async function createLink(pageId: string, data: Omit<Partial<Link>, "id" | "pageId" | "createdAt" | "updatedAt">) {
  const session = await getPageSession();
  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }

  try {
    // First check if the page belongs to the user
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, pageId),
        eq(pages.userId, session.user.id)
      ),
    });

    if (!page) {
      return { success: false, error: "Page not found or you don't have permission" };
    }

    // Get the highest position to append the new link at the end
    const highestPositionLink = await db.query.links.findFirst({
      where: eq(links.pageId, pageId),
      orderBy: [desc(links.position)],
    });

    const position = highestPositionLink ? highestPositionLink.position + 1 : 0;

    // Create the link
    const [newLink] = await db.insert(links).values({
      id: crypto.randomUUID(),
      pageId,
      platform: data.platform || "custom",
      title: data.title || "Untitled Link",
      url: data.url || "#",
      iconType: data.iconType || "default",
      customIcon: data.customIcon || null,
      position,
      isVisible: data.isVisible !== undefined ? data.isVisible : true,
    }).returning();

    revalidatePath(`/dashboard/pages/${pageId}`);
    return { success: true, link: newLink };
  } catch (error) {
    console.error("Error creating link:", error);
    return { success: false, error: "Failed to create link" };
  }
}

/**
 * Gets all links for a page, ordered by position
 */
export async function getPageLinks(pageId: string, checkOwner: boolean = true) {
  try {
    if (checkOwner) {
      const session = await getPageSession();
      if (!session || !session.user) {
        // For public page routes, we need to check if the page exists and is published
        const publicPage = await db.query.pages.findFirst({
          where: and(
            eq(pages.id, pageId),
            eq(pages.isPublished, true)
          ),
        });
        
        if (publicPage) {
          // If page is published, allow access to its links without authentication
          const pageLinks = await db.query.links.findMany({
            where: and(
              eq(links.pageId, pageId),
              eq(links.isVisible, true) // Only show visible links for public pages
            ),
            orderBy: [asc(links.position)],
          });
          
          return { success: true, links: pageLinks };
        }
        
        throw new Error("Not authenticated");
      }

      // First check if the page belongs to the user
      const page = await db.query.pages.findFirst({
        where: and(
          eq(pages.id, pageId),
          eq(pages.userId, session.user.id)
        ),
      });

      if (!page) {
        return { success: false, error: "Page not found or you don't have permission" };
      }
    }

    const pageLinks = await db.query.links.findMany({
      where: eq(links.pageId, pageId),
      orderBy: [asc(links.position)],
    });

    return { success: true, links: pageLinks };
  } catch (error) {
    console.error("Error getting page links:", error);
    return { success: false, error: "Failed to get page links" };
  }
}

/**
 * Gets a link by ID, with owner check
 */
export async function getLinkById(id: string, checkOwner: boolean = true) {
  try {
    const link = await db.query.links.findFirst({
      where: eq(links.id, id),
    });

    if (!link) {
      return { success: false, error: "Link not found" };
    }

    if (checkOwner) {
      const session = await getPageSession();
      if (!session || !session.user) {
        throw new Error("Not authenticated");
      }

      // Check if the page belongs to the user
      const page = await db.query.pages.findFirst({
        where: and(
          eq(pages.id, link.pageId),
          eq(pages.userId, session.user.id)
        ),
      });

      if (!page) {
        return { success: false, error: "You don't have permission to access this link" };
      }
    }

    return { success: true, link };
  } catch (error) {
    console.error("Error getting link:", error);
    return { success: false, error: "Failed to get link" };
  }
}

/**
 * Updates a link by ID, with owner check
 */
export async function updateLink(id: string, data: Partial<Link>) {
  const session = await getPageSession();
  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }

  try {
    // First get the link
    const link = await db.query.links.findFirst({
      where: eq(links.id, id),
    });

    if (!link) {
      return { success: false, error: "Link not found" };
    }

    // Check if the page belongs to the user
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, link.pageId),
        eq(pages.userId, session.user.id)
      ),
    });

    if (!page) {
      return { success: false, error: "You don't have permission to update this link" };
    }

    // Update the link
    const [updatedLink] = await db.update(links)
      .set({
        platform: data.platform !== undefined ? data.platform : link.platform,
        title: data.title !== undefined ? data.title : link.title,
        url: data.url !== undefined ? data.url : link.url,
        iconType: data.iconType !== undefined ? data.iconType : link.iconType,
        customIcon: data.customIcon !== undefined ? data.customIcon : link.customIcon,
        position: data.position !== undefined ? data.position : link.position,
        isVisible: data.isVisible !== undefined ? data.isVisible : link.isVisible,
        updatedAt: new Date(),
      })
      .where(eq(links.id, id))
      .returning();

    revalidatePath(`/dashboard/pages/${link.pageId}`);
    return { success: true, link: updatedLink };
  } catch (error) {
    console.error("Error updating link:", error);
    return { success: false, error: "Failed to update link" };
  }
}

/**
 * Deletes a link by ID, with owner check
 */
export async function deleteLink(id: string) {
  const session = await getPageSession();
  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }

  try {
    // First get the link
    const link = await db.query.links.findFirst({
      where: eq(links.id, id),
    });

    if (!link) {
      return { success: false, error: "Link not found" };
    }

    // Check if the page belongs to the user
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, link.pageId),
        eq(pages.userId, session.user.id)
      ),
    });

    if (!page) {
      return { success: false, error: "You don't have permission to delete this link" };
    }

    // Delete the link
    await db.delete(links).where(eq(links.id, id));

    // Reorder remaining links to close the gap
    const remainingLinks = await db.query.links.findMany({
      where: and(
        eq(links.pageId, link.pageId),
        gt(links.position, link.position)
      ),
      orderBy: [asc(links.position)],
    });

    // Update positions to be sequential
    for (const [index, remainingLink] of remainingLinks.entries()) {
      await db.update(links)
        .set({ position: link.position + index })
        .where(eq(links.id, remainingLink.id));
    }

    revalidatePath(`/dashboard/pages/${link.pageId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting link:", error);
    return { success: false, error: "Failed to delete link" };
  }
}

/**
 * Reorders links by updating their positions
 * @param pageId The ID of the page containing the links
 * @param orderedLinkIds Array of link IDs in the desired order
 */
export async function reorderLinks(pageId: string, orderedLinkIds: string[]) {
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

    // Get all the links for this page
    const pageLinks = await db.query.links.findMany({
      where: eq(links.pageId, pageId),
    });

    // Create a map of link IDs to link objects
    const linkMap = new Map(pageLinks.map(link => [link.id, link]));

    // Check that all IDs are valid
    for (const linkId of orderedLinkIds) {
      if (!linkMap.has(linkId)) {
        return { success: false, error: `Link ID ${linkId} not found` };
      }
    }

    // Update positions based on new order
    for (let i = 0; i < orderedLinkIds.length; i++) {
      await db.update(links)
        .set({ position: i })
        .where(eq(links.id, orderedLinkIds[i]));
    }

    revalidatePath(`/dashboard/pages/${pageId}`);
    return { success: true };
  } catch (error) {
    console.error("Error reordering links:", error);
    return { success: false, error: "Failed to reorder links" };
  }
} 