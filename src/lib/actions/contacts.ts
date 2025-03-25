"use server";

import { db } from "@/lib/db/schema";
import { contacts, pages } from "@/lib/db/schema";
import { type Contact } from "@/types/drizzle";
import { eq, and, desc, count } from "drizzle-orm";
import { getPageSession } from "@/lib/auth/lucia";

/**
 * Creates a new contact form submission for a page
 * (This is a public action, no authentication required)
 */
export async function submitContactForm(pageId: string, data: Omit<Partial<Contact>, "id" | "pageId" | "createdAt">) {
  try {
    // Check if the page exists and has contact form enabled
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, pageId),
        eq(pages.isPublished, true),
        eq(pages.hasContactForm, true)
      ),
    });

    if (!page) {
      return { success: false, error: "Page not found or contact form not enabled" };
    }

    // Create the contact submission
    const [newContact] = await db.insert(contacts).values({
      id: crypto.randomUUID(),
      pageId,
      email: data.email || null,
      phone: data.phone || null,
      wechatId: data.wechatId || null,
      name: data.name || null,
      message: data.message || null,
      customFields: data.customFields || null,
    }).returning();

    return { success: true, contact: newContact };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return { success: false, error: "Failed to submit contact form" };
  }
}

/**
 * Gets all contact submissions for a page
 */
export async function getPageContacts(pageId: string) {
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

    // Get all contacts for this page
    const pageContacts = await db.query.contacts.findMany({
      where: eq(contacts.pageId, pageId),
      orderBy: [desc(contacts.createdAt)],
    });

    return { success: true, contacts: pageContacts };
  } catch (error) {
    console.error("Error getting page contacts:", error);
    return { success: false, error: "Failed to get page contacts" };
  }
}

/**
 * Gets a contact submission by ID, with owner check
 */
export async function getContactById(id: string) {
  const session = await getPageSession();
  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }

  try {
    // Get the contact
    const contact = await db.query.contacts.findFirst({
      where: eq(contacts.id, id),
    });

    if (!contact) {
      return { success: false, error: "Contact not found" };
    }

    // Check if the page belongs to the user
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, contact.pageId),
        eq(pages.userId, session.user.id)
      ),
    });

    if (!page) {
      return { success: false, error: "You don't have permission to access this contact" };
    }

    return { success: true, contact };
  } catch (error) {
    console.error("Error getting contact:", error);
    return { success: false, error: "Failed to get contact" };
  }
}

/**
 * Deletes a contact submission by ID, with owner check
 */
export async function deleteContact(id: string) {
  const session = await getPageSession();
  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }

  try {
    // Get the contact
    const contact = await db.query.contacts.findFirst({
      where: eq(contacts.id, id),
    });

    if (!contact) {
      return { success: false, error: "Contact not found" };
    }

    // Check if the page belongs to the user
    const page = await db.query.pages.findFirst({
      where: and(
        eq(pages.id, contact.pageId),
        eq(pages.userId, session.user.id)
      ),
    });

    if (!page) {
      return { success: false, error: "You don't have permission to delete this contact" };
    }

    // Delete the contact
    await db.delete(contacts).where(eq(contacts.id, id));

    return { success: true };
  } catch (error) {
    console.error("Error deleting contact:", error);
    return { success: false, error: "Failed to delete contact" };
  }
}

/**
 * Gets contact count for a page
 */
export async function getPageContactCount(pageId: string) {
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

    // Count contacts for this page using Drizzle count
    const result = await db.select({ value: count() })
      .from(contacts)
      .where(eq(contacts.pageId, pageId));

    return { success: true, count: Number(result[0].value) };
  } catch (error) {
    console.error("Error getting page contact count:", error);
    return { success: false, error: "Failed to get page contact count" };
  }
} 