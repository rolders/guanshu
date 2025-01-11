// src/lib/auth/types.ts
// Type definitions for authentication-related data structures

// User attributes as stored in the database
export interface DatabaseUserAttributes {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "GUEST" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

// Available user role types in the system
export type UserRole = "USER" | "GUEST" | "ADMIN";
