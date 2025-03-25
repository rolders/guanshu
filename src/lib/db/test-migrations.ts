import { migrate, rollback } from './migrate';
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testMigrations() {
  try {
    // Step 1: Run the migrations
    console.log("=== Step 1: Running migrations ===");
    await migrate();
    console.log("✅ Migrations completed successfully");
    
    // Step 2: Rollback the migrations
    console.log("\n=== Step 2: Testing rollback ===");
    await rollback();
    console.log("✅ Rollback completed successfully");
    
    // Step 3: Run the migrations again to verify idempotence
    console.log("\n=== Step 3: Running migrations again to verify idempotence ===");
    await migrate();
    console.log("✅ Migrations ran successfully after rollback");
    
    console.log("\n✅✅✅ All migration tests passed! ✅✅✅");
  } catch (error) {
    console.error("❌ Migration test failed:", error);
    process.exit(1);
  }
}

// Run migration tests if this file is executed directly
if (require.main === module) {
  testMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} 