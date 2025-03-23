import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as initialMigration from "./migrations/0000_initial";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function migrate() {
  const dbUrl = process.env.DATABASE_URL;
  console.log("Using database URL:", dbUrl);

  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({
    connectionString: dbUrl,
  });

  const db = drizzle(pool);

  try {
    console.log("Running migrations...");
    await initialMigration.up(db);
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} 