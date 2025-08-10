const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Dynamic database path resolution
const getDatabasePath = () => {
  const devPath = path.join(__dirname, '../../../database.db');
  const prodPath = path.join(__dirname, '../../../../database.db');
  
  if (fs.existsSync(devPath)) {
    return devPath;
  } else if (fs.existsSync(prodPath)) {
    return prodPath;
  } else {
    throw new Error('Database file not found');
  }
};

const db = new Database(getDatabasePath());

// Create order detail
const createOrderDetail = (data) => {
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

    return { id: result.lastInsertRowid, ...data };
  } catch (error) {
    console.error('Error creating order detail:', error);
    throw error;
  }
};

// Update order detail
const updateOrderDetail = (id, updates) => {
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
      throw new Error('No valid fields to update');
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const stmt = db.prepare(`
      UPDATE order_details 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);

    const result = stmt.run(...updateValues);
    return result.changes > 0;
  } catch (error) {
    console.error('Error updating order detail:', error);
    throw error;
  }
};

// Get order detail by ID
const getOrderDetailById = (id) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM order_details 
      WHERE id = ? AND isdeleted = 0
    `);
    return stmt.get(id);
  } catch (error) {
    console.error('Error getting order detail by ID:', error);
    throw error;
  }
};

// Get order details by order ID
const getOrderDetailsByOrderId = (orderId) => {
  try {
    const stmt = db.prepare(`
      SELECT od.*, f.name as food_name, f.image as food_image
      FROM order_details od
      LEFT JOIN food f ON od.food_id = f.id
      WHERE od.order_id = ? AND od.isdeleted = 0
      ORDER BY od.created_at ASC
    `);
    return stmt.all(orderId);
  } catch (error) {
    console.error('Error getting order details by order ID:', error);
    throw error;
  }
};

// Get order details by food ID
const getOrderDetailsByFoodId = (foodId) => {
  try {
    const stmt = db.prepare(`
      SELECT od.*, o.order_status, o.customer_id
      FROM order_details od
      LEFT JOIN orders o ON od.order_id = o.id
      WHERE od.food_id = ? AND od.isdeleted = 0
      ORDER BY od.created_at DESC
    `);
    return stmt.all(foodId);
  } catch (error) {
    console.error('Error getting order details by food ID:', error);
    throw error;
  }
};

// Delete order detail (soft delete)
const deleteOrderDetail = (id) => {
  try {
    const stmt = db.prepare(`
      UPDATE order_details 
      SET isdeleted = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(id);
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting order detail:', error);
    throw error;
  }
};

// Get all order details (with pagination)
const getAllOrderDetails = (limit = 100, offset = 0) => {
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
    return stmt.all(limit, offset);
  } catch (error) {
    console.error('Error getting all order details:', error);
    throw error;
  }
};

// Get order details statistics
const getOrderDetailsStatistics = (startDate, endDate) => {
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
    return stmt.get(startDate, endDate);
  } catch (error) {
    console.error('Error getting order details statistics:', error);
    throw error;
  }
};

// Bulk create order details
const createMultipleOrderDetails = (orderDetailsArray) => {
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

    return insertMany(orderDetailsArray);
  } catch (error) {
    console.error('Error creating multiple order details:', error);
    throw error;
  }
};

module.exports = {
  createOrderDetail,
  updateOrderDetail,
  getOrderDetailById,
  getOrderDetailsByOrderId,
  getOrderDetailsByFoodId,
  deleteOrderDetail,
  getAllOrderDetails,
  getOrderDetailsStatistics,
  createMultipleOrderDetails
}; 