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

// Create a new order
export function createOrder(orderData) {
  try {
    console.log('Creating order with data:', orderData);
    
    const sql = `
      INSERT INTO orders (
        customer_id, order_amount, coupon_discount_amount, coupon_discount_title,
        payment_status, order_status, total_tax_amount, payment_method,
        delivery_address_id, coupon_code, order_note, order_type, restaurant_id,
        delivery_charge, schedule_at, callback, otp, pending_date, accepted_date,
        confirmed_date, processing_date, handover_date, picked_up_date,
        delivered_date, canceled_date, cooked_date, done_date,
        refund_requested_date, refunded, delivery_address, delivery_ecode,
        scheduled, discount_amount, original_delivery_charge, failed,
        refund_request_canceled, cancellation_reason, canceled_by, tax_status,
        coupon_created_by, distance, cancellation_note, tax_percentage,
        delivery_instruction, unavailable_item_note, additional_charge,
        partially_paid_amount, order_proof, cash_back_id, extra_packaging_amount,
        table_details, isdeleted, issyncronized, ready_date, draft_name, isreported,
        ontheway, waiter, order_number, placed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Count the placeholders
    const placeholderCount = (sql.match(/\?/g) || []).length;
    console.log('Number of placeholders:', placeholderCount);
    
    const stmt = db.prepare(sql);
    
    const values = [
      orderData.customer_id || null,
      orderData.order_amount || 0,
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
      orderData.restaurant_id || 1, // Default to first restaurant
      orderData.delivery_charge || 0,
      orderData.schedule_at || null,
      orderData.callback || null,
      orderData.otp || null,
      orderData.pending_date || null,
      orderData.accepted_date || null,
      orderData.confirmed_date || null,
      orderData.processing_date || null,
      orderData.handover_date || null,
      orderData.picked_up_date || null,
      orderData.delivered_date || null,
      orderData.canceled_date || null,
      orderData.cooked_date || null,
      orderData.done_date || null,
      orderData.refund_requested_date || null,
      (orderData.refunded || false) ? 1 : 0,
      orderData.delivery_address || null,
      orderData.delivery_ecode || null,
      (orderData.scheduled || false) ? 1 : 0,
      orderData.discount_amount || 0,
      orderData.original_delivery_charge || 0,
      (orderData.failed || false) ? 1 : 0,
      (orderData.refund_request_canceled || false) ? 1 : 0,
      orderData.cancellation_reason || null,
      orderData.canceled_by || null,
      orderData.tax_status || 'pending',
      orderData.coupon_created_by || null,
      orderData.distance || 0,
      orderData.cancellation_note || null,
      orderData.tax_percentage || 0,
      orderData.delivery_instruction || null,
      orderData.unavailable_item_note || null,
      orderData.additional_charge || 0,
      orderData.partially_paid_amount || 0,
      orderData.order_proof || null,
      orderData.cash_back_id || null,
      orderData.extra_packaging_amount || 0,
      orderData.table_details || null,
      (orderData.isdeleted || false) ? 1 : 0,
      (orderData.issyncronized || false) ? 1 : 0,
      orderData.ready_date || null,
      orderData.draft_name || null,
      (orderData.isreported || false) ? 1 : 0,
      orderData.ontheway || null,
      orderData.waiter || null,
      orderData.order_number || null,
      orderData.placed_at || null
    ];
    
    console.log('Number of values:', values.length);
    console.log('Values array:', values);
    
    const info = stmt.run(...values);
    const orderId = info.lastInsertRowid;
    
    console.log('Order created successfully with ID:', orderId);
    return { 
      success: true, 
      id: orderId,
      message: 'Order created successfully'
    };
  } catch (err) {
    console.error('Error creating order:', err.message);
    return errorResponse(err.message);
  }
}

// Update an order by id
export function updateOrder(id, updates) {
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
    const sql = `UPDATE orders SET ${fields.join(', ')} WHERE id = ? AND isdeleted = 0`;
    values.push(id);
    
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      return errorResponse('No order updated or order not found.');
    }
    
    return { 
      success: true, 
      message: 'Order updated successfully',
      changes: result.changes
    };
  } catch (err) {
    console.error('Error updating order:', err.message);
    return errorResponse(err.message);
  }
}

// Get order by id
export function getOrderById(id) {
  try {
    const stmt = db.prepare('SELECT * FROM orders WHERE id = ? AND isdeleted = 0');
    const order = stmt.get(id);
    
    if (!order) {
      return errorResponse('Order not found.');
    }
    
    return { success: true, data: order };
  } catch (err) {
    console.error('Error getting order:', err.message);
    return errorResponse(err.message);
  }
}

// Get all orders
export function getAllOrders(limit = 100, offset = 0) {
  try {
    console.log(`Getting all orders with limit=${limit}, offset=${offset}`);
    const stmt = db.prepare(`
      SELECT * FROM orders 
      WHERE isdeleted = 0 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    const orders = stmt.all(limit, offset);
    console.log(`Found ${orders.length} orders:`, orders.map(o => ({ id: o.id, status: o.order_status })));
    
    return { success: true, data: orders };
  } catch (err) {
    console.error('Error getting orders:', err.message);
    return errorResponse(err.message);
  }
}

