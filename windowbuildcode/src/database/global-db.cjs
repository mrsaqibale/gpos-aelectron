const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Global database connection
let globalDB = null;
let dbPath = null;

// Get database path
function getDatabasePath() {
  try {
    // Check if we're in development or production
    const isDev = !__dirname.includes('app.asar') && fs.existsSync(path.join(__dirname, 'pos.db'));
    
    if (isDev) {
      return path.join(__dirname, 'pos.db');
    } else {
      // Production mode - try multiple paths
      const possiblePaths = [
        path.join(process.resourcesPath, 'database', 'pos.db'),
        path.join(process.resourcesPath, 'app.asar.unpacked', 'database', 'pos.db'),
        path.join(__dirname, '..', '..', '..', 'resources', 'database', 'pos.db'),
        path.join(__dirname, '..', '..', '..', 'resources', 'app.asar.unpacked', 'database', 'pos.db'),
        path.join(process.cwd(), 'database', 'pos.db'),
        path.join(process.cwd(), 'resources', 'database', 'pos.db')
      ];
      
      // Try to find existing database
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          console.log('Found database at:', possiblePath);
          return possiblePath;
        }
      }
      
      // If not found, create in app data directory
      const appDataPath = path.join(process.env.APPDATA || process.env.HOME, 'GPOS System', 'database');
      if (!fs.existsSync(appDataPath)) {
        fs.mkdirSync(appDataPath, { recursive: true });
      }
      
      const finalPath = path.join(appDataPath, 'pos.db');
      
      // Try to copy from resources
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          try {
            fs.copyFileSync(possiblePath, finalPath);
            console.log('Copied database to:', finalPath);
            break;
          } catch (copyError) {
            console.warn('Failed to copy database:', copyError.message);
          }
        }
      }
      
      return finalPath;
    }
  } catch (error) {
    console.error('Error resolving database path:', error);
    // Fallback
    const fallbackPath = path.join(process.env.APPDATA || process.env.HOME, 'GPOS System', 'database', 'pos.db');
    const fallbackDir = path.dirname(fallbackPath);
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    return fallbackPath;
  }
}

// Initialize global database connection
function initializeGlobalDB() {
  if (globalDB) {
    return globalDB;
  }

  try {
    dbPath = getDatabasePath();
    console.log('Initializing global database at:', dbPath);
    
    // Ensure directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    globalDB = new Database(dbPath);
    console.log('Global database initialized successfully');
    return globalDB;
  } catch (error) {
    console.error('Error initializing global database:', error);
    throw error;
  }
}

// Get global database connection
function getGlobalDB() {
  if (!globalDB) {
    return initializeGlobalDB();
  }
  return globalDB;
}

// Get uploads path
function getUploadsPath(subPath = '') {
  try {
    const isDev = !__dirname.includes('app.asar') && fs.existsSync(path.join(__dirname, 'pos.db'));
    
    if (isDev) {
      return path.join(__dirname, 'uploads', subPath);
    } else {
      const uploadsPath = path.join(process.env.APPDATA || process.env.HOME, 'GPOS System', 'uploads', subPath);
      if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
      }
      return uploadsPath;
    }
  } catch (error) {
    console.error('Error resolving uploads path:', error);
    const fallbackPath = path.join(process.env.APPDATA || process.env.HOME, 'GPOS System', 'uploads', subPath);
    const fallbackDir = path.dirname(fallbackPath);
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    return fallbackPath;
  }
}

module.exports = {
  initializeGlobalDB,
  getGlobalDB,
  getUploadsPath,
  getDatabasePath
};
