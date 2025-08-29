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

// Create a new order detail
export function createOrderDetail(orderDetailData) {
  try {
    console.log('Creating order detail with data:', orderDetailData);
    
    const stmt = db.prepare(`
      INSERT INTO order_details (
        food_id, order_id, price, food_details, item_note, variation,
        add_ons, ingredients, discount_on_food, discount_type, quantity,
        tax_amount, total_add_on_price, issynicronized, isdeleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const values = [
      orderDetailData.food_id || null,
      orderDetailData.order_id || null,
      orderDetailData.price || 0,
      orderDetailData.food_details || null,
      orderDetailData.item_note || null,
      orderDetailData.variation || null,
      orderDetailData.add_ons || null,
      orderDetailData.ingredients || null,
      orderDetailData.discount_on_food || 0,
      orderDetailData.discount_type || null,
      orderDetailData.quantity || 1,
      orderDetailData.tax_amount || 0,
      orderDetailData.total_add_on_price || 0,
      (orderDetailData.issynicronized || false) ? 1 : 0,
      (orderDetailData.isdeleted || false) ? 1 : 0
    ];
    
    const info = stmt.run(...values);
    const orderDetailId = info.lastInsertRowid;
    
    console.log('Order detail created successfully with ID:', orderDetailId);
    return { 
      success: true, 
      id: orderDetailId,
      message: 'Order detail created successfully'
    };
  } catch (err) {
    console.error('Error creating order detail:', err.message);
    return errorResponse(err.message);
  }
}

// Create multiple order details
export function createMultipleOrderDetails(orderDetailsArray) {
  try {
    console.log('Creating multiple order details:', orderDetailsArray.length);
    
    const stmt = db.prepare(`
      INSERT INTO order_details (
        food_id, order_id, price, food_details, item_note, variation,
        add_ons, ingredients, discount_on_food, discount_type, quantity,
        tax_amount, total_add_on_price, issynicronized, isdeleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((details) => {
      const results = [];
      for (const detail of details) {
        const values = [
          detail.food_id || null,
          detail.order_id || null,
          detail.price || 0,
          detail.food_details || null,
          detail.item_note || null,
          detail.variation || null,
          detail.add_ons || null,
          detail.ingredients || null,
          detail.discount_on_food || 0,
          detail.discount_type || null,
          detail.quantity || 1,
          detail.tax_amount || 0,
          detail.total_add_on_price || 0,
          (detail.issynicronized || false) ? 1 : 0,
          (detail.isdeleted || false) ? 1 : 0
        ];
        
        console.log('Order detail values:', values);
        
        const info = stmt.run(...values);
        results.push({
          id: info.lastInsertRowid,
          food_id: detail.food_id,
          success: true
        });
      }
      return results;
    });
    
    const results = insertMany(orderDetailsArray);
    
    console.log('Multiple order details created successfully:', results.length);
    return { 
      success: true, 
      data: results,
      count: results.length,
      message: `${results.length} order details created successfully`
    };
  } catch (err) {
    console.error('Error creating multiple order details:', err.message);
    return errorResponse(err.message);
  }
}

// Update an order detail by id
export function updateOrderDetail(id, updates) {
  try {
    const fields = [];
    const values = [];
    
    // Process fields
    for (const key in updates) {
      if (key !== 'id') { // Don't update the ID
        fields.push(`${key} = ?`);
        // Convert boolean values to integers for SQLite
        let value = updates[key];
        if (typeof value === 'boolean') {
          value = value ? 1 : 0;
        }
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      return errorResponse('No valid fields to update.');
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    const sql = `UPDATE order_details SET ${fields.join(', ')} WHERE id = ? AND isdeleted = 0`;
    values.push(id);
    
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      return errorResponse('No order detail updated or not found.');
    }
    
    return { 
      success: true, 
      message: 'Order detail updated successfully',
      changes: result.changes
    };
  } catch (err) {
    console.error('Error updating order detail:', err.message);
    return errorResponse(err.message);
  }
}

// Get order detail by id
export function getOrderDetailById(id) {
  try {
    const stmt = db.prepare('SELECT * FROM order_details WHERE id = ? AND isdeleted = 0');
    const orderDetail = stmt.get(id);
    
    if (!orderDetail) {
      return errorResponse('Order detail not found.');
    }
    
    return { success: true, data: orderDetail };
  } catch (err) {
    console.error('Error getting order detail:', err.message);
    return errorResponse(err.message);
  }
}

// Get order details by order id
export function getOrderDetailsByOrderId(orderId) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM order_details 
      WHERE order_id = ? AND isdeleted = 0 
      ORDER BY created_at ASC
    `);
    const orderDetails = stmt.all(orderId);
    
    return { success: true, data: orderDetails };
  } catch (err) {
    console.error('Error getting order details by order ID:', err.message);
    return errorResponse(err.message);
  }
}

// Get order details by food id
export function getOrderDetailsByFoodId(foodId, limit = 50, offset = 0) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM order_details 
      WHERE food_id = ? AND isdeleted = 0 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    const orderDetails = stmt.all(foodId, limit, offset);
    
    return { success: true, data: orderDetails };
  } catch (err) {
    console.error('Error getting order details by food ID:', err.message);
    return errorResponse(err.message);
  }
}

// Get all order details
export function getAllOrderDetails(limit = 100, offset = 0) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM order_details 
      WHERE isdeleted = 0 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    const orderDetails = stmt.all(limit, offset);
    
    return { success: true, data: orderDetails };
  } catch (err) {
    console.error('Error getting all order details:', err.message);
    return errorResponse(err.message);
  }
}

// Delete order detail (soft delete)
export function deleteOrderDetail(id) {
  try {
    const stmt = db.prepare('UPDATE order_details SET isdeleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return errorResponse('Order detail not found or already deleted.');
    }
    
    return { 
      success: true, 
      message: 'Order detail deleted successfully' 
    };
  } catch (err) {
    console.error('Error deleting order detail:', err.message);
    return errorResponse(err.message);
  }
}

// Get order details with food information
export function getOrderDetailsWithFood(orderId) {
  try {
    console.log(`Getting order details for order ${orderId}...`);
    const stmt = db.prepare(`
      SELECT 
        od.*,
        f.name as food_name,
        f.description as food_description,
        f.image as food_image,
        c.name as category_name
      FROM order_details od
      LEFT JOIN food f ON od.food_id = f.id
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE od.order_id = ? AND od.isdeleted = 0
      ORDER BY od.created_at ASC
    `);
    const orderDetails = stmt.all(orderId);
    console.log(`Found ${orderDetails.length} order details for order ${orderId}:`, orderDetails.map(d => ({ id: d.id, food_id: d.food_id, food_name: d.food_name })));
    
    return { success: true, data: orderDetails };
  } catch (err) {
    console.error('Error getting order details with food:', err.message);
    return errorResponse(err.message);
  }
}

// Get order details statistics
export function getOrderDetailsStatistics(startDate = null, endDate = null) {
  try {
    let sql = `
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity,
        SUM(price * quantity) as total_revenue,
        SUM(discount_on_food) as total_discounts,
        SUM(tax_amount) as total_taxes,
        AVG(price) as average_price,
        COUNT(DISTINCT food_id) as unique_foods,
        COUNT(DISTINCT order_id) as unique_orders
      FROM order_details 
      WHERE isdeleted = 0
    `;
    
    const params = [];
    
    if (startDate && endDate) {
      sql += ' AND created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    const stmt = db.prepare(sql);
    const stats = stmt.get(...params);
    
    return { success: true, data: stats };
  } catch (err) {
    console.error('Error getting order details statistics:', err.message);
    return errorResponse(err.message);
  }
}

// Get top selling foods
export function getTopSellingFoods(limit = 10, startDate = null, endDate = null) {
  try {
    let sql = `
      SELECT 
        f.name as food_name,
        f.id as food_id,
        COUNT(od.id) as order_count,
        SUM(od.quantity) as total_quantity,
        SUM(od.price * od.quantity) as total_revenue
      FROM order_details od
      LEFT JOIN food f ON od.food_id = f.id
      WHERE od.isdeleted = 0
    `;
    
    const params = [];
    
    if (startDate && endDate) {
      sql += ' AND od.created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    sql += `
      GROUP BY od.food_id, f.name, f.id
      ORDER BY total_quantity DESC
      LIMIT ?
    `;
    params.push(limit);
    
    const stmt = db.prepare(sql);
    const topFoods = stmt.all(...params);
    
    return { success: true, data: topFoods };
  } catch (err) {
    console.error('Error getting top selling foods:', err.message);
    return errorResponse(err.message);
  }
}

// Delete order details by order ID
export function deleteOrderDetailsByOrderId(orderId) {
  try {
    const stmt = db.prepare(`
      DELETE FROM order_details 
      WHERE order_id = ? AND isdeleted = 0
    `);
    const result = stmt.run(orderId);
    
    console.log(`Deleted ${result.changes} order details for order ${orderId}`);
    return { success: true, message: `Deleted ${result.changes} order details` };
  } catch (err) {
    console.error('Error deleting order details:', err.message);
    return errorResponse(err.message);
  }
}

// Calculate order total from order details
export function calculateOrderTotal(orderId) {
  try {
    const stmt = db.prepare(`
      SELECT 
        SUM(price * quantity) as subtotal,
        SUM(discount_on_food) as total_discounts,
        SUM(tax_amount) as total_taxes,
        SUM(total_add_on_price) as total_addons
      FROM order_details 
      WHERE order_id = ? AND isdeleted = 0
    `);
    const totals = stmt.get(orderId);
    
    if (!totals) {
      return { success: true, data: { subtotal: 0, total_discounts: 0, total_taxes: 0, total_addons: 0, grand_total: 0 } };
    }
    
    const grandTotal = (totals.subtotal || 0) - (totals.total_discounts || 0) + (totals.total_taxes || 0) + (totals.total_addons || 0);
    
    return { 
      success: true, 
      data: {
        subtotal: totals.subtotal || 0,
        total_discounts: totals.total_discounts || 0,
        total_taxes: totals.total_taxes || 0,
        total_addons: totals.total_addons || 0,
        grand_total: grandTotal
      }
    };
  } catch (err) {
    console.error('Error calculating order total:', err.message);
    return errorResponse(err.message);
  }
} 