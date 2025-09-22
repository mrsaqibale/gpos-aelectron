const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Single global database instance
let dbInstance = null;
let isInitialized = false;

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
      
      // If not found, create in app data directory (professional installer location)
      const appDataPath = path.join(process.env.APPDATA || process.env.HOME, 'GPOS System', 'database');
      if (!fs.existsSync(appDataPath)) {
        fs.mkdirSync(appDataPath, { recursive: true });
        console.log('Created database directory:', appDataPath);
      }
      
      const finalPath = path.join(appDataPath, 'pos.db');
      
      // Try to copy from resources (professional installer copies database here)
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          try {
            fs.copyFileSync(possiblePath, finalPath);
            console.log('Copied database from resources to:', finalPath);
            break;
          } catch (copyError) {
            console.warn('Failed to copy database:', copyError.message);
          }
        }
      }
      
      // If still no database found, create a new one
      if (!fs.existsSync(finalPath)) {
        console.log('Creating new database at:', finalPath);
        // Create empty database file - it will be initialized by the init-database.cjs
        fs.writeFileSync(finalPath, '');
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

// Initialize database connection
function initializeDatabase() {
  if (isInitialized && dbInstance) {
    return dbInstance;
  }

  try {
    const dbPath = getDatabasePath();
    console.log('Initializing database connection at:', dbPath);
    
    // Ensure directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    dbInstance = new Database(dbPath);
    isInitialized = true;
    
    console.log('Database connection initialized successfully');
    return dbInstance;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Get database instance (lazy initialization)
function getDatabase() {
  if (!isInitialized || !dbInstance) {
    return initializeDatabase();
  }
  return dbInstance;
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

// Close database connection
function closeDatabase() {
  if (dbInstance) {
    try {
      dbInstance.close();
      dbInstance = null;
      isInitialized = false;
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
}

module.exports = {
  initializeDatabase,
  getDatabase,
  getUploadsPath,
  closeDatabase,
  getDatabasePath
};
