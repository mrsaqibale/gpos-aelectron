import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic path resolution for both development and production
const getDynamicPath = (relativePath) => {
  try {
    // Check if we're in development by looking for src/database
    const devPath = path.join(__dirname, '../../', relativePath);
    const prodPath = path.join(__dirname, '../../../', relativePath);
    
    if (fs.existsSync(devPath)) {
      return devPath;
    } else if (fs.existsSync(prodPath)) {
      return prodPath;
    } else {
      // Fallback to development path
      return devPath;
    }
  } catch (error) {
    console.error(`Failed to resolve path: ${relativePath}`, error);
    // Fallback to development path
    return path.join(__dirname, '../../', relativePath);
  }
};

const dbPath = getDynamicPath('pos.db');
const db = new Database(dbPath);

// Universal error response
export function errorResponse(message) {
  return { success: false, message };
}

// Create order detail
export function createOrderDetail(data) {
  try {
    const {
      food_id,
      order_id,
      price,
      food_details,
      item_note,
      variation,
      add_ons,
      discount_on_food = 0,
      discount_type,
      quantity = 1,
      tax_amount = 0,
      total_add_on_price = 0
    } = data;

    const stmt = db.prepare(`
      INSERT INTO order_details (
        food_id, order_id, price, food_details, item_note, variation, add_ons,
        discount_on_food, discount_type, quantity, tax_amount, total_add_on_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      food_id, order_id, price, food_details, item_note, variation, add_ons,
      discount_on_food, discount_type, quantity, tax_amount, total_add_on_price
    );

    return { success: true, id: result.lastInsertRowid, ...data };
  } catch (error) {
    console.error('Error creating order detail:', error);
    return errorResponse(error.message);
  }
}

// Update order detail
export function updateOrderDetail(id, updates) {
  try {
    const allowedFields = [
      'price', 'food_details', 'item_note', 'variation', 'add_ons',
      'discount_on_food', 'discount_type', 'quantity', 'tax_amount',
      'total_add_on_price', 'issynicronized', 'isdeleted'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return errorResponse('No valid fields to update');
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const stmt = db.prepare(`
      UPDATE order_details 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);

    const result = stmt.run(...updateValues);
    return { success: result.changes > 0, changes: result.changes };
  } catch (error) {
    console.error('Error updating order detail:', error);
    return errorResponse(error.message);
  }
}

// Get order detail by ID
export function getOrderDetailById(id) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM order_details 
      WHERE id = ? AND isdeleted = 0
    `);
    const result = stmt.get(id);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting order detail by ID:', error);
    return errorResponse(error.message);
  }
}

// Get order details by order ID
export function getOrderDetailsByOrderId(orderId) {
  try {
    const stmt = db.prepare(`
      SELECT od.*, f.name as food_name, f.image as food_image
      FROM order_details od
      LEFT JOIN food f ON od.food_id = f.id
      WHERE od.order_id = ? AND od.isdeleted = 0
      ORDER BY od.created_at ASC
    `);
    const results = stmt.all(orderId);
    return { success: true, data: results };
  } catch (error) {
    console.error('Error getting order details by order ID:', error);
    return errorResponse(error.message);
  }
}

// Get order details by food ID
export function getOrderDetailsByFoodId(foodId) {
  try {
    const stmt = db.prepare(`
      SELECT od.*, o.order_status, o.customer_id
      FROM order_details od
      LEFT JOIN orders o ON od.order_id = o.id
      WHERE od.food_id = ? AND od.isdeleted = 0
      ORDER BY od.created_at DESC
    `);
    const results = stmt.all(foodId);
    return { success: true, data: results };
  } catch (error) {
    console.error('Error getting order details by food ID:', error);
    return errorResponse(error.message);
  }
}

// Delete order detail (soft delete)
export function deleteOrderDetail(id) {
  try {
    const stmt = db.prepare(`
      UPDATE order_details 
      SET isdeleted = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(id);
    return { success: result.changes > 0, changes: result.changes };
  } catch (error) {
    console.error('Error deleting order detail:', error);
    return errorResponse(error.message);
  }
}

// Get all order details (with pagination)
export function getAllOrderDetails(limit = 100, offset = 0) {
  try {
    const stmt = db.prepare(`
      SELECT od.*, f.name as food_name, o.order_status
      FROM order_details od
      LEFT JOIN food f ON od.food_id = f.id
      LEFT JOIN orders o ON od.order_id = o.id
      WHERE od.isdeleted = 0
      ORDER BY od.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const results = stmt.all(limit, offset);
    return { success: true, data: results };
  } catch (error) {
    console.error('Error getting all order details:', error);
    return errorResponse(error.message);
  }
}

// Get order details statistics
export function getOrderDetailsStatistics(startDate, endDate) {
  try {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity,
        SUM(price * quantity) as total_revenue,
        SUM(discount_on_food * quantity) as total_discount,
        SUM(tax_amount * quantity) as total_tax,
        SUM(total_add_on_price * quantity) as total_addon_revenue
      FROM order_details od
      LEFT JOIN orders o ON od.order_id = o.id
      WHERE od.isdeleted = 0 
        AND o.created_at BETWEEN ? AND ?
    `);
    const result = stmt.get(startDate, endDate);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting order details statistics:', error);
    return errorResponse(error.message);
  }
}

// Bulk create order details
export function createMultipleOrderDetails(orderDetailsArray) {
  try {
    const stmt = db.prepare(`
      INSERT INTO order_details (
        food_id, order_id, price, food_details, item_note, variation, add_ons,
        discount_on_food, discount_type, quantity, tax_amount, total_add_on_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((details) => {
      const results = [];
      for (const detail of details) {
        const result = stmt.run(
          detail.food_id, detail.order_id, detail.price, detail.food_details,
          detail.item_note, detail.variation, detail.add_ons, detail.discount_on_food,
          detail.discount_type, detail.quantity, detail.tax_amount, detail.total_add_on_price
        );
        results.push({ id: result.lastInsertRowid, ...detail });
      }
      return results;
    });

    const results = insertMany(orderDetailsArray);
    return { success: true, data: results };
  } catch (error) {
    console.error('Error creating multiple order details:', error);
    return errorResponse(error.message);
  }
} 