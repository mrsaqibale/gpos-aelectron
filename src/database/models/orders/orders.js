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

// Create a new order
export function createOrder(orderData) {
  try {
    const stmt = db.prepare(`
      INSERT INTO orders (
        customer_id, order_amount, coupon_discount_amount, coupon_discount_title,
        payment_status, order_status, total_tax_amount, payment_method,
        delivery_address_id, coupon_code, order_note, order_type, restaurant_id,
        delivery_charge, schedule_at, callback, otp, delivery_address,
        delivery_ecode, scheduled, discount_amount, original_delivery_charge,
        tax_status, distance, tax_percentage, delivery_instruction,
        additional_charge, extra_packaging_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(
      orderData.customer_id,
      orderData.order_amount,
      orderData.coupon_discount_amount || 0,
      orderData.coupon_discount_title || null,
      orderData.payment_status || 'pending',
      orderData.order_status || 'pending',
      orderData.total_tax_amount || 0,
      orderData.payment_method || null,
      orderData.delivery_address_id || null,
      orderData.coupon_code || null,
      orderData.order_note || null,
      orderData.order_type || 'dine_in',
      orderData.restaurant_id,
      orderData.delivery_charge || 0,
      orderData.schedule_at || null,
      orderData.callback || null,
      orderData.otp || null,
      orderData.delivery_address || null,
      orderData.delivery_ecode || null,
      orderData.scheduled || 0,
      orderData.discount_amount || 0,
      orderData.original_delivery_charge || 0,
      orderData.tax_status || 'pending',
      orderData.distance || 0,
      orderData.tax_percentage || 0,
      orderData.delivery_instruction || null,
      orderData.additional_charge || 0,
      orderData.extra_packaging_amount || 0
    );
    
    return { success: true, id: info.lastInsertRowid };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Update order status and related date fields
export function updateOrderStatus(id, status, updatedBy = null) {
  try {
    const currentDate = new Date().toISOString();
    let dateField = '';
    let additionalUpdates = '';
    
    switch (status) {
      case 'pending':
        dateField = 'pending_date';
        break;
      case 'accepted':
        dateField = 'accepted_date';
        break;
      case 'confirmed':
        dateField = 'confirmed_date';
        break;
      case 'processing':
        dateField = 'processing_date';
        break;
      case 'handover':
        dateField = 'handover_date';
        break;
      case 'picked_up':
        dateField = 'picked_up_date';
        break;
      case 'delivered':
        dateField = 'delivered_date';
        break;
      case 'canceled':
        dateField = 'canceled_date';
        additionalUpdates = `, canceled_by = ${updatedBy || 'NULL'}`;
        break;
      case 'cooked':
        dateField = 'cooked_date';
        break;
      case 'done':
        dateField = 'done_date';
        break;
      case 'refund_requested':
        dateField = 'refund_requested_date';
        break;
    }
    
    const sql = `
      UPDATE orders 
      SET order_status = ?, ${dateField} = ?, updated_at = CURRENT_TIMESTAMP${additionalUpdates}
      WHERE id = ? AND isdeleted = 0
    `;
    
    const stmt = db.prepare(sql);
    const result = stmt.run(status, currentDate, id);
    
    if (result.changes === 0) return errorResponse('No order updated.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Update order by id
export function updateOrder(id, updates) {
  try {
    const fields = [];
    const values = [];
    for (const key in updates) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    const sql = `UPDATE orders SET ${fields.join(', ')} WHERE id = ? AND isdeleted = 0`;
    values.push(id);
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    if (result.changes === 0) return errorResponse('No order updated.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get order by id with customer and address details
export function getOrderById(id) {
  try {
    const stmt = db.prepare(`
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        a.address as delivery_address_full
      FROM orders o
      LEFT JOIN customer c ON o.customer_id = c.id
      LEFT JOIN addresses a ON o.delivery_address_id = a.id
      WHERE o.id = ? AND o.isdeleted = 0
    `);
    const order = stmt.get(id);
    if (!order) return errorResponse('Order not found.');
    return { success: true, data: order };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get all orders by restaurant with customer details
export function getOrdersByRestaurant(restaurantId, limit = 50, offset = 0) {
  try {
    const stmt = db.prepare(`
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email
      FROM orders o
      LEFT JOIN customer c ON o.customer_id = c.id
      WHERE o.restaurant_id = ? AND o.isdeleted = 0
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const orders = stmt.all(restaurantId, limit, offset);
    return { success: true, data: orders };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get orders by status
export function getOrdersByStatus(restaurantId, status, limit = 50, offset = 0) {
  try {
    const stmt = db.prepare(`
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email
      FROM orders o
      LEFT JOIN customer c ON o.customer_id = c.id
      WHERE o.restaurant_id = ? AND o.order_status = ? AND o.isdeleted = 0
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const orders = stmt.all(restaurantId, status, limit, offset);
    return { success: true, data: orders };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get orders by customer
export function getOrdersByCustomer(customerId, limit = 50, offset = 0) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM orders 
      WHERE customer_id = ? AND isdeleted = 0
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    const orders = stmt.all(customerId, limit, offset);
    return { success: true, data: orders };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Cancel order
export function cancelOrder(id, reason, canceledBy, note = null) {
  try {
    const stmt = db.prepare(`
      UPDATE orders 
      SET order_status = 'canceled', 
          canceled_date = CURRENT_TIMESTAMP,
          cancellation_reason = ?,
          canceled_by = ?,
          cancellation_note = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND isdeleted = 0
    `);
    const result = stmt.run(reason, canceledBy, note, id);
    if (result.changes === 0) return errorResponse('No order canceled.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Request refund
export function requestRefund(id, reason = null) {
  try {
    const stmt = db.prepare(`
      UPDATE orders 
      SET refund_requested_date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND isdeleted = 0
    `);
    const result = stmt.run(id);
    if (result.changes === 0) return errorResponse('No order updated.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Process refund
export function processRefund(id, processedBy) {
  try {
    const stmt = db.prepare(`
      UPDATE orders 
      SET refunded = 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND isdeleted = 0
    `);
    const result = stmt.run(id);
    if (result.changes === 0) return errorResponse('No order updated.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get order statistics
export function getOrderStatistics(restaurantId, startDate = null, endDate = null) {
  try {
    let dateFilter = '';
    let params = [restaurantId];
    
    if (startDate && endDate) {
      dateFilter = 'AND created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(order_amount) as total_revenue,
        SUM(coupon_discount_amount) as total_discounts,
        SUM(delivery_charge) as total_delivery_charges,
        SUM(total_tax_amount) as total_taxes,
        COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN order_status = 'canceled' THEN 1 END) as canceled_orders,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders
      FROM orders 
      WHERE restaurant_id = ? AND isdeleted = 0 ${dateFilter}
    `);
    
    const stats = stmt.get(...params);
    return { success: true, data: stats };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Delete order (soft delete)
export function deleteOrder(id) {
  try {
    const stmt = db.prepare('UPDATE orders SET isdeleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(id);
    if (result.changes === 0) return errorResponse('No order deleted.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
} 