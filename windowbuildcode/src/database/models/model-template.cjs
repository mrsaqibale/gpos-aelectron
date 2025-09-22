const { getGlobalDB, getUploadsPath } = require('../../global-db.cjs');

// Template for database models that use global database connection
// This prevents module-level database connections

// Get database connection (lazy)
function getDB() {
  return getGlobalDB();
}

// Get uploads path
function getUploads(subPath = '') {
  return getUploadsPath(subPath);
}

// Universal error response
function errorResponse(message) {
  return { success: false, message };
}

module.exports = {
  getDB,
  getUploads,
  errorResponse
};
