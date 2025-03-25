import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as initialMigration from "./migrations/0000_initial";
import * as guanshuTables from "./migrations/0001_guanshu_tables";
import * as backgroundImageFit from "./migrations/0002_add_background_image_fit";
import * as backgroundImageVisible from "./migrations/0003_add_background_image_visible";
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
    
    // Run initial migration
    console.log("Running initial migration (0000)...");
    await initialMigration.up(db);
    
    // Run guanshu tables migration
    console.log("Running guanshu tables migration (0001)...");
    await guanshuTables.up(db);
    
    // Run background image fit migration
    console.log("Running background image fit migration (0002)...");
    await backgroundImageFit.up(db);
    
    // Run background image visible migration
    console.log("Running background image visible migration (0003)...");
    await backgroundImageVisible.up(db);
    
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Function to rollback migrations
export async function rollback() {
  const dbUrl = process.env.DATABASE_URL;
  console.log("Using database URL for rollback:", dbUrl);

  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({
    connectionString: dbUrl,
  });

  const db = drizzle(pool);

  try {
    console.log("Rolling back migrations...");
    
    // Rollback in reverse order
    console.log("Rolling back background image visible migration (0003)...");
    await backgroundImageVisible.down(db);
    
    console.log("Rolling back background image fit migration (0002)...");
    await backgroundImageFit.down(db);
    
    console.log("Rolling back guanshu tables migration (0001)...");
    await guanshuTables.down(db);
    
    console.log("Rolling back initial migration (0000)...");
    await initialMigration.down(db);
    
    console.log("Rollback completed successfully");
  } catch (error) {
    console.error("Error rolling back migrations:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  const isRollback = process.argv.includes("rollback");
  if (isRollback) {
    rollback().catch(console.error);
  } else {
    migrate().catch(console.error);
  }
}

export { migrate }; 