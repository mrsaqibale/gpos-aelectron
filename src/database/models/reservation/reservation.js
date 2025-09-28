import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic path resolution for both development and production
const getDynamicPath = (relativePath) => {
  try {
    // Check if we're in development mode
    const isDev = !__dirname.includes('app.asar') && fs.existsSync(path.join(__dirname, '../../', relativePath));
    if (isDev) {
      return path.join(__dirname, '../../', relativePath);
    }

    // For production builds, try multiple possible paths
    const possiblePaths = [
      path.join(process.resourcesPath || '', 'database', relativePath),
      path.join(process.resourcesPath || '', 'app.asar.unpacked', 'database', relativePath),
      path.join(__dirname, '..', '..', 'resources', 'database', relativePath),
      path.join(__dirname, '..', '..', 'resources', 'app.asar.unpacked', 'database', relativePath),
      path.join(process.cwd(), 'database', relativePath),
      path.join(process.cwd(), 'resources', 'database', relativePath),
      path.join(__dirname, '../../', relativePath) // Fallback to relative path
    ];

    console.log(`[${path.basename(__filename)}] Looking for: ${relativePath}`);
    console.log(`[${path.basename(__filename)}] Current dir: ${__dirname}`);
    console.log(`[${path.basename(__filename)}] isDev: ${isDev}`);

    for (const candidate of possiblePaths) {
      try {
        if (candidate && fs.existsSync(candidate)) {
          console.log(`✅ [${path.basename(__filename)}] Found at: ${candidate}`);
          return candidate;
        }
      } catch (_) {}
    }

    // If not found, create in user's app data directory
    const appDataBaseDir = path.join(process.env.APPDATA || process.env.HOME || '', 'GPOS System', 'database');
    if (!fs.existsSync(appDataBaseDir)) {
      fs.mkdirSync(appDataBaseDir, { recursive: true });
    }
    const finalPath = path.join(appDataBaseDir, relativePath);

    // Try to copy from any of the possible paths
    for (const candidate of possiblePaths) {
      try {
        if (candidate && fs.existsSync(candidate)) {
          fs.copyFileSync(candidate, finalPath);
          console.log(`✅ [${path.basename(__filename)}] Copied to: ${finalPath}`);
          break;
        }
      } catch (_) {}
    }

    // If still not found, create empty file
    if (!fs.existsSync(finalPath)) {
      if (relativePath.endsWith('.db')) {
        fs.writeFileSync(finalPath, '');
      } else {
        fs.mkdirSync(finalPath, { recursive: true });
      }
    }

    console.log(`✅ [${path.basename(__filename)}] Using final path: ${finalPath}`);
    return finalPath;
  } catch (error) {
    console.error(`[${path.basename(__filename)}] Failed to resolve path: ${relativePath}`, error);
    // Ultimate fallback
    const fallback = path.join(process.env.APPDATA || process.env.HOME || '', 'GPOS System', 'database', relativePath);
    const dir = path.dirname(fallback);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return fallback;
  }
};

const dbPath = getDynamicPath('pos.db');
const db = new Database(dbPath);

// Universal error response
function errorResponse(message) {
  return { success: false, message };
}

