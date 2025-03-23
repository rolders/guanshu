import { sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";

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

export async function up(db: ReturnType<typeof drizzle>) {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "User" (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'GUEST', 'ADMIN')),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Session" (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      expires_at TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "Key" (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      hashed_password TEXT
    );
  `);
}

export async function down(db: ReturnType<typeof drizzle>) {
  await db.execute(sql`
    DROP TABLE IF EXISTS "Key";
    DROP TABLE IF EXISTS "Session";
    DROP TABLE IF EXISTS "User";
  `);
} 