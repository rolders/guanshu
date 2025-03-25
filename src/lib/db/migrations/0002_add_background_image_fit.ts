import { drizzle } from "drizzle-orm/node-postgres";

export async function up(db: ReturnType<typeof drizzle>) {
  // Add background_image_fit column to Page table
  await db.execute(`
    ALTER TABLE "Page" 
    ADD COLUMN IF NOT EXISTS "background_image_fit" text 
    DEFAULT 'cover' 
    CHECK ("background_image_fit" IN ('cover', 'contain', 'repeat'));
  `);
}

export async function down(db: ReturnType<typeof drizzle>) {
  // Remove background_image_fit column from Page table
  await db.execute(`
    ALTER TABLE "Page" 
    DROP COLUMN IF EXISTS "background_image_fit";
  `);
} 