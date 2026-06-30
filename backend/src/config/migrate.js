import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, "../../migrations");

export async function runMigrations() {
  console.log("Checking database migrations...");

  try {
    // Create migrations tracking table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(255) PRIMARY KEY,
                applied_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.log("No migrations directory found, skipping.");
      return;
    }

    // Get all SQL files sorted alphabetically
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      // Check if already applied
      const { rows } = await pool.query(
        "SELECT version FROM schema_migrations WHERE version = $1",
        [file],
      );

      if (rows.length === 0) {
        console.log(`Applying migration: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, "utf8");

        // Execute migration transaction
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          await client.query(sql);
          await client.query(
            "INSERT INTO schema_migrations (version) VALUES ($1)",
            [file],
          );
          await client.query("COMMIT");
          console.log(`Successfully applied ${file}`);
        } catch (err) {
          await client.query("ROLLBACK");
          console.error(`Error applying migration ${file}:`, err);
          throw err; // Stop application startup if migration fails
        } finally {
          client.release();
        }
      }
    }

    console.log("Database migrations are up to date.");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}
