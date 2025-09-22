const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

let dbInstance = null;
let isInitialized = false;

function getDatabasePath() {
  try {
    const isDev = !__dirname.includes('app.asar') && fs.existsSync(path.join(__dirname, 'pos.db'));
    if (isDev) {
      return path.join(__dirname, 'pos.db');
    }

    const possiblePaths = [
      path.join(process.resourcesPath || '', 'database', 'pos.db'),
      path.join(process.resourcesPath || '', 'app.asar.unpacked', 'database', 'pos.db'),
      path.join(__dirname, '..', '..', 'resources', 'database', 'pos.db'),
      path.join(__dirname, '..', '..', 'resources', 'app.asar.unpacked', 'database', 'pos.db'),
      path.join(process.cwd(), 'database', 'pos.db'),
      path.join(process.cwd(), 'resources', 'database', 'pos.db')
    ];

    for (const candidate of possiblePaths) {
      try {
        if (candidate && fs.existsSync(candidate)) {
          return candidate;
        }
      } catch (_) {}
    }

    const appDataBaseDir = path.join(process.env.APPDATA || process.env.HOME || '', 'GPOS System', 'database');
    if (!fs.existsSync(appDataBaseDir)) {
      fs.mkdirSync(appDataBaseDir, { recursive: true });
    }
    const finalPath = path.join(appDataBaseDir, 'pos.db');

    for (const candidate of possiblePaths) {
      try {
        if (candidate && fs.existsSync(candidate)) {
          fs.copyFileSync(candidate, finalPath);
          break;
        }
      } catch (_) {}
    }

    if (!fs.existsSync(finalPath)) {
      fs.writeFileSync(finalPath, '');
    }
    return finalPath;
  } catch (error) {
    const fallback = path.join(process.env.APPDATA || process.env.HOME || '', 'GPOS System', 'database', 'pos.db');
    const dir = path.dirname(fallback);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return fallback;
  }
}

function initializeDatabase() {
  if (isInitialized && dbInstance) return dbInstance;
  const dbPath = getDatabasePath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  dbInstance = new Database(dbPath);
  isInitialized = true;
  return dbInstance;
}

function getDatabase() {
  if (!isInitialized || !dbInstance) return initializeDatabase();
  return dbInstance;
}

function getUploadsPath(subPath = '') {
  try {
    const isDev = !__dirname.includes('app.asar') && fs.existsSync(path.join(__dirname, 'pos.db'));
    if (isDev) return path.join(__dirname, 'uploads', subPath);
    const uploads = path.join(process.env.APPDATA || process.env.HOME || '', 'GPOS System', 'uploads', subPath);
    const dir = path.dirname(uploads);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return uploads;
  } catch (e) {
    const fallback = path.join(process.env.APPDATA || process.env.HOME || '', 'GPOS System', 'uploads', subPath);
    const dir = path.dirname(fallback);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return fallback;
  }
}

function closeDatabase() {
  if (dbInstance) {
    try { dbInstance.close(); } catch (_) {}
    dbInstance = null;
    isInitialized = false;
  }
}

module.exports = {
  initializeDatabase,
  getDatabase,
  getUploadsPath,
  closeDatabase,
  getDatabasePath
};