// Get orders by customer id
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
    console.error('Error getting customer orders:', err.message);
    return errorResponse(err.message);
  }
}

// Get orders by status
export function getOrdersByStatus(status, limit = 50, offset = 0) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM orders 
      WHERE order_status = ? AND isdeleted = 0 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    const orders = stmt.all(status, limit, offset);
    
    return { success: true, data: orders };
  } catch (err) {
    console.error('Error getting orders by status:', err.message);
    return errorResponse(err.message);
  }
}

// Update order status
export function updateOrderStatus(id, status, updatedBy = null) {
  try {
    const updates = { order_status: status };
    
    // Add status-specific timestamps
    const now = new Date().toISOString();
    switch (status) {
      case 'pending':
        updates.pending_date = now;
        break;
      case 'accepted':
        updates.accepted_date = now;
        break;
      case 'confirmed':
        updates.confirmed_date = now;
        break;
      case 'processing':
        updates.processing_date = now;
        break;
      case 'handover':
        updates.handover_date = now;
        break;
      case 'picked_up':
        updates.picked_up_date = now;
        break;
      case 'delivered':
        updates.delivered_date = now;
        break;
      case 'canceled':
        updates.canceled_date = now;
        if (updatedBy) updates.canceled_by = updatedBy;
        break;
      case 'cooked':
        updates.cooked_date = now;
        break;
      case 'done':
        updates.done_date = now;
        break;
    }
    
    return updateOrder(id, updates);
  } catch (err) {
    console.error('Error updating order status:', err.message);
    return errorResponse(err.message);
  }
}

// Cancel order
export function cancelOrder(id, reason, canceledBy, note = null) {
  try {
    const updates = {
      order_status: 'canceled',
      canceled_date: new Date().toISOString(),
      canceled_by: canceledBy,
      cancellation_reason: reason,
      cancellation_note: note
    };
    
    return updateOrder(id, updates);
  } catch (err) {
    console.error('Error canceling order:', err.message);
    return errorResponse(err.message);
  }
}

// Delete order (soft delete)
export function deleteOrder(id) {
  try {
    const stmt = db.prepare('UPDATE orders SET isdeleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return errorResponse('Order not found or already deleted.');
    }
    
    return { 
      success: true, 
      message: 'Order deleted successfully' 
    };
  } catch (err) {
    console.error('Error deleting order:', err.message);
    return errorResponse(err.message);
  }
}

// Get order statistics
export function getOrderStatistics(startDate = null, endDate = null) {
  try {
    let sql = `
      SELECT 
        COUNT(*) as total_orders,
        SUM(order_amount) as total_amount,
        AVG(order_amount) as average_amount,
        COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN order_status = 'canceled' THEN 1 END) as canceled_orders
      FROM orders 
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
    console.error('Error getting order statistics:', err.message);
    return errorResponse(err.message);
  }
} 