// src/lib/actions/auth.ts
// Server actions for handling authentication operations

"use server";

import { getAuth } from "@/lib/auth/lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/schema";
import { users, keys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { Scrypt } from "lucia";

// Validation schema for login form data
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export async function login(formData: LoginFormData) {
  console.log("Starting login process...");
  const result = loginSchema.safeParse(formData);

  if (!result.success) {
    console.log("Invalid form data:", result.error);
    return { error: "Invalid credentials" };
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, result.data.email.toLowerCase()),
    });

    if (!user) {
      console.log("User not found:", result.data.email);
      return { error: "Invalid credentials" };
    }
    console.log("User found:", user.email);

    // Get the key for this user
    const key = await db.query.keys.findFirst({
      where: eq(keys.userId, user.id),
    });

    if (!key || !key.hashedPassword) {
      console.log("No valid key found for user");
      return { error: "Invalid credentials" };
    }

    // Verify password
    const scrypt = new Scrypt();
    const validPassword = await scrypt.verify(
      key.hashedPassword,
      result.data.password
    );

    if (!validPassword) {
      console.log("Invalid password");
      return { error: "Invalid credentials" };
    }
    console.log("Password verified successfully");

    const auth = await getAuth();

    // Check for and invalidate any existing session
    const cookieStore = await cookies();
    const existingSessionId = cookieStore.get(auth.sessionCookieName)?.value;
    if (existingSessionId) {
      console.log("Found existing session, invalidating:", existingSessionId);
      try {
        await auth.invalidateSession(existingSessionId);
        console.log("Existing session invalidated");
      } catch (e) {
        console.log("Error invalidating existing session:", e);
        // Ignore error if session doesn't exist
      }
    }

    // Create new session
    const session = await auth.createSession(user.id, {
      email: user.email,
      name: user.name,
      role: user.role,
    });
    console.log("New session created:", session.id);

    const sessionCookie = auth.createSessionCookie(session.id);
    (await cookies()).set({
      name: sessionCookie.name,
      value: sessionCookie.value,
      ...sessionCookie.attributes,
    });
    console.log("Session cookie set");

    console.log("Login successful");
    return { success: true };
  } catch (e) {
    console.error("Error during login:", e);
    return { error: "Invalid credentials" };
  }
}

export async function logout() {
  console.log("Starting logout process...");
  const auth = await getAuth();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(auth.sessionCookieName)?.value;

  console.log("Current session ID:", sessionId);

  if (!sessionId) {
    console.log("No active session found");
    return;
  }

  try {
    await auth.invalidateSession(sessionId);
    console.log("Session invalidated successfully");

    (await cookies()).set({
      name: auth.sessionCookieName,
      value: "",
      expires: new Date(0),
    });
    console.log("Session cookie cleared");

    console.log("Logout successful, redirecting to home");
    redirect("/");
  } catch (error) {
    console.error("Error during logout:", error);
    throw error; // Re-throw to handle in the UI if needed
  }
}

// Creates test users with different roles for development purposes
export async function createTestUsers() {
  try {
    const testUsers = [
      {
        email: "admin@test.com",
        password: "admin123",
        name: "Admin User",
        role: "ADMIN",
      },
      {
        email: "user@test.com",
        password: "user123",
        name: "Regular User",
        role: "USER",
      },
      {
        email: "guest@test.com",
        password: "guest123",
        name: "Guest User",
        role: "GUEST",
      },
    ] as const;

    for (const user of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email.toLowerCase()),
        });

        if (!existingUser) {
          const userId = generateId(15);
          const hashedPassword = await new Scrypt().hash(user.password);

          // Create user first
          await db.insert(users).values({
            id: userId,
            email: user.email.toLowerCase(),
            name: user.name,
            role: user.role,
          });

          // Create key with password
          await db.insert(keys).values({
            id: generateId(15),
            userId,
            hashedPassword,
          });

          console.log(`Created ${user.role} user: ${user.email}`);
        } else {
          console.log(`${user.role} user already exists: ${user.email}`);
        }
      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error);
        throw error;
      }
    }

    return { success: true, message: "Test users created successfully" };
  } catch (error) {
    console.error("Error in createTestUsers:", error);
    throw error;
  }
}
