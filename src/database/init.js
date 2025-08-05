import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'pos.db');
const migrationsDir = path.join(__dirname, 'migrations');

const db = new Database(dbPath);

function runMigrations() {
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  files.sort();
  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    try {
      db.exec(sql);
      console.log(`Migration ${file} applied successfully.`);
    } catch (err) {
      console.error(`Error running migration ${file}:`, err.message);
    }
  }
}

runMigrations();
db.close();