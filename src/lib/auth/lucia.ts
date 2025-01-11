"use server";

import { Lucia, TimeSpan } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@/lib/db/schema";
import { sessions, users } from "@/lib/db/schema";
import { cache } from "react";
import { cookies } from "next/headers";

let _auth: Lucia | null = null;

export async function getAuth() {
  if (!_auth) {
    const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

    _auth = new Lucia(adapter, {
      sessionCookie: {
        expires: false,
        attributes: {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        },
      },
      sessionExpiresIn: new TimeSpan(30, "d"),
      getUserAttributes: (attributes) => {
        return {
          email: attributes.email,
          name: attributes.name,
          role: attributes.role,
        };
      },
    });
  }
  return _auth;
}

// IMPORTANT: For Next.js RSC caching
export const getPageSession = cache(async () => {
  const auth = await getAuth();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(auth.sessionCookieName);
  const sessionId = sessionCookie?.value ?? null;

  if (!sessionId) return null;

  try {
    return await auth.validateSession(sessionId);
  } catch {
    // Invalid session
    return null;
  }
});

// src/lib/auth/lucia.ts
// Lucia authentication configuration and type declarations

// Type declaration for Lucia's module augmentation
declare module "lucia" {
  interface Register {
    Lucia: Awaited<ReturnType<typeof getAuth>>;
    DatabaseUserAttributes: {
      email: string;
      name: string | null;
      role: "USER" | "GUEST" | "ADMIN";
    };
  }
}
