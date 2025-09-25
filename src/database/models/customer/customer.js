import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic path resolution for both development and production
const getDynamicPath = (relativePath) => {
  try {
    // Check if we're in a built app (app.asar) or have resourcesPath
    const isBuiltApp = __dirname.includes('app.asar') || process.resourcesPath;
    
    // Current location: src/database/models/customer/
    // Target: src/database/ (go up 2 levels)
    const devPath = path.join(__dirname, '../../', relativePath);
    
    // For built app: resources/database/models/customer -> resources/database
    const builtPath = path.join(process.resourcesPath || '', 'database', relativePath);
    
    console.log(`[customer.js] Looking for: ${relativePath}`);
    console.log(`[customer.js] Current dir: ${__dirname}`);
    console.log(`[customer.js] isBuiltApp: ${isBuiltApp}`);
    console.log(`[customer.js] Dev path: ${devPath}`);
    console.log(`[customer.js] Built path: ${builtPath}`);
    
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [customer.js] Found at built path: ${builtPath}`);
      return builtPath;
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [customer.js] Found at dev path: ${devPath}`);
      return devPath;
    } else {
      console.log(`❌ [customer.js] Not found, using dev path: ${devPath}`);
      return devPath;
    }
  } catch (error) {
    console.error(`[customer.js] Failed to resolve path: ${relativePath}`, error);
    return path.join(__dirname, '../../', relativePath);
  }
};

const dbPath = getDynamicPath('pos.db');
const db = new Database(dbPath);

// Universal error response
export function errorResponse(message) {
  return { success: false, message };
}

