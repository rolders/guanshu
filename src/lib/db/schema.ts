import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

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

// Schema for inserting a user
export const insertUserSchema = createInsertSchema(users);

// Schema for selecting a user
export const selectUserSchema = createSelectSchema(users);

// Initialize database with query builder
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    users,
    sessions,
    keys,
  },
});
