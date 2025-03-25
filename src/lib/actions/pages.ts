"use server";

import { db } from "@/lib/db/schema";
import { pages } from "@/lib/db/schema";
import { isPage, type Page } from "@/types/drizzle";
import { revalidatePath } from "next/cache";
import { eq, and, ilike, or } from "drizzle-orm";
import { generateId } from "lucia";
import { getPageSession } from "@/lib/auth/lucia";
import { redirect } from "next/navigation";

/**
 * Creates a new page for the current user
 */
export async function createPage(data: Omit<Partial<Page>, "id" | "userId" | "createdAt" | "updatedAt">) {
  const session = await getPageSession();
  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }

  // Generate a random slug if one is not provided
  const slug = data.slug || `page-${Math.random().toString(36).substring(2, 10)}`;

  try {
    const [newPage] = await db.insert(pages).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      title: data.title || "Untitled Page",
      slug: slug,
      description: data.description || null,
      backgroundImage: data.backgroundImage || null,
      backgroundImageFit: data.backgroundImageFit || "cover",
      mainIcon: data.mainIcon || null,
      theme: data.theme || "default",
      customColors: data.customColors || null,
      hasContactForm: data.hasContactForm || false,
      contactFormTitle: data.contactFormTitle || null,
      contactFormCta: data.contactFormCta || null,
      isPublished: data.isPublished || false,
    }).returning();

    revalidatePath(`/dashboard/pages`);
    return { success: true, page: newPage };
  } catch (error) {
    console.error("Error creating page:", error);
    return { success: false, error: "Failed to create page" };
  }
}

/**
 * Retrieves a page by ID, with optional owner check
 */
export async function getPageById(id: string, checkOwner: boolean = true) {
  try {
    if (checkOwner) {
      const session = await getPageSession();
      if (!session || !session.user) {
        throw new Error("Not authenticated");
      }

      const page = await db.query.pages.findFirst({
        where: and(
          eq(pages.id, id),
          eq(pages.userId, session.user.id)
        ),
      });

      return { success: true, page };
    } else {
      const page = await db.query.pages.findFirst({
        where: eq(pages.id, id),
      });

      return { success: true, page };
    }
  } catch (error) {
    console.error("Error getting page:", error);
    return { success: false, error: "Failed to get page" };
  }
}

/**
 * Retrieves a page by slug, used for public pages
 */
export async function getPageBySlug(slug: string) {
  try {
    const page = await db.query.pages.findFirst({
      where: eq(pages.slug, slug),
    });

    return { success: true, page };
  } catch (error) {
    console.error("Error getting page by slug:", error);
    return { success: false, error: "Failed to get page" };
  }
}

/**
 * Updates a page by ID, with owner check
 */
export async function updatePage(id: string, data: Partial<Page>) {
  const session = await getPageSession();
  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }

  try {
    // First check if the page belongs to the user
    const existingPage = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, id),
        eq(pages.userId, session.user.id)
      ),
    });

    if (!existingPage) {
      return { success: false, error: "Page not found or you don't have permission" };
    }

    // Update the page
    const [updatedPage] = await db.update(pages)
      .set({
        title: data.title !== undefined ? data.title : existingPage.title,
        slug: data.slug !== undefined ? data.slug : existingPage.slug,
        description: data.description !== undefined ? data.description : existingPage.description,
        backgroundImage: data.backgroundImage !== undefined ? data.backgroundImage : existingPage.backgroundImage,
        backgroundImageFit: data.backgroundImageFit !== undefined ? data.backgroundImageFit : existingPage.backgroundImageFit,
        mainIcon: data.mainIcon !== undefined ? data.mainIcon : existingPage.mainIcon,
        theme: data.theme !== undefined ? data.theme : existingPage.theme,
        customColors: data.customColors !== undefined ? data.customColors : existingPage.customColors,
        hasContactForm: data.hasContactForm !== undefined ? data.hasContactForm : existingPage.hasContactForm,
        contactFormTitle: data.contactFormTitle !== undefined ? data.contactFormTitle : existingPage.contactFormTitle,
        contactFormCta: data.contactFormCta !== undefined ? data.contactFormCta : existingPage.contactFormCta,
        isPublished: data.isPublished !== undefined ? data.isPublished : existingPage.isPublished,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id))
      .returning();

    revalidatePath(`/dashboard/pages/${id}`);
    revalidatePath(`/dashboard/pages`);
    return { success: true, page: updatedPage };
  } catch (error) {
    console.error("Error updating page:", error);
    return { success: false, error: "Failed to update page" };
  }
}

/**
 * Deletes a page by ID, with owner check
 */
export async function deletePage(id: string) {
  const session = await getPageSession();
  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }

  try {
    // First check if the page belongs to the user
    const existingPage = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, id),
        eq(pages.userId, session.user.id)
      ),
    });

    if (!existingPage) {
      return { success: false, error: "Page not found or you don't have permission" };
    }

    // Delete the page (cascade will handle related records)
    await db.delete(pages).where(eq(pages.id, id));

    revalidatePath(`/dashboard/pages`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting page:", error);
    return { success: false, error: "Failed to delete page" };
  }
}

/**
 * Gets all pages for the current user
 */
export async function getUserPages() {
  const session = await getPageSession();
  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }

  try {
    const userPages = await db.query.pages.findMany({
      where: eq(pages.userId, session.user.id),
      orderBy: (pages, { desc }) => [desc(pages.updatedAt)],
    });

    return { success: true, pages: userPages };
  } catch (error) {
    console.error("Error getting user pages:", error);
    return { success: false, error: "Failed to get user pages" };
  }
}

/**
 * Search user's pages by title or slug
 */
export async function searchUserPages(query: string) {
  const session = await getPageSession();
  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }

  try {
    const userPages = await db.query.pages.findMany({
      where: and(
        eq(pages.userId, session.user.id),
        or(
          ilike(pages.title, `%${query}%`),
          ilike(pages.slug, `%${query}%`)
        )
      ),
      orderBy: (pages, { desc }) => [desc(pages.updatedAt)],
    });

    return { success: true, pages: userPages };
  } catch (error) {
    console.error("Error searching user pages:", error);
    return { success: false, error: "Failed to search user pages" };
  }
} 