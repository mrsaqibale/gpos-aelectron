const path = require('path');
const fs = require('fs');

// Enhanced database path resolver for both development and production (CommonJS version)
function getDatabasePath(relativePath = 'pos.db') {
  try {
    // Check if we're in development mode
    const isDev = !__dirname.includes('app.asar') && fs.existsSync(path.join(__dirname, 'pos.db'));
    
    if (isDev) {
      // Development mode - use src/database path
      const devPath = path.join(__dirname, relativePath);
      console.log('Development mode: Using database path:', devPath);
      return devPath;
    } else {
      // Production mode - try multiple possible paths
      const possiblePaths = [
        // Standard resources path
        path.join(process.resourcesPath, 'database', relativePath),
        // App.asar.unpacked path
        path.join(process.resourcesPath, 'app.asar.unpacked', 'database', relativePath),
        // Relative to current directory
        path.join(__dirname, '..', '..', '..', 'resources', 'database', relativePath),
        path.join(__dirname, '..', '..', '..', 'resources', 'app.asar.unpacked', 'database', relativePath),
        // Current working directory
        path.join(process.cwd(), 'database', relativePath),
        path.join(process.cwd(), 'resources', 'database', relativePath),
        // App data directory (fallback)
        path.join(process.env.APPDATA || process.env.HOME, 'GPOS System', 'database', relativePath)
      ];
      
      // First, try to find existing database
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          console.log('Production mode: Found database at:', possiblePath);
          return possiblePath;
        }
      }
      
      // If no existing database found, use app data directory
      const appDataPath = path.join(process.env.APPDATA || process.env.HOME, 'GPOS System', 'database');
      if (!fs.existsSync(appDataPath)) {
        fs.mkdirSync(appDataPath, { recursive: true });
      }
      
      const finalPath = path.join(appDataPath, relativePath);
      
      // Try to copy database from resources if it exists
      const resourceDbPaths = [
        path.join(process.resourcesPath, 'database', relativePath),
        path.join(process.resourcesPath, 'app.asar.unpacked', 'database', relativePath),
        path.join(__dirname, '..', '..', '..', 'resources', 'database', relativePath),
        path.join(__dirname, '..', '..', '..', 'resources', 'app.asar.unpacked', 'database', relativePath)
      ];
      
      for (const resourceDbPath of resourceDbPaths) {
        if (fs.existsSync(resourceDbPath)) {
          try {
            fs.copyFileSync(resourceDbPath, finalPath);
            console.log('Production mode: Copied database from resources to:', finalPath);
            break;
          } catch (copyError) {
            console.warn('Failed to copy database from resources:', copyError.message);
          }
        }
      }
      
      console.log('Production mode: Using database at:', finalPath);
      return finalPath;
    }
  } catch (error) {
    console.error('Error resolving database path:', error);
    // Fallback to app data directory
    const fallbackPath = path.join(process.env.APPDATA || process.env.HOME, 'GPOS System', 'database', relativePath);
    const fallbackDir = path.dirname(fallbackPath);
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    return fallbackPath;
  }
}

// Get uploads directory path
function getUploadsPath(subPath = '') {
  try {
    const isDev = !__dirname.includes('app.asar') && fs.existsSync(path.join(__dirname, 'pos.db'));
    
    if (isDev) {
      // Development mode
      return path.join(__dirname, 'uploads', subPath);
    } else {
      // Production mode - use app data directory for uploads
      const uploadsPath = path.join(process.env.APPDATA || process.env.HOME, 'GPOS System', 'uploads', subPath);
      if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
      }
      return uploadsPath;
    }
  } catch (error) {
    console.error('Error resolving uploads path:', error);
    // Fallback
    const fallbackPath = path.join(process.env.APPDATA || process.env.HOME, 'GPOS System', 'uploads', subPath);
    const fallbackDir = path.dirname(fallbackPath);
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    return fallbackPath;
  }
}

// Ensure directory exists
function ensureDirectoryExists(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log('Created directory:', dirPath);
    }
  } catch (error) {
    console.error('Error creating directory:', error);
  }
}

module.exports = { getDatabasePath, getUploadsPath, ensureDirectoryExists };