// Create a new reservation
function createReservation({
  customer_id,
  customer_name,
  customer_phone,
  customer_email,
  reservation_date,
  start_time,
  end_time,
  duration,
  party_size,
  table_id,
  table_preference = 'any',
  is_table_preferred = false,
  status = 'pending',
  special_notes,
  hotel_id = 1,
  added_by
}) {
  try {
    const stmt = db.prepare(`
      INSERT INTO reservations (
        customer_id, customer_name, customer_phone, customer_email,
        reservation_date, start_time, end_time, duration, party_size,
        table_id, table_preference, is_table_preferred, status,
        special_notes, hotel_id, added_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(
      customer_id,
      customer_name,
      customer_phone || null,
      customer_email || null,
      reservation_date,
      start_time,
      end_time || null,
      duration || null,
      party_size || null,
      table_id || null,
      table_preference,
      is_table_preferred ? 1 : 0,
      status,
      special_notes || null,
      hotel_id,
      added_by || null
    );
    
    return { success: true, id: info.lastInsertRowid };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Update a reservation by id
function updateReservation(id, updates) {
  try {
    const fields = [];
    const values = [];
    
    // Process each field in updates
    for (const key in updates) {
      if (key === 'is_table_preferred' && typeof updates[key] === 'boolean') {
        fields.push(`${key} = ?`);
        values.push(updates[key] ? 1 : 0);
      } else {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }
    
    if (fields.length === 0) {
      return errorResponse('No valid fields to update.');
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    const sql = `UPDATE reservations SET ${fields.join(', ')} WHERE id = ? AND is_deleted = 0`;
    values.push(id);
    
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      return errorResponse('No reservation updated.');
    }
    
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get reservation by id
function getReservationById(id) {
  try {
    const stmt = db.prepare(`
      SELECT 
        r.*,
        c.name as customer_full_name,
        c.phone as customer_full_phone,
        c.email as customer_full_email,
        rt.table_no,
        f.name as floor_name
      FROM reservations r
      LEFT JOIN customer c ON r.customer_id = c.id
      LEFT JOIN restaurant_table rt ON r.table_id = rt.id
      LEFT JOIN floor f ON rt.floor_id = f.id
      WHERE r.id = ? AND r.is_deleted = 0
    `);
    
    const reservation = stmt.get(id);
    if (!reservation) {
      return errorResponse('Reservation not found.');
    }
    
    return { success: true, data: reservation };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get all reservations by hotel id
function getReservationsByHotelId(hotel_id = 1, limit = 50, offset = 0) {
  try {
    const stmt = db.prepare(`
      SELECT 
        r.*,
        c.name as customer_full_name,
        c.phone as customer_full_phone,
        c.email as customer_full_email,
        rt.table_no,
        f.name as floor_name
      FROM reservations r
      LEFT JOIN customer c ON r.customer_id = c.id
      LEFT JOIN restaurant_table rt ON r.table_id = rt.id
      LEFT JOIN floor f ON rt.floor_id = f.id
      WHERE r.hotel_id = ? AND r.is_deleted = 0
      ORDER BY r.reservation_date DESC, r.start_time DESC
      LIMIT ? OFFSET ?
    `);
    
    const reservations = stmt.all(hotel_id, limit, offset);
    return { success: true, data: reservations };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get reservations by status
function getReservationsByStatus(status, hotel_id = 1, limit = 50, offset = 0) {
  try {
    const stmt = db.prepare(`
      SELECT 
        r.*,
        c.name as customer_full_name,
        c.phone as customer_full_phone,
        c.email as customer_full_email,
        rt.table_no,
        f.name as floor_name
      FROM reservations r
      LEFT JOIN customer c ON r.customer_id = c.id
      LEFT JOIN restaurant_table rt ON r.table_id = rt.id
      LEFT JOIN floor f ON rt.floor_id = f.id
      WHERE r.hotel_id = ? AND r.status = ? AND r.is_deleted = 0
      ORDER BY r.reservation_date DESC, r.start_time DESC
      LIMIT ? OFFSET ?
    `);
    
    const reservations = stmt.all(hotel_id, status, limit, offset);
    return { success: true, data: reservations };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get reservations by date range
function getReservationsByDateRange(start_date, end_date, hotel_id = 1) {
  try {
    const stmt = db.prepare(`
      SELECT 
        r.*,
        c.name as customer_full_name,
        c.phone as customer_full_phone,
        c.email as customer_full_email,
        rt.table_no,
        f.name as floor_name
      FROM reservations r
      LEFT JOIN customer c ON r.customer_id = c.id
      LEFT JOIN restaurant_table rt ON r.table_id = rt.id
      LEFT JOIN floor f ON rt.floor_id = f.id
      WHERE r.hotel_id = ? AND r.reservation_date BETWEEN ? AND ? AND r.is_deleted = 0
      ORDER BY r.reservation_date ASC, r.start_time ASC
    `);
    
    const reservations = stmt.all(hotel_id, start_date, end_date);
    return { success: true, data: reservations };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get reservations by customer id
function getReservationsByCustomerId(customer_id, limit = 50, offset = 0) {
  try {
    const stmt = db.prepare(`
      SELECT 
        r.*,
        rt.table_no,
        f.name as floor_name
      FROM reservations r
      LEFT JOIN restaurant_table rt ON r.table_id = rt.id
      LEFT JOIN floor f ON rt.floor_id = f.id
      WHERE r.customer_id = ? AND r.is_deleted = 0
      ORDER BY r.reservation_date DESC, r.start_time DESC
      LIMIT ? OFFSET ?
    `);
    
    const reservations = stmt.all(customer_id, limit, offset);
    return { success: true, data: reservations };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Soft delete reservation
function deleteReservation(id) {
  try {
    const stmt = db.prepare(`
      UPDATE reservations 
      SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND is_deleted = 0
    `);
    
    const result = stmt.run(id);
    if (result.changes === 0) {
      return errorResponse('No reservation deleted.');
    }
    
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get total count of reservations for pagination
function getReservationsCount(hotel_id = 1, status = null) {
  try {
    let sql = 'SELECT COUNT(*) as count FROM reservations WHERE hotel_id = ? AND is_deleted = 0';
    let params = [hotel_id];
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    const stmt = db.prepare(sql);
    const result = stmt.get(...params);
    return { success: true, count: result.count };
  } catch (err) {
    return errorResponse(err.message);
  }
}

export {
  createReservation,
  updateReservation,
  getReservationById,
  getReservationsByHotelId,
  getReservationsByStatus,
  getReservationsByDateRange,
  getReservationsByCustomerId,
  deleteReservation,
  getReservationsCount
};
