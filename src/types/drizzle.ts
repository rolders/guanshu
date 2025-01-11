// src/types/drizzle.ts
// Core database model interfaces and type guards for the application

// Base model interface that all database models extend
export interface DrizzleModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User model interface extending the base model
export interface User extends DrizzleModel {
  email: string;
  name?: string | null;
  role: "USER" | "GUEST" | "ADMIN";
}

// Type guard for User model to ensure type safety at runtime
export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as User).id === "string" &&
    typeof (obj as User).email === "string" &&
    (obj as User).createdAt instanceof Date &&
    (obj as User).updatedAt instanceof Date &&
    ((obj as User).name === null ||
      typeof (obj as User).name === "string" ||
      (obj as User).name === undefined) &&
    ["USER", "GUEST", "ADMIN"].includes((obj as User).role)
  );
}
