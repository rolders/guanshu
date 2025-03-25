import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as initialMigration from "./migrations/0000_initial";
import * as guanshuTables from "./migrations/0001_guanshu_tables";
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
    console.log("Rolling back guanshu tables migration (0001)...");
    await guanshuTables.down(db);
    
    console.log("Rolling back initial migration (0000)...");
    // Uncomment the next line if you want to roll back the initial migration too
    // await initialMigration.down(db);
    
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
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'rollback') {
    rollback()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    migrate()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }
}

export { migrate }; 