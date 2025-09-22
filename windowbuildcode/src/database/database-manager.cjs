const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Database connection manager
class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = null;
    this.initialized = false;
  }

  // Get database path with proper resolution
  getDatabasePath(relativePath = 'pos.db') {
    try {
      // Check if we're in development or production
      const isDev = !__dirname.includes('app.asar') && fs.existsSync(path.join(__dirname, 'pos.db'));
      
      if (isDev) {
        // Development mode
        return path.join(__dirname, relativePath);
      } else {
        // Production mode - try multiple paths
        const possiblePaths = [
          path.join(process.resourcesPath, 'database', relativePath),
          path.join(process.resourcesPath, 'app.asar.unpacked', 'database', relativePath),
          path.join(__dirname, '..', '..', '..', 'resources', 'database', relativePath),
          path.join(__dirname, '..', '..', '..', 'resources', 'app.asar.unpacked', 'database', relativePath),
          path.join(process.cwd(), 'database', relativePath),
          path.join(process.cwd(), 'resources', 'database', relativePath)
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
        
        const finalPath = path.join(appDataPath, relativePath);
        
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
      const fallbackPath = path.join(process.env.APPDATA || process.env.HOME, 'GPOS System', 'database', relativePath);
      const fallbackDir = path.dirname(fallbackPath);
      if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
      }
      return fallbackPath;
    }
  }

  // Get uploads path
  getUploadsPath(subPath = '') {
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

  // Initialize database connection
  initialize() {
    if (this.initialized) {
      return this.db;
    }

    try {
      this.dbPath = this.getDatabasePath('pos.db');
      console.log('Initializing database at:', this.dbPath);
      
      // Ensure directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      this.db = new Database(this.dbPath);
      this.initialized = true;
      
      console.log('Database initialized successfully');
      return this.db;
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  // Get database connection (lazy initialization)
  getDatabase() {
    if (!this.initialized) {
      return this.initialize();
    }
    return this.db;
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }
}

// Create singleton instance
const dbManager = new DatabaseManager();

module.exports = dbManager;