// Create a new customer
export function createCustomer({ name, phone, email, address, isloyal = false, addedBy, hotel_id = 1 }) {
  try {
    const stmt = db.prepare(`
      INSERT INTO customer (name, phone, email, address, isloyal, addedBy, hotel_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(name, phone, email, address, isloyal ? 1 : 0, addedBy, hotel_id);
    return { success: true, id: info.lastInsertRowid };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Update a customer by id
export function updateCustomer(id, updates) {
  try {
    const fields = [];
    const values = [];
    for (const key in updates) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    const sql = `UPDATE customer SET ${fields.join(', ')} WHERE id = ? AND isDelete = 0`;
    values.push(id);
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    if (result.changes === 0) return errorResponse('No customer updated.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get customer by id with addresses
export function getCustomerById(id) {
  try {
    const stmt = db.prepare(`
      SELECT 
        c.*,
        GROUP_CONCAT(a.id || ':' || a.address || ':' || a.code) as addresses
      FROM customer c
      LEFT JOIN addresses a ON c.id = a.customer_id AND a.isdeleted = 0
      WHERE c.id = ? AND c.isDelete = 0
      GROUP BY c.id
    `);
    const customer = stmt.get(id);
    if (!customer) return errorResponse('Customer not found.');
    
    // Parse addresses string into array of objects
    if (customer.addresses) {
      customer.addresses = customer.addresses.split(',').map(addr => {
        const [id, address, code] = addr.split(':');
        return { id: parseInt(id), address, code: code || null };
      });
    } else {
      customer.addresses = [];
    }
    
    return { success: true, data: customer };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get all customers by hotel id with addresses
export function getCustomersByHotelId(hotel_id) {
  try {
    const stmt = db.prepare(`
      SELECT 
        c.id, c.name, c.phone, c.email, c.address, c.isloyal, c.addedBy,
        GROUP_CONCAT(a.id || ':' || a.address || ':' || a.code) as addresses
      FROM customer c
      LEFT JOIN addresses a ON c.id = a.customer_id AND a.isdeleted = 0
      WHERE c.hotel_id = ? AND c.isDelete = 0
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    const customers = stmt.all(hotel_id);
    
    // Parse addresses string into array of objects
    customers.forEach(customer => {
      if (customer.addresses) {
        customer.addresses = customer.addresses.split(',').map(addr => {
          const [id, address, code] = addr.split(':');
          return { id: parseInt(id), address, code: code || null };
        });
      } else {
        customer.addresses = [];
      }
    });
    
    return { success: true, data: customers };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Search customer by phone (prefix match) with addresses
export function searchCustomerByPhone(phone) {
  try {
    // If phone is empty or not provided, return empty result
    if (!phone) return { success: true, data: [] };
    // Use LIKE for prefix match (e.g., '984%')
    const stmt = db.prepare(`
      SELECT 
        c.id, c.name, c.phone, c.email, c.address, c.isloyal, c.addedBy,
        GROUP_CONCAT(a.id || ':' || a.address || ':' || a.code) as addresses
      FROM customer c
      LEFT JOIN addresses a ON c.id = a.customer_id AND a.isdeleted = 0
      WHERE c.phone LIKE ? AND c.isDelete = 0
      GROUP BY c.id
    `);
    const customers = stmt.all(`${phone}%`);
    
    // Parse addresses string into array of objects
    customers.forEach(customer => {
      if (customer.addresses) {
        customer.addresses = customer.addresses.split(',').map(addr => {
          const [id, address, code] = addr.split(':');
          return { id: parseInt(id), address, code: code || null };
        });
      } else {
        customer.addresses = [];
      }
    });
    
    return { success: true, data: customers };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Search customer by name (prefix match) with addresses
export function searchCustomerByName(name) {
  try {
    // If name is empty or not provided, return empty result
    if (!name) return { success: true, data: [] };
    // Use LIKE for contains match (e.g., '%John%') and case-insensitive
    const stmt = db.prepare(`
      SELECT 
        c.id, c.name, c.phone, c.email, c.address, c.isloyal, c.addedBy,
        GROUP_CONCAT(a.id || ':' || a.address || ':' || a.code) as addresses
      FROM customer c
      LEFT JOIN addresses a ON c.id = a.customer_id AND a.isdeleted = 0
      WHERE LOWER(c.name) LIKE LOWER(?) AND c.isDelete = 0
      GROUP BY c.id
    `);
    const customers = stmt.all(`%${name}%`);
    
    // Parse addresses string into array of objects
    customers.forEach(customer => {
      if (customer.addresses) {
        customer.addresses = customer.addresses.split(',').map(addr => {
          const [id, address, code] = addr.split(':');
          return { id: parseInt(id), address, code: code || null };
        });
      } else {
        customer.addresses = [];
      }
    });
    
    return { success: true, data: customers };
  } catch (err) {
    return errorResponse(err.message);
  }
} 

// Create a new customer with addresses in a single transaction
export function createCustomerWithAddresses({ customer, addresses = [] }) {
  try {
    // Start transaction
    const transaction = db.transaction(() => {
      // Create customer first
      const customerStmt = db.prepare(`
        INSERT INTO customer (name, phone, email, address, isloyal, addedBy, hotel_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const customerInfo = customerStmt.run(
        customer.name, 
        customer.phone, 
        customer.email, 
        customer.address || null, 
        customer.isloyal ? 1 : 0, 
        customer.addedBy, 
        customer.hotel_id || 1
      );
      
      const customerId = customerInfo.lastInsertRowid;
      
      // Create addresses if provided
      const addressIds = [];
      if (addresses.length > 0) {
        const addressStmt = db.prepare(`
          INSERT INTO addresses (customer_id, address, code, addedby)
          VALUES (?, ?, ?, ?)
        `);
        
        for (const address of addresses) {
          const addressInfo = addressStmt.run(
            customerId,
            address.address,
            address.code || null,
            address.addedby || customer.addedBy
          );
          addressIds.push(addressInfo.lastInsertRowid);
        }
      }
      
      return { customerId, addressIds };
    });
    
    const result = transaction();
    return { 
      success: true, 
      customerId: result.customerId, 
      addressIds: result.addressIds 
    };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Create a single address for an existing customer
export function createAddress({ customer_id, address, code, addedby }) {
  try {
    const stmt = db.prepare(`
      INSERT INTO addresses (customer_id, address, code, addedby)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(customer_id, address, code || null, addedby);
    return { success: true, id: info.lastInsertRowid };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get all addresses for a customer
export function getCustomerAddresses(customer_id) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM addresses 
      WHERE customer_id = ? AND isdeleted = 0
      ORDER BY created_at DESC
    `);
    const addresses = stmt.all(customer_id);
    return { success: true, data: addresses };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Update an address
export function updateAddress(id, updates) {
  try {
    const fields = [];
    const values = [];
    for (const key in updates) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    const sql = `UPDATE addresses SET ${fields.join(', ')} WHERE id = ? AND isdeleted = 0`;
    values.push(id);
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    if (result.changes === 0) return errorResponse('No address updated.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Delete an address (soft delete)
export function deleteAddress(id) {
  try {
    const stmt = db.prepare('UPDATE addresses SET isdeleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(id);
    if (result.changes === 0) return errorResponse('No address deleted.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get customers with order statistics for management table
export function getCustomersWithOrderStats(hotel_id = 1, limit = 50, offset = 0) {
  try {
    const stmt = db.prepare(`
      SELECT 
        c.id,
        c.name,
        c.phone,
        c.email,
        c.address,
        c.isloyal,
        c.addedBy,
        c.created_at as joiningDate,
        COALESCE(COUNT(o.id), 0) as totalOrders,
        COALESCE(SUM(o.order_amount), 0) as totalAmount,
        COALESCE(MAX(o.created_at), c.created_at) as lastOrderDate
      FROM customer c
      LEFT JOIN orders o ON c.id = o.customer_id AND o.isdeleted = 0
      WHERE c.hotel_id = ? AND c.isDelete = 0
      GROUP BY c.id, c.name, c.phone, c.email, c.address, c.isloyal, c.addedBy, c.created_at
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const customers = stmt.all(hotel_id, limit, offset);
    
    return { success: true, data: customers };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get total count of customers for pagination
export function getCustomersCount(hotel_id = 1) {
  try {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM customer 
      WHERE hotel_id = ? AND isDelete = 0
    `);
    const result = stmt.get(hotel_id);
    return { success: true, count: result.count };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Search customers with order statistics
export function searchCustomersWithOrderStats(searchTerm, hotel_id = 1, limit = 50, offset = 0) {
  try {
    if (!searchTerm) {
      return getCustomersWithOrderStats(hotel_id, limit, offset);
    }
    
    const stmt = db.prepare(`
      SELECT 
        c.id,
        c.name,
        c.phone,
        c.email,
        c.address,
        c.isloyal,
        c.addedBy,
        c.created_at as joiningDate,
        COALESCE(COUNT(o.id), 0) as totalOrders,
        COALESCE(SUM(o.order_amount), 0) as totalAmount,
        COALESCE(MAX(o.created_at), c.created_at) as lastOrderDate
      FROM customer c
      LEFT JOIN orders o ON c.id = o.customer_id AND o.isdeleted = 0
      WHERE c.hotel_id = ? AND c.isDelete = 0 
        AND (LOWER(c.name) LIKE LOWER(?) OR LOWER(c.email) LIKE LOWER(?) OR c.phone LIKE ?)
      GROUP BY c.id, c.name, c.phone, c.email, c.address, c.isloyal, c.addedBy, c.created_at
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const searchPattern = `%${searchTerm}%`;
    const phonePattern = `${searchTerm}%`;
    const customers = stmt.all(hotel_id, searchPattern, searchPattern, phonePattern, limit, offset);
    
    return { success: true, data: customers };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get customer orders for modal display
export function getCustomerOrders(customer_id, limit = 50, offset = 0) {
  try {
    const stmt = db.prepare(`
      SELECT 
        id,
        order_number,
        order_status,
        order_amount,
        payment_status,
        payment_method,
        created_at,
        order_type,
        table_details
      FROM orders 
      WHERE customer_id = ? AND isdeleted = 0
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    const orders = stmt.all(customer_id, limit, offset);
    
    return { success: true, data: orders };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get customer order count
export function getCustomerOrderCount(customer_id) {
  try {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE customer_id = ? AND isdeleted = 0
    `);
    const result = stmt.get(customer_id);
    return { success: true, count: result.count };
  } catch (err) {
    return errorResponse(err.message);
  }
} 