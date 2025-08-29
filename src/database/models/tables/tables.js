import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../pos.db');
const db = new Database(dbPath);

// Universal error response
export function errorResponse(message) {
  return { success: false, message };
}

// Create a new table
export function createTable({ table_no, floor_id, seat_capacity, addedby }) {
  try {
    // Check if seat_capacity column exists
    const tableInfo = db.prepare("PRAGMA table_info(restaurant_table)").all();
    const hasSeatCapacity = tableInfo.some(col => col.name === 'seat_capacity');
    
    if (hasSeatCapacity) {
      const stmt = db.prepare(`
        INSERT INTO restaurant_table (table_no, floor_id, seat_capacity, addedby)
        VALUES (?, ?, ?, ?)
      `);
      const info = stmt.run(table_no, floor_id, seat_capacity || 4, addedby);
      return { success: true, id: info.lastInsertRowid };
    } else {
      // Fallback to original schema without seat_capacity
      const stmt = db.prepare(`
        INSERT INTO restaurant_table (table_no, floor_id, addedby)
        VALUES (?, ?, ?)
      `);
      const info = stmt.run(table_no, floor_id, addedby);
      return { success: true, id: info.lastInsertRowid };
    }
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Update a table by id
export function updateTable(id, updates) {
  try {
    const fields = [];
    const values = [];
    for (const key in updates) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    const sql = `UPDATE restaurant_table SET ${fields.join(', ')} WHERE id = ? AND isdeleted = 0`;
    values.push(id);
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    if (result.changes === 0) return errorResponse('No table updated.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get table by id with floor information
export function getTableById(id) {
  try {
    const stmt = db.prepare(`
      SELECT 
        rt.*,
        f.name as floor_name,
        f.type as floor_type
      FROM restaurant_table rt
      LEFT JOIN floor f ON rt.floor_id = f.id
      WHERE rt.id = ? AND rt.isdeleted = 0
    `);
    const table = stmt.get(id);
    if (!table) return errorResponse('Table not found.');
    return { success: true, data: table };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get all tables with their floor information
export function getAllTables() {
  try {
    // Check if seat_capacity and status columns exist
    const tableInfo = db.prepare("PRAGMA table_info(restaurant_table)").all();
    const hasSeatCapacity = tableInfo.some(col => col.name === 'seat_capacity');
    const hasStatus = tableInfo.some(col => col.name === 'status');
    
    let sql = `
      SELECT 
        rt.*,
        f.name as floor_name,
        f.type as floor_type
    `;
    
    if (!hasSeatCapacity) {
      sql = sql.replace('rt.*', 'rt.id, rt.table_no, rt.floor_id, rt.created_at, rt.updated_at, rt.issyncronized, rt.isdeleted, rt.addedby');
    }
    
    sql += `
      FROM restaurant_table rt
      LEFT JOIN floor f ON rt.floor_id = f.id
      WHERE rt.isdeleted = 0
      ORDER BY f.name, rt.table_no
    `;
    
    const tables = db.prepare(sql).all();
    
    // Add default values for missing columns
    const processedTables = tables.map(table => ({
      ...table,
      seat_capacity: hasSeatCapacity ? table.seat_capacity : 4,
      status: hasStatus ? table.status : 'Free'
    }));
    
    return { success: true, data: processedTables };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get tables by floor id
export function getTablesByFloor(floorId) {
  try {
    // Check if seat_capacity and status columns exist
    const tableInfo = db.prepare("PRAGMA table_info(restaurant_table)").all();
    const hasSeatCapacity = tableInfo.some(col => col.name === 'seat_capacity');
    const hasStatus = tableInfo.some(col => col.name === 'status');
    
    let sql = `
      SELECT 
        rt.*,
        f.name as floor_name,
        f.type as floor_type
    `;
    
    if (!hasSeatCapacity) {
      sql = sql.replace('rt.*', 'rt.id, rt.table_no, rt.floor_id, rt.created_at, rt.updated_at, rt.issyncronized, rt.isdeleted, rt.addedby');
    }
    
    sql += `
      FROM restaurant_table rt
      LEFT JOIN floor f ON rt.floor_id = f.id
      WHERE rt.floor_id = ? AND rt.isdeleted = 0
      ORDER BY rt.table_no
    `;
    
    const tables = db.prepare(sql).all(floorId);
    
    // Add default values for missing columns
    const processedTables = tables.map(table => ({
      ...table,
      seat_capacity: hasSeatCapacity ? table.seat_capacity : 4,
      status: hasStatus ? table.status : 'Free'
    }));
    
    return { success: true, data: processedTables };
  } catch (err) {
    return errorResponse(err.message);
  }
} 

// Get tables by floor id with status filter
export function getTablesByFloorWithStatus(floorId, status = 'Free') {
  try {
    // Check if seat_capacity and status columns exist
    const tableInfo = db.prepare("PRAGMA table_info(restaurant_table)").all();
    const hasSeatCapacity = tableInfo.some(col => col.name === 'seat_capacity');
    const hasStatus = tableInfo.some(col => col.name === 'status');
    
    let sql = `
      SELECT 
        rt.*,
        f.name as floor_name,
        f.type as floor_type
    `;
    
    if (!hasSeatCapacity) {
      sql = sql.replace('rt.*', 'rt.id, rt.table_no, rt.floor_id, rt.created_at, rt.updated_at, rt.issyncronized, rt.isdeleted, rt.addedby');
    }
    
    if (hasStatus) {
      sql += `
        FROM restaurant_table rt
        LEFT JOIN floor f ON rt.floor_id = f.id
        WHERE rt.floor_id = ? AND rt.status = ? AND rt.isdeleted = 0
        ORDER BY rt.table_no
      `;
      const tables = db.prepare(sql).all(floorId, status);
      
      // Add default values for missing columns
      const processedTables = tables.map(table => ({
        ...table,
        seat_capacity: hasSeatCapacity ? table.seat_capacity : 4,
        status: table.status
      }));
      
      return { success: true, data: processedTables };
    } else {
      // If status column doesn't exist, return all tables for the floor
      sql += `
        FROM restaurant_table rt
        LEFT JOIN floor f ON rt.floor_id = f.id
        WHERE rt.floor_id = ? AND rt.isdeleted = 0
        ORDER BY rt.table_no
      `;
      const tables = db.prepare(sql).all(floorId);
      
      // Add default values for missing columns
      const processedTables = tables.map(table => ({
        ...table,
        seat_capacity: hasSeatCapacity ? table.seat_capacity : 4,
        status: 'Free' // Default status
      }));
      
      return { success: true, data: processedTables };
    }
  } catch (err) {
    return errorResponse(err.message);
  }
} 

// Update table status
export function updateTableStatus(tableId, status) {
  try {
    // Check if status column exists
    const tableInfo = db.prepare("PRAGMA table_info(restaurant_table)").all();
    const hasStatus = tableInfo.some(col => col.name === 'status');
    
    if (hasStatus) {
      const stmt = db.prepare(`
        UPDATE restaurant_table 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND isdeleted = 0
      `);
      const result = stmt.run(status, tableId);
      
      if (result.changes === 0) {
        return errorResponse('No table updated or table not found.');
      }
      
      return { 
        success: true, 
        message: `Table status updated to ${status}`,
        changes: result.changes
      };
    } else {
      return errorResponse('Status column does not exist in restaurant_table.');
    }
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Update multiple table statuses
export function updateMultipleTableStatuses(tableIds, status) {
  try {
    // Check if status column exists
    const tableInfo = db.prepare("PRAGMA table_info(restaurant_table)").all();
    const hasStatus = tableInfo.some(col => col.name === 'status');
    
    if (!hasStatus) {
      return errorResponse('Status column does not exist in restaurant_table.');
    }
    
    const stmt = db.prepare(`
      UPDATE restaurant_table 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id IN (${tableIds.map(() => '?').join(',')}) AND isdeleted = 0
    `);
    
    const result = stmt.run(status, ...tableIds);
    
    if (result.changes === 0) {
      return errorResponse('No tables updated.');
    }
    
    return { 
      success: true, 
      message: `Updated ${result.changes} table(s) status to ${status}`,
      changes: result.changes
    };
  } catch (err) {
    return errorResponse(err.message);
  }
} 